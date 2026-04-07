import { retry, Logger, AppError } from '@acme/shared-utils';

const logger = new Logger({ service: 'stripe-client' });

export interface StripeCustomerParams {
  email: string;
  name: string;
  metadata?: Record<string, string>;
}

export interface StripeCustomer {
  id: string;
  email: string;
  name: string;
  metadata: Record<string, string>;
  created: number;
}

export interface PaymentIntentParams {
  amount: number;
  currency: string;
  customerId: string;
  paymentMethodId?: string;
  metadata?: Record<string, string>;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'succeeded' | 'canceled';
  customerId: string;
  clientSecret: string;
  created: number;
}

export interface StripeSubscriptionParams {
  customerId: string;
  priceId: string;
  trialDays?: number;
  metadata?: Record<string, string>;
}

export interface StripeSubscription {
  id: string;
  customerId: string;
  priceId: string;
  status: 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete';
  currentPeriodStart: number;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
  created: number;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  card?: { brand: string; last4: string; expMonth: number; expYear: number };
  created: number;
}

export class StripeClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(apiKey: string, baseUrl = 'https://api.stripe.com/v1') {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async createCustomer(params: StripeCustomerParams): Promise<StripeCustomer> {
    return retry(async () => {
      logger.info('Creating Stripe customer', { email: params.email });
      const response = await this.post<StripeCustomer>('/customers', params);
      return response;
    }, { maxAttempts: 3, baseDelay: 500 });
  }

  async createPaymentIntent(params: PaymentIntentParams): Promise<PaymentIntent> {
    return retry(async () => {
      logger.info('Creating payment intent', { amount: params.amount, currency: params.currency });
      const response = await this.post<PaymentIntent>('/payment_intents', {
        amount: params.amount,
        currency: params.currency,
        customer: params.customerId,
        payment_method: params.paymentMethodId,
        metadata: params.metadata,
      });
      return response;
    }, { maxAttempts: 3, baseDelay: 500 });
  }

  async createSubscription(params: StripeSubscriptionParams): Promise<StripeSubscription> {
    return retry(async () => {
      logger.info('Creating subscription', { customerId: params.customerId, priceId: params.priceId });
      const response = await this.post<StripeSubscription>('/subscriptions', {
        customer: params.customerId,
        items: [{ price: params.priceId }],
        trial_period_days: params.trialDays,
        metadata: params.metadata,
      });
      return response;
    }, { maxAttempts: 3, baseDelay: 500 });
  }

  async cancelSubscription(subscriptionId: string): Promise<StripeSubscription> {
    return retry(async () => {
      logger.info('Canceling subscription', { subscriptionId });
      const response = await this.post<StripeSubscription>(
        `/subscriptions/${subscriptionId}`,
        { cancel_at_period_end: true },
      );
      return response;
    }, { maxAttempts: 3, baseDelay: 500 });
  }

  async listPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    return retry(async () => {
      logger.info('Listing payment methods', { customerId });
      const response = await this.get<{ data: PaymentMethod[] }>(
        `/payment_methods?customer=${customerId}&type=card`,
      );
      return response.data;
    }, { maxAttempts: 3, baseDelay: 500 });
  }

  async attachPaymentMethod(paymentMethodId: string, customerId: string): Promise<PaymentMethod> {
    return retry(async () => {
      logger.info('Attaching payment method', { paymentMethodId, customerId });
      const response = await this.post<PaymentMethod>(
        `/payment_methods/${paymentMethodId}/attach`,
        { customer: customerId },
      );
      return response;
    }, { maxAttempts: 3, baseDelay: 500 });
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      throw new AppError(`Stripe API error: ${response.status} ${response.statusText}`, { code: 'STRIPE_API_ERROR' });
    }
    return response.json() as Promise<T>;
  }

  private async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${this.apiKey}` },
    });
    if (!response.ok) {
      throw new AppError(`Stripe API error: ${response.status} ${response.statusText}`, { code: 'STRIPE_API_ERROR' });
    }
    return response.json() as Promise<T>;
  }
}
