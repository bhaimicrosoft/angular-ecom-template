import { Injectable, inject } from '@angular/core';
import { AuthProvider } from '../auth.provider';
import { AuthUser, Credentials, OAuthProvider, SignupPayload } from '../models';
import { ProviderError } from '../provider-error';
import { APP_CONFIG } from '../app-config';

const STORAGE_KEY = 'ecom-auth-user';

/**
 * Default {@link AuthProvider}: simulates a backend with latency and persists
 * the session to `localStorage`. Swap it for a real adapter in `app.config.ts`.
 */
@Injectable({ providedIn: 'root' })
export class MockAuthProvider implements AuthProvider {
  private readonly latency = inject(APP_CONFIG).mockLatencyMs;

  currentUser(): AuthUser | null {
    return this.read();
  }

  token(): string | null {
    const user = this.read();
    return user ? `mock.${user.id}` : null;
  }

  async login({ email, password }: Credentials): Promise<AuthUser> {
    await this.delay();
    if (!email || !password) {
      throw new ProviderError('invalid_input', 'Please enter your email and password.');
    }
    if (password.length < 6) {
      throw new ProviderError('unauthorized', 'Incorrect email or password. Please try again.');
    }
    return this.persist(this.userFromEmail(email));
  }

  async signup({ name, email, password }: SignupPayload): Promise<AuthUser> {
    await this.delay();
    if (!name || !email || !password) {
      throw new ProviderError('invalid_input', 'Please complete every field to continue.');
    }
    if (password.length < 6) {
      throw new ProviderError('invalid_input', 'Password must be at least 6 characters long.');
    }
    return this.persist({ id: crypto.randomUUID(), name, email, avatarUrl: this.avatarFor(email) });
  }

  async loginWithProvider(provider: OAuthProvider): Promise<AuthUser> {
    await this.delay(600);
    const email = `you@${provider}.com`;
    return this.persist({
      id: crypto.randomUUID(),
      name: provider === 'github' ? 'Nova Developer' : 'Nova Shopper',
      email,
      avatarUrl: this.avatarFor(email),
    });
  }

  async logout(): Promise<void> {
    await this.delay(300);
    this.persist(null);
  }

  async updateProfile(
    patch: Partial<Pick<AuthUser, 'name' | 'email' | 'avatarUrl'>>,
  ): Promise<AuthUser> {
    await this.delay(600);
    const current = this.read();
    if (!current) throw new ProviderError('unauthorized', 'You are not signed in.');
    if (patch.email !== undefined && !patch.email.trim()) {
      throw new ProviderError('invalid_input', 'Email cannot be empty.');
    }
    return this.persist({ ...current, ...patch });
  }

  async changePassword(current: string, next: string): Promise<void> {
    await this.delay(600);
    if (!current || !next) {
      throw new ProviderError('invalid_input', 'Please fill in both password fields.');
    }
    if (next.length < 6) {
      throw new ProviderError('invalid_input', 'New password must be at least 6 characters long.');
    }
  }

  private userFromEmail(email: string): AuthUser {
    const handle = email.split('@')[0] ?? 'shopper';
    const name = handle
      .replace(/[._-]+/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .trim();
    return { id: crypto.randomUUID(), name: name || 'Nova Shopper', email, avatarUrl: this.avatarFor(email) };
  }

  private avatarFor(email: string): string {
    return `https://i.pravatar.cc/128?u=${encodeURIComponent(email)}`;
  }

  private delay(ms = this.latency): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private read(): AuthUser | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }

  private persist(user: AuthUser): AuthUser;
  private persist(user: null): null;
  private persist(user: AuthUser | null): AuthUser | null {
    if (typeof localStorage !== 'undefined') {
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEY);
    }
    return user;
  }
}
