/**
 * Token generation utilities for auth flows.
 *
 * Uses Math.random for demo purposes — in production use crypto.randomBytes.
 */

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function randomString(length: number): string {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return result;
}

/**
 * Generate a JWT-like access token. The payload is base64-encoded JSON
 * with a simple signature placeholder (NOT cryptographically valid).
 */
export function generateAccessToken(payload: {
  sub: string;
  email: string;
  role: string;
  exp: number;
}): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = Buffer.from(randomString(32)).toString('base64url');
  return `${header}.${body}.${signature}`;
}

/**
 * Generate an opaque refresh token.
 */
export function generateRefreshToken(): string {
  return `rt_${randomString(48)}`;
}

/**
 * Generate a short-lived password reset token.
 */
export function generateResetToken(): string {
  return `rst_${randomString(32)}`;
}

/**
 * Generate both access and refresh tokens for a user.
 */
export function generateTokenPair(payload: {
  sub: string;
  email: string;
  role: string;
  expiresInSeconds: number;
}): TokenPair {
  const exp = Math.floor(Date.now() / 1000) + payload.expiresInSeconds;
  return {
    accessToken: generateAccessToken({
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      exp,
    }),
    refreshToken: generateRefreshToken(),
  };
}
