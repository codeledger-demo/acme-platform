/**
 * Webhook endpoint types and in-memory store.
 */
import { NotFoundError } from '@acme/shared-utils';

export interface WebhookEndpoint {
  id: string;
  url: string;
  secret: string;
  events: string[];
  active: boolean;
  createdAt: Date;
  lastDeliveryAt: Date | null;
  failureCount: number;
}

export interface CreateEndpointInput {
  url: string;
  secret: string;
  events: string[];
}

export interface UpdateEndpointInput {
  url?: string;
  secret?: string;
  events?: string[];
  active?: boolean;
}

export class EndpointStore {
  private readonly endpoints: Map<string, WebhookEndpoint> = new Map();
  private nextId = 1;

  create(input: CreateEndpointInput): WebhookEndpoint {
    const endpoint: WebhookEndpoint = {
      id: `ep_${String(this.nextId++).padStart(6, '0')}`,
      url: input.url,
      secret: input.secret,
      events: [...input.events],
      active: true,
      createdAt: new Date(),
      lastDeliveryAt: null,
      failureCount: 0,
    };
    this.endpoints.set(endpoint.id, endpoint);
    return endpoint;
  }

  getById(id: string): WebhookEndpoint {
    const endpoint = this.endpoints.get(id);
    if (!endpoint) {
      throw new NotFoundError('WebhookEndpoint', id);
    }
    return endpoint;
  }

  update(id: string, input: UpdateEndpointInput): WebhookEndpoint {
    const endpoint = this.getById(id);
    if (input.url !== undefined) endpoint.url = input.url;
    if (input.secret !== undefined) endpoint.secret = input.secret;
    if (input.events !== undefined) endpoint.events = [...input.events];
    if (input.active !== undefined) endpoint.active = input.active;
    return endpoint;
  }

  delete(id: string): boolean {
    return this.endpoints.delete(id);
  }

  listActive(): WebhookEndpoint[] {
    return [...this.endpoints.values()].filter((ep) => ep.active);
  }

  listByEvent(eventType: string): WebhookEndpoint[] {
    return this.listActive().filter((ep) => ep.events.includes(eventType));
  }

  recordDelivery(id: string, success: boolean): void {
    const endpoint = this.getById(id);
    endpoint.lastDeliveryAt = new Date();
    if (!success) {
      endpoint.failureCount += 1;
    } else {
      endpoint.failureCount = 0;
    }
  }
}
