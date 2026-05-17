import { z } from 'zod';

export const createSectionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  sortOrder: z.number().int().min(0).default(0),
});

export const updateSectionSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const sectionParamsSchema = z.object({
  courseId: z.string().uuid('Invalid course ID'),
});

export const sectionIdParamsSchema = z.object({
  courseId: z.string().uuid('Invalid course ID'),
  id: z.string().uuid('Invalid section ID'),
});

export const reorderSectionsSchema = z.object({
  orderedIds: z.array(z.string().uuid()).min(1, 'At least one section ID is required'),
});

export type CreateSectionInput = z.infer<typeof createSectionSchema>;
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;
export type ReorderSectionsInput = z.infer<typeof reorderSectionsSchema>;
