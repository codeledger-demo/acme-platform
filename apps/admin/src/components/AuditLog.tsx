declare namespace JSX {
  interface Element {}
  interface IntrinsicElements {
    [elemName: string]: unknown;
  }
}

import type { AcmeClient } from '@acme/api-client';

export type AuditActionType = 'user.login' | 'user.created' | 'user.deleted' | 'billing.subscription_created' | 'billing.invoice_paid' | 'settings.updated';

export interface AuditEntry {
  id: string;
  userId: string;
  userName: string;
  action: AuditActionType;
  details: Record<string, string>;
  timestamp: string;
  ipAddress: string;
}

export interface AuditLogProps {
  client: AcmeClient;
  initialEntries?: AuditEntry[];
}

interface AuditLogState {
  entries: AuditEntry[];
  filterUser: string;
  filterAction: AuditActionType | '';
  filterDateFrom: string;
  filterDateTo: string;
  isLoading: boolean;
}

const ACTION_TYPES: AuditActionType[] = [
  'user.login',
  'user.created',
  'user.deleted',
  'billing.subscription_created',
  'billing.invoice_paid',
  'settings.updated',
];

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function matchesFilters(entry: AuditEntry, state: AuditLogState): boolean {
  if (state.filterUser && !entry.userName.toLowerCase().includes(state.filterUser.toLowerCase())) {
    return false;
  }
  if (state.filterAction && entry.action !== state.filterAction) {
    return false;
  }
  if (state.filterDateFrom && entry.timestamp < state.filterDateFrom) {
    return false;
  }
  if (state.filterDateTo && entry.timestamp > state.filterDateTo) {
    return false;
  }
  return true;
}

export function AuditLog(props: AuditLogProps): JSX.Element {
  const state: AuditLogState = {
    entries: props.initialEntries ?? [],
    filterUser: '',
    filterAction: '',
    filterDateFrom: '',
    filterDateTo: '',
    isLoading: false,
  };

  const filtered = state.entries.filter((entry) => matchesFilters(entry, state));

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Audit Log</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Filter by user..."
          className="rounded border px-3 py-2 text-sm"
          value={state.filterUser}
          onChange={(e: { target: { value: string } }) => { state.filterUser = e.target.value; }}
        />
        <select
          className="rounded border px-3 py-2 text-sm"
          value={state.filterAction}
          onChange={(e: { target: { value: string } }) => { state.filterAction = e.target.value as AuditActionType; }}
        >
          <option value="">All actions</option>
          {ACTION_TYPES.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <input
          type="date"
          className="rounded border px-3 py-2 text-sm"
          value={state.filterDateFrom}
          onChange={(e: { target: { value: string } }) => { state.filterDateFrom = e.target.value; }}
        />
        <input
          type="date"
          className="rounded border px-3 py-2 text-sm"
          value={state.filterDateTo}
          onChange={(e: { target: { value: string } }) => { state.filterDateTo = e.target.value; }}
        />
      </div>

      <p className="text-sm text-neutral-500">{filtered.length} entries</p>

      {/* Log table */}
      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">User</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map((entry) => (
              <tr key={entry.id}>
                <td className="whitespace-nowrap px-4 py-3 text-xs">{formatTimestamp(entry.timestamp)}</td>
                <td className="px-4 py-3">{entry.userName}</td>
                <td className="px-4 py-3 font-mono text-xs">{entry.action}</td>
                <td className="px-4 py-3 text-xs text-neutral-400">{entry.ipAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
