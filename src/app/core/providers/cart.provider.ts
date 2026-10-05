import { InjectionToken } from '@angular/core';
import { CartLine } from '../../shared/data/models';

/**
 * Port for cart persistence. The default `LocalCartProvider` keeps the cart in
 * `localStorage`; a server-backed adapter (Medusa/Shopify keep line items on the
 * server) can persist in `save` and hydrate the snapshot in `load`. `CartService`
 * keeps all the pricing/computed logic and only delegates persistence here.
 */
export interface CartProvider {
  /** Restore the persisted cart snapshot. Server carts may return `[]` and sync via `save`. */
  load(): CartLine[];
  /** Persist the current cart lines. */
  save(lines: CartLine[]): void;
}

export const CART_PROVIDER = new InjectionToken<CartProvider>('CART_PROVIDER');
