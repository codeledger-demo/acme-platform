import { BillingApi } from '@acme/api-client';
import type { Subscription, Invoice } from '@acme/api-client';
import { apiClient } from '../lib/api.js';

export interface BillingState {
  subscriptions: Subscription[];
  invoices: Invoice[];
  isLoadingSubscriptions: boolean;
  isLoadingInvoices: boolean;
  error: string | null;
}

export interface BillingActions {
  loadSubscriptions: () => Promise<void>;
  loadInvoices: (page?: number) => Promise<void>;
  cancelSubscription: (id: string) => Promise<void>;
  createSubscription: (planId: string) => Promise<void>;
}

export type UseBillingReturn = BillingState & BillingActions;

/**
 * Billing hook for subscription and invoice management.
 * Wraps BillingApi with loading/error state tracking.
 */
export function useBilling(): UseBillingReturn {
  const billingApi = new BillingApi(apiClient);

  const state: BillingState = {
    subscriptions: [],
    invoices: [],
    isLoadingSubscriptions: false,
    isLoadingInvoices: false,
    error: null,
  };

  const loadSubscriptions = async (): Promise<void> => {
    state.isLoadingSubscriptions = true;
    state.error = null;
    try {
      const res = await billingApi.listSubscriptions();
      state.subscriptions = res.data;
    } catch (err: unknown) {
      state.error = err instanceof Error ? err.message : 'Failed to load subscriptions';
    } finally {
      state.isLoadingSubscriptions = false;
    }
  };

  const loadInvoices = async (page = 1): Promise<void> => {
    state.isLoadingInvoices = true;
    state.error = null;
    try {
      const res = await billingApi.listInvoices({ page, pageSize: 20 });
      state.invoices = res.data;
    } catch (err: unknown) {
      state.error = err instanceof Error ? err.message : 'Failed to load invoices';
    } finally {
      state.isLoadingInvoices = false;
    }
  };

  const cancelSubscription = async (id: string): Promise<void> => {
    await billingApi.cancelSubscription(id);
    await loadSubscriptions();
  };

  const createSubscription = async (planId: string): Promise<void> => {
    await billingApi.createSubscription(planId);
    await loadSubscriptions();
  };

  return { ...state, loadSubscriptions, loadInvoices, cancelSubscription, createSubscription };
}
