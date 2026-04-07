/**
 * Usage report generator — produces usage metrics for a given date range.
 */
import { Logger, formatISO, diffInDays, addDays } from '@acme/shared-utils';
import { buildUsageQuery, buildActiveUsersQuery, buildApiCallsQuery } from '../queries/usage-queries.js';

export type Granularity = 'daily' | 'weekly' | 'monthly';

export interface UsageReportParams {
  startDate: Date;
  endDate: Date;
  granularity: Granularity;
  tenantId?: string;
}

export interface UsageMetrics {
  activeUsers: number;
  apiCalls: number;
  storageBytes: number;
  bandwidthBytes: number;
}

export interface TrendDataPoint {
  date: string;
  activeUsers: number;
  apiCalls: number;
}

export interface UsageReport {
  generatedAt: string;
  startDate: string;
  endDate: string;
  granularity: Granularity;
  tenantId: string | undefined;
  metrics: UsageMetrics;
  trend: TrendDataPoint[];
}

const logger = new Logger({ component: 'UsageReportGenerator' });

export class UsageReportGenerator {
  /**
   * Generate a usage report for the specified date range and granularity.
   */
  async generate(params: UsageReportParams): Promise<UsageReport> {
    const { startDate, endDate, granularity, tenantId } = params;

    logger.info('Generating usage report', {
      startDate: formatISO(startDate),
      endDate: formatISO(endDate),
      granularity,
      tenantId,
    });

    const usageQuery = buildUsageQuery(startDate, endDate, tenantId);
    const activeUsersQuery = buildActiveUsersQuery(startDate, endDate, tenantId);
    const apiCallsQuery = buildApiCallsQuery(startDate, endDate, tenantId);

    // Simulate query execution against a data source
    const metrics = await this.resolveMetrics(usageQuery, activeUsersQuery, apiCallsQuery);
    const trend = this.buildTrend(startDate, endDate, granularity);

    const report: UsageReport = {
      generatedAt: formatISO(new Date()),
      startDate: formatISO(startDate),
      endDate: formatISO(endDate),
      granularity,
      tenantId,
      metrics,
      trend,
    };

    logger.info('Usage report generated', { trendPoints: trend.length });
    return report;
  }

  private async resolveMetrics(
    _usageQuery: ReturnType<typeof buildUsageQuery>,
    _activeUsersQuery: ReturnType<typeof buildActiveUsersQuery>,
    _apiCallsQuery: ReturnType<typeof buildApiCallsQuery>,
  ): Promise<UsageMetrics> {
    // In production this would execute the query objects against a DB
    return {
      activeUsers: 0,
      apiCalls: 0,
      storageBytes: 0,
      bandwidthBytes: 0,
    };
  }

  private buildTrend(startDate: Date, endDate: Date, granularity: Granularity): TrendDataPoint[] {
    const points: TrendDataPoint[] = [];
    const totalDays = diffInDays(startDate, endDate);
    const stepDays = granularity === 'daily' ? 1 : granularity === 'weekly' ? 7 : 30;

    let cursor = startDate;
    for (let offset = 0; offset <= totalDays; offset += stepDays) {
      cursor = addDays(startDate, offset);
      points.push({
        date: formatISO(cursor),
        activeUsers: 0,
        apiCalls: 0,
      });
    }

    return points;
  }
}
