import { z } from 'zod';
import { ClassStatus } from '@prisma/client';

export const createClassSchema = z.object({
  program_id: z.string().uuid(),
  mentor_id: z.string().uuid(),
  name: z.string().min(1).max(255),
  min_age: z.number().int().min(0),
  max_age: z.number().int().min(0),
  status: z.nativeEnum(ClassStatus),
  image: z.string().optional(),
  started_at: z.coerce.date(),
  ended_at: z.coerce.date(),
}).refine((data) => data.min_age <= data.max_age, {
  message: "min_age must be less than or equal to max_age",
  path: ["min_age"],
})
  .refine((data) => data.started_at < data.ended_at, {
    message: "started_at must be before ended_at",
    path: ["started_at"],
  });

export const updateClassSchema = z
  .object({
    program_id: z.string().uuid().optional(),
    mentor_id: z.string().uuid().optional(),
    name: z.string().min(1).max(255).optional(),

    min_age: z.number().int().min(0).optional(),
    max_age: z.number().int().min(0).optional(),

    status: z.nativeEnum(ClassStatus).optional(),
    image: z.string().optional(),

    started_at: z.coerce.date().optional(),
    ended_at: z.coerce.date().optional(),
  })
  .refine(
    (data) =>
      data.min_age === undefined ||
      data.max_age === undefined ||
      data.min_age <= data.max_age,
    {
      message: "min_age must be less than or equal to max_age",
      path: ["min_age"],
    }
  )
  .refine(
    (data) =>
      data.started_at === undefined ||
      data.ended_at === undefined ||
      data.started_at < data.ended_at,
    {
      message: "started_at must be before ended_at",
      path: ["started_at"],
    }
  )


export type createClassSchema = z.infer<typeof createClassSchema>;
export type updateClassSchema = z.infer<typeof updateClassSchema>;
