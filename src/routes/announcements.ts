import { Router, Request, Response } from 'express';
import { createAnnouncementSchema, updateAnnouncementSchema } from '../validators/announcements';
import { ZodError } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { paginatedResponse, errorResponse, successResponse } from '../helper/apiResponse';

const router = Router();

/**
 * GET /
 * Fetches a paginated list of announcements ordered by newest first.
 * Supports `page` and `limit` query params with validation and bounds.
 * Returns 404 if no announcements exist, otherwise responds with
 * paginated data and metadata. Handles and reports server errors.
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      100
    );

    const totalItems = await prisma.announcements.count();

    // 404 error code
    if (totalItems === 0) {
      return errorResponse(
        res,
        "No announcements found",
        404,
        null
      );
    }

    const announcements = await prisma.announcements.findMany({
      orderBy: { created_at: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginatedResponse(
      res,
      announcements,
      {
        page,
        limit,
        totalItems,
      },
      "Announcements fetched successfully"
    );
  } catch (error) {
    return errorResponse(
      res,
      "Failed to fetch announcement",
      500,
      error instanceof Error ? error.message : error
    );
  }
});

/**
 * GET /:id
 * Fetches a single announcement by its unique ID.
 * Returns 404 if the announcement does not exist.
 * Responds with the announcement data on success
 * and handles server errors gracefully.
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const announcement = await prisma.announcements.findUnique({
      where: { announcements_id: req.params.id },
    });

    if (!announcement) {
      return errorResponse(
        res,
        "No announcements found",
        404,
        null
      )
    }
    return successResponse(
      res,
      announcement
    );
  } catch (error) {
    return errorResponse(
      res,
      "Failed to fetch announcement",
      500,
      error instanceof Error ? error.message : error
    );
  }
});

/**
 * POST /
 * Creates a new announcement.
 * Requires authentication and validates request body using Zod.
 * Returns the created announcement on success.
 * Handles validation errors (400) and server errors (500).
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const body = createAnnouncementSchema.parse(req.body);
    const announcement = await prisma.announcements.create({
      data: body,
    });
    return successResponse(
      res,
      announcement,
      "Announcement created successfully"
    );
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
      "Failed to create announcement",
      500,
      error instanceof Error ? error.message : error
    );
  }
});

/**
 * PUT /:id
 * Updates an existing announcement by its unique ID.
 * Requires authentication and validates request body using Zod.
 * Returns the updated announcement on success.
 * Handles validation errors (400) and server errors (500).
 */
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const body = updateAnnouncementSchema.parse(req.body);
    const announcement = await prisma.announcements.update({
      where: { announcements_id: req.params.id },
      data: body,
    });
    return successResponse(
      res,
      announcement,
      "Announcement updated successfully"
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(
        res,
        "Validation failed",
        400,
        error.errors
      );
    }
    return errorResponse(
      res,
      "Failed to update announcement",
      500,
      error instanceof Error ? error.message : error
    );
  }
});

/**
 * DELETE /:id
 * Deletes an announcement by its unique ID.
 * Requires authentication.
 * Returns a success message on successful deletion.
 * Handles server errors gracefully.
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    await prisma.announcements.delete({
      where: { announcements_id: req.params.id },
    });
    return successResponse(
      res,
      null,
      "Announcement deleted successfully"
    );
  } catch (error) {
    return errorResponse(
      res,
      "Failed to delete announcement",
      500,
      error instanceof Error ? error.message : error
    );
  }
});

export default router;
