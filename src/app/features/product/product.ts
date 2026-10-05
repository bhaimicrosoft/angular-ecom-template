import { ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, signal, viewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import Drift from 'drift-zoom';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideHeart,
  lucideShoppingBag,
  lucideMinus,
  lucidePlus,
  lucideTruck,
  lucideRotateCcw,
  lucideShieldCheck,
  lucideCheck,
  lucideChevronRight,
  lucideZoomIn,
} from '@ng-icons/lucide';
import { DATA_SOURCE } from '../../shared/data/data-source';
import { Product, ProductVariant } from '../../shared/data/models';
import { CartService } from '../../core/cart.service';
import { WishlistService } from '../../core/wishlist.service';
import { ToastService } from '../../core/toast.service';
import { ProductCard } from '../../shared/components/product-card';
import { HlmButton } from '../../shared/ui/button';
import { HlmBadge } from '../../shared/ui/badge';
import { Rating } from '../../shared/ui/rating';
import { PricePipe } from '../../shared/ui/price.pipe';

@Component({
  selector: 'app-product-page',
  standalone: true,
  imports: [RouterLink, DatePipe, NgIcon, ProductCard, HlmButton, HlmBadge, Rating, PricePipe],
  providers: [
    provideIcons({
      lucideHeart,
      lucideShoppingBag,
      lucideMinus,
      lucidePlus,
      lucideTruck,
      lucideRotateCcw,
      lucideShieldCheck,
      lucideCheck,
      lucideChevronRight,
      lucideZoomIn,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './product.html',
})
export class ProductPage {
  private readonly data = inject(DATA_SOURCE);
  private readonly route = inject(ActivatedRoute);
  private readonly cart = inject(CartService);
  private readonly wishlist = inject(WishlistService);
  private readonly toast = inject(ToastService);

  readonly product = toSignal(
    this.route.paramMap.pipe(
      switchMap((p) => this.data.getProductBySlug(p.get('slug') ?? '')),
    ),
    { initialValue: undefined },
  );

  readonly related = toSignal(
    this.route.paramMap.pipe(
      switchMap((p) => this.data.getProductBySlug(p.get('slug') ?? '')),
      switchMap((prod) =>
        prod ? this.data.getRelatedProducts(prod.id, 4) : Promise.resolve([]),
      ),
    ),
    { initialValue: [] },
  );

  readonly reviews = toSignal(
    this.route.paramMap.pipe(
      switchMap((p) => this.data.getProductBySlug(p.get('slug') ?? '')),
      switchMap((prod) => (prod ? this.data.getReviews(prod.id) : Promise.resolve([]))),
    ),
    { initialValue: [] },
  );

  // Selection state -------------------------------------------------------
  readonly activeImage = signal(0);
  readonly selectedOptions = signal<Record<string, string>>({});
  readonly quantity = signal(1);
  readonly activeTab = signal<'description' | 'reviews'>('description');

  readonly optionGroups = computed(() => {
    const p = this.product();
    if (!p) return [] as { name: string; values: { value: string; swatch?: string }[] }[];
    const map = new Map<string, Map<string, string | undefined>>();
    for (const v of p.variants) {
      for (const opt of v.options) {
        if (!map.has(opt.name)) map.set(opt.name, new Map());
        map.get(opt.name)!.set(opt.value, opt.swatch);
      }
    }
    return [...map.entries()].map(([name, values]) => ({
      name,
      values: [...values.entries()].map(([value, swatch]) => ({ value, swatch })),
    }));
  });

  readonly selectedVariant = computed<ProductVariant | undefined>(() => {
    const p = this.product();
    if (!p || !p.variants.length) return undefined;
    const opts = this.selectedOptions();
    return (
      p.variants.find((v) => v.options.every((o) => opts[o.name] === o.value)) ?? p.variants[0]
    );
  });

  readonly currentPrice = computed(() => this.selectedVariant()?.price ?? this.product()?.price ?? 0);
  readonly inStock = computed(() => (this.product()?.stock ?? 0) > 0);
  readonly wishlisted = computed(() => {
    const p = this.product();
    return p ? this.wishlist.ids().has(p.id) : false;
  });
  readonly discountPercent = computed(() => {
    const p = this.product();
    if (!p?.compareAtPrice || p.compareAtPrice <= this.currentPrice()) return 0;
    return Math.round((1 - this.currentPrice() / p.compareAtPrice) * 100);
  });

  readonly gallery = computed(() => this.product()?.images ?? []);

  // Ref to the main gallery image that receives the hover-zoom magnifier.
  private readonly zoomTrigger = viewChild<ElementRef<HTMLImageElement>>('zoomTrigger');
  private drift?: Drift;

  constructor() {
    // Preselect the first value of each option group when the product loads.
    effect(() => {
      const groups = this.optionGroups();
      if (groups.length && Object.keys(this.selectedOptions()).length === 0) {
        const initial: Record<string, string> = {};
        for (const g of groups) initial[g.name] = g.values[0].value;
        this.selectedOptions.set(initial);
      }
    });
    // Reset gallery/quantity on product change.
    effect(() => {
      this.product();
      this.activeImage.set(0);
    });

    // Attach a hover-zoom magnifier (drift-zoom) to the main gallery image.
    // Rebuilt whenever the trigger element or the active image changes so the
    // pane always magnifies the currently displayed picture.
    effect((onCleanup) => {
      const el = this.zoomTrigger()?.nativeElement;
      const url = this.gallery()[this.activeImage()]?.url;
      if (typeof window === 'undefined' || !el || !url) return;
      const drift = new Drift(el, {
        inlinePane: true,
        hoverBoundingBox: false,
        zoomFactor: 2.5,
        sourceAttribute: 'data-zoom',
      });
      this.drift = drift;
      onCleanup(() => drift.destroy());
    });
  }

  selectOption(name: string, value: string): void {
    this.selectedOptions.update((o) => ({ ...o, [name]: value }));
  }

  changeQty(delta: number): void {
    this.quantity.update((q) => Math.max(1, Math.min(q + delta, this.product()?.stock || 99)));
  }

  addToCart(): void {
    const p = this.product();
    if (!p) return;
    this.cart.add(p, this.selectedVariant(), this.quantity());
    this.toast.success(`${p.title} added to cart`, 'lucideShoppingBag');
  }

  toggleWishlist(): void {
    const p = this.product();
    if (!p) return;
    this.wishlist.toggle(p);
    this.toast.show(
      this.wishlist.ids().has(p.id) ? 'Saved to wishlist' : 'Removed from wishlist',
      'accent',
      'lucideHeart',
    );
  }
}
