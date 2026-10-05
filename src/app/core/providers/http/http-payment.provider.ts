import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PaymentProvider } from '../payment.provider';
import { PaymentResult, PaymentSession, PaymentSessionInput } from '../models';
import { APP_CONFIG } from '../app-config';

/**
 * Real gateway {@link PaymentProvider} (Stripe/Adyen-style). Opt-in — wire it in
 * `app.config.ts`:
 *   `{ provide: PAYMENT_PROVIDER, useClass: HttpPaymentProvider }`
 *
 * Secure flow: the **server** computes the amount from the order it owns and
 * creates the gateway PaymentIntent (send only a reference + currency, never a
 * trusted total). The client confirms the card with the gateway SDK using the
 * returned `clientSecret`; the server then verifies the charge before fulfilling.
 */
@Injectable({ providedIn: 'root' })
export class HttpPaymentProvider implements PaymentProvider {
  private readonly http = inject(HttpClient);
  private readonly base = inject(APP_CONFIG).apiBaseUrl;

  async createPaymentSession(input: PaymentSessionInput): Promise<PaymentSession> {
    const res = await firstValueFrom(
      this.http.post<{ id: string; clientSecret: string; amount: number }>(
        `${this.base}/payments/intent`,
        { orderRef: input.orderRef, currency: input.currency },
      ),
    );
    return {
      id: res.id,
      amount: res.amount,
      currency: input.currency,
      status: 'requires_payment',
      clientSecret: res.clientSecret,
    };
  }

  async confirm(sessionId: string): Promise<PaymentResult> {
    return firstValueFrom(
      this.http.post<PaymentResult>(`${this.base}/payments/confirm`, { sessionId }),
    );
  }
}
