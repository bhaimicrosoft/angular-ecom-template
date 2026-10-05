import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { AccountService } from './account.service';
import { COMMERCE_PROVIDER } from './providers/commerce.provider';
import { CommerceProvider } from './providers/commerce.provider';
import { DraftOrder, Order, OrderQuote, QuoteInput } from './providers/models';

class FakeCommerceProvider implements CommerceProvider {
  async quoteOrder(input: QuoteInput): Promise<OrderQuote> {
    const subtotal = input.items.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
    return {
      subtotal,
      discount: 0,
      shipping: 0,
      tax: 0,
      total: subtotal,
      currency: input.currency,
      couponApplied: false,
    };
  }
  async createOrder(draft: DraftOrder): Promise<Order> {
    return {
      id: 'NOVA-TEST',
      date: '2026-01-01',
      status: 'processing',
      total: draft.total,
      items: draft.items,
      email: draft.email,
    };
  }
  async getOrders(): Promise<Order[]> {
    return [];
  }
  async getOrder(): Promise<Order | undefined> {
    return undefined;
  }
}

function draft(): DraftOrder {
  const addr = { name: 'Ada', line1: '1 Rd', city: 'Town', state: 'CA', zip: '0', country: 'US' };
  return {
    email: 'ada@example.com',
    items: [{ title: 'Widget', image: '', price: 10, quantity: 1 }],
    shippingAddress: addr,
    billingAddress: addr,
    shippingMethod: { id: 'std', label: 'Standard', price: 0 },
    subtotal: 10,
    discount: 0,
    tax: 1,
    total: 11,
    currency: 'USD',
  };
}

describe('AccountService.createOrder', () => {
  let account: AccountService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [AccountService, { provide: COMMERCE_PROVIDER, useClass: FakeCommerceProvider }],
    });
    account = TestBed.inject(AccountService);
  });

  it('prepends the created order and records it as the last order', async () => {
    const order = await account.createOrder(draft());
    expect(order.id).toBe('NOVA-TEST');
    expect(account.orders()[0].id).toBe('NOVA-TEST');
    expect(account.lastOrder()?.id).toBe('NOVA-TEST');
  });
});
