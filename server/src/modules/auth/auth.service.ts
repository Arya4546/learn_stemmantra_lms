import { prisma } from '../../database/prisma';
import { AppError } from '../../shared/errors/app-error';
import { comparePassword } from '../../shared/utils/hash';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  parseRefreshExpiry,
} from '../../shared/utils/token';
import type { LoginInput } from './auth.validators';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export async function loginUser(credentials: LoginInput): Promise<AuthTokens> {
  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
  });

  if (!user || !user.isActive) {
    throw AppError.unauthorized('Invalid email or password');
  }

  const passwordValid = await comparePassword(credentials.password, user.passwordHash);
  if (!passwordValid) {
    throw AppError.unauthorized('Invalid email or password');
  }

  return issueTokenPair(user.id, user.role);
}

export async function refreshTokens(rawRefreshToken: string): Promise<AuthTokens> {
  const payload = verifyRefreshToken(rawRefreshToken);

  const storedToken = await prisma.refreshToken.findUnique({
    where: { id: payload.tokenId },
  });

  if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
    throw AppError.unauthorized('Invalid or expired refresh token');
  }

  if (storedToken.userId !== payload.userId) {
    throw AppError.unauthorized('Token mismatch');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user || !user.isActive) {
    throw AppError.unauthorized('Account is inactive');
  }

  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revoked: true },
  });

  return issueTokenPair(user.id, user.role);
}

export async function revokeRefreshToken(rawRefreshToken: string): Promise<void> {
  const payload = verifyRefreshToken(rawRefreshToken);

  await prisma.refreshToken.updateMany({
    where: { id: payload.tokenId, revoked: false },
    data: { revoked: true },
  });
}

async function issueTokenPair(userId: string, role: string): Promise<AuthTokens> {
  const refreshRecord = await prisma.refreshToken.create({
    data: {
      token: require('crypto').randomBytes(48).toString('hex'),
      userId,
      expiresAt: parseRefreshExpiry(),
    },
  });

  const accessToken = signAccessToken({ userId, role: role as import('@prisma/client').Role });
  const refreshToken = signRefreshToken(userId, refreshRecord.id);

  return { accessToken, refreshToken };
}
