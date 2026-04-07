/**
 * Base application error with structured metadata.
 * All domain-specific errors extend this class.
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details: Record<string, unknown>;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    options: {
      code?: string;
      statusCode?: number;
      details?: Record<string, unknown>;
      isOperational?: boolean;
      cause?: unknown;
    } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = this.constructor.name;
    this.code = options.code ?? 'INTERNAL_ERROR';
    this.statusCode = options.statusCode ?? 500;
    this.details = options.details ?? {};
    this.isOperational = options.isOperational ?? true;

    // Preserve proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }

  /**
   * Serialize the error to a plain object suitable for JSON responses.
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    details: Record<string, unknown> = {},
    cause?: unknown,
  ) {
    super(message, {
      code: 'VALIDATION_ERROR',
      statusCode: 400,
      details,
      cause,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(
    resource: string,
    identifier?: string,
    cause?: unknown,
  ) {
    const message = identifier
      ? `${resource} not found: ${identifier}`
      : `${resource} not found`;
    super(message, {
      code: 'NOT_FOUND',
      statusCode: 404,
      details: { resource, identifier },
      cause,
    });
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', cause?: unknown) {
    super(message, {
      code: 'AUTHENTICATION_ERROR',
      statusCode: 401,
      cause,
    });
  }
}

export class AuthorizationError extends AppError {
  constructor(
    message: string = 'Insufficient permissions',
    details: Record<string, unknown> = {},
    cause?: unknown,
  ) {
    super(message, {
      code: 'AUTHORIZATION_ERROR',
      statusCode: 403,
      details,
      cause,
    });
  }
}

export class ConflictError extends AppError {
  constructor(
    message: string,
    details: Record<string, unknown> = {},
    cause?: unknown,
  ) {
    super(message, {
      code: 'CONFLICT',
      statusCode: 409,
      details,
      cause,
    });
  }
}

export class RateLimitError extends AppError {
  public readonly retryAfterMs: number;

  constructor(
    retryAfterMs: number = 60_000,
    message: string = 'Rate limit exceeded',
    cause?: unknown,
  ) {
    super(message, {
      code: 'RATE_LIMIT_EXCEEDED',
      statusCode: 429,
      details: { retryAfterMs },
      cause,
    });
    this.retryAfterMs = retryAfterMs;
  }
}
