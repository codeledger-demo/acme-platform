/**
 * Tests for the login handler.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { loginHandler, userStore } from '../src/routes/login.js';
import { hashPassword } from '../src/utils/hash.js';
import { AuthenticationError } from '@acme/shared-utils';

function makeRequest(email: string, password: string) {
  return {
    body: { email, password },
    headers: { 'user-agent': 'test-agent' } as Record<string, string | undefined>,
    ip: '127.0.0.1',
  };
}

describe('loginHandler', () => {
  beforeEach(() => {
    // Seed a test user
    userStore.create({
      email: 'alice@example.com',
      username: 'alice',
      passwordHash: hashPassword('Password1'),
    });
  });

  it('returns tokens for valid credentials', () => {
    const result = loginHandler(makeRequest('alice@example.com', 'Password1'));

    expect(result.accessToken).toBeTruthy();
    expect(result.refreshToken).toBeTruthy();
    expect(result.expiresIn).toBeGreaterThan(0);
    expect(result.user.email).toBe('alice@example.com');
    expect(result.user.username).toBe('alice');
  });

  it('throws AuthenticationError for unknown email', () => {
    expect(() => loginHandler(makeRequest('nobody@example.com', 'Password1'))).toThrow(
      AuthenticationError,
    );
  });

  it('throws AuthenticationError for wrong password', () => {
    expect(() => loginHandler(makeRequest('alice@example.com', 'WrongPass1'))).toThrow(
      AuthenticationError,
    );
  });

  it('throws for invalid email format', () => {
    expect(() => loginHandler(makeRequest('not-an-email', 'Password1'))).toThrow(
      AuthenticationError,
    );
  });
});
