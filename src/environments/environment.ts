import type { AppConfig } from '../app/core/providers/app-config';

/**
 * Development configuration — compiled into `ng serve` and
 * `ng build --configuration development`.
 *
 * The production build swaps this file for `environment.prod.ts` via the
 * `fileReplacements` entry in `angular.json`. This is the single source of
 * truth for base URLs and keys; every HTTP data source / provider reads it
 * through the `APP_CONFIG` token.
 */
export const environment: AppConfig = {
  apiBaseUrl: '',
  mockLatencyMs: 600,
};
