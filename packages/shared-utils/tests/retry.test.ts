import { describe, it, expect, vi } from 'vitest';
import { retry } from '../src/retry.js';

describe('retry', () => {
  it('returns the result on first success', async () => {
    const fn = vi.fn().mockResolvedValue('ok');
    const result = await retry(fn, { maxAttempts: 3, baseDelay: 1 });
    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries on transient failure and succeeds', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('transient'))
      .mockRejectedValueOnce(new Error('transient'))
      .mockResolvedValue('recovered');

    const result = await retry(fn, { maxAttempts: 4, baseDelay: 1, jitter: 0 });
    expect(result).toBe('recovered');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('throws after exhausting max attempts', async () => {
    const fn = vi.fn().mockRejectedValue(new Error('persistent'));

    await expect(
      retry(fn, { maxAttempts: 3, baseDelay: 1, jitter: 0 }),
    ).rejects.toThrow('persistent');

    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('respects the shouldRetry predicate', async () => {
    const nonRetryable = new Error('fatal');
    const fn = vi.fn().mockRejectedValue(nonRetryable);

    await expect(
      retry(fn, {
        maxAttempts: 5,
        baseDelay: 1,
        shouldRetry: (err) => (err as Error).message !== 'fatal',
      }),
    ).rejects.toThrow('fatal');

    // Should not retry at all because the predicate rejects it
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('caps delay at maxDelay', async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error('fail'))
      .mockResolvedValue('ok');

    const result = await retry(fn, {
      maxAttempts: 3,
      baseDelay: 5_000,
      maxDelay: 10,
      jitter: 0,
    });

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
