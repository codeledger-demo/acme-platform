export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogContext = Record<string, unknown>;

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context: LogContext;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

export class Logger {
  private readonly context: LogContext;
  private readonly minLevel: LogLevel;

  constructor(
    context: LogContext = {},
    minLevel: LogLevel = 'info',
  ) {
    this.context = context;
    this.minLevel = minLevel;
  }

  /**
   * Create a child logger that inherits the parent's context
   * and merges additional fields.
   */
  child(additionalContext: LogContext): Logger {
    return new Logger(
      { ...this.context, ...additionalContext },
      this.minLevel,
    );
  }

  debug(message: string, extra?: LogContext): void {
    this.log('debug', message, extra);
  }

  info(message: string, extra?: LogContext): void {
    this.log('info', message, extra);
  }

  warn(message: string, extra?: LogContext): void {
    this.log('warn', message, extra);
  }

  error(message: string, extra?: LogContext): void {
    this.log('error', message, extra);
  }

  private log(level: LogLevel, message: string, extra?: LogContext): void {
    if (LOG_LEVEL_PRIORITY[level] < LOG_LEVEL_PRIORITY[this.minLevel]) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: extra ? { ...this.context, ...extra } : { ...this.context },
    };

    const serialized = JSON.stringify(entry);

    switch (level) {
      case 'debug':
        console.debug(serialized);
        break;
      case 'info':
        console.info(serialized);
        break;
      case 'warn':
        console.warn(serialized);
        break;
      case 'error':
        console.error(serialized);
        break;
    }
  }
}
