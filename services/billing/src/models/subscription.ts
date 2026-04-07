import { NotFoundError, Logger } from '@acme/shared-utils';

const logger = new Logger({ service: 'subscription-store' });

export type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'trialing';

export interface Subscription {
  id: string;
  customerId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubscriptionInput {
  customerId: string;
  planId: string;
  trialDays?: number;
}

const VALID_TRANSITIONS: Record<SubscriptionStatus, SubscriptionStatus[]> = {
  trialing: ['active', 'canceled'],
  active: ['past_due', 'canceled'],
  past_due: ['active', 'canceled'],
  canceled: [],
};

export class SubscriptionStore {
  private subscriptions: Map<string, Subscription> = new Map();
  private nextId = 1;

  create(input: CreateSubscriptionInput): Subscription {
    const id = `sub_${String(this.nextId++).padStart(6, '0')}`;
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const subscription: Subscription = {
      id,
      customerId: input.customerId,
      planId: input.planId,
      status: input.trialDays ? 'trialing' : 'active',
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      createdAt: now,
      updatedAt: now,
    };

    this.subscriptions.set(id, subscription);
    logger.info('Subscription created', { id, customerId: input.customerId, planId: input.planId });
    return subscription;
  }

  getById(id: string): Subscription {
    const subscription = this.subscriptions.get(id);
    if (!subscription) {
      throw new NotFoundError(`Subscription ${id} not found`);
    }
    return subscription;
  }

  listByCustomer(customerId: string): Subscription[] {
    return Array.from(this.subscriptions.values())
      .filter((s) => s.customerId === customerId);
  }

  updateStatus(id: string, newStatus: SubscriptionStatus): Subscription {
    const subscription = this.getById(id);
    const allowed = VALID_TRANSITIONS[subscription.status];

    if (!allowed.includes(newStatus)) {
      throw new Error(
        `Invalid status transition: ${subscription.status} -> ${newStatus} for subscription ${id}`,
      );
    }

    subscription.status = newStatus;
    subscription.updatedAt = new Date();
    logger.info('Subscription status updated', { id, from: subscription.status, to: newStatus });
    return subscription;
  }

  cancel(id: string): Subscription {
    const subscription = this.getById(id);
    subscription.cancelAtPeriodEnd = true;
    subscription.updatedAt = new Date();
    logger.info('Subscription scheduled for cancellation', { id });
    return subscription;
  }

  delete(id: string): boolean {
    return this.subscriptions.delete(id);
  }
}
