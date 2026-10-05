import type { AppConfig } from '../app/core/providers/app-config';

/**
 * Production configuration. Point these at your real backend before building.
 * Set `mockLatencyMs` to 0 so the bundled mocks (if still used) respond
 * instantly in production.
 */
export const environment: AppConfig = {
  apiBaseUrl: '',
  mockLatencyMs: 0,
};
