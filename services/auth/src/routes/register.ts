/**
 * Registration route handler — validates input, checks for duplicates,
 * hashes the password, and creates a new user.
 */

import { ConflictError, ValidationError } from '@acme/shared-utils';
import { validateUserCreate } from '@acme/validation';
import { logger } from '../index.js';
import { UserStore, type UserPublic } from '../models/user.js';
import { hashPassword } from '../utils/hash.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface RegisterRequest {
  body: {
    email: string;
    password: string;
    username: string;
    displayName?: string;
  };
}

interface RegisterResponse {
  user: UserPublic;
  message: string;
}

// ---------------------------------------------------------------------------
// Shared user store
// ---------------------------------------------------------------------------

export const userStore = new UserStore();

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

/**
 * Register a new user account.
 *
 * 1. Validate the full user creation payload.
 * 2. Check that the email is not already taken.
 * 3. Hash the password.
 * 4. Create the user in the store.
 * 5. Return the public user profile (no password hash).
 */
export function registerHandler(req: RegisterRequest): RegisterResponse {
  const validation = validateUserCreate(req.body);
  if (!validation.valid) {
    throw new ValidationError(
      `Registration validation failed: ${validation.errors.join('; ')}`,
      { fieldErrors: validation.errors },
    );
  }

  const { email, password, username, displayName } = req.body;

  const existing = userStore.findByEmail(email);
  if (existing) {
    logger.warn('Registration attempt with existing email', { email });
    throw new ConflictError('A user with this email already exists', { email });
  }

  const passwordHash = hashPassword(password);

  const user = userStore.create({
    email,
    username,
    passwordHash,
    displayName,
  });

  logger.info('User registered', { userId: user.id, email: user.email });

  // Strip the password hash from the response
  const { passwordHash: _hash, ...publicUser } = user;

  return {
    user: publicUser,
    message: 'Registration successful. Please verify your email.',
  };
}
