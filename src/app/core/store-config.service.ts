import { Injectable, computed, effect, isDevMode, signal } from '@angular/core';

/**
 * Runtime store settings that affect the *storefront itself* (not backend data):
 * currency formatting, tax and shipping. Unlike the dev-only Theme Studio, these
 * values are compiled defaults that are always active in production. The Theme
 * Studio (dev-only) provides a UI to edit them live and write new defaults back
 * to this file via "Save to project".
 *
 * Wire your backend here if these should come from an API: replace the seed
 * defaults or push values into the signals on app init — every consumer
 * (PricePipe, CartService, checkout) reacts automatically.
 */

export interface CurrencyConfig {
  /** ISO 4217 code, used as a hint (e.g. 'USD'). */
  code: string;
  /** Display symbol, e.g. '$', '€', '₹'. */
  symbol: string;
  /** Where the symbol sits relative to the amount. */
  position: 'before' | 'after';
  /** Fraction digits, e.g. 2 → 19.99, 0 → 20. */
  decimals: number;
  /** BCP-47 locale used for digit grouping, e.g. 'en-US'. */
  locale: string;
}

export interface TaxConfig {
  /** Percentage, e.g. 8 means 8%. */
  rate: number;
  /** Label shown in summaries, e.g. 'Tax', 'VAT', 'GST'. */
  label: string;
}

export interface ShippingMethod {
  id: string;
  label: string;
  desc: string;
  price: number;
}

export interface ShippingConfig {
  methods: ShippingMethod[];
  /** Order subtotal above which shipping is free. */
  freeThreshold: number;
  /** Flat rate used for the cart's quick estimate below the threshold. */
  flatRate: number;
}

export const DEFAULT_CURRENCY: CurrencyConfig = { code: 'INR', symbol: '₹', position: 'before', decimals: 2, locale: 'en-US' };

export const DEFAULT_TAX: TaxConfig = { rate: 8, label: 'Tax' };

export const DEFAULT_SHIPPING: ShippingConfig = {
  methods: [
    { id: 'standard', label: 'Standard', desc: '4–6 business days', price: 0 },
    { id: 'express', label: 'Express', desc: '2–3 business days', price: 9.95 },
    { id: 'overnight', label: 'Overnight', desc: 'Next business day', price: 24.95 },
  ],
  freeThreshold: 75,
  flatRate: 6.95,
};

const KEY = 'nova-store-config';

interface PersistShape {
  currency: CurrencyConfig;
  tax: TaxConfig;
  shipping: ShippingConfig;
}

@Injectable({ providedIn: 'root' })
export class StoreConfigService {
  private readonly dev = isDevMode();

  readonly currency = signal<CurrencyConfig>(DEFAULT_CURRENCY);
  readonly tax = signal<TaxConfig>(DEFAULT_TAX);
  readonly shipping = signal<ShippingConfig>(DEFAULT_SHIPPING);

  /** Tax as a 0–1 fraction for math. */
  readonly taxFraction = computed(() => Math.max(0, this.tax().rate) / 100);

  readonly dirty = computed(
    () =>
      JSON.stringify(this.currency()) !== JSON.stringify(DEFAULT_CURRENCY) ||
      JSON.stringify(this.tax()) !== JSON.stringify(DEFAULT_TAX) ||
      JSON.stringify(this.shipping()) !== JSON.stringify(DEFAULT_SHIPPING),
  );

  constructor() {
    if (!this.dev) return; // production uses compiled defaults only
    this.load();
    effect(() => this.persist());
  }

  // Formatting -----------------------------------------------------------
  format(amount: number | null | undefined): string {
    if (amount == null || Number.isNaN(amount)) return '';
    const c = this.currency();
    const sign = amount < 0 ? '-' : '';
    const num = new Intl.NumberFormat(c.locale || 'en-US', {
      minimumFractionDigits: c.decimals,
      maximumFractionDigits: c.decimals,
    }).format(Math.abs(amount));
    return c.position === 'after' ? `${sign}${num}${c.symbol}` : `${sign}${c.symbol}${num}`;
  }

  // Mutations ------------------------------------------------------------
  setCurrency(patch: Partial<CurrencyConfig>): void {
    this.currency.update((c) => ({ ...c, ...patch }));
  }
  setTax(patch: Partial<TaxConfig>): void {
    this.tax.update((t) => ({ ...t, ...patch }));
  }
  setShipping(patch: Partial<ShippingConfig>): void {
    this.shipping.update((s) => ({ ...s, ...patch }));
  }
  updateShippingMethod(index: number, patch: Partial<ShippingMethod>): void {
    this.shipping.update((s) => ({
      ...s,
      methods: s.methods.map((m, i) => (i === index ? { ...m, ...patch } : m)),
    }));
  }
  addShippingMethod(): void {
    this.shipping.update((s) => ({
      ...s,
      methods: [...s.methods, { id: `ship_${Math.random().toString(36).slice(2, 7)}`, label: 'New method', desc: '', price: 0 }],
    }));
  }
  removeShippingMethod(index: number): void {
    this.shipping.update((s) => ({ ...s, methods: s.methods.filter((_, i) => i !== index) }));
  }

  reset(): void {
    this.currency.set(DEFAULT_CURRENCY);
    this.tax.set(DEFAULT_TAX);
    this.shipping.set(DEFAULT_SHIPPING);
  }

  /** Drop persisted overrides so a reload starts from the compiled defaults. */
  clearPersisted(): void {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(KEY);
  }

  // Export ---------------------------------------------------------------
  exportConfig(): string {
    const c = this.currency();
    const t = this.tax();
    const s = this.shipping();
    const methods = s.methods
      .map((m) => `    { id: '${m.id}', label: '${m.label}', desc: '${m.desc}', price: ${m.price} },`)
      .join('\n');
    return (
      `// src/app/core/store-config.service.ts — new defaults\n` +
      `export const DEFAULT_CURRENCY: CurrencyConfig = { code: '${c.code}', symbol: '${c.symbol}', position: '${c.position}', decimals: ${c.decimals}, locale: '${c.locale}' };\n\n` +
      `export const DEFAULT_TAX: TaxConfig = { rate: ${t.rate}, label: '${t.label}' };\n\n` +
      `export const DEFAULT_SHIPPING: ShippingConfig = {\n  methods: [\n${methods}\n  ],\n  freeThreshold: ${s.freeThreshold},\n  flatRate: ${s.flatRate},\n};`
    );
  }

  // Internals ------------------------------------------------------------
  private persist(): void {
    if (typeof localStorage === 'undefined') return;
    const data: PersistShape = { currency: this.currency(), tax: this.tax(), shipping: this.shipping() };
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  private load(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as Partial<PersistShape>;
      if (data.currency) this.currency.set({ ...DEFAULT_CURRENCY, ...data.currency });
      if (data.tax) this.tax.set({ ...DEFAULT_TAX, ...data.tax });
      if (data.shipping) this.shipping.set({ ...DEFAULT_SHIPPING, ...data.shipping });
    } catch {
      /* ignore malformed storage */
    }
  }
}
