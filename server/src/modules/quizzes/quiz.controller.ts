import type { Request, Response } from 'express';
import * as quizService from './quiz.service';
import { sendSuccess } from '../../shared/utils/response';
import { HttpStatus } from '../../shared/errors/app-error';

export async function getQuiz(req: Request, res: Response): Promise<void> {
  const quiz = await quizService.getQuizByContentItemId(
    String(req.params.contentItemId),
    req.user!.userId,
    req.user!.role,
  );
  sendSuccess(res, HttpStatus.OK, 'Quiz retrieved successfully', quiz);
}

export async function createOrUpdateQuiz(req: Request, res: Response): Promise<void> {
  const quiz = await quizService.createOrUpdateQuiz(
    String(req.params.contentItemId),
    req.body as quizService.CreateUpdateQuizInput,
  );
  sendSuccess(res, HttpStatus.OK, 'Quiz created or updated successfully', quiz);
}

export async function submitQuizAttempt(req: Request, res: Response): Promise<void> {
  const result = await quizService.submitQuizAttempt(
    String(req.params.contentItemId),
    req.user!.userId,
    req.body.answers as Record<string, number>,
  );
  sendSuccess(res, HttpStatus.CREATED, 'Quiz attempt submitted successfully', result);
}

export async function getQuizAttempts(req: Request, res: Response): Promise<void> {
  const attempts = await quizService.getQuizAttempts(
    String(req.params.contentItemId),
    req.user!.userId,
    req.user!.role,
  );
  sendSuccess(res, HttpStatus.OK, 'Quiz attempts retrieved successfully', attempts);
}
