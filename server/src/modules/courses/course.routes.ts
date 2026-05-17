import { Router } from 'express';
import { Role } from '@prisma/client';
import * as courseController from './course.controller';
import { authenticate } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { validate } from '../../shared/middleware/validate';
import { asyncHandler } from '../../shared/utils/async-handler';
import { createCourseSchema, updateCourseSchema, courseIdParamSchema } from './course.validators';
import { paginationQuerySchema } from '../users/user.validators';

const router = Router();

router.use(authenticate);

router.post('/', authorize(Role.ADMIN), validate(createCourseSchema), asyncHandler(courseController.createCourse));
router.get('/', validate(paginationQuerySchema, 'query'), asyncHandler(courseController.listCourses));
router.get('/:id', validate(courseIdParamSchema, 'params'), asyncHandler(courseController.getCourse));
router.patch(
  '/:id',
  authorize(Role.ADMIN),
  validate(courseIdParamSchema, 'params'),
  validate(updateCourseSchema),
  asyncHandler(courseController.updateCourse),
);
router.delete(
  '/:id',
  authorize(Role.ADMIN),
  validate(courseIdParamSchema, 'params'),
  asyncHandler(courseController.deleteCourse),
);

export { router as courseRoutes };
