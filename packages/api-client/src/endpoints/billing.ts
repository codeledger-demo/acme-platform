import type { AcmeClient } from '../client.js';
import type { ApiResponse, PaginatedResponse } from '../types.js';

export interface Subscription {
  id: string;
  planId: string;
  planName: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface Invoice {
  id: string;
  subscriptionId: string;
  amountCents: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  issuedAt: string;
  dueAt: string;
  paidAt: string | null;
}

export interface ListInvoicesParams {
  page?: number;
  pageSize?: number;
  status?: Invoice['status'];
  subscriptionId?: string;
}

/**
 * Billing and subscription management API methods.
 */
export class BillingApi {
  constructor(private readonly client: AcmeClient) {}

  /** List all subscriptions for the current organization. */
  async listSubscriptions(): Promise<ApiResponse<Subscription[]>> {
    return this.client.get<Subscription[]>('/billing/subscriptions');
  }

  /** Create a new subscription for the given plan. */
  async createSubscription(planId: string): Promise<ApiResponse<Subscription>> {
    return this.client.post<Subscription>('/billing/subscriptions', { planId });
  }

  /** Cancel a subscription by ID. */
  async cancelSubscription(id: string): Promise<ApiResponse<Subscription>> {
    return this.client.delete<Subscription>(`/billing/subscriptions/${id}`);
  }

  /** List invoices with optional filters. */
  async listInvoices(params?: ListInvoicesParams): Promise<PaginatedResponse<Invoice>> {
    const queryParams: Record<string, string | number | boolean> = {};
    if (params?.page !== undefined) queryParams['page'] = params.page;
    if (params?.pageSize !== undefined) queryParams['pageSize'] = params.pageSize;
    if (params?.status) queryParams['status'] = params.status;
    if (params?.subscriptionId) queryParams['subscriptionId'] = params.subscriptionId;

    return this.client.get<Invoice[]>('/billing/invoices', { params: queryParams }) as unknown as PaginatedResponse<Invoice>;
  }

  /** Fetch a single invoice by ID. */
  async getInvoice(id: string): Promise<ApiResponse<Invoice>> {
    return this.client.get<Invoice>(`/billing/invoices/${id}`);
  }
}
