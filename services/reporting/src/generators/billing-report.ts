/**
 * Billing report generator — revenue, MRR, churn, ARPU, and subscription breakdown.
 */
import { Logger, formatISO } from '@acme/shared-utils';
import { buildRevenueQuery, buildChurnQuery, buildSubscriptionBreakdownQuery } from '../queries/billing-queries.js';

export interface BillingReportParams {
  startDate: Date;
  endDate: Date;
  tenantId?: string;
  currency?: string;
}

export type PlanTier = 'free' | 'starter' | 'professional' | 'enterprise';

export interface SubscriptionBreakdown {
  plan: PlanTier;
  count: number;
  revenue: number;
}

export interface BillingReport {
  generatedAt: string;
  startDate: string;
  endDate: string;
  currency: string;
  totalRevenue: number;
  mrr: number;
  churnRate: number;
  arpu: number;
  subscriptions: SubscriptionBreakdown[];
}

const logger = new Logger({ component: 'BillingReportGenerator' });

export class BillingReportGenerator {
  /**
   * Generate a billing report with revenue metrics and subscription breakdown.
   */
  async generate(params: BillingReportParams): Promise<BillingReport> {
    const { startDate, endDate, tenantId, currency = 'USD' } = params;

    logger.info('Generating billing report', {
      startDate: formatISO(startDate),
      endDate: formatISO(endDate),
      tenantId,
      currency,
    });

    const revenueQuery = buildRevenueQuery(startDate, endDate, currency, tenantId);
    const churnQuery = buildChurnQuery(startDate, endDate, tenantId);
    const breakdownQuery = buildSubscriptionBreakdownQuery(startDate, endDate, tenantId);

    const [revenue, churn, subscriptions] = await Promise.all([
      this.resolveRevenue(revenueQuery),
      this.resolveChurn(churnQuery),
      this.resolveBreakdown(breakdownQuery),
    ]);

    const totalSubscribers = subscriptions.reduce((sum, s) => sum + s.count, 0);
    const arpu = totalSubscribers > 0 ? revenue.total / totalSubscribers : 0;

    const report: BillingReport = {
      generatedAt: formatISO(new Date()),
      startDate: formatISO(startDate),
      endDate: formatISO(endDate),
      currency,
      totalRevenue: revenue.total,
      mrr: revenue.mrr,
      churnRate: churn.rate,
      arpu,
      subscriptions,
    };

    logger.info('Billing report generated', {
      totalRevenue: report.totalRevenue,
      mrr: report.mrr,
      churnRate: report.churnRate,
    });

    return report;
  }

  private async resolveRevenue(
    _query: ReturnType<typeof buildRevenueQuery>,
  ): Promise<{ total: number; mrr: number }> {
    return { total: 0, mrr: 0 };
  }

  private async resolveChurn(
    _query: ReturnType<typeof buildChurnQuery>,
  ): Promise<{ rate: number }> {
    return { rate: 0 };
  }

  private async resolveBreakdown(
    _query: ReturnType<typeof buildSubscriptionBreakdownQuery>,
  ): Promise<SubscriptionBreakdown[]> {
    return [
      { plan: 'free', count: 0, revenue: 0 },
      { plan: 'starter', count: 0, revenue: 0 },
      { plan: 'professional', count: 0, revenue: 0 },
      { plan: 'enterprise', count: 0, revenue: 0 },
    ];
  }
}
