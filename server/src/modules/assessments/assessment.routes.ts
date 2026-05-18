import { Router } from 'express';
import { Role } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as assessmentController from './assessment.controller';
import { authenticate } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { asyncHandler } from '../../shared/utils/async-handler';
import { env } from '../../config/env';
import { ensureDirectory } from '../../shared/utils/file-cleanup';
import { prisma } from '../../database/prisma';
import { AppError } from '../../shared/errors/app-error';

const worksheetsDir = path.join(env.UPLOAD_DIR, 'worksheets');
ensureDirectory(worksheetsDir).catch(() => { /* created on first upload */ });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    ensureDirectory(worksheetsDir)
      .then(() => cb(null, worksheetsDir))
      .catch((err: Error) => cb(err, worksheetsDir));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: env.MAX_FILE_SIZE },
});

const router = Router();

// Securely serve student worksheets (Only student themselves or admin)
router.get(
  '/submissions/serve/:fileName',
  authenticate,
  asyncHandler(async (req, res) => {
    const fileName = String(req.params.fileName);
    
    // Check if the answer exists with this fileName in fileUrl
    const answer = await prisma.assessmentAnswer.findFirst({
      where: {
        fileUrl: { contains: fileName },
      },
      include: {
        attempt: true,
      },
    });

    if (!answer) {
      throw AppError.notFound('Submitted worksheet file not found');
    }

    // Verify permission: Must be Admin OR the Student who owns the attempt
    if (req.user!.role !== Role.ADMIN && answer.attempt.userId !== req.user!.userId) {
      throw AppError.forbidden('Access denied to this submitted worksheet');
    }

    const filePath = path.join(worksheetsDir, fileName);
    res.sendFile(filePath);
  })
);

router.use(authenticate);

// Student & Admin: Fetch assessment configuration & questions
router.get('/:contentItemId', asyncHandler(assessmentController.getAssessment));

// Student & Admin: List user attempts (Student gets own; Admin gets all for grading)
router.get('/:contentItemId/attempts', asyncHandler(assessmentController.getAssessmentAttempts));

// Student & Admin: Fetch specific attempt details
router.get('/attempts/:attemptId', asyncHandler(assessmentController.getAssessmentAttemptById));

// Student: Start assessment session / resume in-progress exam
router.post('/:contentItemId/start', asyncHandler(assessmentController.startAssessmentAttempt));

// Student: Save/Autosave a single answer
router.post('/attempts/:attemptId/answer', asyncHandler(assessmentController.saveAssessmentAnswer));

// Student: Log a tab blur / proctor violation
router.post('/attempts/:attemptId/proctor-blur', asyncHandler(assessmentController.logProctorBlur));

// Student: Submit complete exam
router.post('/attempts/:attemptId/submit', asyncHandler(assessmentController.submitAssessmentAttempt));

// Student: Upload written work / worksheet file
router.post(
  '/attempts/:attemptId/upload',
  upload.single('file'),
  asyncHandler(assessmentController.handleWorksheetUpload)
);

// Admin only: Configure/Update assessment questions
router.post('/:contentItemId', authorize(Role.ADMIN), asyncHandler(assessmentController.createOrUpdateAssessment));

// Admin only: Grade a manual exam attempt
router.post('/attempts/:attemptId/grade', authorize(Role.ADMIN), asyncHandler(assessmentController.gradeAssessmentAttempt));

export { router as assessmentRoutes };
