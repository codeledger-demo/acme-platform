import { describe, it, expect, beforeEach } from 'vitest';
import { handleStripeWebhook, verifyWebhookSignature } from '../src/stripe/webhooks.js';
import type { StripeEvent } from '../src/stripe/webhooks.js';
import { SubscriptionStore } from '../src/models/subscription.js';
import { InvoiceStore } from '../src/models/invoice.js';

describe('verifyWebhookSignature', () => {
  it('should reject signatures without required parts', () => {
    expect(verifyWebhookSignature('payload', 'invalid', 'secret')).toBe(false);
  });

  it('should reject signatures with expired timestamps', () => {
    const oldTimestamp = Math.floor(Date.now() / 1000) - 600;
    const sig = `t=${oldTimestamp},v1=abc123`;
    expect(verifyWebhookSignature('payload', sig, 'secret')).toBe(false);
  });
});

describe('handleStripeWebhook', () => {
  let subscriptionStore: SubscriptionStore;
  let invoiceStore: InvoiceStore;

  beforeEach(() => {
    subscriptionStore = new SubscriptionStore();
    invoiceStore = new InvoiceStore();
  });

  function makeEvent(type: string, data: Record<string, unknown>): StripeEvent {
    return { id: 'evt_test', type, data: { object: data }, created: Date.now(), livemode: false };
  }

  it('should handle invoice.paid events', async () => {
    const inv = invoiceStore.create({
      customerId: 'cus_001',
      subscriptionId: 'sub_001',
      currency: 'usd',
      lineItems: [{ description: 'Plan', quantity: 1, unitAmount: 2900, amount: 2900 }],
      dueDate: new Date(),
    });

    const result = await handleStripeWebhook(
      makeEvent('invoice.paid', { id: inv.id }),
      subscriptionStore,
      invoiceStore,
    );
    expect(result.handled).toBe(true);
    expect(invoiceStore.getById(inv.id).status).toBe('paid');
  });

  it('should handle customer.subscription.deleted events', async () => {
    const sub = subscriptionStore.create({ customerId: 'cus_002', planId: 'plan_starter' });

    const result = await handleStripeWebhook(
      makeEvent('customer.subscription.deleted', { id: sub.id }),
      subscriptionStore,
      invoiceStore,
    );
    expect(result.handled).toBe(true);
    expect(subscriptionStore.getById(sub.id).status).toBe('canceled');
  });

  it('should return handled=false for unknown event types', async () => {
    const result = await handleStripeWebhook(
      makeEvent('unknown.event', {}),
      subscriptionStore,
      invoiceStore,
    );
    expect(result.handled).toBe(false);
  });
});
