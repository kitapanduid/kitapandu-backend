import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { ZodError } from 'zod';
import { successResponse, errorResponse, paginatedResponse } from '../helper/apiResponse';
import { createScheduleSchema, updateScheduleSchema } from '../validators/schedules';

const router = Router();

/**
 * GET /
 * Fetches a paginated list of schedules ordered by newest first.
 * Supports `page` and `limit` query parameters.
 * Includes related class data.
 * Returns 404 if no schedules are found and handles server errors.
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);

    const totalItems = await prisma.schedules.count();

    if (!totalItems) {
      return errorResponse(res, 'No schedules found', 404);
    }

    const schedules = await prisma.schedules.findMany({
      include: {
        class: {
          include: {
            mentor: true
          }
        }
      },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginatedResponse(
      res,
      schedules,
      { page, limit, totalItems },
      'Schedules fetched successfully'
    );
  } catch (error) {
    return errorResponse(
      res,
      "Failed to fetch schedules",
      500,
      error instanceof Error ? error.message : error
    )
  }
});

/**
 * GET /:id
 * Fetches a single schedule by its unique ID.
 * Returns 404 if the schedule is not found.
 * Handles server errors gracefully.
 */
router.get('/:id', async (req, res) => {
  try {
    const schedule = await prisma.schedules.findUnique({
      where: { schedule_id: req.params.id },
      include: {
        class: {
          include: {
            mentor: true
          }
        }
      },
    });
    if (!schedule) return errorResponse(res, 'Schedule not found', 404);
    return successResponse(res, schedule);
  } catch (error) {
    return errorResponse(
      res,
      "Failed to fetch schedules",
      500,
      error instanceof Error ? error.message : error
    )
  }
});

/**
 * POST /
 * Creates a new schedule.
 * Requires authentication and validates request body using Zod.
 * Returns the created schedule with a 201 status code on success.
 * Handles validation and server errors.
 */
router.post('/', authMiddleware, async (req, res) => {
  try {
    const data = createScheduleSchema.parse(req.body);
    const schedule = await prisma.schedules.create({ data });
    return successResponse(res, schedule, 'Schedule created', 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(
        res,
        "validation failed",
        400,
        error.errors
      );
    }
    return errorResponse(
      res,
      "Failed to create schedule",
      500,
      error instanceof Error ? error.message : error
    )
  }
});

/**
 * PUT /:id
 * Updates an existing schedule by its unique ID.
 * Requires authentication and validates request body using Zod.
 * Returns the updated schedule on success.
 * Handles validation and server errors.
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const data = updateScheduleSchema.parse(req.body);
    const schedule = await prisma.schedules.update({
      where: { schedule_id: req.params.id },
      data,
    });
    return successResponse(res, schedule, 'Schedule updated');
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(
        res,
        "validation failed",
        400,
        error.errors
      );
    }
    return errorResponse(
      res,
      "Failed to update schedule",
      500,
      error instanceof Error ? error.message : error
    )
  }
});

/**
 * DELETE /:id
 * Deletes a schedule by its unique ID.
 * Requires authentication.
 * Returns a success message on successful deletion.
 * Handles server errors gracefully.
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.schedules.delete({ where: { schedule_id: req.params.id } });
    return successResponse(res, null, 'Schedule deleted');
  } catch (error) {
    return errorResponse(
      res,
      "Failed to delete schedule",
      500,
      error instanceof Error ? error.message : error
    )
  }
});

export default router;
