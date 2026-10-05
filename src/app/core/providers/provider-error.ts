/**
 * A consistent error shape every write provider throws, so the UI can handle
 * failures uniformly regardless of the backend. Adapters should translate their
 * native errors (HTTP status, SDK errors…) into a `ProviderError` with a stable
 * `code`; components can switch on the code and always show `message` to users.
 */
export type ProviderErrorCode =
  | 'invalid_input'
  | 'unauthorized'
  | 'not_found'
  | 'conflict'
  | 'payment_failed'
  | 'network'
  | 'unknown';

export class ProviderError extends Error {
  constructor(
    readonly code: ProviderErrorCode,
    message: string,
    override readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}

/** Coerce any thrown value into a `ProviderError` with a user-safe message. */
export function toProviderError(
  err: unknown,
  fallback = 'Something went wrong. Please try again.',
): ProviderError {
  if (err instanceof ProviderError) return err;
  if (err instanceof Error) return new ProviderError('unknown', err.message || fallback, err);
  return new ProviderError('unknown', fallback, err);
}
