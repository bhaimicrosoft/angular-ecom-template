import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideSearch,
  lucidePackage,
  lucideClock,
  lucideTruck,
  lucidePackageCheck,
  lucideCircleCheck,
  lucideCircleX,
  lucideMapPin,
  lucideTriangleAlert,
  lucideArrowRight,
} from '@ng-icons/lucide';
import { AccountService, Order } from '../../core/account.service';
import { STATUS_META } from '../account/order-status';
import { HlmButton } from '../../shared/ui/button';
import { HlmInput } from '../../shared/ui/input';
import { PricePipe } from '../../shared/ui/price.pipe';

@Component({
  selector: 'app-track-order',
  standalone: true,
  imports: [FormsModule, PricePipe, NgIcon, HlmButton, HlmInput],
  providers: [
    provideIcons({
      lucideSearch,
      lucidePackage,
      lucideClock,
      lucideTruck,
      lucidePackageCheck,
      lucideCircleCheck,
      lucideCircleX,
      lucideMapPin,
      lucideTriangleAlert,
      lucideArrowRight,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="relative overflow-hidden border-b border-border">
      <div class="absolute -top-24 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 rounded-full bg-accent/20 blur-3xl animate-blob"></div>
      <div class="mx-auto max-w-3xl px-4 py-16 text-center">
        <span class="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/12 text-accent animate-zoom-in">
          <ng-icon name="lucidePackage" size="26" />
        </span>
        <h1 class="text-4xl font-bold tracking-tight animate-fade-up">Track your order</h1>
        <p class="mx-auto mt-3 max-w-md text-muted-foreground animate-fade-up delay-100">
          Enter your order number to see live status and estimated delivery.
        </p>

        <form (submit)="track($event)" class="mx-auto mt-8 flex max-w-md gap-2 animate-fade-up delay-200">
          <div class="relative flex-1">
            <ng-icon name="lucideSearch" size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input hlmInput class="pl-10" placeholder="e.g. NOVA-4821" [ngModel]="query()" (ngModelChange)="query.set($event)" name="orderId" />
          </div>
          <button hlmBtn variant="accent" type="submit" [disabled]="loading()">
            @if (loading()) { <span class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span> }
            @else { Track }
          </button>
        </form>

        <div class="mx-auto mt-4 flex max-w-md flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>Try:</span>
          @for (id of demoIds; track id) {
            <button type="button" (click)="query.set(id); track()" class="rounded-full border border-border px-2.5 py-1 font-medium transition-colors hover:border-accent hover:text-accent">
              {{ id }}
            </button>
          }
        </div>
      </div>
    </section>

    <div class="mx-auto max-w-3xl px-4 py-12">
      @if (notFound()) {
        <div class="flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive animate-fade-up">
          <ng-icon name="lucideTriangleAlert" size="20" />
          <span>We couldn\u2019t find an order matching <strong>{{ searched() }}</strong>. Double-check the number and try again.</span>
        </div>
      }

      @if (order(); as o) {
        <div class="animate-fade-up">
          <div class="flex flex-wrap items-start justify-between gap-4 rounded-t-2xl border border-border bg-card p-6">
            <div>
              <p class="text-xs uppercase tracking-wide text-muted-foreground">Order</p>
              <p class="text-lg font-bold">{{ o.id }}</p>
              <p class="mt-1 text-sm text-muted-foreground">Placed {{ o.date }}</p>
            </div>
            <div class="text-right">
              <span class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold {{ meta(o).classes }}">
                <ng-icon [name]="meta(o).icon" size="13" /> {{ meta(o).label }}
              </span>
              @if (o.eta) { <p class="mt-2 text-sm font-medium text-accent">{{ o.eta }}</p> }
            </div>
          </div>

          <!-- Timeline -->
          <div class="border-x border-border bg-card px-6 py-8">
            @if (o.status === 'cancelled') {
              <div class="flex items-center gap-3 text-destructive">
                <ng-icon name="lucideCircleX" size="22" />
                <span class="font-medium">This order was cancelled.</span>
              </div>
            } @else {
              <ol class="relative">
                @for (s of steps; track s.key; let i = $index; let last = $last) {
                  <li class="relative flex gap-4 pb-8 last:pb-0">
                    @if (!last) {
                      <span
                        class="absolute left-[19px] top-10 h-[calc(100%-1.5rem)] w-0.5"
                        [class]="i < currentStep(o) ? 'bg-accent' : 'bg-border'"
                      ></span>
                    }
                    <span
                      class="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500"
                      [class]="stepClasses(o, i)"
                    >
                      <ng-icon [name]="s.icon" size="18" />
                      @if (i === currentStep(o) && o.status !== 'delivered') {
                        <span class="absolute inset-0 animate-ping rounded-full border-2 border-accent"></span>
                      }
                    </span>
                    <div class="pt-1.5">
                      <p class="font-semibold" [class.text-muted-foreground]="i > currentStep(o)">{{ s.label }}</p>
                      <p class="text-sm text-muted-foreground">{{ i <= currentStep(o) ? s.done : s.pending }}</p>
                    </div>
                  </li>
                }
              </ol>
            }
          </div>

          <!-- Items + tracking -->
          <div class="rounded-b-2xl border border-border bg-card p-6">
            @if (o.trackingNumber) {
              <div class="mb-5 flex items-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm">
                <ng-icon name="lucideMapPin" size="16" class="text-accent" />
                Tracking number: <span class="font-mono font-medium">{{ o.trackingNumber }}</span>
              </div>
            }
            <ul class="space-y-3">
              @for (item of o.items; track item.title) {
                <li class="flex items-center gap-3">
                  <img [src]="item.image" alt="" class="h-12 w-12 rounded-lg object-cover" />
                  <div class="flex-1">
                    <p class="text-sm font-medium">{{ item.title }}</p>
                    <p class="text-xs text-muted-foreground">Qty {{ item.quantity }}</p>
                  </div>
                  <span class="text-sm font-semibold">{{ item.price * item.quantity | price }}</span>
                </li>
              }
            </ul>
          </div>
        </div>
      }
    </div>
  `,
})
export class TrackOrder {
  private readonly account = inject(AccountService);

  protected readonly query = signal('');
  protected readonly searched = signal('');
  protected readonly loading = signal(false);
  protected readonly order = signal<Order | undefined>(undefined);
  protected readonly notFound = signal(false);

  protected readonly demoIds = ['NOVA-4821', 'NOVA-4655', 'NOVA-4390'];

  protected readonly steps = [
    { key: 'processing', label: 'Order confirmed', icon: 'lucideClock', done: 'We\u2019ve received your order.', pending: 'Awaiting confirmation.' },
    { key: 'shipped', label: 'Shipped', icon: 'lucideTruck', done: 'Your parcel is on the move.', pending: 'Preparing for dispatch.' },
    { key: 'out_for_delivery', label: 'Out for delivery', icon: 'lucidePackageCheck', done: 'Arriving soon.', pending: 'Not yet out for delivery.' },
    { key: 'delivered', label: 'Delivered', icon: 'lucideCircleCheck', done: 'Enjoy your order!', pending: 'Delivery pending.' },
  ];

  async track(event?: Event): Promise<void> {
    event?.preventDefault();
    const id = this.query().trim();
    if (!id) return;
    this.loading.set(true);
    this.notFound.set(false);
    this.order.set(undefined);
    await new Promise((r) => setTimeout(r, 600));
    const found = this.account.findOrder(id);
    this.searched.set(id);
    this.order.set(found);
    this.notFound.set(!found);
    this.loading.set(false);
  }

  protected meta(o: Order) {
    return STATUS_META[o.status];
  }

  protected currentStep(o: Order): number {
    return STATUS_META[o.status].step;
  }

  protected stepClasses(o: Order, i: number): string {
    const cur = this.currentStep(o);
    if (i < cur) return 'border-accent bg-accent text-accent-foreground';
    if (i === cur) return 'border-accent bg-accent/12 text-accent';
    return 'border-border bg-card text-muted-foreground';
  }
}
