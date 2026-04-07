/**
 * Audit report generator — security events, user activity, compliance status.
 */
import { Logger, formatISO } from '@acme/shared-utils';

export interface AuditReportParams {
  startDate: Date;
  endDate: Date;
  tenantId?: string;
  includeSecurityEvents?: boolean;
}

export type ComplianceStatus = 'compliant' | 'non_compliant' | 'pending_review';

export interface AuditEvent {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  outcome: 'success' | 'failure';
  metadata: Record<string, unknown>;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: string;
  description: string;
  sourceIp: string;
}

export interface AuditReport {
  generatedAt: string;
  startDate: string;
  endDate: string;
  tenantId: string | undefined;
  totalEvents: number;
  events: AuditEvent[];
  securityEvents: SecurityEvent[];
  complianceStatus: ComplianceStatus;
  userActivitySummary: { userId: string; actionCount: number }[];
}

const logger = new Logger({ component: 'AuditReportGenerator' });

export class AuditReportGenerator {
  /**
   * Generate an audit report covering events, security, and compliance.
   */
  async generate(params: AuditReportParams): Promise<AuditReport> {
    const { startDate, endDate, tenantId, includeSecurityEvents = true } = params;

    logger.info('Generating audit report', {
      startDate: formatISO(startDate),
      endDate: formatISO(endDate),
      tenantId,
      includeSecurityEvents,
    });

    const events = await this.fetchAuditEvents(startDate, endDate, tenantId);
    const securityEvents = includeSecurityEvents
      ? await this.fetchSecurityEvents(startDate, endDate, tenantId)
      : [];

    const complianceStatus = this.evaluateCompliance(events, securityEvents);
    const userActivitySummary = this.summarizeUserActivity(events);

    const report: AuditReport = {
      generatedAt: formatISO(new Date()),
      startDate: formatISO(startDate),
      endDate: formatISO(endDate),
      tenantId,
      totalEvents: events.length,
      events,
      securityEvents,
      complianceStatus,
      userActivitySummary,
    };

    logger.info('Audit report generated', {
      totalEvents: report.totalEvents,
      securityEventCount: securityEvents.length,
      complianceStatus,
    });

    return report;
  }

  private async fetchAuditEvents(
    _start: Date,
    _end: Date,
    _tenantId: string | undefined,
  ): Promise<AuditEvent[]> {
    return [];
  }

  private async fetchSecurityEvents(
    _start: Date,
    _end: Date,
    _tenantId: string | undefined,
  ): Promise<SecurityEvent[]> {
    return [];
  }

  private evaluateCompliance(
    events: AuditEvent[],
    securityEvents: SecurityEvent[],
  ): ComplianceStatus {
    const hasCritical = securityEvents.some((e) => e.severity === 'critical');
    const hasFailures = events.some((e) => e.outcome === 'failure');
    if (hasCritical) return 'non_compliant';
    if (hasFailures) return 'pending_review';
    return 'compliant';
  }

  private summarizeUserActivity(
    events: AuditEvent[],
  ): { userId: string; actionCount: number }[] {
    const counts = new Map<string, number>();
    for (const event of events) {
      counts.set(event.actor, (counts.get(event.actor) ?? 0) + 1);
    }
    return [...counts.entries()]
      .map(([userId, actionCount]) => ({ userId, actionCount }))
      .sort((a, b) => b.actionCount - a.actionCount);
  }
}
