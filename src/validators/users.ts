import { z } from 'zod'
import { UserRole } from '@prisma/client'

export const updateUserSchema = z.object({
    email: z.string().email('Invalid email address').optional(),
    password: z.string().optional(),
    name: z.string().min(1, 'Name is required').optional(),
    role: z.nativeEnum(UserRole).optional(),
    isActive: z.boolean().optional()
});

export type updateUserSchema = z.infer<typeof updateUserSchema>;