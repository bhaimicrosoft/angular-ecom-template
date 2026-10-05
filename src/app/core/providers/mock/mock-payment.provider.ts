import { Injectable, inject } from '@angular/core';
import { PaymentProvider } from '../payment.provider';
import { CardDetails, PaymentResult, PaymentSession, PaymentSessionInput } from '../models';
import { APP_CONFIG } from '../app-config';

/**
 * Default {@link PaymentProvider}: a no-op gateway that always succeeds after a
 * short delay. Replace with a real adapter (Stripe/PayPal/Adyen) in
 * `app.config.ts` — tokenize card data client-side and verify server-side there.
 */
@Injectable({ providedIn: 'root' })
export class MockPaymentProvider implements PaymentProvider {
  private readonly latency = inject(APP_CONFIG).mockLatencyMs;

  async createPaymentSession(input: PaymentSessionInput): Promise<PaymentSession> {
    await this.delay();
    return {
      id: 'pi_' + Math.random().toString(36).slice(2, 12),
      amount: input.amount,
      currency: input.currency,
      status: 'requires_payment',
    };
  }

  async confirm(sessionId: string, _details?: CardDetails): Promise<PaymentResult> {
    await this.delay();
    return { success: true, transactionId: sessionId.replace(/^pi_/, 'txn_') };
  }

  private delay(ms = this.latency): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
