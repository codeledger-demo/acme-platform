/**
 * Webhook-specific retry manager with exponential backoff.
 * Tracks per-delivery attempt history and failure reasons.
 * Different from shared-utils retry — this is domain-specific
 * with persistent state and webhook-aware backoff policies.
 */
import { Logger } from '@acme/shared-utils';

export interface RetryAttempt {
  deliveryId: string;
  attemptNumber: number;
  timestamp: Date;
  success: boolean;
  failureReason: string | null;
  nextRetryAt: Date | null;
}

export interface RetryPolicy {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_POLICY: RetryPolicy = {
  maxRetries: 5,
  baseDelayMs: 1_000,
  maxDelayMs: 300_000, // 5 minutes
  backoffMultiplier: 2,
};

const logger = new Logger({ component: 'WebhookRetryManager' });

export class WebhookRetryManager {
  private readonly policy: RetryPolicy;
  private readonly attempts: Map<string, RetryAttempt[]> = new Map();

  constructor(policy: Partial<RetryPolicy> = {}) {
    this.policy = { ...DEFAULT_POLICY, ...policy };
  }

  /**
   * Record a delivery attempt and determine if retry is needed.
   */
  recordAttempt(
    deliveryId: string,
    success: boolean,
    failureReason: string | null = null,
  ): { shouldRetry: boolean; nextRetryAt: Date | null } {
    const history = this.getAttemptHistory(deliveryId);
    const attemptNumber = history.length + 1;

    const nextRetryAt = !success && attemptNumber < this.policy.maxRetries
      ? this.calculateNextRetry(attemptNumber)
      : null;

    const attempt: RetryAttempt = {
      deliveryId,
      attemptNumber,
      timestamp: new Date(),
      success,
      failureReason,
      nextRetryAt,
    };

    history.push(attempt);
    this.attempts.set(deliveryId, history);

    const shouldRetry = !success && attemptNumber < this.policy.maxRetries;

    logger.debug('Recorded delivery attempt', {
      deliveryId,
      attemptNumber,
      success,
      shouldRetry,
      nextRetryAt: nextRetryAt?.toISOString() ?? null,
    });

    return { shouldRetry, nextRetryAt };
  }

  /**
   * Calculate the delay for the next retry using exponential backoff.
   */
  calculateBackoffMs(attemptNumber: number): number {
    const delay = this.policy.baseDelayMs * Math.pow(this.policy.backoffMultiplier, attemptNumber - 1);
    return Math.min(delay, this.policy.maxDelayMs);
  }

  /**
   * Check whether a delivery has exhausted its retries.
   */
  isExhausted(deliveryId: string): boolean {
    const history = this.getAttemptHistory(deliveryId);
    return history.length >= this.policy.maxRetries;
  }

  /**
   * Get the full attempt history for a delivery.
   */
  getAttemptHistory(deliveryId: string): RetryAttempt[] {
    return this.attempts.get(deliveryId) ?? [];
  }

  /**
   * Get the failure reason from the most recent attempt.
   */
  getLastFailureReason(deliveryId: string): string | null {
    const history = this.getAttemptHistory(deliveryId);
    const lastFailed = [...history].reverse().find((a) => !a.success);
    return lastFailed?.failureReason ?? null;
  }

  /**
   * Clear attempt history for a delivery (e.g., after manual reset).
   */
  clearHistory(deliveryId: string): void {
    this.attempts.delete(deliveryId);
  }

  private calculateNextRetry(attemptNumber: number): Date {
    const delayMs = this.calculateBackoffMs(attemptNumber);
    return new Date(Date.now() + delayMs);
  }
}
