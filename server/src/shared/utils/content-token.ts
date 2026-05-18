import crypto from 'crypto';
import { prisma } from '../../database/prisma';
import { env } from '../../config/env';
import { AppError } from '../errors/app-error';
import { logger } from '../../config/logger';

interface ContentTokenData {
  contentItemId: string;
  userId: string;
  filePath: string | null;
  mimeType: string | null;
}

export async function generateContentAccessToken(
  contentItemId: string,
  userId: string,
): Promise<string> {
  const token = crypto.randomBytes(48).toString('hex');
  const expiresAt = new Date(Date.now() + env.CONTENT_TOKEN_EXPIRY_SECONDS * 1000);

  await prisma.contentAccessToken.create({
    data: {
      token,
      contentItemId,
      userId,
      expiresAt,
    },
  });

  return token;
}

export async function validateAndConsumeContentToken(token: string): Promise<ContentTokenData> {
  const accessToken = await prisma.contentAccessToken.findUnique({
    where: { token },
    include: {
      contentItem: { select: { id: true, filePath: true, mimeType: true } },
    },
  });

  if (!accessToken) {
    throw AppError.unauthorized('Invalid content access token');
  }

  if (accessToken.used) {
    logger.warn('Attempted reuse of content access token', {
      tokenId: accessToken.id,
      userId: accessToken.userId,
      contentItemId: accessToken.contentItemId,
    });
    throw AppError.unauthorized('Content access token has already been used');
  }

  if (accessToken.expiresAt < new Date()) {
    throw AppError.unauthorized('Content access token has expired');
  }

  await prisma.contentAccessToken.update({
    where: { id: accessToken.id },
    data: { used: true },
  });

  return {
    contentItemId: accessToken.contentItem.id,
    userId: accessToken.userId,
    filePath: accessToken.contentItem.filePath,
    mimeType: accessToken.contentItem.mimeType,
  };
}

export async function cleanupExpiredTokens(): Promise<number> {
  const { count } = await prisma.contentAccessToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { used: true, createdAt: { lt: new Date(Date.now() - 60 * 60 * 1000) } },
      ],
    },
  });
  return count;
}
