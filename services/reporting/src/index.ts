/**
 * @acme/reporting-service
 *
 * Generates usage, billing, and audit reports with CSV/PDF export.
 */
import { Logger } from '@acme/shared-utils';

const logger = new Logger({ service: 'reporting' });

logger.info('Reporting service module loaded');

export { UsageReportGenerator } from './generators/usage-report.js';
export { BillingReportGenerator } from './generators/billing-report.js';
export { AuditReportGenerator } from './generators/audit-report.js';
export { buildUsageQuery, buildActiveUsersQuery, buildApiCallsQuery } from './queries/usage-queries.js';
export { buildRevenueQuery, buildChurnQuery, buildSubscriptionBreakdownQuery } from './queries/billing-queries.js';
export { CsvExporter } from './exporters/csv.js';
export { PdfExporter } from './exporters/pdf.js';
