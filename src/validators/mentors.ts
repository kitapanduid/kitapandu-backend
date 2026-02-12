import { z } from 'zod';

export const createMentorSchema = z.object({
  name: z.string().min(1).max(255),
  contact: z.string().min(1).max(255),
});

export const updateMentorSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  contact: z.string().min(1).max(255).optional(),
});

export type createMentorSchema = z.infer<typeof createMentorSchema>;
export type updateMentorSchema = z.infer<typeof updateMentorSchema>
