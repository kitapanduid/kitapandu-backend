import { z } from 'zod';
import { EnrollmentStatus } from '@prisma/client';

export const createEnrollmentSchema = z.object({
  student_id: z.string().uuid(),
  class_id: z.string().uuid(),
  status: z.nativeEnum(EnrollmentStatus),
  register_at: z.coerce.date(),
  confirmed_at: z.coerce.date(),
});

export const updateEnrollmentSchema = z.object({
  student_id: z.string().uuid().optional(),
  class_id: z.string().uuid().optional(),
  status: z.nativeEnum(EnrollmentStatus).optional(),
  register_at: z.coerce.date().optional(),
  confirmed_at: z.coerce.date().optional(),
});

export type createEnrollmentSchema = z.infer<typeof createEnrollmentSchema>;
export type updateEnrollmentSchema = z.infer<typeof updateEnrollmentSchema>;
