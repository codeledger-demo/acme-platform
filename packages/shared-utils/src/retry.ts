/**
 * Options for the retry utility.
 */
export interface RetryOptions {
  /** Maximum number of attempts (including the first). Default: 3 */
  maxAttempts?: number;
  /** Base delay in milliseconds before the first retry. Default: 250 */
  baseDelay?: number;
  /** Maximum delay cap in milliseconds. Default: 10_000 */
  maxDelay?: number;
  /**
   * Predicate to decide whether a failed attempt should be retried.
   * Receives the error and the 1-based attempt number.
   * Default: always retry.
   */
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  /** Jitter factor [0, 1] added to the delay. Default: 0.1 */
  jitter?: number;
}

/**
 * Execute an async function with exponential backoff retry.
 *
 * @param fn - The async operation to attempt.
 * @param options - Retry configuration.
 * @returns The resolved value of `fn` on the first successful attempt.
 * @throws The last error if all attempts are exhausted.
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const {
    maxAttempts = 3,
    baseDelay = 250,
    maxDelay = 10_000,
    shouldRetry = () => true,
    jitter = 0.1,
  } = options;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error: unknown) {
      lastError = error;

      const isLastAttempt = attempt === maxAttempts;
      if (isLastAttempt || !shouldRetry(error, attempt)) {
        throw error;
      }

      const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
      const jitterMs = exponentialDelay * jitter * Math.random();
      const delay = Math.min(exponentialDelay + jitterMs, maxDelay);

      await sleep(delay);
    }
  }

  // Unreachable, but satisfies the compiler
  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
