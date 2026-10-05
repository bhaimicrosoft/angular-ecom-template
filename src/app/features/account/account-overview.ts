import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucidePackage,
  lucideTruck,
  lucideWallet,
  lucideHeart,
  lucideArrowRight,
  lucideClock,
  lucidePackageCheck,
  lucideCircleCheck,
  lucideCircleX,
  lucideMapPin,
  lucideCreditCard,
  lucideSettings,
} from '@ng-icons/lucide';
import { AccountService } from '../../core/account.service';
import { WishlistService } from '../../core/wishlist.service';
import { PricePipe } from '../../shared/ui/price.pipe';
import { OrderStatus } from '../../core/account.service';
import { STATUS_META } from './order-status';

@Component({
  selector: 'app-account-overview',
  standalone: true,
  imports: [RouterLink, NgIcon, PricePipe],
  providers: [
    provideIcons({
      lucidePackage,
      lucideTruck,
      lucideWallet,
      lucideHeart,
      lucideArrowRight,
      lucideClock,
      lucidePackageCheck,
      lucideCircleCheck,
      lucideCircleX,
      lucideMapPin,
      lucideCreditCard,
      lucideSettings,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Stat cards -->
    <div class="grid gap-4 sm:grid-cols-3">
      @for (stat of stats(); track stat.label; let i = $index) {
        <div
          class="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:shadow-lg animate-fade-up"
          [style.animationDelay]="i * 80 + 'ms'"
        >
          <div class="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-accent/10 blur-2xl transition-opacity group-hover:opacity-100"></div>
          <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/12 text-accent">
            <ng-icon [name]="stat.icon" size="20" />
          </span>
          <p class="mt-4 text-2xl font-bold tracking-tight">{{ stat.value }}</p>
          <p class="text-sm text-muted-foreground">{{ stat.label }}</p>
        </div>
      }
    </div>

    <!-- Recent orders -->
    <div class="mt-8 rounded-2xl border border-border bg-card animate-fade-up delay-200">
      <div class="flex items-center justify-between border-b border-border p-5">
        <h2 class="text-lg font-semibold">Recent orders</h2>
        <a routerLink="/account/orders" class="inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline">
          View all <ng-icon name="lucideArrowRight" size="15" />
        </a>
      </div>
      <ul class="divide-y divide-border">
        @for (order of recent(); track order.id) {
          <li class="flex flex-wrap items-center gap-4 p-5">
            <div class="flex -space-x-3">
              @for (item of order.items.slice(0, 3); track item.title) {
                <img [src]="item.image" alt="" class="h-11 w-11 rounded-xl border-2 border-card object-cover" />
              }
            </div>
            <div class="min-w-0 flex-1">
              <p class="font-semibold">{{ order.id }}</p>
              <p class="text-sm text-muted-foreground">{{ order.date }} · {{ order.items.length }} item(s)</p>
            </div>
            <span class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" [class]="meta(order.status).classes">
              <ng-icon [name]="meta(order.status).icon" size="14" />
              {{ meta(order.status).label }}
            </span>
            <p class="font-semibold">{{ order.total | price }}</p>
          </li>
        }
      </ul>
    </div>

    <!-- Quick links -->
    <div class="mt-8 grid gap-4 sm:grid-cols-3">
      @for (q of quick; track q.link) {
        <a
          [routerLink]="q.link"
          class="group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-all hover:border-accent/40 hover:shadow-md"
        >
          <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-foreground transition-colors group-hover:bg-accent/12 group-hover:text-accent">
            <ng-icon [name]="q.icon" size="20" />
          </span>
          <div>
            <p class="font-semibold">{{ q.title }}</p>
            <p class="text-sm text-muted-foreground">{{ q.desc }}</p>
          </div>
        </a>
      }
    </div>
  `,
})
export class AccountOverview {
  private readonly account = inject(AccountService);
  private readonly wishlist = inject(WishlistService);

  protected readonly recent = () => this.account.orders().slice(0, 3);
  protected meta(s: OrderStatus) {
    return STATUS_META[s];
  }

  protected readonly stats = () => [
    { label: 'Total orders', value: String(this.account.orderCount()), icon: 'lucidePackage' },
    { label: 'In transit', value: String(this.account.activeOrders()), icon: 'lucideTruck' },
    { label: 'Wishlist items', value: String(this.wishlist.count()), icon: 'lucideHeart' },
  ];

  protected readonly quick = [
    { title: 'Addresses', desc: 'Manage delivery info', icon: 'lucideMapPin', link: '/account/addresses' },
    { title: 'Payment', desc: 'Cards & methods', icon: 'lucideCreditCard', link: '/account/payments' },
    { title: 'Settings', desc: 'Profile & security', icon: 'lucideSettings', link: '/account/settings' },
  ];
}
