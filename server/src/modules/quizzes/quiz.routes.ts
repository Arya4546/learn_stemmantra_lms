import { Router } from 'express';
import { Role } from '@prisma/client';
import * as quizController from './quiz.controller';
import { authenticate } from '../../shared/middleware/authenticate';
import { authorize } from '../../shared/middleware/authorize';
import { asyncHandler } from '../../shared/utils/async-handler';

const router = Router();

router.use(authenticate);

// Student & Admin: Fetch quiz details
router.get('/:contentItemId', asyncHandler(quizController.getQuiz));

// Student & Admin: List user's attempts for this quiz
router.get('/:contentItemId/attempts', asyncHandler(quizController.getQuizAttempts));

// Student: Submit a quiz attempt
router.post('/:contentItemId/submit', asyncHandler(quizController.submitQuizAttempt));

// Admin only: Create or Update quiz configuration and questions
router.post('/:contentItemId', authorize(Role.ADMIN), asyncHandler(quizController.createOrUpdateQuiz));

export { router as quizRoutes };
