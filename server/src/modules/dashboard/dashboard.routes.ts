import { Router } from 'express';
import { Role } from '@prisma/client';
import * as dashboardController from './dashboard.controller';
import { authenticate } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { asyncHandler } from '../../shared/utils/async-handler';

const router = Router();

router.use(authenticate);

router.get(
  '/admin',
  authorize(Role.ADMIN),
  asyncHandler(dashboardController.getAdminDashboard)
);

router.get(
  '/student',
  authorize(Role.STUDENT),
  asyncHandler(dashboardController.getStudentDashboard)
);

export { router as dashboardRoutes };
