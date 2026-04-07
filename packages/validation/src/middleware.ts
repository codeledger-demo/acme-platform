/**
 * Generic validation middleware — wraps any validator function into a
 * request-handler-style middleware that throws ValidationError on failure.
 */

import { ValidationError } from '@acme/shared-utils';
import type { ValidationResult } from './schemas/user.js';

export interface RequestLike {
  body: unknown;
}

export interface ResponseLike {
  status(code: number): ResponseLike;
  json(data: unknown): void;
}

export type NextFunction = (err?: unknown) => void;

type ValidatorFn = (input: unknown) => ValidationResult;

/**
 * Creates an Express-style middleware that validates `req.body` using the
 * supplied validator. On failure it throws a `ValidationError` from
 * `@acme/shared-utils` so upstream error handlers can respond uniformly.
 *
 * @param validator - A function that returns `{ valid, errors }`.
 * @returns Middleware function compatible with Express-style routers.
 */
export function createValidationMiddleware(
  validator: ValidatorFn,
): (req: RequestLike, _res: ResponseLike, next: NextFunction) => void {
  return function validationMiddleware(
    req: RequestLike,
    _res: ResponseLike,
    next: NextFunction,
  ): void {
    const result = validator(req.body);

    if (!result.valid) {
      const err = new ValidationError(
        `Validation failed: ${result.errors.join('; ')}`,
        { fieldErrors: result.errors },
      );
      next(err);
      return;
    }

    next();
  };
}
