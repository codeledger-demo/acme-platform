/**
 * Billing and subscription validation — currency, amounts, subscriptions, invoices.
 */

import type { ValidationResult } from './user.js';

/** ISO 4217 currency codes we support for billing. */
const SUPPORTED_CURRENCIES = new Set([
  'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'SEK', 'NOK', 'DKK',
]);

const BILLING_INTERVALS = new Set(['monthly', 'quarterly', 'annual']);

export interface SubscriptionCreateInput {
  planId: string;
  currency: string;
  amount: number;
  interval: 'monthly' | 'quarterly' | 'annual';
}

export interface InvoiceInput {
  customerId: string;
  currency: string;
  lineItems: ReadonlyArray<{ description: string; amount: number }>;
  dueDate: string;
}

/**
 * Validates a currency code against supported ISO 4217 codes.
 */
export function validateCurrency(currency: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof currency !== 'string' || currency.length === 0) {
    errors.push('Currency is required and must be a string.');
    return { valid: false, errors };
  }

  if (!SUPPORTED_CURRENCIES.has(currency.toUpperCase())) {
    errors.push(`Unsupported currency: ${currency}. Supported: ${[...SUPPORTED_CURRENCIES].join(', ')}.`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates a monetary amount: must be positive with at most 2 decimal places.
 */
export function validateAmount(amount: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof amount !== 'number' || Number.isNaN(amount)) {
    errors.push('Amount must be a valid number.');
    return { valid: false, errors };
  }

  if (amount <= 0) {
    errors.push('Amount must be positive.');
  }

  // Check max 2 decimal places by rounding
  const rounded = Math.round(amount * 100) / 100;
  if (Math.abs(amount - rounded) > Number.EPSILON) {
    errors.push('Amount must have at most 2 decimal places.');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates a subscription creation payload.
 */
export function validateSubscriptionCreate(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof input !== 'object' || input === null) {
    return { valid: false, errors: ['Input must be a non-null object.'] };
  }

  const record = input as Record<string, unknown>;

  if (typeof record.planId !== 'string' || record.planId.length === 0) {
    errors.push('planId is required.');
  }

  errors.push(...validateCurrency(record.currency).errors);
  errors.push(...validateAmount(record.amount).errors);

  if (typeof record.interval !== 'string' || !BILLING_INTERVALS.has(record.interval)) {
    errors.push(`interval must be one of: ${[...BILLING_INTERVALS].join(', ')}.`);
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates an invoice payload: customer, currency, line items, and due date.
 */
export function validateInvoice(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof input !== 'object' || input === null) {
    return { valid: false, errors: ['Input must be a non-null object.'] };
  }

  const record = input as Record<string, unknown>;

  if (typeof record.customerId !== 'string' || record.customerId.length === 0) {
    errors.push('customerId is required.');
  }

  errors.push(...validateCurrency(record.currency).errors);

  if (!Array.isArray(record.lineItems) || record.lineItems.length === 0) {
    errors.push('At least one line item is required.');
  } else {
    for (const [i, item] of record.lineItems.entries()) {
      if (typeof item !== 'object' || item === null) {
        errors.push(`lineItems[${i}] must be an object.`);
        continue;
      }
      const li = item as Record<string, unknown>;
      if (typeof li.description !== 'string' || li.description.length === 0) {
        errors.push(`lineItems[${i}].description is required.`);
      }
      errors.push(...validateAmount(li.amount).errors);
    }
  }

  if (typeof record.dueDate !== 'string' || Number.isNaN(Date.parse(record.dueDate))) {
    errors.push('dueDate must be a valid ISO date string.');
  }

  return { valid: errors.length === 0, errors };
}
