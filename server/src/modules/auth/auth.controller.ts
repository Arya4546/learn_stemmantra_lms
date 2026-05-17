import type { Request, Response } from 'express';
import { loginUser, refreshTokens, revokeRefreshToken } from './auth.service';
import { sendSuccess } from '../../shared/utils/response';
import { HttpStatus } from '../../shared/errors/app-error';
import type { LoginInput, RefreshInput } from './auth.validators';

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as LoginInput;
  const tokens = await loginUser({ email, password });

  sendSuccess(res, HttpStatus.OK, 'Login successful', {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body as RefreshInput;
  const tokens = await refreshTokens(refreshToken);

  sendSuccess(res, HttpStatus.OK, 'Tokens refreshed', {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body as RefreshInput;
  await revokeRefreshToken(refreshToken);

  sendSuccess(res, HttpStatus.OK, 'Logged out successfully', null);
}
