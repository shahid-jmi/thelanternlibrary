import type { NextFunction, Request, Response } from 'express';
import ValidationError from '../errors/ValidationError.js';

const parseJsonFormFields =
  (fields: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const body = req.body as Record<string, unknown> | undefined;

    for (const field of fields) {
      const value = body?.[field];

      if (typeof value !== 'string') {
        continue;
      }

      try {
        body![field] = JSON.parse(value);
      } catch {
        next(
          new ValidationError('Validation failed', [
            { path: field, msg: `${field} must be valid JSON` },
          ])
        );
        return;
      }
    }

    next();
  };

export default parseJsonFormFields;
