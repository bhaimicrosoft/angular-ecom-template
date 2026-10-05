import { describe, it, expect } from 'vitest';
import { ProviderError, toProviderError } from './provider-error';

describe('toProviderError', () => {
  it('passes through an existing ProviderError unchanged', () => {
    const original = new ProviderError('unauthorized', 'nope');
    expect(toProviderError(original)).toBe(original);
  });

  it('wraps a native Error, preserving its message', () => {
    const err = toProviderError(new Error('boom'));
    expect(err).toBeInstanceOf(ProviderError);
    expect(err.code).toBe('unknown');
    expect(err.message).toBe('boom');
  });

  it('wraps a non-error value with the fallback message', () => {
    const err = toProviderError('weird', 'fallback msg');
    expect(err.code).toBe('unknown');
    expect(err.message).toBe('fallback msg');
    expect(err.cause).toBe('weird');
  });
});
