/**
 * Tests for JWT verification middleware.
 */

import { describe, it, expect } from 'vitest';
import { verifyToken, createJwtMiddleware, type AuthenticatedRequest } from '../src/middleware/jwt-verify.js';
import { generateAccessToken } from '../src/utils/token.js';
import { AuthenticationError } from '@acme/shared-utils';

const SECRET = 'test-secret';

function makeValidToken(overrides: Record<string, unknown> = {}): string {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return generateAccessToken({
    sub: 'usr_00000001',
    email: 'test@example.com',
    role: 'member',
    exp,
    ...overrides,
  });
}

describe('verifyToken', () => {
  it('decodes a valid token', () => {
    const token = makeValidToken();
    const payload = verifyToken(token, SECRET);

    expect(payload.sub).toBe('usr_00000001');
    expect(payload.email).toBe('test@example.com');
    expect(payload.role).toBe('member');
    expect(payload.exp).toBeGreaterThan(Date.now() / 1000);
  });

  it('rejects a malformed token', () => {
    expect(() => verifyToken('not.a.valid.token.here', SECRET)).toThrow(AuthenticationError);
  });

  it('rejects a token with only two segments', () => {
    expect(() => verifyToken('abc.def', SECRET)).toThrow(AuthenticationError);
  });

  it('rejects an expired token', () => {
    const token = makeValidToken({ exp: Math.floor(Date.now() / 1000) - 60 });
    expect(() => verifyToken(token, SECRET)).toThrow('Token has expired');
  });
});

describe('createJwtMiddleware', () => {
  const middleware = createJwtMiddleware(SECRET);

  it('attaches user to request on valid Bearer token', () => {
    const token = makeValidToken();
    const req: AuthenticatedRequest = {
      headers: { authorization: `Bearer ${token}` },
    };
    const res = { status: () => res, json: () => undefined };
    let nextError: unknown = undefined;
    middleware(req, res, (err) => { nextError = err; });

    expect(nextError).toBeUndefined();
    expect(req.user).toBeDefined();
    expect(req.user?.sub).toBe('usr_00000001');
  });

  it('passes AuthenticationError when Authorization header is missing', () => {
    const req: AuthenticatedRequest = { headers: {} };
    const res = { status: () => res, json: () => undefined };
    let nextError: unknown = null;
    middleware(req, res, (err) => { nextError = err; });

    expect(nextError).toBeInstanceOf(AuthenticationError);
  });

  it('passes AuthenticationError when scheme is not Bearer', () => {
    const req: AuthenticatedRequest = {
      headers: { authorization: 'Basic abc123' },
    };
    const res = { status: () => res, json: () => undefined };
    let nextError: unknown = null;
    middleware(req, res, (err) => { nextError = err; });

    expect(nextError).toBeInstanceOf(AuthenticationError);
  });
});
