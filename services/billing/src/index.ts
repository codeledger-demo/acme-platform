import { Logger, Config } from '@acme/shared-utils';

const logger = new Logger({ service: 'billing-service' });
const config = new Config({ prefix: 'BILLING' });

export { StripeClient } from './stripe/client.js';
export { handleStripeWebhook, verifyWebhookSignature } from './stripe/webhooks.js';
export { SubscriptionStore } from './models/subscription.js';
export { InvoiceStore } from './models/invoice.js';
export { PlanStore } from './models/plan.js';
export type { Subscription } from './models/subscription.js';
export type { Invoice, LineItem } from './models/invoice.js';
export type { Plan } from './models/plan.js';

logger.info('Billing service initialized', {
  environment: config.getString('NODE_ENV', 'development'),
  version: '1.0.0',
});
