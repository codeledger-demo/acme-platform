/**
 * Webhook endpoint validation — URL, secret, event types.
 */

import type { ValidationResult } from './user.js';

const ALLOWED_EVENT_TYPES = new Set([
  'invoice.created',
  'invoice.paid',
  'invoice.overdue',
  'subscription.created',
  'subscription.cancelled',
  'subscription.renewed',
  'user.created',
  'user.deleted',
  'payment.succeeded',
  'payment.failed',
]);

export interface WebhookEndpointInput {
  url: string;
  secret: string;
  eventTypes: string[];
}

/**
 * Validates a webhook URL: must be HTTPS.
 */
export function validateUrl(url: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof url !== 'string' || url.length === 0) {
    errors.push('URL is required and must be a string.');
    return { valid: false, errors };
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') {
      errors.push('Webhook URL must use HTTPS.');
    }
  } catch {
    errors.push('Webhook URL is not a valid URL.');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates a webhook signing secret: must be at least 32 characters.
 */
export function validateWebhookSecret(secret: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof secret !== 'string' || secret.length === 0) {
    errors.push('Webhook secret is required and must be a string.');
    return { valid: false, errors };
  }

  if (secret.length < 32) {
    errors.push('Webhook secret must be at least 32 characters.');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates event types against the allow-list.
 */
export function validateEventTypes(eventTypes: unknown): ValidationResult {
  const errors: string[] = [];

  if (!Array.isArray(eventTypes) || eventTypes.length === 0) {
    errors.push('At least one event type is required.');
    return { valid: false, errors };
  }

  for (const et of eventTypes) {
    if (typeof et !== 'string' || !ALLOWED_EVENT_TYPES.has(et)) {
      errors.push(`Unknown event type: ${String(et)}. Allowed: ${[...ALLOWED_EVENT_TYPES].join(', ')}.`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates a complete webhook endpoint registration payload.
 */
export function validateWebhookEndpoint(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof input !== 'object' || input === null) {
    return { valid: false, errors: ['Input must be a non-null object.'] };
  }

  const record = input as Record<string, unknown>;

  errors.push(...validateUrl(record.url).errors);
  errors.push(...validateWebhookSecret(record.secret).errors);
  errors.push(...validateEventTypes(record.eventTypes).errors);

  return { valid: errors.length === 0, errors };
}
