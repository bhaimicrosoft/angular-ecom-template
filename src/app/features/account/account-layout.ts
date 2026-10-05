import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideLayoutGrid,
  lucidePackage,
  lucideMapPin,
  lucideCreditCard,
  lucideHeart,
  lucideSettings,
  lucideLogOut,
  lucideChevronRight,
} from '@ng-icons/lucide';
import { AuthService } from '../../core/auth.service';
import { AccountService } from '../../core/account.service';
import { WishlistService } from '../../core/wishlist.service';
import { ToastService } from '../../core/toast.service';

interface NavLink {
  label: string;
  link: string;
  icon: string;
  exact: boolean;
  badge?: () => number;
}

@Component({
  selector: 'app-account-layout',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, NgIcon],
  providers: [
    provideIcons({
      lucideLayoutGrid,
      lucidePackage,
      lucideMapPin,
      lucideCreditCard,
      lucideHeart,
      lucideSettings,
      lucideLogOut,
      lucideChevronRight,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Header banner -->
      <div
        class="relative mb-8 overflow-hidden rounded-3xl border border-border bg-primary p-6 text-primary-foreground sm:p-8 animate-fade-up"
      >
        <div class="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/30 blur-3xl animate-float"></div>
        <div class="pointer-events-none absolute inset-0 bg-dots opacity-10"></div>
        <div class="relative flex items-center gap-4">
          <div
            class="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary-foreground/15 text-xl font-bold ring-2 ring-primary-foreground/20"
          >
            @if (auth.user()?.avatarUrl) {
              <img [src]="auth.user()!.avatarUrl" alt="" class="h-full w-full object-cover" />
            } @else {
              {{ auth.initials() }}
            }
          </div>
          <div class="min-w-0">
            <p class="text-sm text-primary-foreground/70">Welcome back,</p>
            <h1 class="truncate text-2xl font-bold tracking-tight sm:text-3xl">
              {{ auth.user()?.name }}
            </h1>
            <p class="truncate text-sm text-primary-foreground/70">{{ auth.user()?.email }}</p>
          </div>
        </div>
      </div>

      <div class="grid gap-8 lg:grid-cols-[260px_1fr]">
        <!-- Sidebar -->
        <aside class="lg:sticky lg:top-24 lg:self-start">
          <nav class="flex gap-2 overflow-x-auto rounded-2xl border border-border bg-card p-2 lg:flex-col lg:overflow-visible">
            @for (item of links; track item.link) {
              <a
                [routerLink]="item.link"
                routerLinkActive="!bg-accent/12 !text-foreground"
                [routerLinkActiveOptions]="{ exact: item.exact }"
                class="group flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                <ng-icon [name]="item.icon" size="19" />
                <span>{{ item.label }}</span>
                @if (item.badge && item.badge() > 0) {
                  <span class="ml-auto hidden rounded-full bg-accent px-2 py-0.5 text-xs font-bold text-accent-foreground lg:inline">
                    {{ item.badge() }}
                  </span>
                }
                <ng-icon
                  name="lucideChevronRight"
                  size="16"
                  class="ml-auto hidden opacity-0 transition-opacity group-hover:opacity-100 lg:block"
                />
              </a>
            }
            <button
              type="button"
              (click)="logout()"
              class="mt-0 flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 lg:mt-2 lg:border-t lg:border-border lg:pt-3"
            >
              <ng-icon name="lucideLogOut" size="19" />
              Sign out
            </button>
          </nav>
        </aside>

        <!-- Content -->
        <div class="min-w-0">
          <router-outlet />
        </div>
      </div>
    </div>
  `,
})
export class AccountLayout {
  protected readonly auth = inject(AuthService);
  protected readonly account = inject(AccountService);
  private readonly wishlist = inject(WishlistService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected readonly links: NavLink[] = [
    { label: 'Overview', link: '/account', icon: 'lucideLayoutGrid', exact: true },
    { label: 'Orders', link: '/account/orders', icon: 'lucidePackage', exact: false, badge: () => this.account.activeOrders() },
    { label: 'Addresses', link: '/account/addresses', icon: 'lucideMapPin', exact: false },
    { label: 'Payment', link: '/account/payments', icon: 'lucideCreditCard', exact: false },
    { label: 'Wishlist', link: '/wishlist', icon: 'lucideHeart', exact: false, badge: () => this.wishlist.count() },
    { label: 'Settings', link: '/account/settings', icon: 'lucideSettings', exact: false },
  ];

  async logout(): Promise<void> {
    await this.auth.logout();
    this.toast.success('You have been signed out.');
    this.router.navigate(['/']);
  }
}
