import { InjectionToken } from '@angular/core';
import { CardDetails, PaymentResult, PaymentSession, PaymentSessionInput } from './models';

/**
 * Port for payments. Implement this for a real gateway (Stripe, PayPal, Adyen,
 * Razorpay…) and provide it for {@link PAYMENT_PROVIDER}. The default
 * `MockPaymentProvider` is a no-op that always succeeds.
 *
 * Real adapters should tokenize card data on the client and never send raw PAN
 * to your server. `confirm` should verify the charge server-side.
 */
export interface PaymentProvider {
  createPaymentSession(input: PaymentSessionInput): Promise<PaymentSession>;
  confirm(sessionId: string, details?: CardDetails): Promise<PaymentResult>;
}

export const PAYMENT_PROVIDER = new InjectionToken<PaymentProvider>('PAYMENT_PROVIDER');
