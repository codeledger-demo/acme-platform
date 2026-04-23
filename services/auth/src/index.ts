/**
 * Auth Service — entry point.
 *
 * Re-exports configuration and route handlers so they can be mounted
 * by the top-level HTTP server.
 */

export { logger, JWT_SECRET, TOKEN_EXPIRY_SECONDS, SESSION_TTL_SECONDS } from './config.js';
import { logger, TOKEN_EXPIRY_SECONDS, SESSION_TTL_SECONDS } from './config.js';

logger.info('Auth service initializing', {
  tokenExpiry: TOKEN_EXPIRY_SECONDS,
  sessionTtl: SESSION_TTL_SECONDS,
});

export { loginHandler } from './routes/login.js';
export { registerHandler } from './routes/register.js';
export { initiateOAuth, handleOAuthCallback } from './routes/oauth.js';
export { requestPasswordReset, confirmPasswordReset } from './routes/password-reset.js';
export { createJwtMiddleware } from './middleware/jwt-verify.js';
export { createRateLimitMiddleware } from './middleware/rate-limit.js';
