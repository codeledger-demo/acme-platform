import { validateAmount, validateCurrency } from '@acme/validation';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

const VALID_PLAN_IDS = ['plan_starter', 'plan_professional', 'plan_enterprise'];

export function validatePlanId(planId: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof planId !== 'string' || planId.length === 0) {
    errors.push('planId must be a non-empty string');
  } else if (!VALID_PLAN_IDS.includes(planId)) {
    errors.push(`Invalid planId: ${planId}. Valid plans: ${VALID_PLAN_IDS.join(', ')}`);
  }

  return { valid: errors.length === 0, errors };
}

export function validateCheckoutInput(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['Input must be an object'] };
  }

  const obj = input as Record<string, unknown>;

  if (typeof obj['customerId'] !== 'string' || obj['customerId'].length === 0) {
    errors.push('customerId is required');
  }

  const planResult = validatePlanId(obj['planId']);
  errors.push(...planResult.errors);

  if (typeof obj['successUrl'] !== 'string' || !obj['successUrl'].startsWith('http')) {
    errors.push('successUrl must be a valid URL');
  }

  if (typeof obj['cancelUrl'] !== 'string' || !obj['cancelUrl'].startsWith('http')) {
    errors.push('cancelUrl must be a valid URL');
  }

  return { valid: errors.length === 0, errors };
}

export function validateSubscriptionUpdate(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (!input || typeof input !== 'object') {
    return { valid: false, errors: ['Input must be an object'] };
  }

  const obj = input as Record<string, unknown>;

  if (obj['planId'] !== undefined) {
    const planResult = validatePlanId(obj['planId']);
    errors.push(...planResult.errors);
  }

  if (obj['cancelAtPeriodEnd'] !== undefined && typeof obj['cancelAtPeriodEnd'] !== 'boolean') {
    errors.push('cancelAtPeriodEnd must be a boolean');
  }

  return { valid: errors.length === 0, errors };
}
