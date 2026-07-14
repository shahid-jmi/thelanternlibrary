import type { RequestHandler } from 'express';
import type { ZodError, ZodType } from 'zod';
import ValidationError from '../errors/ValidationError.js';
import type { ErrorDetail } from '../errors/AppError.js';

export interface ValidationSchemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

const LOCATIONS = ['params', 'query', 'body'] as const;

const formatIssues = (error: ZodError, location: string): ErrorDetail[] =>
  error.issues.map((issue) => ({
    path: issue.path.length > 0 ? issue.path.join('.') : location,
    msg: issue.message,
  }));

const validate =
  (schemas: ValidationSchemas): RequestHandler =>
  (req, _res, next) => {
    const details: ErrorDetail[] = [];

    for (const location of LOCATIONS) {
      const schema = schemas[location];

      if (!schema) {
        continue;
      }

      const result = schema.safeParse(req[location]);

      if (!result.success) {
        details.push(...formatIssues(result.error, location));
        continue;
      }

      Object.defineProperty(req, location, { value: result.data, writable: true });
    }

    if (details.length > 0) {
      next(new ValidationError('Validation failed', details));
      return;
    }

    next();
  };

export default validate;
