import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideSearch,
  lucideShoppingBag,
  lucideHeart,
  lucideMenu,
  lucideX,
  lucideSun,
  lucideMoon,
  lucideMonitor,
  lucideSparkles,
  lucideUser,
  lucidePackage,
  lucideSettings,
  lucideLogOut,
  lucideLogIn,
} from '@ng-icons/lucide';
import { CartService } from '../core/cart.service';
import { WishlistService } from '../core/wishlist.service';
import { ThemeService } from '../core/theme.service';
import { AuthService } from '../core/auth.service';
import { ToastService } from '../core/toast.service';
import { CustomizerService } from '../core/customizer.service';
import { HlmButton } from '../shared/ui/button';
import { HlmInput } from '../shared/ui/input';
import { PricePipe } from '../shared/ui/price.pipe';

interface NavItem {
  label: string;
  link: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FormsModule, NgIcon, HlmButton, HlmInput, PricePipe],
  providers: [
    provideIcons({
      lucideSearch,
      lucideShoppingBag,
      lucideHeart,
      lucideMenu,
      lucideX,
      lucideSun,
      lucideMoon,
      lucideMonitor,
      lucideSparkles,
      lucideUser,
      lucidePackage,
      lucideSettings,
      lucideLogOut,
      lucideLogIn,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.html',
})
export class Header {
  protected readonly cart = inject(CartService);
  protected readonly wishlist = inject(WishlistService);
  protected readonly theme = inject(ThemeService);
  protected readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly customizer = inject(CustomizerService);
  private readonly router = inject(Router);

  protected readonly brand = this.customizer.brand;
  protected readonly nav = this.customizer.nav;

  protected readonly scrolled = signal(false);
  protected readonly mobileOpen = signal(false);
  protected readonly searchOpen = signal(false);
  protected readonly accountOpen = signal(false);
  protected readonly search = signal('');

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }

  toggleMobile(): void {
    this.mobileOpen.update((v) => !v);
  }

  toggleSearch(): void {
    this.searchOpen.update((v) => !v);
  }

  toggleAccount(): void {
    this.accountOpen.update((v) => !v);
  }

  async logout(): Promise<void> {
    this.accountOpen.set(false);
    await this.auth.logout();
    this.toast.success('You have been signed out.');
    this.router.navigate(['/']);
  }

  cycleTheme(): void {
    const order = ['light', 'dark', 'system'] as const;
    const next = order[(order.indexOf(this.theme.mode()) + 1) % order.length];
    this.theme.set(next);
  }

  submitSearch(): void {
    const q = this.search().trim();
    this.searchOpen.set(false);
    this.mobileOpen.set(false);
    this.router.navigate(['/catalog'], { queryParams: q ? { search: q } : {} });
  }
}
