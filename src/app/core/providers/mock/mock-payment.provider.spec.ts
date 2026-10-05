import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MockPaymentProvider } from './mock-payment.provider';
import { APP_CONFIG } from '../app-config';

describe('MockPaymentProvider', () => {
  let provider: MockPaymentProvider;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MockPaymentProvider,
        { provide: APP_CONFIG, useValue: { apiBaseUrl: '', mockLatencyMs: 0 } },
      ],
    });
    provider = TestBed.inject(MockPaymentProvider);
  });

  it('creates a payment session that requires payment', async () => {
    const session = await provider.createPaymentSession({ amount: 50, currency: 'USD' });
    expect(session.id).toMatch(/^pi_/);
    expect(session.amount).toBe(50);
    expect(session.status).toBe('requires_payment');
  });

  it('confirms a session successfully with a transaction id', async () => {
    const session = await provider.createPaymentSession({ amount: 50, currency: 'USD' });
    const result = await provider.confirm(session.id);
    expect(result.success).toBe(true);
    expect(result.transactionId).toMatch(/^txn_/);
  });
});
