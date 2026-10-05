import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCheck,
  lucideChevronRight,
  lucideTruck,
  lucideCreditCard,
  lucideMapPin,
  lucideLock,
  lucideShoppingBag,
  lucidePlus,
  lucidePencil,
  lucideX,
  lucideStar,
} from '@ng-icons/lucide';
import { CartService } from '../../core/cart.service';
import { AccountService, Address } from '../../core/account.service';
import { StoreConfigService, ShippingMethod } from '../../core/store-config.service';
import { ToastService } from '../../core/toast.service';
import { PAYMENT_PROVIDER } from '../../core/providers/payment.provider';
import { DraftOrder, OrderAddress, OrderItem, OrderQuote } from '../../core/providers/models';
import { toProviderError } from '../../core/providers/provider-error';
import { HlmButton } from '../../shared/ui/button';
import { HlmInput, HlmLabel } from '../../shared/ui/input';
import { PricePipe } from '../../shared/ui/price.pipe';

/** Effective address used for the order (resolved from a saved or manual entry). */
export interface ResolvedAddress {
  name: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
}

interface QuickAddress {
  firstName: string;
  lastName: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

type Target = 'shipping' | 'billing';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [RouterLink, FormsModule, NgIcon, HlmButton, HlmInput, HlmLabel, PricePipe],
  providers: [
    provideIcons({
      lucideCheck,
      lucideChevronRight,
      lucideTruck,
      lucideCreditCard,
      lucideMapPin,
      lucideLock,
      lucideShoppingBag,
      lucidePlus,
      lucidePencil,
      lucideX,
      lucideStar,
    }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './checkout.html',
})
export class Checkout {
  protected readonly cart = inject(CartService);
  protected readonly account = inject(AccountService);
  protected readonly config = inject(StoreConfigService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly paymentGateway = inject(PAYMENT_PROVIDER);

  protected readonly step = signal(1);
  protected readonly placing = signal(false);

  // Contact --------------------------------------------------------------
  protected readonly email = signal('');
  protected readonly emailValid = computed(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email()));

  // Saved addresses ------------------------------------------------------
  protected readonly savedAddresses = this.account.addresses;
  protected readonly hasSaved = computed(() => this.savedAddresses().length > 0);

  // Shipping selection ---------------------------------------------------
  protected readonly useNewShipping = signal(false);
  protected readonly selectedShippingId = signal<string | null>(null);
  protected readonly manualShipping = signal<QuickAddress>(this.blankQuick());
  protected readonly saveShippingToAccount = signal(true);
  protected readonly useSavedShipping = computed(() => this.hasSaved() && !this.useNewShipping());

  // Billing selection ----------------------------------------------------
  protected readonly billingSame = signal(true);
  protected readonly useNewBilling = signal(false);
  protected readonly selectedBillingId = signal<string | null>(null);
  protected readonly manualBilling = signal<QuickAddress>(this.blankQuick());
  protected readonly useSavedBilling = computed(() => this.hasSaved() && !this.useNewBilling());

  // Saved-address editor (add / edit) ------------------------------------
  protected readonly editorOpen = signal(false);
  protected readonly editorTarget = signal<Target>('shipping');
  protected readonly editorDraft = signal<Address>(this.blankAddress());
  protected readonly editorSaving = signal(false);
  protected readonly editorValid = computed(() => {
    const d = this.editorDraft();
    return !!(d.label && d.name && d.line1 && d.city && d.state && d.zip && d.country);
  });

  protected readonly shippingMethods = computed(() => this.config.shipping().methods);
  protected readonly shippingMethodId = signal<string>('');
  protected readonly shippingMethod = computed<ShippingMethod>(() => {
    const list = this.shippingMethods();
    return (
      list.find((m) => m.id === this.shippingMethodId()) ??
      list[0] ?? { id: '', label: '', desc: '', price: 0 }
    );
  });

  protected readonly payment = signal({ card: '', name: '', expiry: '', cvc: '' });

  protected readonly steps = [
    { n: 1, label: 'Information', icon: 'lucideMapPin' },
    { n: 2, label: 'Shipping', icon: 'lucideTruck' },
    { n: 3, label: 'Payment', icon: 'lucideCreditCard' },
  ];

