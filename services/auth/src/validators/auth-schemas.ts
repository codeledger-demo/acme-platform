/**
 * Auth-specific validation schemas.
 *
 * Complements the generic validators in @acme/validation with
 * auth-flow-specific input validation.
 */

import { validateEmail, validatePassword, type ValidationResult } from '@acme/validation';

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

export interface LoginInput {
  email: string;
  password: string;
}

export function validateLoginInput(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof input !== 'object' || input === null) {
    return { valid: false, errors: ['Input must be a non-null object.'] };
  }

  const record = input as Record<string, unknown>;
  const emailResult = validateEmail(record.email);
  errors.push(...emailResult.errors);

  if (typeof record.password !== 'string' || record.password.length === 0) {
    errors.push('Password is required.');
  }

  return { valid: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// OAuth state
// ---------------------------------------------------------------------------

export function validateOAuthState(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof input !== 'object' || input === null) {
    return { valid: false, errors: ['Input must be a non-null object.'] };
  }

  const record = input as Record<string, unknown>;

  if (typeof record.provider !== 'string' || record.provider.length === 0) {
    errors.push('OAuth provider is required.');
  }

  if (typeof record.redirectUri !== 'string' || record.redirectUri.length === 0) {
    errors.push('Redirect URI is required.');
  }

  return { valid: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// Password reset request
// ---------------------------------------------------------------------------

export function validatePasswordResetRequest(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof input !== 'object' || input === null) {
    return { valid: false, errors: ['Input must be a non-null object.'] };
  }

  const record = input as Record<string, unknown>;
  const emailResult = validateEmail(record.email);
  errors.push(...emailResult.errors);

  return { valid: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// Password reset confirm
// ---------------------------------------------------------------------------

export function validatePasswordResetConfirm(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof input !== 'object' || input === null) {
    return { valid: false, errors: ['Input must be a non-null object.'] };
  }

  const record = input as Record<string, unknown>;

  if (typeof record.token !== 'string' || record.token.length === 0) {
    errors.push('Reset token is required.');
  }

  const passwordResult = validatePassword(record.newPassword);
  errors.push(...passwordResult.errors);

  return { valid: errors.length === 0, errors };
}
