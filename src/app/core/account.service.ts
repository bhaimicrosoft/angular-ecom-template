import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { COMMERCE_PROVIDER } from './providers/commerce.provider';
import { Address, DraftOrder, Order, OrderItem, OrderQuote, OrderStatus, PaymentMethod, QuoteInput } from './providers/models';

// Re-exported so existing imports (`from '../core/account.service'`) keep working.
export type { Address, Order, OrderItem, OrderStatus, PaymentMethod } from './providers/models';

const KEY_ADDR = 'ecom-addresses';
const KEY_PAY = 'ecom-payments';

/**
 * Account data store (orders, addresses, payment methods). UI-facing facade over
 * signals: orders are delegated to the injected {@link COMMERCE_PROVIDER};
 * addresses and payment methods persist locally. Swap the provider in
 * `app.config.ts` to go live — the component contracts stay identical.
 */
@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly commerce = inject(COMMERCE_PROVIDER);

  private readonly _orders = signal<Order[]>([]);
  private readonly _addresses = signal<Address[]>(this.read(KEY_ADDR, this.seedAddresses()));
  private readonly _payments = signal<PaymentMethod[]>(this.read(KEY_PAY, this.seedPayments()));
  private readonly _lastOrder = signal<Order | null>(null);

  readonly orders = this._orders.asReadonly();
  readonly addresses = this._addresses.asReadonly();
  readonly payments = this._payments.asReadonly();
  /** The most recently placed order, for the confirmation screen. */
  readonly lastOrder = this._lastOrder.asReadonly();

  readonly orderCount = computed(() => this._orders().length);
  readonly activeOrders = computed(
    () => this._orders().filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length,
  );
  readonly totalSpent = computed(() =>
    this._orders()
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.total, 0),
  );

  constructor() {
    void this.commerce.getOrders().then((orders) => this._orders.set(orders));
    effect(() => this.persist(KEY_ADDR, this._addresses()));
    effect(() => this.persist(KEY_PAY, this._payments()));
  }

  findOrder(id: string): Order | undefined {
    return this._orders().find((o) => o.id.toLowerCase() === id.toLowerCase());
  }

  // Orders ---------------------------------------------------------------
  /** Price the order server-side before charging. Charge the returned total. */
  quoteOrder(input: QuoteInput): Promise<OrderQuote> {
    return this.commerce.quoteOrder(input);
  }

  async createOrder(draft: DraftOrder): Promise<Order> {
    const order = await this.commerce.createOrder(draft);
    this._orders.update((list) => [order, ...list]);
    this._lastOrder.set(order);
    return order;
  }

  // Addresses ------------------------------------------------------------
  async saveAddress(address: Address): Promise<void> {
    await this.delay();
    this._addresses.update((list) => {
      const next = address.isDefault ? list.map((a) => ({ ...a, isDefault: false })) : [...list];
      const idx = next.findIndex((a) => a.id === address.id);
      if (idx >= 0) next[idx] = address;
      else next.push(address);
      return [...next];
    });
  }

  async removeAddress(id: string): Promise<void> {
    await this.delay();
    this._addresses.update((list) => list.filter((a) => a.id !== id));
  }

  async makeDefaultAddress(id: string): Promise<void> {
    await this.delay(200);
    this._addresses.update((list) => list.map((a) => ({ ...a, isDefault: a.id === id })));
  }

  // Payment methods ------------------------------------------------------
  async savePayment(method: PaymentMethod): Promise<void> {
    await this.delay();
    this._payments.update((list) => {
      const next = method.isDefault ? list.map((p) => ({ ...p, isDefault: false })) : [...list];
      const idx = next.findIndex((p) => p.id === method.id);
      if (idx >= 0) next[idx] = method;
      else next.push(method);
      return [...next];
    });
  }

  async removePayment(id: string): Promise<void> {
    await this.delay();
    this._payments.update((list) => list.filter((p) => p.id !== id));
  }

  async makeDefaultPayment(id: string): Promise<void> {
    await this.delay(200);
    this._payments.update((list) => list.map((p) => ({ ...p, isDefault: p.id === id })));
  }

  newId(prefix: string): string {
    return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
  }

  // Seeds ----------------------------------------------------------------
  private seedAddresses(): Address[] {
    return [
      {
        id: 'addr_home',
        label: 'Home',
        name: 'Nova Shopper',
        line1: '128 Market Street, Apt 9',
        city: 'San Francisco',
        state: 'CA',
        zip: '94103',
        country: 'United States',
        phone: '+1 (415) 555-0101',
        isDefault: true,
      },
    ];
  }

  private seedPayments(): PaymentMethod[] {
    return [
      {
        id: 'pay_visa',
        brand: 'visa',
        last4: '4242',
        expiry: '08/28',
        holder: 'Nova Shopper',
        isDefault: true,
      },
    ];
  }

  private delay(ms = 500): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private persist<T>(key: string, value: T): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  private read<T>(key: string, fallback: T): T {
    if (typeof localStorage === 'undefined') return fallback;
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : fallback;
    } catch {
      return fallback;
    }
  }
}
