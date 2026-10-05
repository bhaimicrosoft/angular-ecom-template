import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { DATA_SOURCE } from './shared/data/data-source';
import { DummyJsonDataSource } from './shared/data/dummyjson-data-source';
import { APP_CONFIG } from './core/providers/app-config';
import { AUTH_PROVIDER } from './core/providers/auth.provider';
import { COMMERCE_PROVIDER } from './core/providers/commerce.provider';
import { CART_PROVIDER } from './core/providers/cart.provider';
import { PAYMENT_PROVIDER } from './core/providers/payment.provider';
import { MockAuthProvider } from './core/providers/mock/mock-auth.provider';
import { MockCommerceProvider } from './core/providers/mock/mock-commerce.provider';
import { LocalCartProvider } from './core/providers/mock/local-cart.provider';
import { MockPaymentProvider } from './core/providers/mock/mock-payment.provider';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withFetch()),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
      withViewTransitions(),
    ),

    // ─────────────────────────────────────────────────────────────────────
    //  Read path — product catalogue. Swap for MockDataSource / HttpDataSource
    //  or your own EcommerceDataSource implementation.
    // ─────────────────────────────────────────────────────────────────────
    { provide: DATA_SOURCE, useClass: DummyJsonDataSource },

    // ─────────────────────────────────────────────────────────────────────
    //  Write path — one provider per backend seam. Each ships a bundled mock
    //  default; replace a single line to point that concern at a real backend
    //  (JWT/Firebase/Supabase auth, Medusa/Shopify orders & cart, Stripe/PayPal
    //  payments). The UI, guards and screens never change.
    // ─────────────────────────────────────────────────────────────────────
    { provide: APP_CONFIG, useValue: environment },
    { provide: AUTH_PROVIDER, useClass: MockAuthProvider },
    { provide: COMMERCE_PROVIDER, useClass: MockCommerceProvider },
    { provide: CART_PROVIDER, useClass: LocalCartProvider },
    { provide: PAYMENT_PROVIDER, useClass: MockPaymentProvider },
  ],
};
