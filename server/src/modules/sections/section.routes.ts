import { Router } from 'express';
import { Role } from '@prisma/client';
import * as sectionController from './section.controller';
import { authenticate } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { validate } from '../../shared/middleware/validate';
import { asyncHandler } from '../../shared/utils/async-handler';
import {
  createSectionSchema,
  updateSectionSchema,
  sectionParamsSchema,
  sectionIdParamsSchema,
  reorderSectionsSchema,
} from './section.validators';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post(
  '/',
  authorize(Role.ADMIN),
  validate(sectionParamsSchema, 'params'),
  validate(createSectionSchema),
  asyncHandler(sectionController.createSection),
);

router.get(
  '/',
  validate(sectionParamsSchema, 'params'),
  asyncHandler(sectionController.listSections),
);

router.patch(
  '/reorder',
  authorize(Role.ADMIN),
  validate(sectionParamsSchema, 'params'),
  validate(reorderSectionsSchema),
  asyncHandler(sectionController.reorderSections),
);

router.patch(
  '/:id',
  authorize(Role.ADMIN),
  validate(sectionIdParamsSchema, 'params'),
  validate(updateSectionSchema),
  asyncHandler(sectionController.updateSection),
);

router.delete(
  '/:id',
  authorize(Role.ADMIN),
  validate(sectionIdParamsSchema, 'params'),
  asyncHandler(sectionController.deleteSection),
);

export { router as sectionRoutes };
