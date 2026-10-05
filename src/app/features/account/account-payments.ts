import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCreditCard,
  lucidePlus,
  lucideTrash2,
  lucideCheck,
  lucideStar,
  lucideX,
  lucideShieldCheck,
} from '@ng-icons/lucide';
import { AccountService, PaymentMethod } from '../../core/account.service';
import { HlmButton } from '../../shared/ui/button';
import { HlmInput, HlmLabel } from '../../shared/ui/input';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-account-payments',
  standalone: true,
  imports: [FormsModule, NgIcon, HlmButton, HlmInput, HlmLabel],
  providers: [
    provideIcons({
      lucideCreditCard,
      lucidePlus,
      lucideTrash2,
      lucideCheck,
      lucideStar,
      lucideX,
      lucideShieldCheck,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-xl font-bold tracking-tight">Payment methods</h2>
      @if (!editing()) {
        <button hlmBtn variant="accent" size="sm" (click)="add()">
          <ng-icon name="lucidePlus" size="16" /> Add card
        </button>
      }
    </div>

    @if (editing()) {
      <div class="mb-6 rounded-2xl border border-border bg-card p-6 animate-scale-in">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="font-semibold">New card</h3>
          <button hlmBtn variant="ghost" size="icon-sm" (click)="cancel()"><ng-icon name="lucideX" size="18" /></button>
        </div>

        <!-- Live card preview -->
        <div class="mb-6 aspect-[16/10] max-w-sm overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-accent/70 p-5 text-primary-foreground shadow-xl">
          <div class="flex h-full flex-col justify-between">
            <div class="flex items-center justify-between">
              <span class="h-9 w-11 rounded-md bg-primary-foreground/25"></span>
              <span class="text-sm font-semibold uppercase tracking-widest">{{ brand() }}</span>
            </div>
            <p class="font-mono text-lg tracking-[0.2em]">{{ maskedNumber() }}</p>
            <div class="flex items-center justify-between text-xs">
              <span class="uppercase">{{ draft().holder || 'CARD HOLDER' }}</span>
              <span>{{ draft().expiry || 'MM/YY' }}</span>
            </div>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2 sm:col-span-2">
            <label hlmLabel>Card number</label>
            <input hlmInput inputmode="numeric" maxlength="19" placeholder="4242 4242 4242 4242" [ngModel]="cardNumber()" (ngModelChange)="onNumber($event)" />
          </div>
          <div class="space-y-2">
            <label hlmLabel>Cardholder</label>
            <input hlmInput placeholder="Ada Lovelace" [ngModel]="draft().holder" (ngModelChange)="patch('holder', $event)" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label hlmLabel>Expiry</label>
              <input hlmInput placeholder="08/28" maxlength="5" [ngModel]="draft().expiry" (ngModelChange)="patch('expiry', $event)" />
            </div>
            <div class="space-y-2">
              <label hlmLabel>CVC</label>
              <input hlmInput placeholder="123" maxlength="4" inputmode="numeric" [ngModel]="cvc()" (ngModelChange)="cvc.set($event)" />
            </div>
          </div>
        </div>
        <label class="mt-4 flex cursor-pointer select-none items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" class="h-4 w-4 rounded border-input accent-accent" [ngModel]="draft().isDefault" (ngModelChange)="patch('isDefault', $event)" />
          Set as default payment method
        </label>
        <p class="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <ng-icon name="lucideShieldCheck" size="14" class="text-success" /> Your details are encrypted and never stored in plain text.
        </p>
        <div class="mt-5 flex gap-3">
          <button hlmBtn variant="accent" (click)="save()" [disabled]="!valid() || saving()">
            @if (saving()) { <span class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span> Saving… }
            @else { <ng-icon name="lucideCheck" size="17" /> Save card }
          </button>
          <button hlmBtn variant="ghost" (click)="cancel()">Cancel</button>
        </div>
      </div>
    }

    @if (payments().length === 0 && !editing()) {
      <div class="rounded-2xl border border-dashed border-border py-16 text-center">
        <ng-icon name="lucideCreditCard" size="40" class="mx-auto text-muted-foreground" />
        <p class="mt-4 font-semibold">No payment methods</p>
      </div>
    }
    <div class="grid gap-4 sm:grid-cols-2">
      @for (card of payments(); track card.id; let i = $index) {
        <div
          class="relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-md animate-fade-up"
          [class.ring-2]="card.isDefault"
          [class.ring-accent]="card.isDefault"
          [style.animationDelay]="i * 70 + 'ms'"
        >
          <div class="flex items-center justify-between">
            <span class="text-sm font-bold uppercase tracking-widest">{{ card.brand }}</span>
            @if (card.isDefault) {
              <span class="inline-flex items-center gap-1 rounded-full bg-accent/12 px-2.5 py-0.5 text-xs font-semibold text-accent">
                <ng-icon name="lucideStar" size="12" /> Default
              </span>
            }
          </div>
          <p class="mt-4 font-mono text-lg tracking-widest">•••• •••• •••• {{ card.last4 }}</p>
          <div class="mt-2 flex items-center justify-between text-sm text-muted-foreground">
            <span>{{ card.holder }}</span>
            <span>Exp {{ card.expiry }}</span>
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            @if (!card.isDefault) {
              <button hlmBtn variant="outline" size="sm" (click)="makeDefault(card.id)">Set default</button>
            }
            <button hlmBtn variant="ghost" size="sm" class="text-destructive hover:bg-destructive/10" (click)="remove(card.id)">
              <ng-icon name="lucideTrash2" size="15" /> Remove
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class AccountPayments {
  private readonly account = inject(AccountService);
  private readonly toast = inject(ToastService);

  protected readonly payments = this.account.payments;
  protected readonly editing = signal(false);
  protected readonly saving = signal(false);
  protected readonly cardNumber = signal('');
  protected readonly cvc = signal('');
  protected readonly draft = signal<PaymentMethod>(this.blank());

  protected readonly brand = computed<PaymentMethod['brand']>(() => {
    const n = this.cardNumber().replace(/\s/g, '');
    if (n.startsWith('4')) return 'visa';
    if (n.startsWith('3')) return 'amex';
    return 'mastercard';
  });

  protected readonly maskedNumber = computed(() => {
    const n = this.cardNumber().replace(/\s/g, '');
    if (!n) return '•••• •••• •••• ••••';
    const padded = n.padEnd(16, '•');
    return (padded.match(/.{1,4}/g) ?? []).join(' ');
  });

  protected readonly valid = computed(() => {
    const digits = this.cardNumber().replace(/\s/g, '');
    return digits.length >= 15 && !!this.draft().holder && /^\d\d\/\d\d$/.test(this.draft().expiry) && this.cvc().length >= 3;
  });

  patch<K extends keyof PaymentMethod>(key: K, value: PaymentMethod[K]): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
  }

  onNumber(value: string): void {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    const grouped = (digits.match(/.{1,4}/g) ?? []).join(' ');
    this.cardNumber.set(grouped);
  }

  add(): void {
    this.draft.set(this.blank());
    this.cardNumber.set('');
    this.cvc.set('');
    this.editing.set(true);
  }

  cancel(): void {
    this.editing.set(false);
  }

  async save(): Promise<void> {
    if (!this.valid()) return;
    this.saving.set(true);
    const digits = this.cardNumber().replace(/\s/g, '');
    const record: PaymentMethod = {
      ...this.draft(),
      id: this.account.newId('pay'),
      brand: this.brand(),
      last4: digits.slice(-4),
    };
    await this.account.savePayment(record);
    this.saving.set(false);
    this.editing.set(false);
    this.toast.success('Card added');
  }

  async makeDefault(id: string): Promise<void> {
    await this.account.makeDefaultPayment(id);
    this.toast.success('Default card updated');
  }

  async remove(id: string): Promise<void> {
    await this.account.removePayment(id);
    this.toast.success('Card removed');
  }

  private blank(): PaymentMethod {
    return { id: '', brand: 'visa', last4: '', expiry: '', holder: '', isDefault: false };
  }
}
