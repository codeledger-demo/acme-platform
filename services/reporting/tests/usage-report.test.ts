import { describe, it, expect } from 'vitest';
import { UsageReportGenerator, type UsageReportParams } from '../src/generators/usage-report.js';

describe('UsageReportGenerator', () => {
  const generator = new UsageReportGenerator();

  const baseParams: UsageReportParams = {
    startDate: new Date('2024-01-01T00:00:00Z'),
    endDate: new Date('2024-01-31T23:59:59Z'),
    granularity: 'daily',
  };

  it('generates a report with correct date range', async () => {
    const report = await generator.generate(baseParams);

    expect(report.startDate).toBe('2024-01-01T00:00:00.000Z');
    expect(report.endDate).toBe('2024-01-31T23:59:59.000Z');
    expect(report.granularity).toBe('daily');
    expect(report.generatedAt).toBeTruthy();
  });

  it('includes usage metrics', async () => {
    const report = await generator.generate(baseParams);

    expect(report.metrics).toHaveProperty('activeUsers');
    expect(report.metrics).toHaveProperty('apiCalls');
    expect(report.metrics).toHaveProperty('storageBytes');
    expect(report.metrics).toHaveProperty('bandwidthBytes');
  });

  it('builds trend data points matching granularity', async () => {
    const weeklyParams: UsageReportParams = { ...baseParams, granularity: 'weekly' };
    const report = await generator.generate(weeklyParams);

    expect(report.trend.length).toBeGreaterThan(0);
    expect(report.trend.length).toBeLessThanOrEqual(6); // ~4.4 weeks in Jan
    for (const point of report.trend) {
      expect(point).toHaveProperty('date');
      expect(point).toHaveProperty('activeUsers');
      expect(point).toHaveProperty('apiCalls');
    }
  });

  it('passes tenantId through to the report', async () => {
    const report = await generator.generate({ ...baseParams, tenantId: 'tenant-42' });
    expect(report.tenantId).toBe('tenant-42');
  });

  it('returns undefined tenantId when not specified', async () => {
    const report = await generator.generate(baseParams);
    expect(report.tenantId).toBeUndefined();
  });
});
