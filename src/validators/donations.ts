import { z } from 'zod';
import { DonationStatus } from '@prisma/client';

export const createDonationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  status: z.nativeEnum(DonationStatus),
  target_amount: z.number().int().positive('Target amount must be positive'),
  google_form_url: z.string().url('Must be a valid URL'),
  image: z.string().optional(),
  start_date: z.string().datetime(),
  end_date: z.string().datetime(),
});

export const updateDonationSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  status: z.nativeEnum(DonationStatus).optional(),
  target_amount: z.number().int().positive().optional(),
  collected_amount: z.number().int().nonnegative().optional(),
  google_form_url: z.string().url().optional(),
  image: z.string().optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

export type CreateDonationInput = z.infer<typeof createDonationSchema>;
export type UpdateDonationInput = z.infer<typeof updateDonationSchema>;