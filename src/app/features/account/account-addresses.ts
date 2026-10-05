import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideMapPin,
  lucidePlus,
  lucidePencil,
  lucideTrash2,
  lucideCheck,
  lucideStar,
  lucideX,
} from '@ng-icons/lucide';
import { AccountService, Address } from '../../core/account.service';
import { HlmButton } from '../../shared/ui/button';
import { HlmInput, HlmLabel } from '../../shared/ui/input';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-account-addresses',
  standalone: true,
  imports: [FormsModule, NgIcon, HlmButton, HlmInput, HlmLabel],
  providers: [
    provideIcons({
      lucideMapPin,
      lucidePlus,
      lucidePencil,
      lucideTrash2,
      lucideCheck,
      lucideStar,
      lucideX,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-6 flex items-center justify-between">
      <h2 class="text-xl font-bold tracking-tight">Saved addresses</h2>
      @if (!editing()) {
        <button hlmBtn variant="accent" size="sm" (click)="add()">
          <ng-icon name="lucidePlus" size="16" /> Add address
        </button>
      }
    </div>

    @if (editing()) {
      <!-- Editor -->
      <div class="mb-6 rounded-2xl border border-border bg-card p-6 animate-scale-in">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="font-semibold">{{ draft().id ? 'Edit address' : 'New address' }}</h3>
          <button hlmBtn variant="ghost" size="icon-sm" (click)="cancel()"><ng-icon name="lucideX" size="18" /></button>
        </div>
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <label hlmLabel>Label</label>
            <input hlmInput placeholder="Home, Work…" [ngModel]="draft().label" (ngModelChange)="patch('label', $event)" />
          </div>
          <div class="space-y-2">
            <label hlmLabel>Full name</label>
            <input hlmInput placeholder="Ada Lovelace" [ngModel]="draft().name" (ngModelChange)="patch('name', $event)" />
          </div>
          <div class="space-y-2 sm:col-span-2">
            <label hlmLabel>Street address</label>
            <input hlmInput placeholder="128 Market Street, Apt 9" [ngModel]="draft().line1" (ngModelChange)="patch('line1', $event)" />
          </div>
          <div class="space-y-2">
            <label hlmLabel>City</label>
            <input hlmInput placeholder="San Francisco" [ngModel]="draft().city" (ngModelChange)="patch('city', $event)" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label hlmLabel>State</label>
              <input hlmInput placeholder="CA" [ngModel]="draft().state" (ngModelChange)="patch('state', $event)" />
            </div>
            <div class="space-y-2">
              <label hlmLabel>ZIP</label>
              <input hlmInput placeholder="94103" [ngModel]="draft().zip" (ngModelChange)="patch('zip', $event)" />
            </div>
          </div>
          <div class="space-y-2">
            <label hlmLabel>Country</label>
            <input hlmInput placeholder="United States" [ngModel]="draft().country" (ngModelChange)="patch('country', $event)" />
          </div>
          <div class="space-y-2">
            <label hlmLabel>Phone (optional)</label>
            <input hlmInput placeholder="+1 (415) 555-0101" [ngModel]="draft().phone" (ngModelChange)="patch('phone', $event)" />
          </div>
        </div>
        <label class="mt-4 flex cursor-pointer select-none items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" class="h-4 w-4 rounded border-input accent-accent" [ngModel]="draft().isDefault" (ngModelChange)="patch('isDefault', $event)" />
          Set as default address
        </label>
        <div class="mt-5 flex gap-3">
          <button hlmBtn variant="accent" (click)="save()" [disabled]="!valid() || saving()">
            @if (saving()) { <span class="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span> Saving… }
            @else { <ng-icon name="lucideCheck" size="17" /> Save address }
          </button>
          <button hlmBtn variant="ghost" (click)="cancel()">Cancel</button>
        </div>
      </div>
    }

    <!-- List -->
    @if (addresses().length === 0 && !editing()) {
      <div class="rounded-2xl border border-dashed border-border py-16 text-center">
        <ng-icon name="lucideMapPin" size="40" class="mx-auto text-muted-foreground" />
        <p class="mt-4 font-semibold">No addresses saved</p>
      </div>
    }
    <div class="grid gap-4 sm:grid-cols-2">
      @for (addr of addresses(); track addr.id; let i = $index) {
        <div
          class="relative rounded-2xl border border-border bg-card p-5 transition-all hover:shadow-md animate-fade-up"
          [class.ring-2]="addr.isDefault"
          [class.ring-accent]="addr.isDefault"
          [style.animationDelay]="i * 70 + 'ms'"
        >
          <div class="flex items-center justify-between">
            <span class="inline-flex items-center gap-2 font-semibold">
              <ng-icon name="lucideMapPin" size="16" class="text-accent" /> {{ addr.label }}
            </span>
            @if (addr.isDefault) {
              <span class="inline-flex items-center gap-1 rounded-full bg-accent/12 px-2.5 py-0.5 text-xs font-semibold text-accent">
                <ng-icon name="lucideStar" size="12" /> Default
              </span>
            }
          </div>
          <div class="mt-3 space-y-0.5 text-sm text-muted-foreground">
            <p class="font-medium text-foreground">{{ addr.name }}</p>
            <p>{{ addr.line1 }}</p>
            <p>{{ addr.city }}, {{ addr.state }} {{ addr.zip }}</p>
            <p>{{ addr.country }}</p>
            @if (addr.phone) { <p>{{ addr.phone }}</p> }
          </div>
          <div class="mt-4 flex flex-wrap gap-2">
            @if (!addr.isDefault) {
              <button hlmBtn variant="outline" size="sm" (click)="makeDefault(addr.id)">Set default</button>
            }
            <button hlmBtn variant="ghost" size="sm" (click)="edit(addr)"><ng-icon name="lucidePencil" size="15" /> Edit</button>
            <button hlmBtn variant="ghost" size="sm" class="text-destructive hover:bg-destructive/10" (click)="remove(addr.id)">
              <ng-icon name="lucideTrash2" size="15" /> Remove
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class AccountAddresses {
  private readonly account = inject(AccountService);
  private readonly toast = inject(ToastService);

  protected readonly addresses = this.account.addresses;
  protected readonly editing = signal(false);
  protected readonly saving = signal(false);
  protected readonly draft = signal<Address>(this.blank());

  protected readonly valid = computed(() => {
    const d = this.draft();
    return !!(d.label && d.name && d.line1 && d.city && d.state && d.zip && d.country);
  });

  patch<K extends keyof Address>(key: K, value: Address[K]): void {
    this.draft.update((d) => ({ ...d, [key]: value }));
  }

  add(): void {
    this.draft.set(this.blank());
    this.editing.set(true);
  }

  edit(addr: Address): void {
    this.draft.set({ ...addr });
    this.editing.set(true);
  }

  cancel(): void {
    this.editing.set(false);
  }

  async save(): Promise<void> {
    if (!this.valid()) return;
    this.saving.set(true);
    const record = { ...this.draft(), id: this.draft().id || this.account.newId('addr') };
    await this.account.saveAddress(record);
    this.saving.set(false);
    this.editing.set(false);
    this.toast.success('Address saved');
  }

  async makeDefault(id: string): Promise<void> {
    await this.account.makeDefaultAddress(id);
    this.toast.success('Default address updated');
  }

  async remove(id: string): Promise<void> {
    await this.account.removeAddress(id);
    this.toast.success('Address removed');
  }

  private blank(): Address {
    return {
      id: '',
      label: '',
      name: '',
      line1: '',
      city: '',
      state: '',
      zip: '',
      country: 'United States',
      phone: '',
      isDefault: false,
    };
  }
}
