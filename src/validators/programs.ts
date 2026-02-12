import { z } from 'zod';

export const createProgramSchema = z.object({
  name: z.string().min(1, 'Program name is required').max(255),
  description: z.string().min(1, 'Description is required'),
  icon: z.string().optional(),
  image: z.string().optional(),
});

export const updateProgramSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().min(1).optional(),
  icon: z.string().optional(),
  image: z.string().optional(),
});

export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramInput = z.infer<typeof updateProgramSchema>;
