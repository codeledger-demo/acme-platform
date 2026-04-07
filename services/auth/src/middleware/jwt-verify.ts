/**
 * JWT verification middleware for the auth service.
 *
 * Extracts and validates Bearer tokens from the Authorization header,
 * decoding the base64url payload and checking expiry. The signature
 * check is a placeholder — in production, use a proper HMAC or RSA
 * verification against the signing key.
 */

import { AuthenticationError } from '@acme/shared-utils';
import { logger } from '../index.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface JwtPayload {
  /** Subject — typically the user ID */
  sub: string;
  /** User email */
  email: string;
  /** User role */
  role: string;
  /** Issued-at timestamp (epoch seconds) */
  iat?: number;
  /** Expiration timestamp (epoch seconds) */
  exp: number;
}

export interface AuthenticatedRequest {
  headers: Record<string, string | undefined>;
  user?: JwtPayload;
}

export interface MiddlewareResponse {
  status(code: number): MiddlewareResponse;
  json(data: unknown): void;
}

export type NextFn = (err?: unknown) => void;

// ---------------------------------------------------------------------------
// Token helpers
// ---------------------------------------------------------------------------

/**
 * Decode a base64url-encoded JWT segment into a string.
 */
function decodeBase64Url(segment: string): string {
  // Replace URL-safe chars back to standard base64
  const base64 = segment.replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(base64, 'base64').toString('utf-8');
}

/**
 * Split a JWT into its three segments. Returns null if the format is invalid.
 */
function splitToken(token: string): { header: string; payload: string; signature: string } | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, payload, signature] = parts as [string, string, string];
  if (!header || !payload || !signature) return null;
  return { header, payload, signature };
}

/**
 * Verify and decode a JWT token string.
 *
 * Steps:
 *   1. Split the token into header / payload / signature segments.
 *   2. Decode the header to confirm it is HS256 + JWT.
 *   3. Decode the payload into a typed JwtPayload object.
 *   4. Check the `exp` claim against the current time.
 *   5. (Placeholder) Validate the signature — always passes in demo mode.
 *
 * Throws `AuthenticationError` on any failure.
 */
export function verifyToken(token: string, _secret: string): JwtPayload {
  const segments = splitToken(token);
  if (!segments) {
    throw new AuthenticationError('Malformed token: expected three dot-separated segments');
  }

  // --- Decode header ---
  let header: Record<string, unknown>;
  try {
    header = JSON.parse(decodeBase64Url(segments.header)) as Record<string, unknown>;
  } catch {
    throw new AuthenticationError('Invalid token header: failed to decode base64url JSON');
  }

  if (header.alg !== 'HS256' || header.typ !== 'JWT') {
    throw new AuthenticationError(
      `Unsupported token: expected alg=HS256 typ=JWT, got alg=${String(header.alg)} typ=${String(header.typ)}`,
    );
  }

  // --- Decode payload ---
  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(decodeBase64Url(segments.payload)) as Record<string, unknown>;
  } catch {
    throw new AuthenticationError('Invalid token payload: failed to decode base64url JSON');
  }

  const { sub, email, role, exp, iat } = payload;

  if (typeof sub !== 'string' || typeof email !== 'string' || typeof role !== 'string') {
    throw new AuthenticationError('Token payload missing required claims: sub, email, role');
  }

  if (typeof exp !== 'number') {
    throw new AuthenticationError('Token payload missing or invalid exp claim');
  }

  // --- Expiry check ---
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (exp <= nowSeconds) {
    logger.warn('Token expired', { sub, exp, now: nowSeconds });
    throw new AuthenticationError('Token has expired');
  }

  // --- Signature verification (placeholder) ---
  // In production, compute HMAC-SHA256(header.payload, secret) and compare
  // to the decoded signature segment. For this demo we skip the check.

  return {
    sub,
    email,
    role,
    iat: typeof iat === 'number' ? iat : undefined,
    exp,
  };
}

/**
 * Create Express-style middleware that verifies JWT Bearer tokens.
 *
 * On success, attaches `req.user` with the decoded JwtPayload.
 * On failure, passes an `AuthenticationError` to `next`.
 */
export function createJwtMiddleware(secret: string): (
  req: AuthenticatedRequest,
  res: MiddlewareResponse,
  next: NextFn,
) => void {
  return function jwtMiddleware(
    req: AuthenticatedRequest,
    _res: MiddlewareResponse,
    next: NextFn,
  ): void {
    const authHeader = req.headers['authorization'] ?? req.headers['Authorization'];

    if (!authHeader) {
      next(new AuthenticationError('Missing Authorization header'));
      return;
    }

    if (!authHeader.startsWith('Bearer ')) {
      next(new AuthenticationError('Authorization header must use Bearer scheme'));
      return;
    }

    const token = authHeader.slice(7).trim();
    if (token.length === 0) {
      next(new AuthenticationError('Bearer token is empty'));
      return;
    }

    try {
      const payload = verifyToken(token, secret);
      req.user = payload;
      logger.debug('JWT verified', { sub: payload.sub, role: payload.role });
      next();
    } catch (err) {
      if (err instanceof AuthenticationError) {
        next(err);
      } else {
        next(new AuthenticationError('Token verification failed'));
      }
    }
  };
}
