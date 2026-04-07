/**
 * Additional webhook validation — payload, delivery retry, endpoint update.
 * Imports foundational URL/secret validation from @acme/validation.
 */
import { validateUrl, validateWebhookSecret, validateEventTypes } from '@acme/validation';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a webhook event payload before dispatch.
 */
export function validateWebhookPayload(payload: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof payload !== 'object' || payload === null) {
    return { valid: false, errors: ['Payload must be a non-null object.'] };
  }

  const record = payload as Record<string, unknown>;

  if (typeof record['type'] !== 'string' || record['type'].length === 0) {
    errors.push('Payload must include a non-empty "type" string.');
  }

  if (typeof record['timestamp'] !== 'string') {
    errors.push('Payload must include a "timestamp" string.');
  }

  if (record['data'] === undefined) {
    errors.push('Payload must include a "data" field.');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate a delivery retry request.
 */
export function validateDeliveryRetry(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof input !== 'object' || input === null) {
    return { valid: false, errors: ['Input must be a non-null object.'] };
  }

  const record = input as Record<string, unknown>;

  if (typeof record['deliveryId'] !== 'string' || record['deliveryId'].length === 0) {
    errors.push('deliveryId is required and must be a non-empty string.');
  }

  if (record['force'] !== undefined && typeof record['force'] !== 'boolean') {
    errors.push('"force" must be a boolean if provided.');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validate an endpoint update payload.
 * Uses shared URL/secret/event validators from @acme/validation.
 */
export function validateEndpointUpdate(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof input !== 'object' || input === null) {
    return { valid: false, errors: ['Input must be a non-null object.'] };
  }

  const record = input as Record<string, unknown>;

  if (record['url'] !== undefined) {
    errors.push(...validateUrl(record['url']).errors);
  }

  if (record['secret'] !== undefined) {
    errors.push(...validateWebhookSecret(record['secret']).errors);
  }

  if (record['events'] !== undefined) {
    errors.push(...validateEventTypes(record['events']).errors);
  }

  if (record['active'] !== undefined && typeof record['active'] !== 'boolean') {
    errors.push('"active" must be a boolean if provided.');
  }

  return { valid: errors.length === 0, errors };
}
