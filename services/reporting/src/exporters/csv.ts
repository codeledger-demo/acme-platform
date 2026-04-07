/**
 * CSV exporter — converts structured data to CSV strings.
 * Handles escaping, headers, and multiple data types.
 */

export interface CsvColumn {
  key: string;
  header: string;
}

export interface CsvExportOptions {
  delimiter?: string;
  includeHeaders?: boolean;
  lineEnding?: '\n' | '\r\n';
}

export class CsvExporter {
  private readonly delimiter: string;
  private readonly includeHeaders: boolean;
  private readonly lineEnding: string;

  constructor(options: CsvExportOptions = {}) {
    this.delimiter = options.delimiter ?? ',';
    this.includeHeaders = options.includeHeaders ?? true;
    this.lineEnding = options.lineEnding ?? '\n';
  }

  /**
   * Export an array of records to a CSV string.
   */
  export(data: Record<string, unknown>[], columns: CsvColumn[]): string {
    const lines: string[] = [];

    if (this.includeHeaders) {
      const headerLine = columns
        .map((col) => this.escapeField(col.header))
        .join(this.delimiter);
      lines.push(headerLine);
    }

    for (const row of data) {
      const values = columns.map((col) => {
        const raw = row[col.key];
        return this.escapeField(this.formatValue(raw));
      });
      lines.push(values.join(this.delimiter));
    }

    return lines.join(this.lineEnding) + this.lineEnding;
  }

  private formatValue(value: unknown): string {
    if (value === null || value === undefined) {
      return '';
    }
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  }

  private escapeField(field: string): string {
    const needsQuoting =
      field.includes(this.delimiter) ||
      field.includes('"') ||
      field.includes('\n') ||
      field.includes('\r');

    if (!needsQuoting) {
      return field;
    }

    const escaped = field.replace(/"/g, '""');
    return `"${escaped}"`;
  }
}
