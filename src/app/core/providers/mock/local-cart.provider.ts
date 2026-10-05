import { Injectable } from '@angular/core';
import { CartProvider } from '../cart.provider';
import { CartLine } from '../../../shared/data/models';

const STORAGE_KEY = 'ecom-cart';

/**
 * Default {@link CartProvider}: persists the cart to `localStorage`. A
 * server-backed adapter would sync line items to the backend in `save` instead.
 */
@Injectable({ providedIn: 'root' })
export class LocalCartProvider implements CartProvider {
  load(): CartLine[] {
    if (typeof localStorage === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as { snapshot?: CartLine[] };
      return Array.isArray(parsed.snapshot) ? parsed.snapshot : [];
    } catch {
      return [];
    }
  }

  save(lines: CartLine[]): void {
    if (typeof localStorage === 'undefined') return;
    const stored = lines.map((l) => ({
      productId: l.product.id,
      variantId: l.variant?.id,
      quantity: l.quantity,
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ lines: stored, snapshot: lines }));
  }
}
