/**
 * Auth Service — entry point.
 *
 * Initializes logging, loads configuration, and exports the route handlers
 * so they can be mounted by the top-level HTTP server.
 */

import { Logger, Config } from '@acme/shared-utils';

const config = new Config({ prefix: 'AUTH' });

export const logger = new Logger(
  { service: 'auth' },
  config.getString('LOG_LEVEL', 'info') === 'debug' ? 'debug' : 'info',
);

export const JWT_SECRET = config.getString('JWT_SECRET', 'dev-secret-do-not-use');
export const TOKEN_EXPIRY_SECONDS = config.getNumber('TOKEN_EXPIRY_SECONDS', 3600);
export const SESSION_TTL_SECONDS = config.getNumber('SESSION_TTL_SECONDS', 86_400);

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
