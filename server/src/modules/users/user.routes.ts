import { Router } from 'express';
import { Role } from '@prisma/client';
import * as userController from './user.controller';
import { authenticate } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { validate } from '../../shared/middleware/validate';
import { asyncHandler } from '../../shared/utils/async-handler';
import {
  createUserSchema,
  updateUserSchema,
  userIdParamSchema,
  paginationQuerySchema,
  updateMeSchema,
} from './user.validators';

const router = Router();

// Non-admin route for profile / password updates
router.patch('/me', authenticate, validate(updateMeSchema), asyncHandler(userController.updateMe));

// Admin-only middleware and routes
router.use(authenticate, authorize(Role.ADMIN));

router.post('/', validate(createUserSchema), asyncHandler(userController.createStudent));
router.get('/', validate(paginationQuerySchema, 'query'), asyncHandler(userController.listStudents));
router.get('/:id', validate(userIdParamSchema, 'params'), asyncHandler(userController.getStudent));
router.patch(
  '/:id',
  validate(userIdParamSchema, 'params'),
  validate(updateUserSchema),
  asyncHandler(userController.updateStudent),
);
router.delete('/:id', validate(userIdParamSchema, 'params'), asyncHandler(userController.deleteStudent));

export { router as userRoutes };
