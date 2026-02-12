import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../lib/jwt';
import { isJtiBlacklisted } from '../lib/tokenBlacklist';
import { errorResponse } from '../helper/apiResponse';

/**
 * Extend Express Request with user data
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Authentication middleware - verifies JWT token from Authorization header
 * Expects: Authorization: Bearer <token>
 * Only allows users with 'admin' or 'operator' roles
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      errorResponse(res, 'Missing authorization header', 401);
      return;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      errorResponse(
        res,
        'Invalid authorization header format. Expected: Bearer <token>',
        401
      );
      return;
    }

    const token = parts[1];
    const payload = verifyToken(token);

    if (!payload) {
      errorResponse(res, 'Invalid or expired token', 401);
      return;
    }

    // Check if JTI is blacklisted
    const isBlacklisted = await isJtiBlacklisted(payload.jti || '');
    if (isBlacklisted) {
      errorResponse(res, 'Token has been revoked. Please login again.', 401);
      return;
    }

    // Only allow admin and operator roles
    if (!payload.role || !['admin', 'operator'].includes(payload.role)) {
      errorResponse(
        res,
        'Insufficient permissions. Only users can access this resource.',
        403
      );
      return;
    }

    req.user = payload;
    next();
  } catch (error) {
    errorResponse(
      res,
      'Authentication error',
      500,
      error instanceof Error ? error.message : String(error)
    );
  }
};

/**
 * Optional authentication middleware
 * Does not fail if token is missing or invalid
 */
export const optionalAuthMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader) {
      const parts = authHeader.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        const payload = verifyToken(parts[1]);
        if (payload) {
          // Check if JTI is blacklisted
          const isBlacklisted = await isJtiBlacklisted(payload.jti || '');
          if (!isBlacklisted) {
            req.user = payload;
          }
        }
      }
    }

    next();
  } catch {
    next();
  }
};

/**
 * Require admin role middleware
 */
export const requiredAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      errorResponse(res, 'Missing authorization header', 401);
      return;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      errorResponse(
        res,
        'Invalid authorization header format. Expected: Bearer <token>',
        401
      );
      return;
    }

    const token = parts[1];
    const payload = verifyToken(token);

    if (!payload) {
      errorResponse(res, 'Invalid or expired token', 401);
      return;
    }

    // Check if JTI is blacklisted
    const isBlacklisted = await isJtiBlacklisted(payload.jti || '');
    if (isBlacklisted) {
      errorResponse(res, 'Token has been revoked. Please login again.', 401);
      return;
    }

    if (!payload.role || !['admin'].includes(payload.role)) {
      errorResponse(
        res,
        'Insufficient permissions. Only admin can access this resource.',
        403
      );
      return;
    }

    req.user = payload;
    next();
  } catch (error) {
    errorResponse(
      res,
      'Authentication error',
      500,
      error instanceof Error ? error.message : String(error)
    );
  }
};
