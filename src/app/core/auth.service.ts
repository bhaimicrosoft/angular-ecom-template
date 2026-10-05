import { Injectable, computed, inject, signal } from '@angular/core';
import { AUTH_PROVIDER } from './providers/auth.provider';
import { AuthUser, Credentials, OAuthProvider, SignupPayload } from './providers/models';

// Re-exported so existing imports (`from '../core/auth.service'`) keep working.
export type { AuthUser, Credentials, SignupPayload } from './providers/models';

/**
 * Signal-based authentication store. This is the UI-facing facade: it holds the
 * reactive session state and delegates all I/O to the injected {@link AUTH_PROVIDER}.
 * Swap the provider in `app.config.ts` to connect a real backend — this service,
 * the `authGuard`, and every screen stay identical.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly provider = inject(AUTH_PROVIDER);
  private readonly _user = signal<AuthUser | null>(this.provider.currentUser());
  private readonly _loading = signal(false);

  /** The currently authenticated user, or `null`. */
  readonly user = this._user.asReadonly();
  /** True while an auth request is in flight. */
  readonly loading = this._loading.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);
  readonly initials = computed(() => {
    const u = this._user();
    if (!u) return '';
    return u.name
      .split(' ')
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  });

  /** The current auth token (for HTTP interceptors), or `null`. */
  token(): string | null {
    return this.provider.token();
  }

  async login(credentials: Credentials): Promise<AuthUser> {
    return this.run(() => this.provider.login(credentials));
  }

  async signup(payload: SignupPayload): Promise<AuthUser> {
    return this.run(() => this.provider.signup(payload));
  }

  async loginWithProvider(provider: OAuthProvider): Promise<AuthUser> {
    return this.run(() => this.provider.loginWithProvider(provider));
  }

  async logout(): Promise<void> {
    await this.provider.logout();
    this._user.set(null);
  }

  /** Update the signed-in user's profile. Returns the updated user. */
  async updateProfile(
    patch: Partial<Pick<AuthUser, 'name' | 'email' | 'avatarUrl'>>,
  ): Promise<AuthUser> {
    return this.run(() => this.provider.updateProfile(patch));
  }

  /** Change the account password. */
  async changePassword(current: string, next: string): Promise<void> {
    this._loading.set(true);
    try {
      await this.provider.changePassword(current, next);
    } finally {
      this._loading.set(false);
    }
  }

  /** Run a provider call that resolves to the current user, syncing loading + state. */
  private async run(op: () => Promise<AuthUser>): Promise<AuthUser> {
    this._loading.set(true);
    try {
      const user = await op();
      this._user.set(user);
      return user;
    } finally {
      this._loading.set(false);
    }
  }
}
