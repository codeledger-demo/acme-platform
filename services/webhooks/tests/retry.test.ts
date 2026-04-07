import { describe, it, expect } from 'vitest';
import { WebhookRetryManager } from '../src/retry.js';

describe('WebhookRetryManager', () => {
  it('allows retries up to the max', () => {
    const manager = new WebhookRetryManager({ maxRetries: 3 });

    const r1 = manager.recordAttempt('dlv_1', false, 'timeout');
    expect(r1.shouldRetry).toBe(true);
    expect(r1.nextRetryAt).not.toBeNull();

    const r2 = manager.recordAttempt('dlv_1', false, 'timeout');
    expect(r2.shouldRetry).toBe(true);

    const r3 = manager.recordAttempt('dlv_1', false, 'timeout');
    expect(r3.shouldRetry).toBe(false);
    expect(r3.nextRetryAt).toBeNull();
  });

  it('stops retrying on success', () => {
    const manager = new WebhookRetryManager({ maxRetries: 5 });

    const r1 = manager.recordAttempt('dlv_2', true);
    expect(r1.shouldRetry).toBe(false);
    expect(r1.nextRetryAt).toBeNull();
  });

  it('calculates exponential backoff', () => {
    const manager = new WebhookRetryManager({
      baseDelayMs: 1_000,
      backoffMultiplier: 2,
      maxDelayMs: 60_000,
    });

    expect(manager.calculateBackoffMs(1)).toBe(1_000);
    expect(manager.calculateBackoffMs(2)).toBe(2_000);
    expect(manager.calculateBackoffMs(3)).toBe(4_000);
    expect(manager.calculateBackoffMs(4)).toBe(8_000);
  });

  it('caps backoff at maxDelayMs', () => {
    const manager = new WebhookRetryManager({
      baseDelayMs: 1_000,
      backoffMultiplier: 10,
      maxDelayMs: 5_000,
    });

    expect(manager.calculateBackoffMs(3)).toBe(5_000);
  });

  it('tracks exhaustion status', () => {
    const manager = new WebhookRetryManager({ maxRetries: 2 });

    expect(manager.isExhausted('dlv_3')).toBe(false);
    manager.recordAttempt('dlv_3', false, 'error');
    expect(manager.isExhausted('dlv_3')).toBe(false);
    manager.recordAttempt('dlv_3', false, 'error');
    expect(manager.isExhausted('dlv_3')).toBe(true);
  });

  it('returns the last failure reason', () => {
    const manager = new WebhookRetryManager({ maxRetries: 3 });

    manager.recordAttempt('dlv_4', false, 'connection refused');
    manager.recordAttempt('dlv_4', false, 'timeout');

    expect(manager.getLastFailureReason('dlv_4')).toBe('timeout');
  });

  it('clears history', () => {
    const manager = new WebhookRetryManager({ maxRetries: 2 });

    manager.recordAttempt('dlv_5', false, 'error');
    manager.clearHistory('dlv_5');
    expect(manager.getAttemptHistory('dlv_5')).toHaveLength(0);
    expect(manager.isExhausted('dlv_5')).toBe(false);
  });
});
