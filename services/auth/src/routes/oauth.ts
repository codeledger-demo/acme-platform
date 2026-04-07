/**
 * OAuth flow handlers — initiate and callback for third-party identity
 * providers (Google, GitHub, etc.).
 */

import { AuthenticationError, ValidationError } from '@acme/shared-utils';
import { logger, TOKEN_EXPIRY_SECONDS, SESSION_TTL_SECONDS } from '../index.js';
import { UserStore, type User } from '../models/user.js';
import { generateTokenPair } from '../utils/token.js';
import { createSession } from '../middleware/session.js';
import { validateOAuthState } from '../validators/auth-schemas.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type OAuthProvider = 'google' | 'github' | 'microsoft';

interface OAuthInitiateRequest {
  body: {
    provider: OAuthProvider;
    redirectUri: string;
  };
}

interface OAuthInitiateResponse {
  authorizationUrl: string;
  state: string;
}

interface OAuthCallbackRequest {
  body: {
    provider: OAuthProvider;
    code: string;
    state: string;
  };
}

interface OAuthCallbackResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: { id: string; email: string; username: string; role: string };
  isNewUser: boolean;
}

// ---------------------------------------------------------------------------
// State store (in-memory, production would use Redis)
// ---------------------------------------------------------------------------

const pendingStates: Map<string, { provider: OAuthProvider; redirectUri: string; createdAt: number }> = new Map();
export const userStore = new UserStore();

function generateState(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

// ---------------------------------------------------------------------------
// Provider configuration (demo)
// ---------------------------------------------------------------------------

const PROVIDER_AUTH_URLS: Record<OAuthProvider, string> = {
  google: 'https://accounts.google.com/o/oauth2/v2/auth',
  github: 'https://github.com/login/oauth/authorize',
  microsoft: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
};

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

/**
 * Initiate an OAuth flow — generate a state parameter and return the
 * provider's authorization URL for the client to redirect to.
 */
export function initiateOAuth(req: OAuthInitiateRequest): OAuthInitiateResponse {
  const validation = validateOAuthState(req.body);
  if (!validation.valid) {
    throw new ValidationError(
      `OAuth initiation failed: ${validation.errors.join('; ')}`,
      { fieldErrors: validation.errors },
    );
  }

  const { provider, redirectUri } = req.body;
  const state = generateState();

  pendingStates.set(state, {
    provider,
    redirectUri,
    createdAt: Date.now(),
  });

  const baseUrl = PROVIDER_AUTH_URLS[provider];
  const params = new URLSearchParams({
    client_id: `demo-client-${provider}`,
    redirect_uri: redirectUri,
    state,
    response_type: 'code',
    scope: 'openid email profile',
  });

  logger.info('OAuth flow initiated', { provider, state: state.slice(0, 8) + '...' });

  return {
    authorizationUrl: `${baseUrl}?${params.toString()}`,
    state,
  };
}

/**
 * Handle the OAuth callback — exchange the authorization code for user
 * information, create or link the user, and return tokens.
 *
 * In a real implementation this would call the provider's token endpoint.
 * For this demo we simulate the exchange.
 */
export function handleOAuthCallback(req: OAuthCallbackRequest): OAuthCallbackResponse {
  const { provider, code, state } = req.body;

  // Validate state
  const pending = pendingStates.get(state);
  if (!pending) {
    throw new AuthenticationError('Invalid or expired OAuth state parameter');
  }

  if (pending.provider !== provider) {
    throw new AuthenticationError('OAuth provider mismatch');
  }

  // Clean up state (one-time use)
  pendingStates.delete(state);

  // Check expiry (5 min)
  if (Date.now() - pending.createdAt > 5 * 60 * 1000) {
    throw new AuthenticationError('OAuth state has expired');
  }

  // Simulate exchanging the code for user info
  const simulatedEmail = `user-${code.slice(0, 6)}@${provider}.example.com`;
  const simulatedProviderId = `${provider}_${code}`;

  // Find or create user
  let user: User | undefined = userStore.findByEmail(simulatedEmail);
  let isNewUser = false;

  if (!user) {
    user = userStore.create({
      email: simulatedEmail,
      username: `${provider}user${Math.floor(Math.random() * 10000)}`,
      passwordHash: '', // OAuth users may not have a password
      oauthProvider: provider,
      oauthProviderId: simulatedProviderId,
    });
    isNewUser = true;
    logger.info('New OAuth user created', { userId: user.id, provider });
  }

  // Generate tokens
  const tokens = generateTokenPair({
    sub: user.id,
    email: user.email,
    role: user.role,
    expiresInSeconds: TOKEN_EXPIRY_SECONDS,
  });

  // Create session
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
  createSession({
    userId: user.id,
    token: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt,
  });

  logger.info('OAuth login successful', { userId: user.id, provider, isNewUser });

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
    isNewUser,
  };
}
