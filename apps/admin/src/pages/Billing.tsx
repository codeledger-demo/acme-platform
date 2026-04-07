declare namespace JSX {
  interface Element {}
  interface IntrinsicElements {
    [elemName: string]: unknown;
  }
}

import { BillingApi } from '@acme/api-client';
import type { AcmeClient, Subscription, Invoice } from '@acme/api-client';

export interface AdminBillingPageProps {
  client: AcmeClient;
}

interface BillingOverview {
  subscriptions: Subscription[];
  recentInvoices: Invoice[];
  totalRevenueCents: number;
  activeSubscriptionCount: number;
  isLoading: boolean;
  error: string | null;
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
}

export function AdminBillingPage(props: AdminBillingPageProps): JSX.Element {
  const billingApi = new BillingApi(props.client);

  const overview: BillingOverview = {
    subscriptions: [],
    recentInvoices: [],
    totalRevenueCents: 0,
    activeSubscriptionCount: 0,
    isLoading: false,
    error: null,
  };

  const loadData = async (): Promise<void> => {
    overview.isLoading = true;
    try {
      const [subRes, invRes] = await Promise.all([
        billingApi.listSubscriptions(),
        billingApi.listInvoices({ page: 1, pageSize: 10 }),
      ]);
      overview.subscriptions = subRes.data;
      overview.recentInvoices = invRes.data;
      overview.activeSubscriptionCount = subRes.data.filter((s) => s.status === 'active').length;
      overview.totalRevenueCents = invRes.data
        .filter((inv) => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.amountCents, 0);
    } catch (err: unknown) {
      overview.error = err instanceof Error ? err.message : 'Failed to load billing data';
    } finally {
      overview.isLoading = false;
    }
  };

  void loadData();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">Billing Overview</h1>

      {overview.error && <p className="text-sm text-red-600">{overview.error}</p>}

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-neutral-500">Total Revenue</p>
          <p className="mt-1 text-2xl font-bold">{formatCurrency(overview.totalRevenueCents)}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-neutral-500">Active Subscriptions</p>
          <p className="mt-1 text-2xl font-bold">{overview.activeSubscriptionCount}</p>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <p className="text-sm text-neutral-500">Recent Invoices</p>
          <p className="mt-1 text-2xl font-bold">{overview.recentInvoices.length}</p>
        </div>
      </div>

      {/* Recent invoices table */}
      <div className="rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Invoice</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Issued</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {overview.recentInvoices.map((inv) => (
              <tr key={inv.id}>
                <td className="px-4 py-3 font-mono text-xs">{inv.id}</td>
                <td className="px-4 py-3">{formatCurrency(inv.amountCents)}</td>
                <td className="px-4 py-3 capitalize">{inv.status}</td>
                <td className="px-4 py-3">{inv.issuedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