  constructor() {
    const def = this.savedAddresses().find((a) => a.isDefault) ?? this.savedAddresses()[0];
    if (def) this.selectedShippingId.set(def.id);
    else this.useNewShipping.set(true);
    this.shippingMethodId.set(this.shippingMethods()[0]?.id ?? '');
  }

  // Resolved addresses ---------------------------------------------------
  protected readonly shippingAddress = computed<ResolvedAddress | null>(() =>
    this.resolve(this.useSavedShipping(), this.selectedShippingId(), this.manualShipping()),
  );

  protected readonly billingAddress = computed<ResolvedAddress | null>(() => {
    if (this.billingSame()) return this.shippingAddress();
    return this.resolve(this.useSavedBilling(), this.selectedBillingId(), this.manualBilling());
  });

  protected readonly orderTotal = computed(
    () =>
      Math.max(0, this.cart.subtotal() - this.cart.discount()) +
      this.shippingMethod().price +
      this.cart.tax(),
  );

  protected readonly infoValid = computed(() => {
    if (!this.emailValid()) return false;
    if (!this.shippingAddress()) return false;
    if (!this.billingSame() && !this.billingAddress()) return false;
    return true;
  });

  protected readonly paymentValid = computed(() => {
    const p = this.payment();
    return !!(p.card && p.name && p.expiry && p.cvc);
  });

  // Shipping/billing selection actions -----------------------------------
  selectShipping(id: string): void {
    this.selectedShippingId.set(id);
    this.useNewShipping.set(false);
  }
  selectBilling(id: string): void {
    this.selectedBillingId.set(id);
    this.useNewBilling.set(false);
  }

  showManualShipping(): void {
    this.useNewShipping.set(true);
  }
  showSavedShipping(): void {
    this.useNewShipping.set(false);
    if (!this.selectedShippingId()) {
      const first = this.savedAddresses()[0];
      if (first) this.selectedShippingId.set(first.id);
    }
  }

  setBillingSame(same: boolean): void {
    this.billingSame.set(same);
    if (!same && !this.selectedBillingId() && !this.useNewBilling()) {
      const def = this.savedAddresses().find((a) => a.isDefault) ?? this.savedAddresses()[0];
      if (def) this.selectedBillingId.set(def.id);
      else this.useNewBilling.set(true);
    }
  }
  showManualBilling(): void {
    this.useNewBilling.set(true);
  }
  showSavedBilling(): void {
    this.useNewBilling.set(false);
    if (!this.selectedBillingId()) {
      const first = this.savedAddresses()[0];
      if (first) this.selectedBillingId.set(first.id);
    }
  }

  updateManual(target: Target, key: keyof QuickAddress, value: string): void {
    const sig = target === 'shipping' ? this.manualShipping : this.manualBilling;
    sig.update((q) => ({ ...q, [key]: value }));
  }

  updatePayment(key: 'card' | 'name' | 'expiry' | 'cvc', value: string): void {
    this.payment.update((p) => ({ ...p, [key]: value }));
  }

  // Saved-address editor -------------------------------------------------
  openAddAddress(target: Target): void {
    this.editorTarget.set(target);
    this.editorDraft.set(this.blankAddress());
    this.editorOpen.set(true);
  }
  openEditAddress(target: Target, addr: Address): void {
    this.editorTarget.set(target);
    this.editorDraft.set({ ...addr });
    this.editorOpen.set(true);
  }
  patchEditor<K extends keyof Address>(key: K, value: Address[K]): void {
    this.editorDraft.update((d) => ({ ...d, [key]: value }));
  }
  closeEditor(): void {
    this.editorOpen.set(false);
  }

  async saveEditor(): Promise<void> {
    if (!this.editorValid() || this.editorSaving()) return;
    this.editorSaving.set(true);
    const record: Address = {
      ...this.editorDraft(),
      id: this.editorDraft().id || this.account.newId('addr'),
    };
    await this.account.saveAddress(record);
    this.editorSaving.set(false);
    this.editorOpen.set(false);
    if (this.editorTarget() === 'shipping') this.selectShipping(record.id);
    else {
      this.billingSame.set(false);
      this.selectBilling(record.id);
    }
    this.toast.success('Address saved');
  }

