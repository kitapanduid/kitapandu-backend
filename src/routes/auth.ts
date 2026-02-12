import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { ZodError } from 'zod';
import { loginSchema, signupSchema } from '../validators/auth';
import { generateToken, getTokenExpiration, getTokenJti } from '../lib/jwt';
import { blacklistToken } from '../lib/tokenBlacklist';
import { prisma } from '../lib/prisma';
import { successResponse, errorResponse } from '../helper/apiResponse';
import { requiredAdmin, authMiddleware } from '../middleware/auth';

const router = Router();

/**
 * POST /login
 * Authenticates a user using email and password.
 * Validates request body with Zod, checks user existence and active status,
 * verifies password using bcrypt, and generates a JWT on success.
 * Returns user info and token, or appropriate auth/validation errors.
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const body = loginSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: { email: body.email },
    });

    if (!user) {
      return errorResponse(
        res,
        'Invalid email or password',
        401
      );
    }

    if (!user.isActive) {
      return errorResponse(
        res,
        'User account is inactive',
        403
      );
    }

    const isPasswordValid = await bcrypt.compare(
      body.password,
      user.password
    );

    if (!isPasswordValid) {
      return errorResponse(
        res,
        'Invalid email or password',
        401
      );
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return successResponse(
      res,
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
      },
      'Login successful'
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(
        res,
        'Validation failed',
        400,
        error.errors
      );
    }

    console.error('Login error:', error);

    return errorResponse(
      res,
      'Login failed',
      500,
      error instanceof Error ? error.message : String(error)
    );
  }
});

/**
 * POST /logout
 * Logs out the authenticated user by invalidating the current JWT.
 * Extracts the token from the Authorization header, retrieves its JTI
 * and expiration, and adds it to a blacklist for audit and revocation.
 * Returns a success message or handles server errors.
 */
router.post('/logout', authMiddleware, async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const userId = req.user?.id;

    if (authHeader) {
      const token = authHeader.split(' ')[1];
      const jti = getTokenJti(token);
      const expiration = getTokenExpiration(token);

      if (jti && expiration) {
        // Add JTI to blacklist with user ID for audit trail
        await blacklistToken(jti, expiration, userId);
      }
    }

    return successResponse(res, null, 'Logout successful');
  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse(
      res,
      'Logout failed',
      500,
      error instanceof Error ? error.message : String(error)
    );
  }
});

/**
 * POST /signup
 * Creates a new user account.
 * Restricted to admin users and validates input using Zod.
 * Hashes the password before persisting the user.
 * Returns the created user’s public details or appropriate errors.
 */
router.post('/signup', requiredAdmin, async (req, res) => {
  try {
    const body = signupSchema.parse(req.body);
    const hashedPassword = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
        password: hashedPassword
      }
    });
    return successResponse(
      res,
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      "User created successfully"
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse(
        res, "validation failed", 400, error.errors
      );
    }
    return errorResponse(
      res,
      "Failed to create user",
      500,
      error instanceof Error ? error.message : error
    );
  }
});

export default router;
