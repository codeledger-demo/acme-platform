import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  NotFoundError,
  AuthenticationError,
  AuthorizationError,
  ConflictError,
  RateLimitError,
} from '../src/errors.js';

describe('AppError', () => {
  it('has correct defaults', () => {
    const err = new AppError('something broke');
    expect(err.message).toBe('something broke');
    expect(err.code).toBe('INTERNAL_ERROR');
    expect(err.statusCode).toBe(500);
    expect(err.isOperational).toBe(true);
    expect(err.details).toEqual({});
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });

  it('serializes to JSON', () => {
    const err = new AppError('fail', { code: 'CUSTOM', statusCode: 418 });
    const json = err.toJSON();
    expect(json.code).toBe('CUSTOM');
    expect(json.statusCode).toBe(418);
    expect(json.name).toBe('AppError');
  });
});

describe('ValidationError', () => {
  it('sets 400 status and correct code', () => {
    const err = new ValidationError('bad input', { field: 'email' });
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.details).toEqual({ field: 'email' });
    expect(err).toBeInstanceOf(AppError);
  });
});

describe('NotFoundError', () => {
  it('formats message with resource and identifier', () => {
    const err = new NotFoundError('User', 'usr_123');
    expect(err.message).toBe('User not found: usr_123');
    expect(err.statusCode).toBe(404);
    expect(err).toBeInstanceOf(AppError);
  });
});

describe('AuthenticationError', () => {
  it('defaults to 401', () => {
    const err = new AuthenticationError();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('AUTHENTICATION_ERROR');
  });
});

describe('AuthorizationError', () => {
  it('defaults to 403', () => {
    const err = new AuthorizationError();
    expect(err.statusCode).toBe(403);
  });
});

describe('ConflictError', () => {
  it('defaults to 409', () => {
    const err = new ConflictError('duplicate key');
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe('CONFLICT');
  });
});

describe('RateLimitError', () => {
  it('defaults to 429 with retryAfterMs', () => {
    const err = new RateLimitError(30_000);
    expect(err.statusCode).toBe(429);
    expect(err.retryAfterMs).toBe(30_000);
    expect(err.details).toEqual({ retryAfterMs: 30_000 });
  });
});
