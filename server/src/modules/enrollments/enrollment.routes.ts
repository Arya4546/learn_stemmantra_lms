import { Router } from 'express';
import { Role } from '@prisma/client';
import * as enrollmentController from './enrollment.controller';
import { authenticate } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { validate } from '../../shared/middleware/validate';
import { asyncHandler } from '../../shared/utils/async-handler';
import {
  createEnrollmentSchema,
  enrollmentCourseParamSchema,
  enrollmentUserParamSchema,
} from './enrollment.validators';

const router = Router();

router.use(authenticate);

router.post('/', authorize(Role.ADMIN), validate(createEnrollmentSchema), asyncHandler(enrollmentController.enroll));
router.delete('/', authorize(Role.ADMIN), validate(createEnrollmentSchema), asyncHandler(enrollmentController.unenroll));
router.get(
  '/course/:courseId',
  authorize(Role.ADMIN),
  validate(enrollmentCourseParamSchema, 'params'),
  asyncHandler(enrollmentController.listByCourse),
);
router.get(
  '/user/:userId',
  // Students can see their own enrollments, Admins can see any
  (req, res, next) => {
    if (req.user?.role === Role.ADMIN || req.user?.userId === req.params.userId) {
      return next();
    }
    res.status(403).json({ success: false, message: 'Unauthorized' });
  },
  validate(enrollmentUserParamSchema, 'params'),
  asyncHandler(enrollmentController.listByUser),
);

export { router as enrollmentRoutes };
