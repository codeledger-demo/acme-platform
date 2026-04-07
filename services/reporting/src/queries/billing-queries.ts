/**
 * Query builders for billing metrics — revenue, churn, subscription breakdown.
 */
import { formatISO } from '@acme/shared-utils';

export interface BillingQueryObject {
  table: string;
  select: string[];
  where: Record<string, unknown>;
  groupBy?: string[];
  orderBy?: { column: string; direction: 'asc' | 'desc' };
}

export function buildRevenueQuery(
  startDate: Date,
  endDate: Date,
  currency: string,
  tenantId?: string,
): BillingQueryObject {
  const where: Record<string, unknown> = {
    created_at_gte: formatISO(startDate),
    created_at_lte: formatISO(endDate),
    currency,
    status: 'paid',
  };
  if (tenantId) {
    where['tenant_id'] = tenantId;
  }

  return {
    table: 'invoices',
    select: [
      'SUM(amount) AS total',
      'SUM(CASE WHEN recurring = true THEN amount ELSE 0 END) AS mrr',
    ],
    where,
  };
}

export function buildChurnQuery(
  startDate: Date,
  endDate: Date,
  tenantId?: string,
): BillingQueryObject {
  const where: Record<string, unknown> = {
    cancelled_at_gte: formatISO(startDate),
    cancelled_at_lte: formatISO(endDate),
  };
  if (tenantId) {
    where['tenant_id'] = tenantId;
  }

  return {
    table: 'subscriptions',
    select: [
      'COUNT(CASE WHEN cancelled_at IS NOT NULL THEN 1 END) AS churned',
      'COUNT(*) AS total',
    ],
    where,
    groupBy: ['tenant_id'],
  };
}

export function buildSubscriptionBreakdownQuery(
  startDate: Date,
  endDate: Date,
  tenantId?: string,
): BillingQueryObject {
  const where: Record<string, unknown> = {
    created_at_lte: formatISO(endDate),
    status: 'active',
  };
  if (tenantId) {
    where['tenant_id'] = tenantId;
  }

  return {
    table: 'subscriptions',
    select: ['plan', 'COUNT(*) AS count', 'SUM(amount) AS revenue'],
    where,
    groupBy: ['plan'],
    orderBy: { column: 'plan', direction: 'asc' },
  };
}
