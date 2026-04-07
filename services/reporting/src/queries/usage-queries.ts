/**
 * Query builders for usage metrics.
 * Returns typed query objects that can be executed against a data store.
 */
import { formatISO } from '@acme/shared-utils';

export interface QueryObject {
  table: string;
  select: string[];
  where: Record<string, unknown>;
  groupBy?: string[];
  orderBy?: { column: string; direction: 'asc' | 'desc' };
}

export function buildUsageQuery(
  startDate: Date,
  endDate: Date,
  tenantId?: string,
): QueryObject {
  const where: Record<string, unknown> = {
    timestamp_gte: formatISO(startDate),
    timestamp_lte: formatISO(endDate),
  };
  if (tenantId) {
    where['tenant_id'] = tenantId;
  }

  return {
    table: 'usage_events',
    select: ['SUM(storage_bytes) AS storageBytes', 'SUM(bandwidth_bytes) AS bandwidthBytes'],
    where,
  };
}

export function buildActiveUsersQuery(
  startDate: Date,
  endDate: Date,
  tenantId?: string,
): QueryObject {
  const where: Record<string, unknown> = {
    last_active_gte: formatISO(startDate),
    last_active_lte: formatISO(endDate),
  };
  if (tenantId) {
    where['tenant_id'] = tenantId;
  }

  return {
    table: 'users',
    select: ['COUNT(DISTINCT id) AS activeUsers'],
    where,
  };
}

export function buildApiCallsQuery(
  startDate: Date,
  endDate: Date,
  tenantId?: string,
): QueryObject {
  const where: Record<string, unknown> = {
    called_at_gte: formatISO(startDate),
    called_at_lte: formatISO(endDate),
  };
  if (tenantId) {
    where['tenant_id'] = tenantId;
  }

  return {
    table: 'api_requests',
    select: ['COUNT(*) AS apiCalls'],
    where,
    orderBy: { column: 'called_at', direction: 'desc' },
  };
}
