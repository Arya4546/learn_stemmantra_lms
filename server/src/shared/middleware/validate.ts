import type { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { HttpStatus } from '../errors/app-error';

type ValidationTarget = 'body' | 'params' | 'query';

export function validate(schema: ZodSchema, target: ValidationTarget = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const source = target === 'query' ? { ...req[target] } : req[target];
    const parsed = schema.safeParse(source);

    if (!parsed.success) {
      const errors = formatZodErrors(parsed.error);
      res.status(HttpStatus.UNPROCESSABLE_ENTITY).json({
        success: false,
        message: 'Validation failed',
        data: null,
        meta: { errors },
      });
      return;
    }

    if (target === 'body') {
      req.body = parsed.data;
    } else if (target === 'query') {
      res.locals.validatedQuery = parsed.data;
    } else if (target === 'params') {
      res.locals.validatedParams = parsed.data;
    }

    next();
  };
}

function formatZodErrors(error: ZodError): Record<string, string> {
  const formatted: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    formatted[path] = issue.message;
  }
  return formatted;
}
