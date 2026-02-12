import { z } from 'zod';
import { AnnouncementCategory } from '@prisma/client';

export const createAnnouncementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  category: z.nativeEnum(AnnouncementCategory),
  content: z.string().min(1, 'Content is required'),
});

export const updateAnnouncementSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  category: z.nativeEnum(AnnouncementCategory).optional(),
  content: z.string().min(1).optional(),
});

export type CreateAnnouncementInput = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementInput = z.infer<typeof updateAnnouncementSchema>;
