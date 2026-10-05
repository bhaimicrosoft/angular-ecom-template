import { Injectable, computed, effect, signal } from '@angular/core';
import { Product } from '../shared/data/models';

const STORAGE_KEY = 'ecom-wishlist';

@Injectable({ providedIn: 'root' })
export class WishlistService {
  private readonly _items = signal<Product[]>([]);
  readonly items = this._items.asReadonly();
  readonly count = computed(() => this._items().length);
  readonly ids = computed(() => new Set(this._items().map((p) => p.id)));

  constructor() {
    this.restore();
    effect(() => this.persist(this._items()));
  }

  has(productId: string): boolean {
    return this.ids().has(productId);
  }

  toggle(product: Product): void {
    this._items.update((items) =>
      items.some((p) => p.id === product.id)
        ? items.filter((p) => p.id !== product.id)
        : [product, ...items],
    );
  }

  remove(productId: string): void {
    this._items.update((items) => items.filter((p) => p.id !== productId));
  }

  clear(): void {
    this._items.set([]);
  }

  private persist(items: Product[]): void {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  private restore(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) this._items.set(JSON.parse(raw) as Product[]);
    } catch {
      /* ignore */
    }
  }
}
