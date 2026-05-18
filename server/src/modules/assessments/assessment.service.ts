import { prisma } from '../../database/prisma';
import { AppError } from '../../shared/errors/app-error';
import { QuestionType, AttemptStatus } from '@prisma/client';

export interface AssessmentQuestionInput {
  questionText: string;
  type: QuestionType;
  options?: string[];
  correctOptionIndex?: number;
  explanation?: string;
  points?: number;
}

export interface CreateUpdateAssessmentInput {
  durationMinutes: number;
  totalPoints?: number;
  passingScore?: number;
  allowedAttempts?: number;
  isProctored?: boolean;
  showResultImmediately?: boolean;
  questions: AssessmentQuestionInput[];
}

export async function getAssessmentByContentItemId(contentItemId: string, _userId: string, role: string) {
  const contentItem = await prisma.contentItem.findUnique({
    where: { id: contentItemId },
    include: {
      assessment: {
        include: {
          questions: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      },
    },
  });

  if (!contentItem) {
    throw AppError.notFound('Content item not found');
  }

  if (contentItem.type !== 'ASSESSMENT') {
    throw AppError.badRequest('This content item is not an assessment');
  }

  const assessment = contentItem.assessment;
  if (!assessment) {
    return null;
  }

  // If student, remove correct options and explanations to ensure integrity
  if (role === 'STUDENT') {
    const safeQuestions = assessment.questions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      type: q.type,
      options: q.options,
      points: q.points,
      sortOrder: q.sortOrder,
    }));
    return {
      ...assessment,
      questions: safeQuestions,
    };
  }

  return assessment;
}

