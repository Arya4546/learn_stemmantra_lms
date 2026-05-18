import type { Request, Response } from 'express';
import * as assessmentService from './assessment.service';
import { sendSuccess } from '../../shared/utils/response';
import { HttpStatus } from '../../shared/errors/app-error';

export async function getAssessment(req: Request, res: Response): Promise<void> {
  const assessment = await assessmentService.getAssessmentByContentItemId(
    String(req.params.contentItemId),
    req.user!.userId,
    req.user!.role,
  );
  sendSuccess(res, HttpStatus.OK, 'Assessment retrieved successfully', assessment);
}

export async function createOrUpdateAssessment(req: Request, res: Response): Promise<void> {
  const assessment = await assessmentService.createOrUpdateAssessment(
    String(req.params.contentItemId),
    req.body as assessmentService.CreateUpdateAssessmentInput,
  );
  sendSuccess(res, HttpStatus.OK, 'Assessment saved successfully', assessment);
}

export async function startAssessmentAttempt(req: Request, res: Response): Promise<void> {
  const attempt = await assessmentService.startAssessmentAttempt(
    String(req.params.contentItemId),
    req.user!.userId,
  );
  sendSuccess(res, HttpStatus.CREATED, 'Exam session started successfully', attempt);
}

export async function saveAssessmentAnswer(req: Request, res: Response): Promise<void> {
  const answer = await assessmentService.saveAssessmentAnswer(
    String(req.params.attemptId),
    req.user!.userId,
    String(req.body.questionId),
    req.body as { selectedOptionIndex?: number; textResponse?: string; fileUrl?: string },
  );
  sendSuccess(res, HttpStatus.OK, 'Answer saved successfully', answer);
}

export async function logProctorBlur(req: Request, res: Response): Promise<void> {
  const attempt = await assessmentService.logProctorBlur(
    String(req.params.attemptId),
    req.user!.userId,
  );
  sendSuccess(res, HttpStatus.OK, 'Proctor focus violation recorded', attempt);
}

export async function submitAssessmentAttempt(req: Request, res: Response): Promise<void> {
  const attempt = await assessmentService.submitAssessmentAttempt(
    String(req.params.attemptId),
    req.user!.userId,
  );
  sendSuccess(res, HttpStatus.OK, 'Exam submitted successfully', attempt);
}

export async function gradeAssessmentAttempt(req: Request, res: Response): Promise<void> {
  const attempt = await assessmentService.gradeAssessmentAttempt(
    String(req.params.attemptId),
    req.user!.userId,
    req.body.scores as Record<string, { points: number; isCorrect: boolean }>,
    req.body.feedback as string,
  );
  sendSuccess(res, HttpStatus.OK, 'Exam graded successfully', attempt);
}

export async function getAssessmentAttempts(req: Request, res: Response): Promise<void> {
  const attempts = await assessmentService.getAssessmentAttempts(
    String(req.params.contentItemId),
    req.user!.userId,
    req.user!.role,
  );
  sendSuccess(res, HttpStatus.OK, 'Exam attempts retrieved successfully', attempts);
}

export async function getAssessmentAttemptById(req: Request, res: Response): Promise<void> {
  const attempt = await assessmentService.getAssessmentAttemptById(
    String(req.params.attemptId),
    req.user!.userId,
    req.user!.role,
  );
  sendSuccess(res, HttpStatus.OK, 'Exam attempt retrieved successfully', attempt);
}

export async function handleWorksheetUpload(req: Request, res: Response): Promise<void> {
  if (!req.file) {
    sendSuccess(res, HttpStatus.BAD_REQUEST, 'No worksheet file uploaded', null);
    return;
  }

  // Construct secure serve URL
  const fileUrl = `${req.protocol}://${req.get('host')}/api/assessments/submissions/serve/${req.file.filename}`;
  sendSuccess(res, HttpStatus.OK, 'Worksheet uploaded successfully', { fileUrl });
}
