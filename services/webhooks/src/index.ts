/**
 * @acme/webhook-service
 *
 * Dispatches webhook events to registered endpoints with retry and delivery tracking.
 */
import { Logger } from '@acme/shared-utils';

const logger = new Logger({ service: 'webhooks' });

logger.info('Webhook service module loaded');

export { WebhookDispatcher } from './dispatcher.js';
export { WebhookRetryManager } from './retry.js';
export { type WebhookEndpoint, EndpointStore } from './models/endpoint.js';
export { type WebhookDelivery, type DeliveryStatus, DeliveryStore } from './models/delivery.js';
export { validateWebhookPayload, validateDeliveryRetry, validateEndpointUpdate } from './validators/webhook-schemas.js';
