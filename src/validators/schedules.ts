import { z } from 'zod';

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

export const createScheduleSchema = z
  .object({
    class_id: z.string().uuid(),
    day_of_week: z.number().int().min(1).max(7), // 1=Mon, 7=Sun
    start_time: z.string().regex(timeRegex, "Invalid time format (HH:mm)"),
    end_time: z.string().regex(timeRegex, "Invalid time format (HH:mm)"),
  })
  .refine((data) => data.start_time < data.end_time, {
    message: "start_time must be earlier than end_time",
    path: ["start_time"],
  })

export const updateScheduleSchema = z
  .object({
    class_id: z.string().uuid().optional(),
    day_of_week: z.number().int().min(1).max(7).optional(),
    start_time: z.string().regex(timeRegex).optional(),
    end_time: z.string().regex(timeRegex).optional(),
  })
  .refine(
    (data) =>
      !data.start_time ||
      !data.end_time ||
      data.start_time < data.end_time,
    {
      message: "start_time must be earlier than end_time",
      path: ["start_time"],
    }
  )

export type createScheduleSchema = z.infer<typeof createScheduleSchema>;
export type updateScheduleSchema = z.infer<typeof updateScheduleSchema>;
