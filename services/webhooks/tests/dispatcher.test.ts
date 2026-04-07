import { describe, it, expect } from 'vitest';
import { WebhookDispatcher, type WebhookEvent } from '../src/dispatcher.js';
import type { WebhookEndpoint } from '../src/models/endpoint.js';

describe('WebhookDispatcher', () => {
  const dispatcher = new WebhookDispatcher({ timeoutMs: 5_000, maxRetries: 2 });

  const event: WebhookEvent = {
    id: 'evt_001',
    type: 'invoice.paid',
    timestamp: new Date().toISOString(),
    payload: { invoiceId: 'inv_123', amount: 9900 },
  };

  const endpoint: WebhookEndpoint = {
    id: 'ep_000001',
    url: 'https://example.com/webhook',
    secret: 'a'.repeat(32),
    events: ['invoice.paid'],
    active: true,
    createdAt: new Date(),
    lastDeliveryAt: null,
    failureCount: 0,
  };

  it('dispatches to all endpoints and returns results', async () => {
    const results = await dispatcher.dispatch(event, [endpoint]);

    expect(results).toHaveLength(1);
    expect(results[0]?.endpointId).toBe('ep_000001');
    expect(results[0]?.status).toBe('delivered');
    expect(results[0]?.responseCode).toBe(200);
  });

  it('returns empty results for empty endpoints array', async () => {
    const results = await dispatcher.dispatch(event, []);
    expect(results).toHaveLength(0);
  });

  it('dispatches to multiple endpoints in parallel', async () => {
    const endpoint2: WebhookEndpoint = {
      ...endpoint,
      id: 'ep_000002',
      url: 'https://other.example.com/hook',
    };

    const results = await dispatcher.dispatch(event, [endpoint, endpoint2]);

    expect(results).toHaveLength(2);
    expect(results[0]?.endpointId).toBe('ep_000001');
    expect(results[1]?.endpointId).toBe('ep_000002');
  });

  describe('generateSignature', () => {
    it('produces a sha256-prefixed signature', () => {
      const signature = dispatcher.generateSignature('{"test":true}', 'secret-key');
      expect(signature).toMatch(/^sha256=[0-9a-f]{16}$/);
    });

    it('produces different signatures for different secrets', () => {
      const sig1 = dispatcher.generateSignature('body', 'secret-a');
      const sig2 = dispatcher.generateSignature('body', 'secret-b');
      expect(sig1).not.toBe(sig2);
    });

    it('produces different signatures for different bodies', () => {
      const sig1 = dispatcher.generateSignature('body-a', 'secret');
      const sig2 = dispatcher.generateSignature('body-b', 'secret');
      expect(sig1).not.toBe(sig2);
    });
  });
});
