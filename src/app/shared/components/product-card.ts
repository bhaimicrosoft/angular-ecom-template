import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideHeart, lucideShoppingBag } from '@ng-icons/lucide';
import { Product } from '../data/models';
import { CartService } from '../../core/cart.service';
import { WishlistService } from '../../core/wishlist.service';
import { ToastService } from '../../core/toast.service';
import { HlmButton } from '../ui/button';
import { HlmBadge } from '../ui/badge';
import { Rating } from '../ui/rating';
import { PricePipe } from '../ui/price.pipe';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, NgIcon, HlmButton, HlmBadge, Rating, PricePipe],
  providers: [provideIcons({ lucideHeart, lucideShoppingBag })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/40"
    >
      <a
        [routerLink]="['/product', product().slug]"
        class="relative block aspect-square overflow-hidden bg-muted"
      >
        <img
          [src]="product().thumbnail"
          [alt]="product().title"
          loading="lazy"
          class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div
          class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        ></div>

        <div class="absolute left-3 top-3 flex flex-col gap-1.5">
          @if (discountPercent() > 0) {
            <span hlmBadge variant="destructive">-{{ discountPercent() }}%</span>
          }
          @if (product().stock <= 0) {
            <span hlmBadge variant="muted">Sold out</span>
          } @else if (product().stock < 8) {
            <span hlmBadge variant="secondary">Low stock</span>
          }
          @if (isNew()) {
            <span hlmBadge variant="accent">New</span>
          }
        </div>
      </a>

      <button
        type="button"
        (click)="toggleWishlist($event)"
        [attr.aria-label]="wishlisted() ? 'Remove from wishlist' : 'Add to wishlist'"
        class="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background/80 text-foreground backdrop-blur transition-all duration-200 hover:scale-110 hover:text-accent"
      >
        <ng-icon
          name="lucideHeart"
          size="18"
          [class]="wishlisted() ? 'text-accent [&_svg]:fill-accent' : ''"
        />
      </button>

      <div class="flex flex-1 flex-col gap-2 p-4">
        @if (product().brand) {
          <span class="text-xs font-medium uppercase tracking-wide text-muted-foreground">{{
            product().brand
          }}</span>
        }
        <a
          [routerLink]="['/product', product().slug]"
          class="line-clamp-1 font-semibold leading-tight text-foreground transition-colors hover:text-accent"
        >
          {{ product().title }}
        </a>
        <app-rating [value]="product().rating.average"         [count]="product().rating.count"
          [showCount]="true"
        />

        <div class="mt-auto flex items-end justify-between pt-2">
          <div class="flex items-baseline gap-2">
            <span data-test="price" class="text-lg font-bold text-foreground">{{
              product().price | price
            }}</span>
            @if (product().compareAtPrice) {
              <span class="text-sm text-muted-foreground line-through">{{
                product().compareAtPrice | price
              }}</span>
            }
          </div>
          <button
            hlmBtn
            size="icon-sm"
            variant="default"
            (click)="quickAdd($event)"
            [disabled]="product().stock <= 0"
            aria-label="Add to cart"
            class="opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          >
            <ng-icon name="lucideShoppingBag" size="16" />
          </button>
        </div>
      </div>
    </div>
  `,
})
export class ProductCard {
  readonly product = input.required<Product>();

  private readonly cart = inject(CartService);
  private readonly wishlist = inject(WishlistService);
  private readonly toast = inject(ToastService);

  protected readonly wishlisted = computed(() => this.wishlist.ids().has(this.product().id));
  protected readonly discountPercent = computed(() => {
    const p = this.product();
    if (!p.compareAtPrice || p.compareAtPrice <= p.price) return 0;
    return Math.round((1 - p.price / p.compareAtPrice) * 100);
  });
  protected readonly isNew = computed(() => {
    const created = this.product().createdAt;
    if (!created) return false;
    return Date.now() - new Date(created).getTime() < 5 * 86_400_000;
  });

  protected quickAdd(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const p = this.product();
    this.cart.add(p, p.variants[0]);
    this.toast.success(`${p.title} added to cart`, 'lucideShoppingBag');
  }

  protected toggleWishlist(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    const p = this.product();
    this.wishlist.toggle(p);
    this.toast.show(
      this.wishlist.ids().has(p.id) ? 'Saved to wishlist' : 'Removed from wishlist',
      'accent',
      'lucideHeart',
    );
  }
}
