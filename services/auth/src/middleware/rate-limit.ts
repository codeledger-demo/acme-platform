/**
 * In-memory sliding-window rate limiter middleware.
 *
 * Tracks request timestamps per key (typically IP address) and rejects
 * requests that exceed the configured threshold within the window.
 */

import { RateLimitError } from '@acme/shared-utils';
import { logger } from '../index.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RateLimitOptions {
  /** Maximum number of requests allowed in the window. */
  maxRequests: number;
  /** Window duration in milliseconds. */
  windowMs: number;
}

interface RateLimitRequest {
  headers: Record<string, string | undefined>;
  ip?: string;
}

interface RateLimitResponse {
  status(code: number): RateLimitResponse;
  json(data: unknown): void;
}

type NextFn = (err?: unknown) => void;

// ---------------------------------------------------------------------------
// Rate limiter
// ---------------------------------------------------------------------------

/**
 * Sliding-window rate limiter backed by an in-memory Map.
 *
 * Each key maps to an array of request timestamps. On every check,
 * expired entries are pruned before counting.
 */
export class RateLimiter {
  private readonly store: Map<string, number[]> = new Map();
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(options: RateLimitOptions) {
    this.maxRequests = options.maxRequests;
    this.windowMs = options.windowMs;
  }

  /**
   * Check whether a request from the given key should be allowed.
   *
   * @returns `true` if within limits, `false` if the limit is exceeded.
   */
  check(key: string): { allowed: boolean; remaining: number; retryAfterMs: number } {
    const now = Date.now();
    const cutoff = now - this.windowMs;

    let timestamps = this.store.get(key);
    if (!timestamps) {
      timestamps = [];
      this.store.set(key, timestamps);
    }

    // Prune expired entries
    const pruned = timestamps.filter((ts) => ts > cutoff);
    this.store.set(key, pruned);

    if (pruned.length >= this.maxRequests) {
      const oldestInWindow = pruned[0] ?? now;
      const retryAfterMs = oldestInWindow + this.windowMs - now;
      return { allowed: false, remaining: 0, retryAfterMs: Math.max(retryAfterMs, 0) };
    }

    pruned.push(now);
    const remaining = this.maxRequests - pruned.length;
    return { allowed: true, remaining, retryAfterMs: 0 };
  }

  /** Remove all tracked entries. Useful for testing. */
  reset(): void {
    this.store.clear();
  }
}

// ---------------------------------------------------------------------------
// Middleware factory
// ---------------------------------------------------------------------------

/**
 * Creates Express-style rate-limit middleware.
 *
 * Uses the request IP as the rate-limit key. When the limit is exceeded,
 * passes a `RateLimitError` to the next error handler.
 */
export function createRateLimitMiddleware(
  options: RateLimitOptions,
): (req: RateLimitRequest, res: RateLimitResponse, next: NextFn) => void {
  const limiter = new RateLimiter(options);

  return function rateLimitMiddleware(
    req: RateLimitRequest,
    _res: RateLimitResponse,
    next: NextFn,
  ): void {
    const key = req.ip ?? req.headers['x-forwarded-for'] ?? 'unknown';
    const result = limiter.check(key);

    if (!result.allowed) {
      logger.warn('Rate limit exceeded', { key, retryAfterMs: result.retryAfterMs });
      next(new RateLimitError(result.retryAfterMs));
      return;
    }

    next();
  };
}
