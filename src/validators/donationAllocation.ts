import { z } from 'zod';

export const createDonationAllocationSchema = z.object({
  donation_id: z.string().uuid(),
  title: z.string().min(1).max(255),
  amount: z.number().int().positive(),
  percent: z.number().int().min(0).max(100).optional().default(0),
});

//bulk allocation
export const createDonationAllocationsSchema = z.array(
  createDonationAllocationSchema.omit({ donation_id: true })
);

export const updateDonationAllocationSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  amount: z.number().int().positive().optional(),
  percent: z.number().int().min(0).max(100).optional(),
});

export type CreateDonationAllocationInput = z.infer<typeof createDonationAllocationSchema>;
export type CreateDonationAllocationsInput = z.infer<typeof createDonationAllocationsSchema>;
export type updateDonationAllocationSchema = z.infer<typeof updateDonationAllocationSchema>;