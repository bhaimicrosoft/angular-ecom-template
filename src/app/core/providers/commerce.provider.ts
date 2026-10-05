import { InjectionToken } from '@angular/core';
import { DraftOrder, Order, OrderQuote, QuoteInput } from './models';

/**
 * Port for order/commerce operations. Implement this for your backend (Medusa,
 * Shopify, a custom API…) and provide it for {@link COMMERCE_PROVIDER}. The
 * checkout prices the cart with `quoteOrder` (the backend is authoritative on
 * money) and then hands a normalized {@link DraftOrder} to `createOrder`; the
 * provider owns id generation, status and timestamps.
 *
 * Throw a `ProviderError` on failure.
 */
export interface CommerceProvider {
  /** Price the cart server-side (re-price + validate coupon). Charge this total. */
  quoteOrder(input: QuoteInput): Promise<OrderQuote>;
  createOrder(draft: DraftOrder): Promise<Order>;
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
}

export const COMMERCE_PROVIDER = new InjectionToken<CommerceProvider>('COMMERCE_PROVIDER');
