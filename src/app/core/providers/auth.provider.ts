import { InjectionToken } from '@angular/core';
import { AuthUser, Credentials, SignupPayload, OAuthProvider } from './models';

/**
 * Port for authentication. Implement this for your backend (JWT, Firebase,
 * Supabase, OAuth…) and provide it for {@link AUTH_PROVIDER} — nothing in the UI
 * changes. The bundled `MockAuthProvider` is the default.
 *
 * All methods are async so real network calls drop in unchanged. Throw a
 * `ProviderError` on failure; the UI surfaces its `message`.
 */
export interface AuthProvider {
  /** The persisted user restored on app start, or `null`. Read synchronously. */
  currentUser(): AuthUser | null;
  /** The current auth token (JWT/session), or `null`. Used by HTTP interceptors. */
  token(): string | null;
  login(credentials: Credentials): Promise<AuthUser>;
  signup(payload: SignupPayload): Promise<AuthUser>;
  loginWithProvider(provider: OAuthProvider): Promise<AuthUser>;
  logout(): Promise<void>;
  updateProfile(patch: Partial<Pick<AuthUser, 'name' | 'email' | 'avatarUrl'>>): Promise<AuthUser>;
  changePassword(current: string, next: string): Promise<void>;
}

export const AUTH_PROVIDER = new InjectionToken<AuthProvider>('AUTH_PROVIDER');
