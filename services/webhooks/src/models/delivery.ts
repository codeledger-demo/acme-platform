/**
 * Webhook delivery types and in-memory store.
 */
import { NotFoundError } from '@acme/shared-utils';

export type DeliveryStatus = 'pending' | 'delivered' | 'failed';

export interface WebhookDelivery {
  id: string;
  endpointId: string;
  eventType: string;
  payload: Record<string, unknown>;
  status: DeliveryStatus;
  attempts: number;
  lastAttemptAt: Date | null;
  responseCode: number | null;
  responseBody: string | null;
  createdAt: Date;
}

export interface CreateDeliveryInput {
  endpointId: string;
  eventType: string;
  payload: Record<string, unknown>;
}

export class DeliveryStore {
  private readonly deliveries: Map<string, WebhookDelivery> = new Map();
  private nextId = 1;

  create(input: CreateDeliveryInput): WebhookDelivery {
    const delivery: WebhookDelivery = {
      id: `dlv_${String(this.nextId++).padStart(8, '0')}`,
      endpointId: input.endpointId,
      eventType: input.eventType,
      payload: { ...input.payload },
      status: 'pending',
      attempts: 0,
      lastAttemptAt: null,
      responseCode: null,
      responseBody: null,
      createdAt: new Date(),
    };
    this.deliveries.set(delivery.id, delivery);
    return delivery;
  }

  getById(id: string): WebhookDelivery {
    const delivery = this.deliveries.get(id);
    if (!delivery) {
      throw new NotFoundError('WebhookDelivery', id);
    }
    return delivery;
  }

  recordAttempt(
    id: string,
    result: { status: DeliveryStatus; responseCode: number | null; responseBody: string | null },
  ): WebhookDelivery {
    const delivery = this.getById(id);
    delivery.attempts += 1;
    delivery.lastAttemptAt = new Date();
    delivery.status = result.status;
    delivery.responseCode = result.responseCode;
    delivery.responseBody = result.responseBody;
    return delivery;
  }

  listByEndpoint(endpointId: string): WebhookDelivery[] {
    return [...this.deliveries.values()].filter((d) => d.endpointId === endpointId);
  }

  listPending(): WebhookDelivery[] {
    return [...this.deliveries.values()].filter((d) => d.status === 'pending');
  }

  listFailed(): WebhookDelivery[] {
    return [...this.deliveries.values()].filter((d) => d.status === 'failed');
  }
}
