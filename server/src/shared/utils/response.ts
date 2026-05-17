import type { Response } from 'express';
import type { ApiResponse, PaginationMeta } from '../types/api-response';
import { HttpStatus } from '../errors/app-error';

export function sendSuccess<T>(
  res: Response,
  statusCode: HttpStatus,
  message: string,
  data: T,
  meta?: Record<string, unknown>,
): void {
  const response: ApiResponse<T> = { success: true, message, data };
  if (meta) response.meta = meta;
  res.status(statusCode).json(response);
}

export function sendPaginated<T>(
  res: Response,
  message: string,
  data: T,
  pagination: PaginationMeta,
): void {
  sendSuccess(res, HttpStatus.OK, message, data, { pagination });
}
