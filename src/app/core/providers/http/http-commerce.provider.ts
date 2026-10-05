import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CommerceProvider } from '../commerce.provider';
import { DraftOrder, Order, OrderQuote, QuoteInput } from '../models';
import { APP_CONFIG } from '../app-config';

/**
 * Real REST {@link CommerceProvider}. Opt-in — wire it in `app.config.ts`:
 *   `{ provide: COMMERCE_PROVIDER, useClass: HttpCommerceProvider }`
 *
 * The backend is authoritative on money: `quoteOrder` re-prices from the server's
 * own catalogue and validates the coupon; the client-sent `unitPrice` is ignored.
 */
@Injectable({ providedIn: 'root' })
export class HttpCommerceProvider implements CommerceProvider {
  private readonly http = inject(HttpClient);
  private readonly base = inject(APP_CONFIG).apiBaseUrl;

  quoteOrder(input: QuoteInput): Promise<OrderQuote> {
    return firstValueFrom(this.http.post<OrderQuote>(`${this.base}/orders/quote`, input));
  }

  createOrder(draft: DraftOrder): Promise<Order> {
    return firstValueFrom(this.http.post<Order>(`${this.base}/orders`, draft));
  }

  getOrders(): Promise<Order[]> {
    return firstValueFrom(this.http.get<Order[]>(`${this.base}/orders`));
  }

  getOrder(id: string): Promise<Order | undefined> {
    return firstValueFrom(this.http.get<Order>(`${this.base}/orders/${id}`));
  }
}
