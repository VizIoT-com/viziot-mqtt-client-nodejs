import { EventEmitter } from 'node:events';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import mqtt from 'mqtt';
import { VizIoTMQTT, VizIoTError } from '../src/index.js';

const DEVICE_KEY = 'abcdefghij123456'; // 16 chars
const DEVICE_PASSWORD = 'abcdefghij1234567890'; // 20 chars

class FakeMqttClient extends EventEmitter {
  subscribe = vi.fn((_topic: string, cb: (error: Error | null) => void) => cb(null));
  publish = vi.fn(
    (_topic: string, _payload: string, _opts: unknown, cb: (error: Error | null) => void) =>
      cb(null),
  );
  end = vi.fn((_force?: boolean, _opts?: unknown, cb?: (error?: Error) => void) => cb?.());
}

vi.mock('mqtt', () => ({
  default: { connect: vi.fn() },
}));

describe('VizIoTMQTT', () => {
  let fakeClient: FakeMqttClient;

  beforeEach(() => {
    fakeClient = new FakeMqttClient();
    vi.mocked(mqtt.connect).mockReturnValue(fakeClient as never);
  });

  it('rejects invalid device credentials', () => {
    expect(() => new VizIoTMQTT('too-short', DEVICE_PASSWORD)).toThrow(VizIoTError);
  });

  it('resolves connect() once the broker acknowledges the connection', async () => {
    const client = new VizIoTMQTT(DEVICE_KEY, DEVICE_PASSWORD);
    const connectPromise = client.connect();
    fakeClient.emit('connect');
    await expect(connectPromise).resolves.toBeUndefined();
  });

  it('rejects connect() on the first error', async () => {
    const client = new VizIoTMQTT(DEVICE_KEY, DEVICE_PASSWORD);
    // EventEmitter throws when an "error" event has no listener, same as the underlying
    // mqtt client — real consumers are expected to attach one (see README).
    client.on('error', () => {});
    const connectPromise = client.connect();
    fakeClient.emit('error', new Error('Bad user name or password'));
    await expect(connectPromise).rejects.toThrow('Bad user name or password');
  });

  it('serializes an object payload and publishes it with QoS 1', async () => {
    const client = new VizIoTMQTT(DEVICE_KEY, DEVICE_PASSWORD);
    const connectPromise = client.connect();
    fakeClient.emit('connect');
    await connectPromise;

    await client.send({ testData: 42 });

    expect(fakeClient.publish).toHaveBeenCalledWith(
      `/devices/${DEVICE_KEY}/packet`,
      JSON.stringify({ testData: 42 }),
      { qos: 1 },
      expect.any(Function),
    );
  });

  it('rejects an empty payload', async () => {
    const client = new VizIoTMQTT(DEVICE_KEY, DEVICE_PASSWORD);
    const connectPromise = client.connect();
    fakeClient.emit('connect');
    await connectPromise;

    await expect(client.send({})).rejects.toThrow(VizIoTError);
  });

  it('emits "command" with the parameter parsed out of the topic', async () => {
    const client = new VizIoTMQTT(DEVICE_KEY, DEVICE_PASSWORD);
    const connectPromise = client.connect();
    fakeClient.emit('connect');
    await connectPromise;

    const received: Array<[string, string]> = [];
    await client.onCommand((parameter, value) => received.push([parameter, value]));

    fakeClient.emit('message', `/devices/${DEVICE_KEY}/param/sendTestData`, Buffer.from('1'));

    expect(received).toEqual([['sendTestData', '1']]);
  });
});
