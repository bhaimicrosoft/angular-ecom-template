import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import { AUTH_PROVIDER } from './providers/auth.provider';
import { AuthProvider } from './providers/auth.provider';
import { AuthUser } from './providers/models';

const USER: AuthUser = { id: '1', name: 'Ada Lovelace', email: 'ada@example.com' };

/** In-memory AuthProvider so the facade can be tested without a backend. */
class FakeAuthProvider implements AuthProvider {
  private user: AuthUser | null = null;
  currentUser() {
    return this.user;
  }
  token() {
    return this.user ? 'fake-token' : null;
  }
  async login() {
    this.user = USER;
    return USER;
  }
  async signup() {
    this.user = USER;
    return USER;
  }
  async loginWithProvider() {
    this.user = USER;
    return USER;
  }
  async logout() {
    this.user = null;
  }
  async updateProfile(patch: Partial<AuthUser>) {
    this.user = { ...this.user!, ...patch };
    return this.user;
  }
  async changePassword() {}
}

describe('AuthService (facade)', () => {
  let auth: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AuthService, { provide: AUTH_PROVIDER, useClass: FakeAuthProvider }],
    });
    auth = TestBed.inject(AuthService);
  });

  it('starts unauthenticated', () => {
    expect(auth.isAuthenticated()).toBe(false);
    expect(auth.user()).toBeNull();
  });

  it('sets the user, initials and token after login', async () => {
    await auth.login({ email: 'ada@example.com', password: 'secret1' });
    expect(auth.isAuthenticated()).toBe(true);
    expect(auth.user()?.email).toBe('ada@example.com');
    expect(auth.initials()).toBe('AL');
    expect(auth.token()).toBe('fake-token');
  });

  it('clears the user on logout', async () => {
    await auth.login({ email: 'ada@example.com', password: 'secret1' });
    await auth.logout();
    expect(auth.isAuthenticated()).toBe(false);
    expect(auth.token()).toBeNull();
  });
});
