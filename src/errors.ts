export type VizIoTErrorCode =
  'INVALID_CREDENTIALS' | 'INVALID_PAYLOAD' | 'EMPTY_PAYLOAD' | 'NOT_CONNECTED';

/**
 * Error thrown for any misuse of the {@link VizIoTMQTT} client
 * (invalid credentials, invalid payloads, calling methods before `connect()`, etc).
 * Transport-level failures (authentication, network, protocol) are surfaced as-is
 * from the underlying `mqtt` client instead.
 */
export class VizIoTError extends Error {
  readonly code: VizIoTErrorCode;

  constructor(code: VizIoTErrorCode, message: string) {
    super(message);
    this.name = 'VizIoTError';
    this.code = code;
    Object.setPrototypeOf(this, VizIoTError.prototype);
  }
}
