import { z } from 'zod';

export const uploadContentParamsSchema = z.object({
  sectionId: z.string().uuid('Invalid section ID'),
});

export const uploadContentBodySchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
});

export const contentIdParamSchema = z.object({
  id: z.string().uuid('Invalid content ID'),
});

export const contentTokenParamSchema = z.object({
  token: z.string().min(1, 'Token is required'),
});

export type UploadContentBody = z.infer<typeof uploadContentBodySchema>;
