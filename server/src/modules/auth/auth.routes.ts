import { Router } from 'express';
import { login, refresh, logout } from './auth.controller';
import { validate } from '../../shared/middleware/validate';
import { authenticate } from '../../shared/middleware/authenticate';
import { asyncHandler } from '../../shared/utils/async-handler';
import { loginSchema, refreshSchema } from './auth.validators';
import { authLimiter } from '../../config/rate-limit';

const router = Router();

router.post('/login', authLimiter, validate(loginSchema), asyncHandler(login));
router.post('/refresh', authLimiter, validate(refreshSchema), asyncHandler(refresh));
router.post('/logout', authenticate, validate(refreshSchema), asyncHandler(logout));

export { router as authRoutes };
