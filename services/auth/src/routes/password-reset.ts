/**
 * Password reset flow — request a reset token and confirm the reset.
 */

import { AuthenticationError, NotFoundError, ValidationError } from '@acme/shared-utils';
import { logger } from '../config.js';
import { UserStore } from '../models/user.js';
import { hashPassword } from '../utils/hash.js';
import { generateResetToken } from '../utils/token.js';
import {
  validatePasswordResetRequest,
  validatePasswordResetConfirm,
} from '../validators/auth-schemas.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ResetRequestInput {
  body: { email: string };
}

interface ResetConfirmInput {
  body: { token: string; newPassword: string };
}

interface ResetRequestResponse {
  message: string;
}

interface ResetConfirmResponse {
  message: string;
}

// ---------------------------------------------------------------------------
// Token store (in-memory, production would use Redis with TTL)
// ---------------------------------------------------------------------------

interface PendingReset {
  userId: string;
  email: string;
  token: string;
  createdAt: number;
  expiresAt: number;
}

const pendingResets: Map<string, PendingReset> = new Map();
const RESET_TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

export const userStore = new UserStore();

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

/**
 * Request a password reset — generates a token and "sends" a reset email.
 *
 * Always returns a success message even if the email is not found, to
 * prevent email enumeration attacks.
 */
export function requestPasswordReset(req: ResetRequestInput): ResetRequestResponse {
  const validation = validatePasswordResetRequest(req.body);
  if (!validation.valid) {
    throw new ValidationError(
      `Invalid reset request: ${validation.errors.join('; ')}`,
      { fieldErrors: validation.errors },
    );
  }

  const { email } = req.body;
  const user = userStore.findByEmail(email);

  if (user) {
    const token = generateResetToken();
    const now = Date.now();

    pendingResets.set(token, {
      userId: user.id,
      email: user.email,
      token,
      createdAt: now,
      expiresAt: now + RESET_TOKEN_TTL_MS,
    });

    // In production, this would send an actual email via a notification service
    logger.info('Password reset token generated', {
      userId: user.id,
      email: user.email,
      tokenPrefix: token.slice(0, 8),
    });
  } else {
    // Log but don't reveal to the caller
    logger.debug('Password reset requested for unknown email', { email });
  }

  return {
    message: 'If an account with that email exists, a reset link has been sent.',
  };
}

/**
 * Confirm a password reset — validate the token and update the password.
 */
export function confirmPasswordReset(req: ResetConfirmInput): ResetConfirmResponse {
  const validation = validatePasswordResetConfirm(req.body);
  if (!validation.valid) {
    throw new ValidationError(
      `Invalid reset confirmation: ${validation.errors.join('; ')}`,
      { fieldErrors: validation.errors },
    );
  }

  const { token, newPassword } = req.body;
  const pending = pendingResets.get(token);

  if (!pending) {
    throw new AuthenticationError('Invalid or expired reset token');
  }

  if (Date.now() > pending.expiresAt) {
    pendingResets.delete(token);
    throw new AuthenticationError('Reset token has expired');
  }

  // Update the user's password
  const newHash = hashPassword(newPassword);
  const updated = userStore.update(pending.userId, { passwordHash: newHash });

  if (!updated) {
    throw new NotFoundError('User', pending.userId);
  }

  // Invalidate the token (one-time use)
  pendingResets.delete(token);

  logger.info('Password reset completed', { userId: pending.userId, email: pending.email });

  return {
    message: 'Password has been reset successfully.',
  };
}
