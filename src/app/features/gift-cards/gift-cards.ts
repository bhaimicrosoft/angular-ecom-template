import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideGift,
  lucideSparkles,
  lucideMail,
  lucideCheck,
  lucideHeart,
  lucideCake,
  lucidePartyPopper,
} from '@ng-icons/lucide';
import { HlmButton } from '../../shared/ui/button';
import { HlmInput, HlmLabel } from '../../shared/ui/input';
import { PricePipe } from '../../shared/ui/price.pipe';
import { StoreConfigService } from '../../core/store-config.service';
import { ToastService } from '../../core/toast.service';

interface CardTheme {
  id: string;
  label: string;
  gradient: string;
  icon: string;
}

@Component({
  selector: 'app-gift-cards',
  standalone: true,
  imports: [FormsModule, PricePipe, NgIcon, HlmButton, HlmInput, HlmLabel],
  providers: [
    provideIcons({
      lucideGift,
      lucideSparkles,
      lucideMail,
      lucideCheck,
      lucideHeart,
      lucideCake,
      lucidePartyPopper,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="relative overflow-hidden border-b border-border">
      <div class="absolute -top-24 right-1/3 -z-10 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl animate-blob"></div>
      <div class="mx-auto max-w-3xl px-4 py-16 text-center">
        <span class="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500 to-orange-400 text-white shadow-lg animate-zoom-in">
          <ng-icon name="lucideGift" size="26" />
        </span>
        <h1 class="text-4xl font-bold tracking-tight animate-fade-up">The gift they\u2019ll actually love</h1>
        <p class="mx-auto mt-3 max-w-md text-muted-foreground animate-fade-up delay-100">
          A Nova gift card never expires and works on everything in store.
        </p>
      </div>
    </section>

    <div class="mx-auto grid max-w-5xl gap-10 px-4 py-14 lg:grid-cols-2">
      <!-- Live preview -->
      <div class="lg:sticky lg:top-24 lg:self-start">
        <div
          class="group relative aspect-[1.6/1] overflow-hidden rounded-3xl bg-gradient-to-br p-7 text-white shadow-2xl transition-transform duration-500 hover:scale-[1.02] {{ theme().gradient }}"
        >
          <div class="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl animate-blob"></div>
          <div class="absolute -bottom-12 -left-6 h-40 w-40 rounded-full bg-black/10 blur-2xl animate-blob delay-300"></div>
          <div class="relative flex h-full flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-2 text-lg font-bold tracking-tight">
                <span class="grid h-8 w-8 place-items-center rounded-lg bg-white/20"><ng-icon [name]="theme().icon" size="17" /></span>
                Nova
              </span>
              <ng-icon name="lucideSparkles" size="20" class="opacity-80 animate-pulse-glow" />
            </div>
            <div>
              <p class="text-sm/none uppercase tracking-widest opacity-80">Gift Card</p>
              <p class="mt-1 text-5xl font-bold tabular-nums">{{ amount() | price }}</p>
            </div>
            <div class="flex items-end justify-between text-sm">
              <div class="max-w-[60%]">
                <p class="opacity-70">To</p>
                <p class="truncate font-medium">{{ form().to || 'Someone special' }}</p>
              </div>
              <div class="text-right">
                <p class="opacity-70">From</p>
                <p class="truncate font-medium">{{ form().from || 'You' }}</p>
              </div>
            </div>
          </div>
        </div>
        @if (form().message) {
          <p class="mt-4 rounded-2xl border border-border bg-card p-4 text-center text-sm italic text-muted-foreground animate-fade-up">
            \u201C{{ form().message }}\u201D
          </p>
        }
      </div>

      <!-- Builder -->
      <div class="space-y-8">
        <div>
          <h3 class="mb-3 text-sm font-semibold">Choose an amount</h3>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
            @for (a of amounts; track a) {
              <button
                type="button"
                (click)="setAmount(a)"
                class="rounded-xl border-2 py-3 text-center font-semibold tabular-nums transition-all"
                [class]="amount() === a && !custom() ? 'border-accent bg-accent/8 text-accent' : 'border-border hover:border-accent/40'"
              >
                {{ a | price }}
              </button>
            }
          </div>
          <div class="mt-3">
            <label hlmLabel>Or enter a custom amount</label>
            <div class="relative mt-1.5">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{{ store.currency().symbol }}</span>
              <input hlmInput type="number" min="5" max="2000" class="pl-7" placeholder="Custom" [ngModel]="customValue()" (ngModelChange)="setCustom($event)" />
            </div>
          </div>
        </div>

        <div>
          <h3 class="mb-3 text-sm font-semibold">Pick a design</h3>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            @for (t of themes; track t.id) {
              <button
                type="button"
                (click)="themeId.set(t.id)"
                [attr.aria-label]="t.label"
                class="relative aspect-square overflow-hidden rounded-xl bg-gradient-to-br ring-2 transition-all {{ t.gradient }}"
                [class]="themeId() === t.id ? 'ring-accent scale-105' : 'ring-transparent hover:ring-accent/40'"
              >
                <ng-icon [name]="t.icon" size="20" class="absolute inset-0 m-auto text-white" />
                @if (themeId() === t.id) {
                  <span class="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-white text-accent">
                    <ng-icon name="lucideCheck" size="11" />
                  </span>
                }
              </button>
            }
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-1.5">
            <label hlmLabel>Recipient name</label>
            <input hlmInput placeholder="Alex" [ngModel]="form().to" (ngModelChange)="patch('to', $event)" />
          </div>
          <div class="space-y-1.5">
            <label hlmLabel>Your name</label>
            <input hlmInput placeholder="Jordan" [ngModel]="form().from" (ngModelChange)="patch('from', $event)" />
          </div>
          <div class="space-y-1.5 sm:col-span-2">
            <label hlmLabel>Recipient email</label>
            <div class="relative">
              <ng-icon name="lucideMail" size="17" class="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input hlmInput type="email" class="pl-10" placeholder="alex@example.com" [ngModel]="form().email" (ngModelChange)="patch('email', $event)" />
            </div>
          </div>
          <div class="space-y-1.5 sm:col-span-2">
            <label hlmLabel>Message (optional)</label>
            <textarea
              hlmInput
              rows="3"
              class="h-auto min-h-20 resize-none"
              placeholder="Happy birthday! Treat yourself \u2728"
              [ngModel]="form().message"
              (ngModelChange)="patch('message', $event)"
            ></textarea>
          </div>
        </div>

        <button hlmBtn variant="accent" size="lg" class="w-full" (click)="addToCart()" [disabled]="!valid()">
          <ng-icon name="lucideGift" size="18" /> Add gift card to cart — {{ amount() | price }}
        </button>
      </div>
    </div>
  `,
})
export class GiftCards {
  private readonly toast = inject(ToastService);
  protected readonly store = inject(StoreConfigService);

  protected readonly amounts = [25, 50, 100, 150, 250, 500];
  protected readonly themes: CardTheme[] = [
    { id: 'aurora', label: 'Aurora', gradient: 'from-fuchsia-500 to-orange-400', icon: 'lucideGift' },
    { id: 'love', label: 'With love', gradient: 'from-rose-500 to-pink-500', icon: 'lucideHeart' },
    { id: 'birthday', label: 'Birthday', gradient: 'from-violet-500 to-indigo-500', icon: 'lucideCake' },
    { id: 'party', label: 'Celebrate', gradient: 'from-sky-500 to-emerald-400', icon: 'lucidePartyPopper' },
  ];

  protected readonly amount = signal(100);
  protected readonly custom = signal(false);
  protected readonly customValue = signal<number | null>(null);
  protected readonly themeId = signal('aurora');

  protected readonly form = signal({ to: '', from: '', email: '', message: '' });

  protected readonly theme = computed(() => this.themes.find((t) => t.id === this.themeId()) ?? this.themes[0]);
  protected readonly valid = computed(() => this.amount() >= 5 && /.+@.+\..+/.test(this.form().email));

  setAmount(a: number): void {
    this.amount.set(a);
    this.custom.set(false);
    this.customValue.set(null);
  }

  setCustom(value: number | null): void {
    this.customValue.set(value);
    if (value && value >= 5) {
      this.custom.set(true);
      this.amount.set(Math.min(value, 2000));
    }
  }

  patch(key: 'to' | 'from' | 'email' | 'message', value: string): void {
    this.form.update((f) => ({ ...f, [key]: value }));
  }

  addToCart(): void {
    this.toast.success(`$${this.amount()} gift card added to cart`);
  }
}
