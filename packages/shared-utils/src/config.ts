/**
 * Typed configuration loader backed by environment variables.
 * Supports string, number, and boolean coercion with required/optional semantics.
 */
export class Config {
  private readonly prefix: string;
  private readonly env: Record<string, string | undefined>;

  constructor(options: { prefix?: string; env?: Record<string, string | undefined> } = {}) {
    this.prefix = options.prefix ?? '';
    this.env = options.env ?? process.env;
  }

  private resolve(key: string): string {
    return this.prefix ? `${this.prefix}_${key}` : key;
  }

  /**
   * Get a string value from the environment. Returns the default if not set.
   */
  getString(key: string, defaultValue: string): string {
    const resolved = this.resolve(key);
    return this.env[resolved] ?? defaultValue;
  }

  /**
   * Get a numeric value from the environment. Returns the default if not set
   * or if the value cannot be parsed as a finite number.
   */
  getNumber(key: string, defaultValue: number): number {
    const resolved = this.resolve(key);
    const raw = this.env[resolved];
    if (raw === undefined) return defaultValue;

    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : defaultValue;
  }

  /**
   * Get a boolean value from the environment.
   * Truthy values: "true", "1", "yes" (case-insensitive).
   * Everything else (including unset) returns the default.
   */
  getBoolean(key: string, defaultValue: boolean): boolean {
    const resolved = this.resolve(key);
    const raw = this.env[resolved];
    if (raw === undefined) return defaultValue;

    const normalized = raw.trim().toLowerCase();
    if (['true', '1', 'yes'].includes(normalized)) return true;
    if (['false', '0', 'no'].includes(normalized)) return false;
    return defaultValue;
  }

  /**
   * Get a required string value. Throws if the variable is not set.
   */
  getRequired(key: string): string {
    const resolved = this.resolve(key);
    const value = this.env[resolved];
    if (value === undefined || value === '') {
      throw new Error(`Missing required environment variable: ${resolved}`);
    }
    return value;
  }
}
