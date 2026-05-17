import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().max(5000).default(''),
  thumbnailUrl: z.string().optional(),
  price: z.number().min(0).default(0),
  isActive: z.boolean().default(true),
  isPublished: z.boolean().default(false),
});

export const updateCourseSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().max(5000).optional(),
  thumbnailUrl: z.string().optional(),
  price: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

export const courseIdParamSchema = z.object({
  id: z.string().uuid('Invalid course ID'),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
