import { EventEmitter } from 'node:events';
import mqtt, { type IClientOptions, type MqttClient } from 'mqtt';
import { VizIoTError } from './errors.js';

const DEFAULT_BROKER_URL = 'mqtt://viziot.com:48651';
const DEVICE_KEY_LENGTH = 16;
const DEVICE_PASSWORD_LENGTH = 20;
const RECONNECT_PERIOD_MS = 5000;

/** Data accepted by {@link VizIoTMQTT.send}: a JSON-serializable object/array, or a JSON string. */
export type VizIoTPayload = Record<string, unknown> | unknown[] | string;

export interface VizIoTMQTTEventMap {
  connect: [];
  reconnect: [];
  close: [];
  offline: [];
  error: [error: Error];
  command: [parameter: string, value: string];
}

function normalizeCredential(value: string): string {
  return value.replace(/[^A-Za-z0-9]/g, '');
}

function serializePayload(data: VizIoTPayload): string {
  let payload: string;

  if (typeof data === 'string') {
    try {
      payload = JSON.stringify(JSON.parse(data));
    } catch {
      throw new VizIoTError('INVALID_PAYLOAD', 'The data string is not valid JSON.');
    }
  } else if (Array.isArray(data) || (typeof data === 'object' && data !== null)) {
    payload = JSON.stringify(data);
  } else {
    throw new VizIoTError(
      'INVALID_PAYLOAD',
      'The data must be a string, an array, or a plain object.',
    );
  }

  if (payload.length <= 2) {
    throw new VizIoTError('EMPTY_PAYLOAD', 'Refusing to send an empty payload ("{}" / "[]").');
  }

  return payload;
}

/**
 * MQTT client for the VizIoT.com IoT platform.
 *
 * Emits the standard connection lifecycle events (`connect`, `reconnect`, `close`,
 * `offline`, `error`) plus a `command` event whenever the platform pushes a new
 * parameter value to the device.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging -- merged below with `declare interface VizIoTMQTT` to type the inherited EventEmitter methods.
export class VizIoTMQTT extends EventEmitter {
  readonly brokerUrl: string;

  private readonly deviceKey: string;
  private readonly devicePassword: string;
  private readonly publishTopic: string;
  private readonly subscribeTopic: string;
  private client: MqttClient | null = null;
  private subscribed = false;

  /**
   * @param deviceKey - device key from the VizIoT.com dashboard
   * @param devicePassword - device password from the VizIoT.com dashboard
   * @param brokerUrl - defaults to `mqtt://viziot.com:48651`
   */
  constructor(deviceKey: string, devicePassword: string, brokerUrl: string = DEFAULT_BROKER_URL) {
    super();

    const key = normalizeCredential(deviceKey);
    const password = normalizeCredential(devicePassword);

    if (key.length !== DEVICE_KEY_LENGTH || password.length !== DEVICE_PASSWORD_LENGTH) {
      throw new VizIoTError(
        'INVALID_CREDENTIALS',
        'Device key or device password has an invalid format.',
      );
    }

    this.deviceKey = key;
    this.devicePassword = password;
    this.brokerUrl = brokerUrl;
    this.publishTopic = `/devices/${key}/packet`;
    this.subscribeTopic = `/devices/${key}/param/+`;
  }

  /** Connects to the VizIoT.com broker. Resolves once the connection is acknowledged. */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const options: IClientOptions = {
        username: this.deviceKey,
        password: this.devicePassword,
        reconnectPeriod: RECONNECT_PERIOD_MS,
      };

      const client = mqtt.connect(this.brokerUrl, options);

      const onFirstConnect = () => {
        client.removeListener('error', onFirstError);
        this.emit('connect');
        resolve();
      };
      const onFirstError = (error: Error) => {
        client.removeListener('connect', onFirstConnect);
        client.end(true);
        reject(error);
      };

      client.once('connect', onFirstConnect);
      client.once('error', onFirstError);

      client.on('reconnect', () => this.emit('reconnect'));
      client.on('close', () => this.emit('close'));
      client.on('offline', () => this.emit('offline'));
      client.on('error', (error) => this.emit('error', error));
      client.on('message', (topic, message) => {
        const parameter = topic.slice(this.subscribeTopic.length - 1);
        this.emit('command', parameter, message.toString());
      });

      this.client = client;
    });
  }

  /** Ends the connection to the broker. */
  disconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.client) {
        resolve();
        return;
      }
      this.client.end(false, {}, (error) => (error ? reject(error) : resolve()));
    });
  }

  /**
   * Subscribes to parameter changes pushed from the VizIoT.com dashboard and registers
   * `listener` on the `command` event. Safe to call multiple times; the underlying MQTT
   * subscription is only made once.
   */
  async onCommand(listener: (parameter: string, value: string) => void): Promise<void> {
    if (!this.client) {
      throw new VizIoTError('NOT_CONNECTED', 'Call connect() before subscribing to commands.');
    }

    this.on('command', listener);

    if (this.subscribed) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      this.client!.subscribe(this.subscribeTopic, (error) => (error ? reject(error) : resolve()));
    });
    this.subscribed = true;
  }

  /** Sends an object, array, or JSON string to the VizIoT.com server. */
  async send(data: VizIoTPayload): Promise<void> {
    if (!this.client) {
      throw new VizIoTError('NOT_CONNECTED', 'Call connect() before sending data.');
    }

    const payload = serializePayload(data);

    await new Promise<void>((resolve, reject) => {
      this.client!.publish(this.publishTopic, payload, { qos: 1 }, (error) =>
        error ? reject(error) : resolve(),
      );
    });
  }
}

// Intentional declaration merging to give EventEmitter's `on`/`once`/`emit` precise,
// per-event types (the same pattern Node's own type definitions use).
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export declare interface VizIoTMQTT {
  on<K extends keyof VizIoTMQTTEventMap>(
    event: K,
    listener: (...args: VizIoTMQTTEventMap[K]) => void,
  ): this;
  once<K extends keyof VizIoTMQTTEventMap>(
    event: K,
    listener: (...args: VizIoTMQTTEventMap[K]) => void,
  ): this;
  emit<K extends keyof VizIoTMQTTEventMap>(event: K, ...args: VizIoTMQTTEventMap[K]): boolean;
}
