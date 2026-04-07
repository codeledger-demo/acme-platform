import { Logger, AppError } from '@acme/shared-utils';
import { PlanStore } from '../models/plan.js';
import { StripeClient } from '../stripe/client.js';
import { validateCheckoutInput } from '../validators/billing-schemas.js';

const logger = new Logger({ service: 'checkout-routes' });

export type CheckoutSessionStatus = 'pending' | 'complete' | 'expired';

export interface CheckoutSession {
  id: string;
  customerId: string;
  planId: string;
  status: CheckoutSessionStatus;
  paymentIntentId: string | null;
  successUrl: string;
  cancelUrl: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface CheckoutInput {
  customerId: string;
  planId: string;
  successUrl: string;
  cancelUrl: string;
}

export interface CheckoutResponse {
  success: boolean;
  data?: CheckoutSession;
  error?: string;
}

const sessions: Map<string, CheckoutSession> = new Map();
let nextId = 1;

export async function createCheckoutSession(
  input: CheckoutInput,
  planStore: PlanStore,
  stripeClient: StripeClient,
): Promise<CheckoutResponse> {
  const validation = validateCheckoutInput(input);
  if (!validation.valid) {
    throw new AppError(`Invalid checkout input: ${validation.errors.join(', ')}`, { code: 'VALIDATION_ERROR' });
  }

  const plan = planStore.getById(input.planId);
  logger.info('Creating checkout session', { customerId: input.customerId, planId: plan.id });

  const paymentIntent = await stripeClient.createPaymentIntent({
    amount: plan.amount,
    currency: plan.currency,
    customerId: input.customerId,
  });

  const id = `cs_${String(nextId++).padStart(6, '0')}`;
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  const session: CheckoutSession = {
    id,
    customerId: input.customerId,
    planId: input.planId,
    status: 'pending',
    paymentIntentId: paymentIntent.id,
    successUrl: input.successUrl,
    cancelUrl: input.cancelUrl,
    expiresAt,
    createdAt: new Date(),
  };

  sessions.set(id, session);
  logger.info('Checkout session created', { sessionId: id });

  return { success: true, data: session };
}

export function handleCheckoutComplete(sessionId: string): CheckoutResponse {
  const session = sessions.get(sessionId);
  if (!session) {
    throw new AppError(`Checkout session ${sessionId} not found`, { code: 'NOT_FOUND' });
  }

  if (session.status !== 'pending') {
    throw new AppError(
      `Checkout session ${sessionId} is not pending (status: ${session.status})`,
      { code: 'INVALID_SESSION_STATUS' },
    );
  }

  session.status = 'complete';
  logger.info('Checkout session completed', { sessionId });

  return { success: true, data: session };
}