  // Navigation -----------------------------------------------------------
  async next(): Promise<void> {
    if (this.step() === 1) {
      if (!this.infoValid()) return;
      // Persist a freshly typed shipping address when the shopper opts in.
      if (this.useNewShipping() && this.saveShippingToAccount()) {
        const a = this.shippingAddress();
        if (a) {
          const first = !this.hasSaved();
          await this.account.saveAddress({
            id: this.account.newId('addr'),
            label: 'Shipping',
            name: a.name,
            line1: a.line1,
            city: a.city,
            state: a.state,
            zip: a.zip,
            country: a.country,
            phone: a.phone ?? '',
            isDefault: first,
          });
        }
      }
    }
    this.step.update((s) => Math.min(3, s + 1));
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  back(): void {
    this.step.update((s) => Math.max(1, s - 1));
  }

  async placeOrder(): Promise<void> {
    if (!this.paymentValid() || this.placing()) return;
    this.placing.set(true);
    try {
      // Price the cart server-side — the charged amount comes from the backend,
      // never from the client cart (re-prices items + validates the coupon).
      const quote = await this.account.quoteOrder({
        items: this.cart.lines().map((l) => ({
          productId: l.product.id,
          variantId: l.variant?.id,
          title: l.product.title,
          unitPrice: l.variant?.price ?? l.product.price,
          quantity: l.quantity,
        })),
        couponCode: this.cart.couponCode() ?? undefined,
        shippingMethodId: this.shippingMethod().id,
        currency: this.config.currency().code,
      });
      const draft = this.buildDraft(quote);
      const session = await this.paymentGateway.createPaymentSession({
        amount: quote.total,
        currency: quote.currency,
        email: draft.email,
      });
      const result = await this.paymentGateway.confirm(session.id, this.payment());
      if (!result.success) {
        this.toast.show(result.error ?? 'Payment failed. Please try another method.', 'accent');
        return;
      }
      const order = await this.account.createOrder(draft);
      this.cart.clear();
      this.router.navigate(['/order-confirmation'], { state: { orderId: order.id } });
    } catch (err) {
      this.toast.show(toProviderError(err).message, 'accent');
    } finally {
      this.placing.set(false);
    }
  }

  /** Assemble the order from the addresses, cart items and the server quote. */
  private buildDraft(quote: OrderQuote): DraftOrder {
    const ship = this.shippingAddress()!;
    const bill = this.billingAddress() ?? ship;
    const method = this.shippingMethod();
    const items: OrderItem[] = this.cart.lines().map((l) => ({
      title: l.product.title,
      image: l.variant?.image ?? l.product.thumbnail,
      price: l.variant?.price ?? l.product.price,
      quantity: l.quantity,
    }));
    return {
      email: this.email(),
      items,
      shippingAddress: this.toOrderAddress(ship),
      billingAddress: this.toOrderAddress(bill),
      shippingMethod: { id: method.id, label: method.label, price: quote.shipping },
      subtotal: quote.subtotal,
      discount: quote.discount,
      tax: quote.tax,
      total: quote.total,
      currency: quote.currency,
    };
  }

  private toOrderAddress(a: ResolvedAddress): OrderAddress {
    return {
      name: a.name,
      line1: a.line1,
      city: a.city,
      state: a.state,
      zip: a.zip,
      country: a.country,
      phone: a.phone,
    };
  }

  // Helpers --------------------------------------------------------------
  private resolve(useSaved: boolean, savedId: string | null, quick: QuickAddress): ResolvedAddress | null {
    if (useSaved) {
      const a = this.savedAddresses().find((x) => x.id === savedId);
      return a
        ? { name: a.name, line1: a.line1, city: a.city, state: a.state, zip: a.zip, country: a.country, phone: a.phone }
        : null;
    }
    if (!quick.firstName || !quick.lastName || !quick.line1 || !quick.city || !quick.zip || !quick.country) {
      return null;
    }
    return {
      name: `${quick.firstName} ${quick.lastName}`.trim(),
      line1: quick.line1,
      city: quick.city,
      state: quick.state,
      zip: quick.zip,
      country: quick.country,
    };
  }

  private blankQuick(): QuickAddress {
    return { firstName: '', lastName: '', line1: '', city: '', state: '', zip: '', country: 'United States' };
  }

  private blankAddress(): Address {
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
