import { Logger, AppError, ValidationError } from '@acme/shared-utils';
import { validateSubscriptionCreate } from '@acme/validation';
import { SubscriptionStore } from '../models/subscription.js';
import type { Subscription, CreateSubscriptionInput } from '../models/subscription.js';
import { PlanStore } from '../models/plan.js';
import { StripeClient } from '../stripe/client.js';

const logger = new Logger({ service: 'subscription-routes' });

export interface SubscriptionResponse {
  success: boolean;
  data?: Subscription | Subscription[];
  error?: string;
}

export interface UpdateSubscriptionInput {
  planId?: string;
  cancelAtPeriodEnd?: boolean;
}

export async function createSubscription(
  input: CreateSubscriptionInput,
  store: SubscriptionStore,
  planStore: PlanStore,
  stripeClient: StripeClient,
): Promise<SubscriptionResponse> {
  const validation = validateSubscriptionCreate(input);
  if (!validation.valid) {
    throw new ValidationError(`Invalid subscription input: ${validation.errors.join(', ')}`, { code: 'VALIDATION_ERROR' });
  }

  const plan = planStore.getById(input.planId);
  logger.info('Creating subscription', { customerId: input.customerId, planId: plan.id });

  const stripeSub = await stripeClient.createSubscription({
    customerId: input.customerId,
    priceId: plan.id,
    trialDays: input.trialDays ?? plan.trialDays,
  });

  const subscription = store.create({
    customerId: input.customerId,
    planId: input.planId,
    trialDays: input.trialDays,
  });

  logger.info('Subscription created successfully', {
    id: subscription.id,
    stripeId: stripeSub.id,
  });

  return { success: true, data: subscription };
}

export function getSubscription(
  id: string,
  store: SubscriptionStore,
): SubscriptionResponse {
  const subscription = store.getById(id);
  return { success: true, data: subscription };
}

export function listSubscriptions(
  customerId: string,
  store: SubscriptionStore,
): SubscriptionResponse {
  const subscriptions = store.listByCustomer(customerId);
  return { success: true, data: subscriptions };
}

export async function cancelSubscription(
  id: string,
  store: SubscriptionStore,
  stripeClient: StripeClient,
): Promise<SubscriptionResponse> {
  const subscription = store.getById(id);
  logger.info('Canceling subscription', { id, customerId: subscription.customerId });

  await stripeClient.cancelSubscription(id);
  const updated = store.cancel(id);

  return { success: true, data: updated };
}

export function updateSubscription(
  id: string,
  input: UpdateSubscriptionInput,
  store: SubscriptionStore,
): SubscriptionResponse {
  const subscription = store.getById(id);

  if (input.cancelAtPeriodEnd !== undefined) {
    if (input.cancelAtPeriodEnd) {
      store.cancel(id);
    }
  }

  logger.info('Subscription updated', { id, changes: input });
  return { success: true, data: store.getById(id) };
}