export async function createOrUpdateAssessment(contentItemId: string, input: CreateUpdateAssessmentInput) {
  const contentItem = await prisma.contentItem.findUnique({
    where: { id: contentItemId },
  });

  if (!contentItem) {
    throw AppError.notFound('Content item not found');
  }

  if (contentItem.type !== 'ASSESSMENT') {
    throw AppError.badRequest('Content item type must be ASSESSMENT');
  }

  return prisma.$transaction(async (tx) => {
    let assessment = await tx.assessment.findUnique({
      where: { contentItemId },
    });

    const computedTotalPoints = input.questions.reduce((sum, q) => sum + (q.points ?? 5), 0);

    if (assessment) {
      assessment = await tx.assessment.update({
        where: { id: assessment.id },
        data: {
          durationMinutes: input.durationMinutes,
          totalPoints: computedTotalPoints,
          passingScore: input.passingScore ?? computedTotalPoints * 0.5,
          allowedAttempts: input.allowedAttempts ?? 1,
          isProctored: input.isProctored ?? true,
          showResultImmediately: input.showResultImmediately ?? false,
        },
      });

      // Delete old questions
      await tx.assessmentQuestion.deleteMany({
        where: { assessmentId: assessment.id },
      });
    } else {
      assessment = await tx.assessment.create({
        data: {
          contentItemId,
          durationMinutes: input.durationMinutes,
          totalPoints: computedTotalPoints,
          passingScore: input.passingScore ?? computedTotalPoints * 0.5,
          allowedAttempts: input.allowedAttempts ?? 1,
          isProctored: input.isProctored ?? true,
          showResultImmediately: input.showResultImmediately ?? false,
        },
      });
    }

    if (input.questions && input.questions.length > 0) {
      await tx.assessmentQuestion.createMany({
        data: input.questions.map((q, idx) => ({
          assessmentId: assessment!.id,
          questionText: q.questionText,
          type: q.type,
          options: q.options || [],
          correctOptionIndex: q.correctOptionIndex !== undefined ? q.correctOptionIndex : null,
          explanation: q.explanation || null,
          points: q.points ?? 5,
          sortOrder: idx,
        })),
      });
    }

    return tx.assessment.findUnique({
      where: { id: assessment.id },
      include: {
        questions: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  });
}

export async function startAssessmentAttempt(contentItemId: string, userId: string) {
  const contentItem = await prisma.contentItem.findUnique({
    where: { id: contentItemId },
    include: { assessment: true },
  });

  if (!contentItem || !contentItem.assessment) {
    throw AppError.notFound('Assessment not configured yet');
  }

  const assessment = contentItem.assessment;

  // Check attempt limit
  const attemptCount = await prisma.assessmentAttempt.count({
    where: { assessmentId: assessment.id, userId, status: { in: [AttemptStatus.SUBMITTED, AttemptStatus.GRADED] } },
  });

  if (attemptCount >= assessment.allowedAttempts) {
    throw AppError.badRequest('You have already taken this assessment exam.');
  }

  // Check if there is an in-progress attempt to resume
  const existingAttempt = await prisma.assessmentAttempt.findFirst({
    where: { assessmentId: assessment.id, userId, status: AttemptStatus.IN_PROGRESS },
    include: {
      answers: true,
    },
  });

  if (existingAttempt) {
    // Check if time expired since start
    const elapsedMinutes = (Date.now() - existingAttempt.startedAt.getTime()) / 60000;
    if (elapsedMinutes >= assessment.durationMinutes) {
      // Auto-submit expired attempt
      await submitAssessmentAttempt(existingAttempt.id, userId);
      throw AppError.badRequest('Your previous exam session has expired and was auto-submitted.');
    }
    return existingAttempt;
  }

  // Start new attempt
  return prisma.assessmentAttempt.create({
    data: {
      assessmentId: assessment.id,
      userId,
      status: AttemptStatus.IN_PROGRESS,
      blurCount: 0,
    },
    include: {
      answers: true,
    },
  });
}

export async function saveAssessmentAnswer(
  attemptId: string,
  userId: string,
  questionId: string,
  data: { selectedOptionIndex?: number; textResponse?: string; fileUrl?: string },
) {
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: attemptId },
  });

  if (!attempt) {
    throw AppError.notFound('Exam session not found');
  }

  if (attempt.userId !== userId) {
    throw AppError.forbidden('Unauthorized access to this session');
  }

  if (attempt.status !== AttemptStatus.IN_PROGRESS) {
    throw AppError.badRequest('Cannot edit answers on a submitted exam.');
  }

  // Upsert the answer
  const existingAnswer = await prisma.assessmentAnswer.findFirst({
    where: { attemptId, questionId },
  });

  if (existingAnswer) {
    return prisma.assessmentAnswer.update({
      where: { id: existingAnswer.id },
      data: {
        selectedOptionIndex: data.selectedOptionIndex !== undefined ? data.selectedOptionIndex : null,
        textResponse: data.textResponse || null,
        fileUrl: data.fileUrl || null,
      },
    });
  } else {
    return prisma.assessmentAnswer.create({
      data: {
        attemptId,
        questionId,
        selectedOptionIndex: data.selectedOptionIndex !== undefined ? data.selectedOptionIndex : null,
        textResponse: data.textResponse || null,
        fileUrl: data.fileUrl || null,
      },
    });
  }
}

export async function logProctorBlur(attemptId: string, userId: string) {
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: attemptId },
  });

  if (!attempt) {
    throw AppError.notFound('Session not found');
  }

  if (attempt.userId !== userId) {
    throw AppError.forbidden('Unauthorized');
  }

  return prisma.assessmentAttempt.update({
    where: { id: attemptId },
    data: {
      blurCount: { increment: 1 },
    },
  });
}

