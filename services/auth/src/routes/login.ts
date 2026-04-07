/**
 * Login route handler — validates credentials, creates a session,
 * and returns a JWT token pair.
 */

import { AuthenticationError } from '@acme/shared-utils';
import { validateEmail } from '@acme/validation';
import { logger, JWT_SECRET, TOKEN_EXPIRY_SECONDS, SESSION_TTL_SECONDS } from '../index.js';
import { UserStore } from '../models/user.js';
import { verifyPassword } from '../utils/hash.js';
import { generateTokenPair } from '../utils/token.js';
import { createSession } from '../middleware/session.js';
import { validateLoginInput } from '../validators/auth-schemas.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LoginRequest {
  body: { email: string; password: string };
  headers: Record<string, string | undefined>;
  ip?: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: { id: string; email: string; username: string; role: string };
}

// ---------------------------------------------------------------------------
// Shared user store (in real app this would be injected)
// ---------------------------------------------------------------------------

export const userStore = new UserStore();

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------

/**
 * Authenticate a user with email + password.
 *
 * 1. Validate input format.
 * 2. Look up the user by email.
 * 3. Verify the password hash.
 * 4. Generate a token pair.
 * 5. Create a server-side session.
 * 6. Return the tokens and user info.
 */
export function loginHandler(req: LoginRequest): LoginResponse {
  const validation = validateLoginInput(req.body);
  if (!validation.valid) {
    throw new AuthenticationError(`Login validation failed: ${validation.errors.join('; ')}`);
  }

  const { email, password } = req.body;

  const user = userStore.findByEmail(email);
  if (!user) {
    logger.warn('Login attempt for unknown email', { email });
    throw new AuthenticationError('Invalid email or password');
  }

  if (!verifyPassword(password, user.passwordHash)) {
    logger.warn('Invalid password attempt', { userId: user.id, email });
    throw new AuthenticationError('Invalid email or password');
  }

  const tokens = generateTokenPair({
    sub: user.id,
    email: user.email,
    role: user.role,
    expiresInSeconds: TOKEN_EXPIRY_SECONDS,
  });

  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
  createSession({
    userId: user.id,
    token: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt,
    metadata: {
      ipAddress: req.ip ?? req.headers['x-forwarded-for'] ?? null,
      userAgent: req.headers['user-agent'] ?? null,
    },
  });

  logger.info('User logged in', { userId: user.id, email: user.email });

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresIn: TOKEN_EXPIRY_SECONDS,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    },
  };
}
