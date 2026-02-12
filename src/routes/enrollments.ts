import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { successResponse, errorResponse, paginatedResponse } from '../helper/apiResponse';
import { createEnrollmentSchema, updateEnrollmentSchema } from '../validators/enrollments';
import { ZodError } from 'zod';

const router = Router();

/**
 * GET /
 * Fetches a paginated list of enrollments ordered by newest first.
 * Supports `page` and `limit` query parameters.
 * Includes related student and class data.
 * Returns 404 if no enrollments are found and handles server errors.
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);

    const totalItems = await prisma.enrollments.count();

    if (!totalItems) {
      return errorResponse(res, 'No enrollments found', 404);
    }

    const enrollments = await prisma.enrollments.findMany({
      include: { student: true, class: true },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginatedResponse(
      res,
      enrollments,
      { page, limit, totalItems },
      'Enrollments fetched successfully'
    );
  } catch (error) {
    return errorResponse(
      res,
      "Failed to fetch enrollments",
      500,
      error instanceof Error ? error.message : error
    );
  }
});

/**
 * GET /:id
 * Fetches a single enrollment by its unique ID.
 * Returns 404 if the enrollment is not found.
 * Handles server errors gracefully.
 */
router.get('/:id', async (req, res) => {
  try {
    const enrollment = await prisma.enrollments.findUnique({
      where: { enrollment_id: req.params.id },
    });
    if (!enrollment) return errorResponse(res, 'Enrollment not found', 404);
    return successResponse(res, enrollment);
  } catch (error) {
    return errorResponse(
      res,
      "Failed to fetch enrollments",
      500,
      error instanceof Error ? error.message : error
    );
  }
});

/**
 * POST /
 * Creates a new enrollment.
 * Requires authentication and validates request body using Zod.
 * Returns the created enrollment with a 201 status code on success.
 * Handles validation and server errors.
 */
router.post('/', async (req, res) => {
  try {
    const data = createEnrollmentSchema.parse(req.body);
    const enrollment = await prisma.enrollments.create({ data });
    return successResponse(res, enrollment, 'Enrollment created', 201);
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(res, "Validation failed", 400, error.errors)
    }

    return errorResponse(
      res,
      "Failed to create enrollment",
      500,
      error instanceof Error ? error.message : error
    )
  }
});

/**
 * PUT /:id
 * Updates an existing enrollment by its unique ID.
 * Requires authentication and validates request body using Zod.
 * Returns the updated enrollment on success.
 * Handles validation and server errors.
 */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const data = updateEnrollmentSchema.parse(req.body);
    const enrollment = await prisma.enrollments.update({
      where: { enrollment_id: req.params.id },
      data,
    });
    return successResponse(res, enrollment, 'Enrollment updated');
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(res, "Validation failed", 400, error.errors);
    }
    return errorResponse(
      res,
      "Failed to update enrollment",
      500,
      error instanceof Error ? error.message : error
    );
  }
});

/**
 * DELETE /:id
 * Deletes an enrollment by its unique ID.
 * Requires authentication.
 * Returns a success message on successful deletion.
 * Handles server errors gracefully.
 */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.enrollments.delete({ where: { enrollment_id: req.params.id } });
    return successResponse(res, null, 'Enrollment deleted');
  } catch (error) {
    return errorResponse(
      res,
      "Failed to delete enrollment",
      500,
      error instanceof Error ? error.message : error
    );
  }
});

export default router;
