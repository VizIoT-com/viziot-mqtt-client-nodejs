# viziot-mqtt-client-nodejs

<img src="/logo.png" alt="VizIoT.com" height="200"/>

A Promise-based MQTT client for the [VizIoT.com](http://viziot.com) IoT platform. It lets a
Node.js device send data to VizIoT.com and receive parameter/command updates pushed from the
dashboard. Written in TypeScript and published with type declarations, so it works out of the
box in both TypeScript and plain JavaScript (CommonJS or ESM) projects.

> **Upgrading from 1.x?** Version 2.0.0 is a full rewrite with a breaking, Promise-based API.
> See [CHANGELOG.md](./CHANGELOG.md) for the migration notes.

## Installation

```sh
npm install viziot-mqtt-client-nodejs
```

Requires Node.js 18 or later.

## Quick start

### TypeScript / ESM

```ts
import { VizIoTMQTT } from 'viziot-mqtt-client-nodejs';

const client = new VizIoTMQTT(deviceKey, devicePassword);

client.on('error', (error) => console.error(error.message));

await client.connect();

await client.onCommand((parameter, value) => {
  console.log('Received command:', parameter, value);
});

await client.send({ temperature: 21.5 });
```

### CommonJS

```js
const { VizIoTMQTT } = require('viziot-mqtt-client-nodejs');

const client = new VizIoTMQTT(deviceKey, devicePassword);

client.connect().then(async () => {
  await client.onCommand((parameter, value) => {
    console.log('Received command:', parameter, value);
  });
  await client.send({ temperature: 21.5 });
});
```

Runnable versions of both examples live in [examples/](./examples).

## API

### `new VizIoTMQTT(deviceKey, devicePassword, brokerUrl?)`

- `deviceKey` — device key from the VizIoT.com dashboard.
- `devicePassword` — device password from the VizIoT.com dashboard.
- `brokerUrl` — optional, defaults to `mqtt://viziot.com:48651`.

Throws a `VizIoTError` (code `INVALID_CREDENTIALS`) if the key or password has an invalid format.

### `client.connect(): Promise<void>`

Connects to the broker. The returned promise resolves on the first successful connection and
rejects if the initial connection attempt fails (e.g. bad credentials). Automatic reconnection
after a successful connection is handled internally; observe it via the `reconnect` event.

### `client.onCommand(listener): Promise<void>`

Subscribes to parameter changes pushed from the VizIoT.com dashboard and registers `listener` as
a `command` event handler. `listener` is called with `(parameter: string, value: string)`. Safe
to call multiple times — the underlying MQTT subscription is only issued once.

### `client.send(data): Promise<void>`

Sends `data` (a plain object, an array, or a JSON string) to VizIoT.com with QoS 1. Rejects with
a `VizIoTError` if `data` is empty or not JSON-serializable.

### `client.disconnect(): Promise<void>`

Closes the connection to the broker.

### Events

`VizIoTMQTT` extends `EventEmitter` and emits:

| Event       | Payload                            | Description                                       |
| ----------- | ---------------------------------- | ------------------------------------------------- |
| `connect`   | —                                  | Emitted on every (re)connection.                  |
| `reconnect` | —                                  | A reconnection attempt has started.               |
| `close`     | —                                  | The connection was closed.                        |
| `offline`   | —                                  | The client went offline.                          |
| `error`     | `error: Error`                     | A transport-level error occurred.                 |
| `command`   | `parameter: string, value: string` | A new parameter value was pushed from VizIoT.com. |

### Errors

Validation errors thrown by this library are instances of `VizIoTError`, with a `code` of
`INVALID_CREDENTIALS`, `INVALID_PAYLOAD`, `EMPTY_PAYLOAD`, or `NOT_CONNECTED`. Transport-level
failures (bad credentials rejected by the broker, network issues, etc.) are surfaced as the
original `Error` from the underlying [`mqtt`](https://www.npmjs.com/package/mqtt) client.

## Development

```sh
npm install
npm run build       # bundle src/ to dist/ (CJS + ESM + .d.ts) with tsup
npm test            # run the vitest suite
npm run lint        # eslint
npm run format      # prettier --write
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) for the release/versioning process.

## License

MIT — see [LICENSE](./LICENSE).
