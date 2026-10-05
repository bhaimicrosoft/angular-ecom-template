/**
 * ============================================================================
 *  Normalized write-side domain models
 * ============================================================================
 *  The mirror image of `shared/data/models.ts` (the read side). Every write
 *  provider — auth, commerce, cart, payment — speaks in these shapes, so the UI
 *  never changes when you swap the backend behind a provider token.
 *
 *  These types are framework-free (no Angular imports) and are re-exported from
 *  the stateful services (`AuthService`, `AccountService`) so existing imports
 *  keep working.
 */

// ── Auth ────────────────────────────────────────────────────────────────────

/** The authenticated user the UI consumes. Map your API's user payload to this. */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

/** Third-party identity providers offered on the auth screens. */
export type OAuthProvider = 'google' | 'apple' | 'github';

// ── Orders & account ────────────────────────────────────────────────────────

export type OrderStatus =
  | 'processing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  title: string;
  image: string;
  price: number;
  quantity: number;
}

/** A flattened address as stored on an order. */
export interface OrderAddress {
  name: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
}

export interface Order {
  id: string;
  date: string;
  status: OrderStatus;
  total: number;
  items: OrderItem[];
  trackingNumber?: string;
  eta?: string;
  email?: string;
  shippingAddress?: OrderAddress;
}

export interface Address {
  id: string;
  label: string;
  name: string;
  line1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone?: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  brand: 'visa' | 'mastercard' | 'amex';
  last4: string;
  expiry: string;
  holder: string;
  isDefault: boolean;
}

/**
 * Everything needed to place an order, assembled by the checkout and handed to
 * a `CommerceProvider`. The provider owns id generation, status and timestamps.
 */
export interface DraftOrder {
  email: string;
  items: OrderItem[];
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
  shippingMethod: { id: string; label: string; price: number };
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  currency: string;
}

// ── Pricing (server-authoritative) ───────────────────────────────────

/** One line sent for pricing. `unitPrice` is the client's view only. */
export interface QuoteLine {
  productId: string;
  variantId?: string;
  title: string;
  unitPrice: number;
  quantity: number;
}

/** Input to `quoteOrder` — what to price, not how much it costs. */
export interface QuoteInput {
  items: QuoteLine[];
  couponCode?: string;
  shippingMethodId: string;
  currency: string;
}

/**
 * The authoritative price of an order, returned by the backend. Never trust
 * client-computed totals for real money — charge `total` from a quote, and have a
 * real backend re-price from its own catalogue and validate the coupon itself.
 */
export interface OrderQuote {
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  couponCode?: string;
  couponApplied: boolean;
}

// ── Payments ────────────────────────────────────────────────────────────────

export interface PaymentSessionInput {
  amount: number;
  currency: string;
  email?: string;
  /** A reference the backend can attach the payment to (e.g. a cart/order id). */
  orderRef?: string;
}

export interface PaymentSession {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment' | 'succeeded' | 'failed';
  /** Opaque secret a client-side SDK (Stripe/Adyen) uses to confirm payment. */
  clientSecret?: string;
}

/** Raw card entry from the checkout form. Real providers should tokenize instead. */
export interface CardDetails {
  card: string;
  name: string;
  expiry: string;
  cvc: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
}
