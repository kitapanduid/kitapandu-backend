import { Router, Request, Response } from 'express';
import {
  createProgramSchema,
  updateProgramSchema,
} from '../validators/programs';
import { ZodError } from 'zod';
import { prisma } from '../lib/prisma';
import {
  successResponse,
  errorResponse,
  paginatedResponse,
} from '../helper/apiResponse';
import { authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * GET /
 * Fetches a paginated list of programs ordered by newest first.
 * Supports `page` and `limit` query parameters.
 * Includes related classes for each program.
 * Returns 404 if no programs are found and handles server errors.
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.max(Number(req.query.limit) || 10, 1);

    const totalItems = await prisma.programs.count();

    if (totalItems === 0) {
      return errorResponse(res, 'No programs found', 404);
    }

    const programs = await prisma.programs.findMany({
      include: {
        classes: {
          include: {
            schedules: true
          }
        }
      },
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return paginatedResponse(
      res,
      programs,
      { page, limit, totalItems },
      'Programs fetched successfully'
    );
  } catch (error) {
    return errorResponse(
      res,
      'Failed to fetch programs',
      500,
      error instanceof Error ? error.message : error
    );
  }
});

/**
 * GET /:id
 * Fetches a single program by its unique ID.
 * Includes related classes.
 * Returns 404 if the program is not found.
 * Handles server errors gracefully.
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const program = await prisma.programs.findUnique({
      where: { program_id: req.params.id },
      include: {
        classes: {
          include: {
            schedules: true
          }
        }
      },
    });

    if (!program) {
      return errorResponse(res, 'Program not found', 404);
    }

    return successResponse(
      res,
      program,
      'Program fetched successfully'
    );
  } catch (error) {
    return errorResponse(
      res,
      'Failed to fetch program',
      500,
      error instanceof Error ? error.message : error
    );
  }
});

/**
 * GET /:id
 * Fetches a single class by program's unique ID.
 * Includes related schedule.
 * Returns 404 if the program is not found.
 * Handles server errors gracefully.
 */
router.get('/class/:id', async (req: Request, res: Response) => {
  try {
    const { id: program_id } = req.params;

    const classes = await prisma.classes.findMany({
      where: {
        program_id,
      },
      include: {
        program: {
          select: {
            program_id: true,
            name: true,
          },
        },
        mentor: {
          select: {
            mentor_id: true,
            name: true,
          },
        },
        schedules: {
          orderBy: [
            { day_of_week: 'asc' },
            { start_time: 'asc' },
          ],
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    if (classes.length === 0) {
      return errorResponse(res, 'No classes found for this program', 404);
    }

    return successResponse(
      res,
      classes,
      'Classes fetched successfully'
    );
  } catch (error) {
    return errorResponse(
      res,
      'Failed to fetch classes',
      500,
      error instanceof Error ? error.message : error
    );
  }
});

/**
 * POST /
 * Creates a new program.
 * Requires authentication and validates request body using Zod.
 * Returns the created program with a 201 status code on success.
 * Handles validation and server errors.
 */
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const body = createProgramSchema.parse(req.body);

    const program = await prisma.programs.create({
      data: body,
    });

    return successResponse(
      res,
      program,
      'Program created successfully',
      201
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(res, 'Validation failed', 400, error.errors);
    }

    return errorResponse(
      res,
      'Failed to create program',
      500,
      error instanceof Error ? error.message : error
    );
  }
});

/**
 * PUT /:id
 * Updates an existing program by its unique ID.
 * Requires authentication and validates request body using Zod.
 * Returns the updated program with related classes on success.
 * Handles validation and server errors.
 */
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const body = updateProgramSchema.parse(req.body);

    const program = await prisma.programs.update({
      where: { program_id: req.params.id },
      data: body,
      include: { classes: true },
    });

    return successResponse(
      res,
      program,
      'Program updated successfully'
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(res, 'Validation failed', 400, error.errors);
    }

    return errorResponse(
      res,
      'Failed to update program',
      500,
      error instanceof Error ? error.message : error
    );
  }
});

/**
 * DELETE /:id
 * Deletes a program by its unique ID.
 * Requires authentication.
 * Returns a success message on successful deletion.
 * Handles server errors gracefully.
 */
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    await prisma.programs.delete({
      where: { program_id: req.params.id },
    });

    return successResponse(
      res,
      null,
      'Program deleted successfully'
    );
  } catch (error) {
    return errorResponse(
      res,
      'Failed to delete program',
      500,
      error instanceof Error ? error.message : error
    );
  }
});

export default router;
