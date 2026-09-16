# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this
project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [2.0.0] - 2026-09-16

### Changed

- Full rewrite in TypeScript. The package now ships compiled CommonJS, ESM, and `.d.ts`
  declarations, and works in both TypeScript and JavaScript projects.
- **Breaking:** the API is now Promise-based instead of callback-based.
  - `connect(callback)` → `await connect()`
  - `startListenCommands(callback)` → `await onCommand(listener)`
  - `sendDataToVizIoT(data, callback)` → `await send(data)`
- **Breaking:** the module now exports the client as a named export,
  `const { VizIoTMQTT } = require('viziot-mqtt-client-nodejs')`, instead of a default
  export used directly as a constructor.
- `VizIoTMQTT` now extends `EventEmitter` and emits `connect`, `reconnect`, `close`, `offline`,
  `error`, and `command` events instead of logging to the console.
- Validation failures now throw a typed `VizIoTError` (with an English message and a `code`)
  instead of logging Russian text to the console.
- Updated the `mqtt` dependency from `^2.18.8` to `^5.16.0`.

### Removed

- The bundled Russian-language console log messages and the internal `errorsVizIoT` /
  `errorsMQTT` dictionaries. Transport errors are now surfaced as-is from the `mqtt` package.

## [1.0.7] - previous releases

See the git history prior to 2.0.0 for the changes shipped in the 1.x line.

[Unreleased]: https://github.com/VizIoT-com/viziot-mqtt-client-nodejs/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/VizIoT-com/viziot-mqtt-client-nodejs/releases/tag/v2.0.0
