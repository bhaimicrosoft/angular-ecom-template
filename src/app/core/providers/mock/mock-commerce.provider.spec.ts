import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MockCommerceProvider } from './mock-commerce.provider';
import { APP_CONFIG } from '../app-config';
import { DraftOrder } from '../models';

function draft(): DraftOrder {
  const addr = {
    name: 'Ada',
    line1: '1 Rd',
    city: 'Town',
    state: 'CA',
    zip: '00000',
    country: 'US',
  };
  return {
    email: 'ada@example.com',
    items: [{ title: 'Widget', image: '', price: 10, quantity: 2 }],
    shippingAddress: addr,
    billingAddress: addr,
    shippingMethod: { id: 'express', label: 'Express', price: 9 },
    subtotal: 20,
    discount: 0,
    tax: 2,
    total: 31,
    currency: 'USD',
  };
}

describe('MockCommerceProvider', () => {
  let provider: MockCommerceProvider;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        MockCommerceProvider,
        { provide: APP_CONFIG, useValue: { apiBaseUrl: '', mockLatencyMs: 0 } },
      ],
    });
    provider = TestBed.inject(MockCommerceProvider);
  });

  it('creates an order from a draft', async () => {
    const order = await provider.createOrder(draft());
    expect(order.id).toMatch(/^NOVA-/);
    expect(order.status).toBe('processing');
    expect(order.total).toBe(31);
    expect(order.items).toHaveLength(1);
    expect(order.email).toBe('ada@example.com');
  });

  it('returns created orders ahead of the seeded demo orders', async () => {
    const created = await provider.createOrder(draft());
    const all = await provider.getOrders();
    expect(all[0].id).toBe(created.id);
    // Seeded demo orders are still present.
    expect(all.some((o) => o.id === 'NOVA-4821')).toBe(true);
  });

  it('finds an order by id case-insensitively', async () => {
    const created = await provider.createOrder(draft());
    const found = await provider.getOrder(created.id.toLowerCase());
    expect(found?.id).toBe(created.id);
  });

  it('prices a quote from the line items', async () => {
    const quote = await provider.quoteOrder({
      items: [{ productId: 'a', title: 'A', unitPrice: 10, quantity: 2 }],
      shippingMethodId: 'std',
      currency: 'USD',
    });
    expect(quote.subtotal).toBe(20);
    expect(quote.couponApplied).toBe(false);
    // Total is at least subtotal minus any discount (tax/shipping are >= 0).
    expect(quote.total).toBeGreaterThanOrEqual(quote.subtotal - quote.discount);
  });

  it('applies a valid coupon in the quote', async () => {
    const quote = await provider.quoteOrder({
      items: [{ productId: 'a', title: 'A', unitPrice: 100, quantity: 1 }],
      couponCode: 'save10',
      shippingMethodId: 'std',
      currency: 'USD',
    });
    expect(quote.couponApplied).toBe(true);
    expect(quote.discount).toBe(10);
  });
});
