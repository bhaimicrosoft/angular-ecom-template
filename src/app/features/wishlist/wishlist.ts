import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideHeart, lucideArrowRight, lucideShoppingBag } from '@ng-icons/lucide';
import { WishlistService } from '../../core/wishlist.service';
import { CartService } from '../../core/cart.service';
import { ToastService } from '../../core/toast.service';
import { ProductCard } from '../../shared/components/product-card';
import { HlmButton } from '../../shared/ui/button';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [RouterLink, NgIcon, ProductCard, HlmButton],
  providers: [provideIcons({ lucideHeart, lucideArrowRight, lucideShoppingBag })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './wishlist.html',
})
export class Wishlist {
  protected readonly wishlist = inject(WishlistService);
  private readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);

  addAll(): void {
    for (const p of this.wishlist.items()) this.cart.add(p, p.variants[0]);
    this.toast.success('Added all items to cart', 'lucideShoppingBag');
  }
}
