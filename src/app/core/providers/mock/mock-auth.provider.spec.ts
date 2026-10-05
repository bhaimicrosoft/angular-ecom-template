import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MockAuthProvider } from './mock-auth.provider';
import { APP_CONFIG } from '../app-config';
import { ProviderError } from '../provider-error';

describe('MockAuthProvider', () => {
  let provider: MockAuthProvider;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        MockAuthProvider,
        { provide: APP_CONFIG, useValue: { apiBaseUrl: '', mockLatencyMs: 0 } },
      ],
    });
    provider = TestBed.inject(MockAuthProvider);
  });

  it('logs in with valid credentials and persists the session', async () => {
    const user = await provider.login({ email: 'ada@example.com', password: 'secret1' });
    expect(user.email).toBe('ada@example.com');
    expect(provider.currentUser()?.email).toBe('ada@example.com');
    expect(provider.token()).toContain('mock.');
  });

  it('rejects a too-short password', async () => {
    await expect(provider.login({ email: 'a@b.com', password: '123' })).rejects.toBeInstanceOf(
      ProviderError,
    );
  });

  it('clears the session on logout', async () => {
    await provider.login({ email: 'ada@example.com', password: 'secret1' });
    await provider.logout();
    expect(provider.currentUser()).toBeNull();
    expect(provider.token()).toBeNull();
  });
});
