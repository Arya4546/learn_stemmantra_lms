import { z } from 'zod';

export const createEnrollmentSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  courseId: z.string().uuid('Invalid course ID'),
});

export const enrollmentCourseParamSchema = z.object({
  courseId: z.string().uuid('Invalid course ID'),
});

export const enrollmentUserParamSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;
