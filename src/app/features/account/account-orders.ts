import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideClock,
  lucideTruck,
  lucidePackageCheck,
  lucideCircleCheck,
  lucideCircleX,
  lucideChevronDown,
  lucidePackageOpen,
  lucideRotateCcw,
  lucideDownload,
  lucideArrowRight,
} from '@ng-icons/lucide';
import { AccountService, Order, OrderStatus } from '../../core/account.service';
import { HlmButton } from '../../shared/ui/button';
import { PricePipe } from '../../shared/ui/price.pipe';
import { ORDER_STEPS, STATUS_META } from './order-status';

@Component({
  selector: 'app-account-orders',
  standalone: true,
  imports: [RouterLink, NgIcon, HlmButton, PricePipe],
  providers: [
    provideIcons({
      lucideClock,
      lucideTruck,
      lucidePackageCheck,
      lucideCircleCheck,
      lucideCircleX,
      lucideChevronDown,
      lucidePackageOpen,
      lucideRotateCcw,
      lucideDownload,
      lucideArrowRight,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-xl font-bold tracking-tight">Your orders</h2>
      <a routerLink="/track-order" hlmBtn variant="outline" size="sm">
        <ng-icon name="lucideTruck" size="16" /> Track an order
      </a>
    </div>

    @if (orders().length === 0) {
      <div class="rounded-2xl border border-dashed border-border py-16 text-center">
        <ng-icon name="lucidePackageOpen" size="40" class="mx-auto text-muted-foreground" />
        <p class="mt-4 font-semibold">No orders yet</p>
        <a routerLink="/catalog" class="mt-4 inline-flex" hlmBtn variant="accent">Start shopping</a>
      </div>
    } @else {
      <div class="space-y-4">
        @for (order of orders(); track order.id; let i = $index) {
          <div
            class="overflow-hidden rounded-2xl border border-border bg-card animate-fade-up"
            [style.animationDelay]="i * 70 + 'ms'"
          >
            <!-- Summary row -->
            <button
              type="button"
              (click)="toggle(order.id)"
              class="flex w-full flex-wrap items-center gap-4 p-5 text-left transition-colors hover:bg-secondary/40"
            >
              <div class="flex -space-x-3">
                @for (item of order.items.slice(0, 3); track item.title) {
                  <img [src]="item.image" alt="" class="h-12 w-12 rounded-xl border-2 border-card object-cover" />
                }
              </div>
              <div class="min-w-0 flex-1">
                <p class="font-semibold">{{ order.id }}</p>
                <p class="text-sm text-muted-foreground">Placed {{ order.date }}</p>
              </div>
              <span class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold" [class]="meta(order.status).classes">
                <ng-icon [name]="meta(order.status).icon" size="14" />
                {{ meta(order.status).label }}
              </span>
              <p class="font-semibold">{{ order.total | price }}</p>
              <ng-icon
                name="lucideChevronDown"
                size="18"
                class="text-muted-foreground transition-transform duration-300"
                [class.rotate-180]="expanded() === order.id"
              />
            </button>

            <!-- Expanded detail -->
            @if (expanded() === order.id) {
              <div class="border-t border-border p-5 animate-fade-in">
                <!-- Timeline -->
                @if (order.status !== 'cancelled') {
                  <div class="mb-6">
                    <div class="flex items-center justify-between">
                      @for (step of steps; track step; let si = $index) {
                        <div class="flex flex-1 flex-col items-center text-center">
                          <div class="flex w-full items-center">
                            <span class="h-0.5 flex-1" [class]="si === 0 ? 'bg-transparent' : (si <= meta(order.status).step ? 'bg-accent' : 'bg-border')"></span>
                            <span
                              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors"
                              [class]="si <= meta(order.status).step ? 'border-accent bg-accent text-accent-foreground' : 'border-border bg-card text-muted-foreground'"
                            >
                              <ng-icon [name]="stepIcon(si)" size="16" />
                            </span>
                            <span class="h-0.5 flex-1" [class]="si === steps.length - 1 ? 'bg-transparent' : (si < meta(order.status).step ? 'bg-accent' : 'bg-border')"></span>
                          </div>
                          <span class="mt-2 text-xs font-medium" [class]="si <= meta(order.status).step ? 'text-foreground' : 'text-muted-foreground'">
                            {{ stepLabel(si) }}
                          </span>
                        </div>
                      }
                    </div>
                    @if (order.eta) {
                      <p class="mt-4 rounded-xl bg-accent/10 px-4 py-2.5 text-center text-sm font-medium text-accent">
                        Estimated delivery: {{ order.eta }}
                      </p>
                    }
                  </div>
                }

                <!-- Items -->
                <ul class="divide-y divide-border">
                  @for (item of order.items; track item.title) {
                    <li class="flex items-center gap-4 py-3">
                      <img [src]="item.image" alt="" class="h-14 w-14 rounded-xl object-cover" />
                      <div class="min-w-0 flex-1">
                        <p class="truncate font-medium">{{ item.title }}</p>
                        <p class="text-sm text-muted-foreground">Qty {{ item.quantity }}</p>
                      </div>
                      <p class="font-semibold">{{ item.price | price }}</p>
                    </li>
                  }
                </ul>

                @if (order.trackingNumber) {
                  <p class="mt-4 text-sm text-muted-foreground">
                    Tracking #: <span class="font-mono text-foreground">{{ order.trackingNumber }}</span>
                  </p>
                }

                <div class="mt-5 flex flex-wrap gap-3">
                  <button hlmBtn variant="outline" size="sm"><ng-icon name="lucideDownload" size="15" /> Invoice</button>
                  <button hlmBtn variant="outline" size="sm"><ng-icon name="lucideRotateCcw" size="15" /> Buy again</button>
                  @if (order.status === 'delivered') {
                    <a routerLink="/returns" hlmBtn variant="ghost" size="sm">Return or replace</a>
                  }
                </div>
              </div>
            }
          </div>
        }
      </div>
    }
  `,
})
export class AccountOrders {
  private readonly account = inject(AccountService);
  protected readonly orders = this.account.orders;
  protected readonly expanded = signal<string | null>(null);
  protected readonly steps = ORDER_STEPS;

  protected meta(s: OrderStatus) {
    return STATUS_META[s];
  }

  protected stepIcon(i: number): string {
    return STATUS_META[this.steps[i]].icon;
  }

  protected stepLabel(i: number): string {
    return STATUS_META[this.steps[i]].label;
  }

  toggle(id: string): void {
    this.expanded.update((cur) => (cur === id ? null : id));
  }
}
