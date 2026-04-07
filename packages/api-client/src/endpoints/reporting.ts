import type { AcmeClient } from '../client.js';
import type { ApiResponse } from '../types.js';

export interface UsageReportParams {
  startDate: string;
  endDate: string;
  granularity?: 'hourly' | 'daily' | 'weekly' | 'monthly';
}

export interface BillingReportParams {
  startDate: string;
  endDate: string;
  groupBy?: 'plan' | 'organization' | 'subscription';
}

export interface UsageReport {
  id: string;
  period: { start: string; end: string };
  totalRequests: number;
  totalStorageBytes: number;
  dataPoints: Array<{ timestamp: string; requests: number; storageBytes: number }>;
}

export interface BillingReport {
  id: string;
  period: { start: string; end: string };
  totalRevenueCents: number;
  lineItems: Array<{ label: string; amountCents: number; quantity: number }>;
}

export interface ExportedReport {
  id: string;
  downloadUrl: string;
  format: string;
  expiresAt: string;
}

/**
 * Reporting and analytics API methods.
 */
export class ReportingApi {
  constructor(private readonly client: AcmeClient) {}

  /** Generate a usage report for the given date range. */
  async getUsageReport(params: UsageReportParams): Promise<ApiResponse<UsageReport>> {
    return this.client.post<UsageReport>('/reports/usage', params);
  }

  /** Generate a billing report for the given date range. */
  async getBillingReport(params: BillingReportParams): Promise<ApiResponse<BillingReport>> {
    return this.client.post<BillingReport>('/reports/billing', params);
  }

  /** Export a previously generated report in the specified format. */
  async exportReport(id: string, format: 'csv' | 'pdf' | 'xlsx'): Promise<ApiResponse<ExportedReport>> {
    return this.client.post<ExportedReport>(`/reports/${id}/export`, { format });
  }
}
