import { prisma } from '../../database/prisma';
import { AppError } from '../../shared/errors/app-error';

export interface QuizQuestionInput {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
  points?: number;
}

export interface CreateUpdateQuizInput {
  passingScore?: number;
  allowedAttempts?: number;
  questions: QuizQuestionInput[];
}

export async function getQuizByContentItemId(contentItemId: string, _userId: string, role: string) {
  const contentItem = await prisma.contentItem.findUnique({
    where: { id: contentItemId },
    include: {
      quiz: {
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

  // Ensure content item is of type QUIZ
  if (contentItem.type !== 'QUIZ') {
    throw AppError.badRequest('This content item is not a quiz');
  }

  const quiz = contentItem.quiz;
  if (!quiz) {
    return null;
  }

  // If student, remove correct options and explanations to prevent cheating!
  if (role === 'STUDENT') {
    const safeQuestions = quiz.questions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      options: q.options,
      points: q.points,
      sortOrder: q.sortOrder,
    }));
    return {
      ...quiz,
      questions: safeQuestions,
    };
  }

  return quiz;
}

export async function createOrUpdateQuiz(contentItemId: string, input: CreateUpdateQuizInput) {
  const contentItem = await prisma.contentItem.findUnique({
    where: { id: contentItemId },
  });

  if (!contentItem) {
    throw AppError.notFound('Content item not found');
  }

  if (contentItem.type !== 'QUIZ') {
    throw AppError.badRequest('Content item type must be QUIZ');
  }

  // Use a transaction to ensure atomic updates
  return prisma.$transaction(async (tx) => {
    // Check if quiz already exists
    let quiz = await tx.quiz.findUnique({
      where: { contentItemId },
    });

    if (quiz) {
      // Update basic details
      quiz = await tx.quiz.update({
        where: { id: quiz.id },
        data: {
          passingScore: input.passingScore ?? 60.0,
          allowedAttempts: input.allowedAttempts ?? 0,
        },
      });

      // Delete existing questions to rebuild
      await tx.quizQuestion.deleteMany({
        where: { quizId: quiz.id },
      });
    } else {
      // Create new quiz
      quiz = await tx.quiz.create({
        data: {
          contentItemId,
          passingScore: input.passingScore ?? 60.0,
          allowedAttempts: input.allowedAttempts ?? 0,
        },
      });
    }

    // Insert new questions
    if (input.questions && input.questions.length > 0) {
      await tx.quizQuestion.createMany({
        data: input.questions.map((q, idx) => ({
          quizId: quiz!.id,
          questionText: q.questionText,
          options: q.options,
          correctOptionIndex: q.correctOptionIndex,
          explanation: q.explanation || null,
          points: q.points ?? 1,
          sortOrder: idx,
        })),
      });
    }

    // Return full quiz
    return tx.quiz.findUnique({
      where: { id: quiz.id },
      include: {
        questions: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
  });
}

export async function submitQuizAttempt(contentItemId: string, userId: string, answers: Record<string, number>) {
  const contentItem = await prisma.contentItem.findUnique({
    where: { id: contentItemId },
    include: {
      quiz: {
        include: {
          questions: true,
        },
      },
    },
  });

  if (!contentItem || !contentItem.quiz) {
    throw AppError.notFound('Quiz not configured yet');
  }

  const quiz = contentItem.quiz;

  // Check attempt limit
  if (quiz.allowedAttempts > 0) {
    const attemptCount = await prisma.quizAttempt.count({
      where: { quizId: quiz.id, userId },
    });
    if (attemptCount >= quiz.allowedAttempts) {
      throw AppError.badRequest('You have reached the maximum number of attempts for this quiz');
    }
  }

  // Calculate score
  let earnedPoints = 0;
  let totalPoints = 0;
  const itemizedResults = quiz.questions.map((q) => {
    const selectedAnswer = answers[q.id];
    const isCorrect = selectedAnswer === q.correctOptionIndex;
    earnedPoints += isCorrect ? q.points : 0;
    totalPoints += q.points;

    return {
      questionId: q.id,
      questionText: q.questionText,
      options: q.options,
      correctOptionIndex: q.correctOptionIndex,
      selectedOptionIndex: selectedAnswer ?? null,
      isCorrect,
      explanation: q.explanation,
      points: q.points,
    };
  });

  const percentageScore = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
  const isPassed = percentageScore >= quiz.passingScore;

  // Save attempt
  const attempt = await prisma.quizAttempt.create({
    data: {
      quizId: quiz.id,
      userId,
      score: percentageScore,
      isPassed,
      answers: answers as any,
    },
  });

  return {
    attemptId: attempt.id,
    score: percentageScore,
    isPassed,
    totalPoints,
    earnedPoints,
    results: itemizedResults,
    createdAt: attempt.createdAt,
  };
}

export async function getQuizAttempts(contentItemId: string, userId: string, role: string) {
  const contentItem = await prisma.contentItem.findUnique({
    where: { id: contentItemId },
    include: { quiz: true },
  });

  if (!contentItem || !contentItem.quiz) {
    return [];
  }

  if (role === 'ADMIN') {
    return prisma.quizAttempt.findMany({
      where: {
        quizId: contentItem.quiz.id,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { fullName: true, email: true },
        },
      },
    });
  }

  return prisma.quizAttempt.findMany({
    where: {
      quizId: contentItem.quiz.id,
      userId,
    },
    orderBy: { createdAt: 'desc' },
  });
}