export async function submitAssessmentAttempt(attemptId: string, _userId: string) {
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: attemptId },
    include: {
      assessment: {
        include: {
          questions: true,
        },
      },
      answers: true,
    },
  });

  if (!attempt) {
    throw AppError.notFound('Exam session not found');
  }

  if (attempt.status !== AttemptStatus.IN_PROGRESS) {
    return attempt; // Already submitted
  }

  const assessment = attempt.assessment;
  let earnedPoints = 0;
  let hasManualGrading = false;

  // Grade autograded questions (MCQs, True/False)
  const answersUpdates = attempt.assessment.questions.map((q) => {
    const studentAnswer = attempt.answers.find((ans) => ans.questionId === q.id);
    const isAutograded = q.type === QuestionType.MCQ || q.type === QuestionType.TRUE_FALSE;

    if (isAutograded) {
      const isCorrect = studentAnswer?.selectedOptionIndex === q.correctOptionIndex;
      earnedPoints += isCorrect ? q.points : 0;
      return prisma.assessmentAnswer.updateMany({
        where: { attemptId, questionId: q.id },
        data: {
          pointsAwarded: isCorrect ? q.points : 0,
          isCorrect,
        },
      });
    } else {
      hasManualGrading = true;
      return null;
    }
  }).filter((promise) => promise !== null) as Promise<any>[];

  await Promise.all(answersUpdates);

  // If exam has no manual questions and results should be shown immediately, grade it right away
  const status = (!hasManualGrading && assessment.showResultImmediately) ? AttemptStatus.GRADED : AttemptStatus.SUBMITTED;
  const finalScore = !hasManualGrading ? earnedPoints : null;
  const isPassed = !hasManualGrading ? finalScore! >= assessment.passingScore : null;

  return prisma.assessmentAttempt.update({
    where: { id: attemptId },
    data: {
      status,
      score: finalScore,
      isPassed,
      completedAt: new Date(),
    },
    include: {
      answers: true,
    },
  });
}

export async function gradeAssessmentAttempt(
  attemptId: string,
  _graderId: string,
  scores: Record<string, { points: number; isCorrect: boolean }>,
  feedback?: string,
) {
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: attemptId },
    include: {
      assessment: {
        include: {
          questions: true,
        },
      },
    },
  });

  if (!attempt) {
    throw AppError.notFound('Submission not found');
  }

  // Update question-by-question manual points
  const gradingPromises = Object.entries(scores).map(([questionId, grade]) => {
    return prisma.assessmentAnswer.updateMany({
      where: { attemptId, questionId },
      data: {
        pointsAwarded: grade.points,
        isCorrect: grade.isCorrect,
      },
    });
  });

  await Promise.all(gradingPromises);

  // Recalculate full total score (autograded + newly manual graded)
  const allAnswers = await prisma.assessmentAnswer.findMany({
    where: { attemptId },
  });

  const finalPoints = allAnswers.reduce((sum, ans) => sum + (ans.pointsAwarded ?? 0), 0);
  const isPassed = finalPoints >= attempt.assessment.passingScore;

  return prisma.assessmentAttempt.update({
    where: { id: attemptId },
    data: {
      status: AttemptStatus.GRADED,
      score: finalPoints,
      isPassed,
      feedback: feedback || null,
    },
    include: {
      answers: {
        include: {
          question: true,
        },
      },
    },
  });
}

export async function getAssessmentAttempts(contentItemId: string, userId: string, role: string) {
  const contentItem = await prisma.contentItem.findUnique({
    where: { id: contentItemId },
    include: { assessment: true },
  });

  if (!contentItem || !contentItem.assessment) {
    return [];
  }

  const assessmentId = contentItem.assessment.id;

  if (role === 'STUDENT') {
    return prisma.assessmentAttempt.findMany({
      where: { assessmentId, userId },
      orderBy: { startedAt: 'desc' },
      include: {
        answers: {
          include: {
            question: true,
          },
        },
      },
    });
  }

  // Admin gets ALL attempts for grading!
  return prisma.assessmentAttempt.findMany({
    where: { assessmentId },
    orderBy: { startedAt: 'desc' },
    include: {
      user: {
        select: { fullName: true, email: true },
      },
      answers: {
        include: {
          question: true,
        },
      },
    },
  });
}

export async function getAssessmentAttemptById(attemptId: string, userId: string, role: string) {
  const attempt = await prisma.assessmentAttempt.findUnique({
    where: { id: attemptId },
    include: {
      user: { select: { fullName: true, email: true } },
      assessment: {
        include: {
          questions: { orderBy: { sortOrder: 'asc' } },
        },
      },
      answers: true,
    },
  });

  if (!attempt) {
    throw AppError.notFound('Assessment attempt not found');
  }

  // Restrict students to only view their own attempts
  if (role === 'STUDENT' && attempt.userId !== userId) {
    throw AppError.forbidden('Access denied');
  }

  return attempt;
}
