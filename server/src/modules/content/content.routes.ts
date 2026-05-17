import { Router } from 'express';
import { Role } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as contentController from './content.controller';
import { authenticate } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { validate } from '../../shared/middleware/validate';
import { asyncHandler } from '../../shared/utils/async-handler';
import {
  uploadContentParamsSchema,
  contentIdParamSchema,
  contentTokenParamSchema,
} from './content.validators';
import { uploadLimiter, contentServeLimiter } from '../../config/rate-limit';
import { env } from '../../config/env';
import { ensureDirectory } from '../../shared/utils/file-cleanup';

const tempDir = path.join(env.UPLOAD_DIR, 'temp');
ensureDirectory(tempDir).catch(() => { /* created on first upload */ });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureDirectory(tempDir)
      .then(() => cb(null, tempDir))
      .catch((err: Error) => cb(err, tempDir));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const ALLOWED_MIMES = [
  'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime',
  'application/pdf',
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
];

const upload = multer({
  storage,
  limits: { fileSize: env.MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type '${file.mimetype}' is not allowed`));
    }
  },
});

const router = Router();

// Admin: Upload content to a section
router.post(
  '/sections/:sectionId/content',
  authenticate,
  authorize(Role.ADMIN),
  uploadLimiter,
  validate(uploadContentParamsSchema, 'params'),
  upload.single('file'),
  asyncHandler(contentController.uploadContent),
);

// Authenticated: List content items for a section
router.get(
  '/sections/:sectionId/content',
  authenticate,
  validate(uploadContentParamsSchema, 'params'),
  asyncHandler(contentController.listContent),
);

// Admin: Delete content item
router.delete(
  '/content/:id',
  authenticate,
  authorize(Role.ADMIN),
  validate(contentIdParamSchema, 'params'),
  asyncHandler(contentController.deleteContent),
);

// Authenticated (enrolled): Generate one-time content access token
router.post(
  '/content/:id/access-token',
  authenticate,
  validate(contentIdParamSchema, 'params'),
  asyncHandler(contentController.generateAccessToken),
);

// Token-validated: Serve content (no JWT auth — token is the auth)
router.get(
  '/content/serve/:token',
  contentServeLimiter,
  validate(contentTokenParamSchema, 'params'),
  asyncHandler(contentController.serveContent),
);

export { router as contentRoutes };
