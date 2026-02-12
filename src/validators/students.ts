import { z } from 'zod';

export const createStudentSchema = z.object({
  student_name: z.string().min(1, 'Student name is required').max(255),
  student_age: z.number().int().min(1).max(120),
  parent_name: z.string().min(1, 'Parent name is required').max(255),
  whatsapp: z
    .string()
    .min(10, "WhatsApp number too short")
    .max(15, "WhatsApp number too long"),
});

export const updateStudentSchema = z.object({
  student_name: z.string().min(1).max(255).optional(),
  student_age: z.number().int().min(1).max(120).optional(),
  parent_name: z.string().min(1).max(255).optional(),
  whatsapp: z
    .string()
    .min(10, "WhatsApp number too short")
    .max(15, "WhatsApp number too long").optional(),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
