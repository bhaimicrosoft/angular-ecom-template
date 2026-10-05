import { Injectable, computed, signal, effect, inject } from '@angular/core';
import { CartLine, Product, ProductVariant } from '../shared/data/models';
import { StoreConfigService } from './store-config.service';
import { CART_PROVIDER } from './providers/cart.provider';

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly config = inject(StoreConfigService);
  private readonly persistence = inject(CART_PROVIDER);
  private readonly _lines = signal<CartLine[]>([]);
  readonly lines = this._lines.asReadonly();

  readonly count = computed(() => this._lines().reduce((n, l) => n + l.quantity, 0));
  readonly subtotal = computed(() =>
    this._lines().reduce((sum, l) => sum + this.linePrice(l) * l.quantity, 0),
  );
  readonly shipping = computed(() => {
    const sub = this.subtotal();
    const { freeThreshold, flatRate } = this.config.shipping();
    return sub === 0 || sub >= freeThreshold ? 0 : flatRate;
  });
  readonly discount = signal(0);
  readonly tax = computed(
    () => Math.max(0, this.subtotal() - this.discount()) * this.config.taxFraction(),
  );
  readonly total = computed(() =>
    Math.max(0, this.subtotal() - this.discount()) + this.shipping() + this.tax(),
  );
  readonly freeShippingRemaining = computed(() =>
    Math.max(0, this.config.shipping().freeThreshold - this.subtotal()),
  );
  readonly freeShippingThreshold = computed(() => this.config.shipping().freeThreshold);
  readonly taxLabel = computed(() => this.config.tax().label);
  readonly isEmpty = computed(() => this._lines().length === 0);

  constructor() {
    this._lines.set(this.persistence.load());
    effect(() => this.persistence.save(this._lines()));
  }

  private linePrice(l: CartLine): number {
    return l.variant?.price ?? l.product.price;
  }

  private keyOf(productId: string, variantId?: string): string {
    return `${productId}::${variantId ?? ''}`;
  }

  add(product: Product, variant?: ProductVariant, quantity = 1): void {
    const key = this.keyOf(product.id, variant?.id);
    this._lines.update((lines) => {
      const existing = lines.find((l) => this.keyOf(l.product.id, l.variant?.id) === key);
      if (existing) {
        return lines.map((l) =>
          l === existing ? { ...l, quantity: l.quantity + quantity } : l,
        );
      }
      return [...lines, { product, variant, quantity }];
    });
  }

  setQuantity(productId: string, variantId: string | undefined, quantity: number): void {
    if (quantity <= 0) return this.remove(productId, variantId);
    const key = this.keyOf(productId, variantId);
    this._lines.update((lines) =>
      lines.map((l) =>
        this.keyOf(l.product.id, l.variant?.id) === key ? { ...l, quantity } : l,
      ),
    );
  }

  remove(productId: string, variantId?: string): void {
    const key = this.keyOf(productId, variantId);
    this._lines.update((lines) =>
      lines.filter((l) => this.keyOf(l.product.id, l.variant?.id) !== key),
    );
  }

  clear(): void {
    this._lines.set([]);
    this.discount.set(0);
    this._couponCode.set(null);
  }

  private readonly _couponCode = signal<string | null>(null);
  /** The applied coupon code, or `null`. The checkout re-validates it server-side. */
  readonly couponCode = this._couponCode.asReadonly();

  applyCoupon(code: string): boolean {
    const normalized = code.trim().toUpperCase();
    const table: Record<string, number> = { SAVE10: 0.1, WELCOME: 0.15, VIP20: 0.2 };
    const rate = table[normalized];
    if (rate) {
      this.discount.set(Math.round(this.subtotal() * rate * 100) / 100);
      this._couponCode.set(normalized);
      return true;
    }
    return false;
  }

}
