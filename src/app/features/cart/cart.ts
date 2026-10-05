import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideMinus,
  lucidePlus,
  lucideTrash2,
  lucideShoppingBag,
  lucideArrowRight,
  lucideTag,
  lucideTruck,
  lucideLock,
} from '@ng-icons/lucide';
import { CartService } from '../../core/cart.service';
import { ToastService } from '../../core/toast.service';
import { HlmButton } from '../../shared/ui/button';
import { HlmInput, HlmLabel } from '../../shared/ui/input';
import { PricePipe } from '../../shared/ui/price.pipe';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, FormsModule, NgIcon, HlmButton, HlmInput, HlmLabel, PricePipe],
  providers: [
    provideIcons({
      lucideMinus,
      lucidePlus,
      lucideTrash2,
      lucideShoppingBag,
      lucideArrowRight,
      lucideTag,
      lucideTruck,
      lucideLock,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cart.html',
})
export class Cart {
  protected readonly cart = inject(CartService);
  private readonly toast = inject(ToastService);

  protected readonly coupon = signal('');
  protected readonly couponError = signal(false);

  applyCoupon(): void {
    const ok = this.cart.applyCoupon(this.coupon());
    this.couponError.set(!ok);
    if (ok) this.toast.success('Coupon applied');
  }
}
