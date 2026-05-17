import type { Request, Response } from 'express';
import { HttpStatus } from '../errors/app-error';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(HttpStatus.NOT_FOUND).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
    data: null,
  });
}
