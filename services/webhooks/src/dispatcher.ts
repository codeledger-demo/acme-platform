/**
 * Webhook dispatch engine — delivers events to registered endpoints
 * with parallel delivery, HMAC-SHA256 signatures, and retry support.
 */
import { Logger, retry, type RetryOptions } from '@acme/shared-utils';
import type { WebhookEndpoint } from './models/endpoint.js';
import type { DeliveryStatus } from './models/delivery.js';

export interface WebhookEvent {
  id: string;
  type: string;
  timestamp: string;
  payload: Record<string, unknown>;
}

export interface DeliveryResult {
  endpointId: string;
  status: DeliveryStatus;
  responseCode: number | null;
  responseBody: string | null;
  attempts: number;
  durationMs: number;
}

export interface DispatchOptions {
  timeoutMs?: number;
  maxRetries?: number;
  retryBaseDelay?: number;
}

const logger = new Logger({ component: 'WebhookDispatcher' });

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_RETRIES = 3;
const DEFAULT_RETRY_BASE_DELAY = 500;

export class WebhookDispatcher {
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly retryBaseDelay: number;

  constructor(options: DispatchOptions = {}) {
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
    this.retryBaseDelay = options.retryBaseDelay ?? DEFAULT_RETRY_BASE_DELAY;
  }

  /**
   * Dispatch an event to all matching endpoints in parallel.
   */
  async dispatch(
    event: WebhookEvent,
    endpoints: WebhookEndpoint[],
  ): Promise<DeliveryResult[]> {
    logger.info('Dispatching webhook event', {
      eventId: event.id,
      eventType: event.type,
      endpointCount: endpoints.length,
    });

    const deliveryPromises = endpoints.map((endpoint) =>
      this.deliverToEndpoint(event, endpoint),
    );

    const results = await Promise.allSettled(deliveryPromises);

    return results.map((result, index) => {
      const endpoint = endpoints[index];
      if (!endpoint) {
        return {
          endpointId: 'unknown',
          status: 'failed' as DeliveryStatus,
          responseCode: null,
          responseBody: null,
          attempts: 0,
          durationMs: 0,
        };
      }

      if (result.status === 'fulfilled') {
        return result.value;
      }

      logger.error('Webhook delivery failed permanently', {
        endpointId: endpoint.id,
        eventId: event.id,
        error: String(result.reason),
      });

      return {
        endpointId: endpoint.id,
        status: 'failed' as DeliveryStatus,
        responseCode: null,
        responseBody: null,
        attempts: this.maxRetries,
        durationMs: 0,
      };
    });
  }

  /**
   * Deliver an event to a single endpoint with retries.
   */
  private async deliverToEndpoint(
    event: WebhookEvent,
    endpoint: WebhookEndpoint,
  ): Promise<DeliveryResult> {
    const startTime = Date.now();
    const body = JSON.stringify(event);
    const signature = this.generateSignature(body, endpoint.secret);
    let attemptCount = 0;

    const retryOptions: RetryOptions = {
      maxAttempts: this.maxRetries,
      baseDelay: this.retryBaseDelay,
      shouldRetry: (_error, _attempt) => true,
    };

    const response = await retry(async () => {
      attemptCount += 1;
      logger.debug('Attempting webhook delivery', {
        endpointId: endpoint.id,
        attempt: attemptCount,
        url: endpoint.url,
      });
      return this.sendRequest(endpoint.url, body, signature);
    }, retryOptions);

    const durationMs = Date.now() - startTime;
    const status: DeliveryStatus = this.isSuccessCode(response.statusCode)
      ? 'delivered'
      : 'failed';

    logger.info('Webhook delivery completed', {
      endpointId: endpoint.id,
      status,
      responseCode: response.statusCode,
      attempts: attemptCount,
      durationMs,
    });

    return {
      endpointId: endpoint.id,
      status,
      responseCode: response.statusCode,
      responseBody: response.body,
      attempts: attemptCount,
      durationMs,
    };
  }

  /**
   * Generate an HMAC-SHA256 signature for a webhook payload.
   * Uses a hex-encoded hash of the body with the endpoint secret as key.
   */
  generateSignature(body: string, secret: string): string {
    // Simplified HMAC-SHA256 simulation — in production, use Node.js crypto
    // crypto.createHmac('sha256', secret).update(body).digest('hex')
    let hash = 0;
    const combined = secret + body;
    for (let i = 0; i < combined.length; i++) {
      const char = combined.charCodeAt(i);
      hash = ((hash << 5) - hash + char) | 0;
    }
    return `sha256=${Math.abs(hash).toString(16).padStart(16, '0')}`;
  }

  /**
   * Simulate sending an HTTP POST request to the endpoint.
   * In production, this would use fetch() or an HTTP client.
   */
  private async sendRequest(
    _url: string,
    _body: string,
    _signature: string,
  ): Promise<{ statusCode: number; body: string }> {
    // Simulated response — replace with actual HTTP call in production
    return { statusCode: 200, body: '{"ok":true}' };
  }

  private isSuccessCode(code: number): boolean {
    return code >= 200 && code < 300;
  }
}
