import fs from 'fs';
import path from 'path';
import type { Request, Response } from 'express';
import { AppError } from '../../shared/errors/app-error';
import { logger } from '../../config/logger';
import { env } from '../../config/env';

const ALLOWED_ORIGINS = env.CORS_ORIGIN.split(',').map((o) => o.trim());

export function validateReferer(req: Request): void {
  const referer = req.get('referer');
  const origin = req.get('origin');

  const source = referer || origin;
  if (!source) {
    throw AppError.forbidden('Direct access is not allowed');
  }

  const isAllowed = ALLOWED_ORIGINS.some(
    (allowed) => source.startsWith(allowed),
  );

  if (!isAllowed) {
    logger.warn('Hotlink attempt blocked', {
      referer,
      origin,
      ip: req.ip,
    });
    throw AppError.forbidden('Hotlinking is not allowed');
  }
}

export function setSecurityHeaders(res: Response, mimeType: string): void {
  res.setHeader('Content-Disposition', 'inline');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  // Allow designated front-end origins to frame the content
  const allowedOriginsString = ALLOWED_ORIGINS.join(' ');

  // Modern browsers respect frame-ancestors inside Content-Security-Policy.
  // We allow 'self' and our defined CORS origins to load this content in a frame.
  // We also relax default-src slightly so Chrome's/Firefox's built-in PDF viewers can load internal styles/scripts.
  res.setHeader(
    'Content-Security-Policy',
    `frame-ancestors 'self' ${allowedOriginsString}; default-src 'self' blob: data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; object-src 'self' blob:;`
  );

  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('Content-Type', mimeType);
}

export function streamVideo(req: Request, res: Response, filePath: string, mimeType: string): void {
  const absolutePath = path.resolve(filePath);
  const stat = fs.statSync(absolutePath);
  const fileSize = stat.size;
  const range = req.headers.range;

  setSecurityHeaders(res, mimeType);

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize || end >= fileSize || start > end) {
      res.status(416).setHeader('Content-Range', `bytes */${fileSize}`);
      res.end();
      return;
    }

    const chunkSize = end - start + 1;
    const fileStream = fs.createReadStream(absolutePath, { start, end });

    res.status(206);
    res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Length', chunkSize);

    fileStream.pipe(res);
  } else {
    res.setHeader('Content-Length', fileSize);
    res.setHeader('Accept-Ranges', 'bytes');
    fs.createReadStream(absolutePath).pipe(res);
  }
}

export function serveInline(res: Response, filePath: string, mimeType: string): void {
  const absolutePath = path.resolve(filePath);
  const stat = fs.statSync(absolutePath);

  setSecurityHeaders(res, mimeType);
  res.setHeader('Content-Length', stat.size);

  fs.createReadStream(absolutePath).pipe(res);
}
