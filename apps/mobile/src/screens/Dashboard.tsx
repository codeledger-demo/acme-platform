declare namespace JSX {
  interface Element {}
  interface IntrinsicElements {
    [elemName: string]: unknown;
  }
}

import type { AcmeClient } from '@acme/api-client';
import { ReportingApi } from '@acme/api-client';
import type { UsageReport } from '@acme/api-client';

export interface DashboardScreenProps {
  client: AcmeClient;
}

interface DashboardState {
  usageReport: UsageReport | null;
  isLoading: boolean;
  error: string | null;
}

interface MetricSummary {
  label: string;
  value: string;
  trend: 'up' | 'down' | 'flat';
}

function buildMetrics(report: UsageReport | null): MetricSummary[] {
  if (!report) {
    return [
      { label: 'Total Requests', value: '--', trend: 'flat' },
      { label: 'Storage Used', value: '--', trend: 'flat' },
      { label: 'Avg Daily', value: '--', trend: 'flat' },
    ];
  }

  const storageMB = (report.totalStorageBytes / (1024 * 1024)).toFixed(1);
  const dayCount = report.dataPoints.length || 1;
  const avgDaily = Math.round(report.totalRequests / dayCount);

  return [
    { label: 'Total Requests', value: report.totalRequests.toLocaleString(), trend: 'up' },
    { label: 'Storage Used', value: `${storageMB} MB`, trend: 'up' },
    { label: 'Avg Daily', value: avgDaily.toLocaleString(), trend: 'flat' },
  ];
}

export function DashboardScreen(props: DashboardScreenProps): JSX.Element {
  const reportingApi = new ReportingApi(props.client);

  const state: DashboardState = {
    usageReport: null,
    isLoading: false,
    error: null,
  };

  const loadData = async (): Promise<void> => {
    state.isLoading = true;
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const res = await reportingApi.getUsageReport({
        startDate: thirtyDaysAgo.toISOString(),
        endDate: now.toISOString(),
        granularity: 'daily',
      });
      state.usageReport = res.data;
    } catch (err: unknown) {
      state.error = err instanceof Error ? err.message : 'Failed to load dashboard';
    } finally {
      state.isLoading = false;
    }
  };

  void loadData();

  const metrics = buildMetrics(state.usageReport);

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-bold">Dashboard</h1>

      {state.error && <p className="text-sm text-red-500">{state.error}</p>}

      <div className="space-y-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-xl border bg-white p-4 shadow-sm">
            <p className="text-xs text-neutral-500">{metric.label}</p>
            <p className="mt-1 text-xl font-bold">{metric.value}</p>
            <p className="text-xs text-neutral-400">
              {metric.trend === 'up' ? '\u2191 Trending up' : metric.trend === 'down' ? '\u2193 Trending down' : '\u2192 Stable'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
