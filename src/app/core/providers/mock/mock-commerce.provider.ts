import { Injectable, inject } from '@angular/core';
import { CommerceProvider } from '../commerce.provider';
import { DraftOrder, Order, OrderQuote, QuoteInput } from '../models';
import { APP_CONFIG } from '../app-config';
import { StoreConfigService } from '../../store-config.service';

const KEY_ORDERS = 'ecom-orders';

/** Demo coupon rules. A real backend owns and validates these server-side. */
const COUPONS: Record<string, number> = { SAVE10: 0.1, WELCOME: 0.15, VIP20: 0.2 };

const round2 = (n: number): number => Math.round(n * 100) / 100;

/**
 * Default {@link CommerceProvider}: seeds a few demo orders and stores newly
 * placed orders in `localStorage` so they survive reloads. Swap it for a real
 * adapter (Medusa/Shopify/custom) in `app.config.ts`.
 */
@Injectable({ providedIn: 'root' })
export class MockCommerceProvider implements CommerceProvider {
  private readonly latency = inject(APP_CONFIG).mockLatencyMs;
  private readonly config = inject(StoreConfigService);

  async quoteOrder(input: QuoteInput): Promise<OrderQuote> {
    await this.delay(200);
    // A real backend ignores the client's unitPrice and re-prices from its own
    // catalogue; this mock echoes it since it has no server-side catalogue.
    const subtotal = round2(input.items.reduce((s, l) => s + l.unitPrice * l.quantity, 0));
    const rate = input.couponCode ? COUPONS[input.couponCode.trim().toUpperCase()] : undefined;
    const discount = rate ? round2(subtotal * rate) : 0;
    const shipping = this.config.shipping();
    const method = shipping.methods.find((m) => m.id === input.shippingMethodId);
    const shippingCost = subtotal >= shipping.freeThreshold ? 0 : (method?.price ?? 0);
    const tax = round2(Math.max(0, subtotal - discount) * this.config.taxFraction());
    const total = round2(Math.max(0, subtotal - discount) + shippingCost + tax);
    return {
      subtotal,
      discount,
      shipping: shippingCost,
      tax,
      total,
      currency: input.currency,
      couponCode: input.couponCode,
      couponApplied: !!rate,
    };
  }

  async createOrder(draft: DraftOrder): Promise<Order> {
    await this.delay();
    const order: Order = {
      id: 'NOVA-' + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toISOString().slice(0, 10),
      status: 'processing',
      total: draft.total,
      items: draft.items,
      eta: this.etaFrom(draft.shippingMethod.id),
      email: draft.email,
      shippingAddress: draft.shippingAddress,
    };
    const stored = this.readStored();
    this.writeStored([order, ...stored]);
    return order;
  }

  async getOrders(): Promise<Order[]> {
    await this.delay(200);
    return [...this.readStored(), ...this.seedOrders()];
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const all = await this.getOrders();
    return all.find((o) => o.id.toLowerCase() === id.toLowerCase());
  }

  private etaFrom(methodId: string): string {
    if (methodId.includes('express')) return 'Tomorrow by 8 PM';
    if (methodId.includes('next')) return 'Tomorrow by 12 PM';
    return 'In 3–5 business days';
  }

  private readStored(): Order[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(KEY_ORDERS);
      return raw ? (JSON.parse(raw) as Order[]) : [];
    } catch {
      return [];
    }
  }

  private writeStored(orders: Order[]): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(KEY_ORDERS, JSON.stringify(orders));
  }

  private delay(ms = this.latency): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private seedOrders(): Order[] {
    return [
      {
        id: 'NOVA-4821',
        date: '2026-09-12',
        status: 'out_for_delivery',
        total: 349.0,
        trackingNumber: '1Z999AA10123456784',
        eta: 'Tomorrow by 8 PM',
        items: [
          { title: 'Aura Wireless Headphones', image: 'https://picsum.photos/seed/nova-h1/200', price: 249, quantity: 1 },
          { title: 'USB-C Braided Cable', image: 'https://picsum.photos/seed/nova-c1/200', price: 25, quantity: 4 },
        ],
      },
      {
        id: 'NOVA-4655',
        date: '2026-08-28',
        status: 'delivered',
        total: 1299.0,
        trackingNumber: '1Z999AA10123456111',
        items: [
          { title: 'Nova Pro Laptop 14"', image: 'https://picsum.photos/seed/nova-l1/200', price: 1299, quantity: 1 },
        ],
      },
      {
        id: 'NOVA-4390',
        date: '2026-08-04',
        status: 'delivered',
        total: 178.0,
        items: [
          { title: 'Pulse Smartwatch', image: 'https://picsum.photos/seed/nova-w1/200', price: 178, quantity: 1 },
        ],
      },
    ];
  }
}
