import jwt from 'jsonwebtoken';
import type { Role } from '@prisma/client';
import { env } from '../../config/env';
import { AppError } from '../errors/app-error';

function parseDurationToSeconds(duration: string): number {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Invalid duration format: ${duration}`);
  const value = parseInt(match[1], 10);
  const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return value * multipliers[match[2]];
}

export interface AccessTokenPayload {
  userId: string;
  role: Role;
}

interface RefreshTokenPayload {
  userId: string;
  tokenId: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(
    { userId: payload.userId, role: payload.role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: parseDurationToSeconds(env.JWT_ACCESS_EXPIRY) },
  );
}

export function signRefreshToken(userId: string, tokenId: string): string {
  return jwt.sign(
    { userId, tokenId },
    env.JWT_REFRESH_SECRET,
    { expiresIn: parseDurationToSeconds(env.JWT_REFRESH_EXPIRY) },
  );
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
    return { userId: decoded.userId, role: decoded.role };
  } catch {
    throw AppError.unauthorized('Invalid or expired access token');
  }
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
    return { userId: decoded.userId, tokenId: decoded.tokenId };
  } catch {
    throw AppError.unauthorized('Invalid or expired refresh token');
  }
}

export function parseRefreshExpiry(): Date {
  const seconds = parseDurationToSeconds(env.JWT_REFRESH_EXPIRY);
  return new Date(Date.now() + seconds * 1000);
}
