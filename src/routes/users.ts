import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { requiredAdmin } from '../middleware/auth';
import { successResponse, errorResponse, paginatedResponse } from '../helper/apiResponse';
import { ZodError } from 'zod';
import { updateUserSchema } from '../validators/users';
import bcrypt from 'bcryptjs';

const router = Router();

/**
 * GET /
 * Fetches a paginated list of users.
 * Restricted to admin users.
 * Supports `page` and `limit` query parameters with bounds.
 * Returns selected public user fields ordered by newest first.
 * Returns 404 if no users are found and handles server errors.
 */
router.get('/', requiredAdmin, async (req: Request, res: Response) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      100
    );

    const totalItems = await prisma.user.count();

    if (totalItems === 0) {
      return errorResponse(
        res,
        "No users found",
        404,
        null
      );
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return paginatedResponse(
      res,
      users,
      { page, limit, totalItems },
      'Users fetch successfully'
    );

  } catch (error) {
    return errorResponse(
      res,
      "Failed to fetch users",
      500,
      error instanceof Error ? error.message : error
    )
  }
});

/**
 * GET /:id
 * Fetches a single user by unique ID.
 * Restricted to admin users.
 * Returns selected public user fields.
 * Returns 404 if the user is not found.
 * Handles server errors gracefully.
 */
router.get('/:id', requiredAdmin, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    if (!user) return errorResponse(res, "User not found", 404);
    return successResponse(res, user, "User fetch successfully")
  } catch (error) {
    return errorResponse(
      res,
      "Failed to fetch users",
      500,
      error instanceof Error ? error.message : error
    )
  }
});

/**
 * PUT /:id
 * Updates an existing user by unique ID.
 * Restricted to admin users and validates input using Zod.
 * Hashes password if provided and updates role, status, and profile data.
 * Returns updated user public details on success.
 * Handles validation and server errors.
 */

router.put('/:id', requiredAdmin, async (req, res) => {
  try {
    const body = updateUserSchema.parse(req.body);
    const updateData: any = {
      email: body.email,
      name: body.name,
      role: body.role,
      isActive: body.isActive,
    };
    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 10);
    }
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: updateData,
    });
    return successResponse(
      res,
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive
      },
      "User update successfully"
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(res, "validation failed", 400, error.message);
    }
    return errorResponse(
      res,
      "Failed to fetch users",
      500,
      error instanceof Error ? error.message : error
    )
  }
});

/**
 * DELETE /:id
 * Deletes a user by unique ID.
 * Restricted to admin users.
 * Returns a success message on successful deletion.
 * Handles validation and server errors gracefully.
 */

router.delete('/:id', requiredAdmin, async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    return successResponse(res, null, "userDeleted")
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(res, "validation failed", 400, error.message);
    }
    return errorResponse(
      res,
      "Failed to fetch users",
      500,
      error instanceof Error ? error.message : error
    )
  }
});

export default router;