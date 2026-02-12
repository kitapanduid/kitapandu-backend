/**
 * JWT Token Blacklist Service (JTI-based)
 * Manages blacklisted tokens using JWT ID (JTI) claim
 * Uses database storage with automatic expiration cleanup
 */

import { prisma } from './prisma';

// Cleanup interval (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;

/**
 * Start periodic cleanup of expired tokens
 */
export const initializeBlacklist = (): void => {
  setInterval(() => {
    cleanupExpiredTokens();
  }, CLEANUP_INTERVAL);
};

/**
 * Add a token to the blacklist by JTI
 */
export const blacklistToken = async (jti: string, expiresAt: number, userId?: string): Promise<void> => {
  try {
    await prisma.tokenBlacklist.create({
      data: {
        jti,
        expiresAt: new Date(expiresAt * 1000),
        userId: userId || null,
      },
    });
    console.log(`[TokenBlacklist] Token blacklisted. JTI: ${jti}`);
  } catch (error) {
    console.error('[TokenBlacklist] Error adding token to blacklist:', error);
    throw error;
  }
};

/**
 * Check if a JTI is blacklisted
 */
export const isJtiBlacklisted = async (jti: string): Promise<boolean> => {
  try {
    const blacklistedToken = await prisma.tokenBlacklist.findUnique({
      where: { jti },
    });

    if (!blacklistedToken) {
      return false;
    }

    // Check if token has expired
    if (new Date() > blacklistedToken.expiresAt) {
      // Delete expired token
      await prisma.tokenBlacklist.delete({
        where: { jti },
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error('[TokenBlacklist] Error checking token blacklist:', error);
    return false;
  }
};

/**
 * Remove all expired tokens from blacklist
 */
export const cleanupExpiredTokens = async (): Promise<void> => {
  try {
    const result = await prisma.tokenBlacklist.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    if (result.count > 0) {
      console.log(`[TokenBlacklist] Cleaned up ${result.count} expired tokens`);
    }
  } catch (error) {
    console.error('[TokenBlacklist] Error during cleanup:', error);
  }
};

/**
 * Get blacklist statistics
 */
export const getBlacklistStats = async (): Promise<{
  totalBlacklisted: number;
  expiredSoon: number;
  createdAt: string;
}> => {
  try {
    const [total, expiredSoon] = await Promise.all([
      prisma.tokenBlacklist.count(),
      prisma.tokenBlacklist.count({
        where: {
          expiresAt: {
            lte: new Date(Date.now() + 24 * 60 * 60 * 1000), // Next 24 hours
          },
        },
      }),
    ]);

    return {
      totalBlacklisted: total,
      expiredSoon: expiredSoon,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[TokenBlacklist] Error getting stats:', error);
    return {
      totalBlacklisted: 0,
      expiredSoon: 0,
      createdAt: new Date().toISOString(),
    };
  }
};

/**
 * Revoke all tokens for a specific user
 */
export const revokeUserTokens = async (userId: string): Promise<number> => {
  try {
    const result = await prisma.tokenBlacklist.deleteMany({
      where: { userId },
    });
    console.log(`[TokenBlacklist] Revoked ${result.count} tokens for user: ${userId}`);
    return result.count;
  } catch (error) {
    console.error('[TokenBlacklist] Error revoking user tokens:', error);
    return 0;
  }
};

/**
 * Clear entire blacklist (use with caution)
 */
export const clearBlacklist = async (): Promise<void> => {
  try {
    await prisma.tokenBlacklist.deleteMany({});
    console.log('[TokenBlacklist] Blacklist cleared');
  } catch (error) {
    console.error('[TokenBlacklist] Error clearing blacklist:', error);
  }
};
