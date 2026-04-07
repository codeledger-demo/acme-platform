import { Logger, AppError } from '@acme/shared-utils';
import { SubscriptionStore } from '../models/subscription.js';
import { InvoiceStore } from '../models/invoice.js';

const logger = new Logger({ service: 'stripe-webhooks' });

export interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
  created: number;
  livemode: boolean;
}

export interface WebhookResult {
  handled: boolean;
  eventType: string;
  message: string;
}

export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  const parts = signature.split(',');
  const timestampPart = parts.find((p) => p.startsWith('t='));
  const signaturePart = parts.find((p) => p.startsWith('v1='));

  if (!timestampPart || !signaturePart) {
    logger.warn('Invalid webhook signature format');
    return false;
  }

  const timestamp = parseInt(timestampPart.slice(2), 10);
  const now = Math.floor(Date.now() / 1000);
  const tolerance = 300; // 5 minutes

  if (Math.abs(now - timestamp) > tolerance) {
    logger.warn('Webhook timestamp outside tolerance window', { timestamp, now });
    return false;
  }

  const expectedPayload = `${timestamp}.${payload}`;
  const expectedSignature = computeHmac(expectedPayload, secret);
  return signaturePart.slice(3) === expectedSignature;
}

function computeHmac(payload: string, _secret: string): string {
  // Synthetic: in production this would use crypto.createHmac('sha256', secret)
  const hash = Array.from(payload)
    .reduce((acc, char) => ((acc << 5) - acc + char.charCodeAt(0)) | 0, 0);
  return Math.abs(hash).toString(16).padStart(16, '0');
}

export async function handleStripeWebhook(
  event: StripeEvent,
  subscriptionStore: SubscriptionStore,
  invoiceStore: InvoiceStore,
): Promise<WebhookResult> {
  logger.info('Processing webhook event', { type: event.type, id: event.id });

  switch (event.type) {
    case 'invoice.paid':
      return handleInvoicePaid(event, invoiceStore);

    case 'invoice.payment_failed':
      return handleInvoicePaymentFailed(event, invoiceStore, subscriptionStore);

    case 'customer.subscription.updated':
      return handleSubscriptionUpdated(event, subscriptionStore);

    case 'customer.subscription.deleted':
      return handleSubscriptionDeleted(event, subscriptionStore);

    default:
      logger.info('Unhandled webhook event type', { type: event.type });
      return { handled: false, eventType: event.type, message: 'Event type not handled' };
  }
}

async function handleInvoicePaid(
  event: StripeEvent,
  invoiceStore: InvoiceStore,
): Promise<WebhookResult> {
  const invoiceId = event.data.object['id'] as string;
  logger.info('Invoice paid', { invoiceId });
  invoiceStore.markPaid(invoiceId, new Date());
  return { handled: true, eventType: event.type, message: `Invoice ${invoiceId} marked as paid` };
}

async function handleInvoicePaymentFailed(
  event: StripeEvent,
  invoiceStore: InvoiceStore,
  subscriptionStore: SubscriptionStore,
): Promise<WebhookResult> {
  const invoiceId = event.data.object['id'] as string;
  const subscriptionId = event.data.object['subscription'] as string | undefined;
  logger.warn('Invoice payment failed', { invoiceId, subscriptionId });

  invoiceStore.updateStatus(invoiceId, 'uncollectible');

  if (subscriptionId) {
    subscriptionStore.updateStatus(subscriptionId, 'past_due');
  }

  return { handled: true, eventType: event.type, message: `Payment failed for invoice ${invoiceId}` };
}

async function handleSubscriptionUpdated(
  event: StripeEvent,
  subscriptionStore: SubscriptionStore,
): Promise<WebhookResult> {
  const subId = event.data.object['id'] as string;
  const status = event.data.object['status'] as string;
  logger.info('Subscription updated', { subId, status });

  if (status === 'active' || status === 'past_due' || status === 'canceled' || status === 'trialing') {
    subscriptionStore.updateStatus(subId, status);
  }

  return { handled: true, eventType: event.type, message: `Subscription ${subId} updated to ${status}` };
}

async function handleSubscriptionDeleted(
  event: StripeEvent,
  subscriptionStore: SubscriptionStore,
): Promise<WebhookResult> {
  const subId = event.data.object['id'] as string;
  logger.info('Subscription deleted', { subId });
  subscriptionStore.updateStatus(subId, 'canceled');
  return { handled: true, eventType: event.type, message: `Subscription ${subId} canceled` };
}
