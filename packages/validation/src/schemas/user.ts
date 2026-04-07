/**
 * User input validation — hand-rolled validators for sign-up and profile flows.
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface UserCreateInput {
  email: string;
  password: string;
  username: string;
  displayName?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[a-zA-Z0-9]{3,30}$/;

/**
 * Validates an email address against a basic RFC-style pattern.
 */
export function validateEmail(email: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof email !== 'string' || email.length === 0) {
    errors.push('Email is required and must be a string.');
    return { valid: false, errors };
  }

  if (email.length > 254) {
    errors.push('Email must not exceed 254 characters.');
  }

  if (!EMAIL_RE.test(email)) {
    errors.push('Email format is invalid.');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates a password: minimum 8 characters, must contain uppercase,
 * lowercase, and at least one digit.
 */
export function validatePassword(password: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof password !== 'string' || password.length === 0) {
    errors.push('Password is required and must be a string.');
    return { valid: false, errors };
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters.');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter.');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter.');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one digit.');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates a username: alphanumeric, 3-30 characters.
 */
export function validateUsername(username: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof username !== 'string' || username.length === 0) {
    errors.push('Username is required and must be a string.');
    return { valid: false, errors };
  }

  if (!USERNAME_RE.test(username)) {
    errors.push('Username must be 3-30 alphanumeric characters.');
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Validates a complete user creation payload.
 */
export function validateUserCreate(input: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof input !== 'object' || input === null) {
    return { valid: false, errors: ['Input must be a non-null object.'] };
  }

  const record = input as Record<string, unknown>;
  const emailResult = validateEmail(record.email);
  const passwordResult = validatePassword(record.password);
  const usernameResult = validateUsername(record.username);

  errors.push(...emailResult.errors, ...passwordResult.errors, ...usernameResult.errors);

  return { valid: errors.length === 0, errors };
}
