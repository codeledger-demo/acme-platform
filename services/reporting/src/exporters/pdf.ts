/**
 * PDF exporter — builds a structured PDF document model.
 * Does not produce actual binary PDF — returns a data structure
 * representing sections, tables, and chart placeholders.
 */

export interface PdfTable {
  headers: string[];
  rows: string[][];
}

export interface PdfChart {
  type: 'bar' | 'line' | 'pie';
  title: string;
  dataPoints: { label: string; value: number }[];
}

export interface PdfSection {
  title: string;
  body?: string;
  table?: PdfTable;
  chart?: PdfChart;
}

export interface PdfDocument {
  title: string;
  author: string;
  createdAt: string;
  pageSize: 'A4' | 'letter';
  sections: PdfSection[];
  footerText: string;
}

export interface PdfExportOptions {
  author?: string;
  pageSize?: 'A4' | 'letter';
  footerText?: string;
}

export class PdfExporter {
  private readonly author: string;
  private readonly pageSize: 'A4' | 'letter';
  private readonly footerText: string;

  constructor(options: PdfExportOptions = {}) {
    this.author = options.author ?? 'Acme Reporting Service';
    this.pageSize = options.pageSize ?? 'A4';
    this.footerText = options.footerText ?? 'Confidential';
  }

  /**
   * Export a report to a structured PDF document model.
   */
  export(
    report: { title: string; sections: PdfSection[] },
  ): PdfDocument {
    const document: PdfDocument = {
      title: report.title,
      author: this.author,
      createdAt: new Date().toISOString(),
      pageSize: this.pageSize,
      sections: report.sections.map((section) => this.normalizeSection(section)),
      footerText: this.footerText,
    };

    return document;
  }

  private normalizeSection(section: PdfSection): PdfSection {
    const normalized: PdfSection = { title: section.title };

    if (section.body) {
      normalized.body = section.body;
    }

    if (section.table) {
      normalized.table = {
        headers: section.table.headers,
        rows: section.table.rows.map((row) =>
          row.map((cell) => (cell === undefined || cell === null ? '' : String(cell))),
        ),
      };
    }

    if (section.chart) {
      normalized.chart = {
        type: section.chart.type,
        title: section.chart.title,
        dataPoints: section.chart.dataPoints.filter(
          (dp) => typeof dp.value === 'number' && Number.isFinite(dp.value),
        ),
      };
    }

    return normalized;
  }
}
