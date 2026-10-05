import { InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Central runtime configuration for every backend adapter — the one place base
 * URLs, keys and tuning live, instead of constants scattered across data
 * sources and providers. The active values come from
 * `src/environments/environment.ts` (swapped per build); override `APP_CONFIG`
 * in `app.config.ts` if you need to supply them another way.
 */
export interface AppConfig {
  /** Base URL shared by HTTP-backed data sources and providers. */
  apiBaseUrl: string;
  /** Optional API key/header value forwarded by HTTP adapters. */
  apiKey?: string;
  /** Simulated latency (ms) used by the bundled mock providers. */
  mockLatencyMs: number;
}

/** DI token for {@link AppConfig}. Defaults to the active environment config. */
export const APP_CONFIG = new InjectionToken<AppConfig>('APP_CONFIG', {
  providedIn: 'root',
  factory: () => environment,
});

