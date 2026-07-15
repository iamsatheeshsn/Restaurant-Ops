import { Request, Response, NextFunction } from 'express';
import {
  verifyAccessToken,
  verifySupplierToken,
  TokenPayload,
  SupplierTokenPayload,
} from '../utils/jwt';
import { redisClient } from '../config/redis';
import { prisma } from '../config/db';
import { env } from '../config/env';
import { AppError } from './error';
import { logger } from '../config/logger';
import { assertFeatureEnabled, assertTenantAccessAllowed } from '../services/subscription';

export interface AuthRequest extends Request {
  user?: TokenPayload;
  supplier?: SupplierTokenPayload;
  tenantId?: string;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Resolve tenant for public (and authenticated) requests.
 * Priority: JWT tenant → X-Tenant-ID header → DEFAULT_TENANT_ID env.
 * Never silently picks an arbitrary tenant via findFirst.
 */
export const resolveTenant = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.tenantId) {
      return next();
    }

    const headerRaw = req.headers['x-tenant-id'];
    const headerTenantId = Array.isArray(headerRaw) ? headerRaw[0] : headerRaw;
    const candidate = (headerTenantId || env.defaultTenantId || '').trim();

    if (!candidate) {
      return next(
        new AppError(
          'Tenant context required. Send X-Tenant-ID header or configure DEFAULT_TENANT_ID.',
          400,
          'TENANT_CONTEXT_MISSING'
        )
      );
    }

    if (!UUID_RE.test(candidate)) {
      return next(new AppError('Invalid X-Tenant-ID format', 400, 'INVALID_TENANT_ID'));
    }

    const tenant = await prisma.tenant.findFirst({
      where: { id: candidate, deletedAt: null },
      select: { id: true },
    });

    if (!tenant) {
      return next(new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND'));
    }

    req.tenantId = tenant.id;
    next();
  } catch (error: any) {
    logger.error(`Tenant resolution failed: ${error.message}`);
    return next(new AppError('Tenant resolution failed', 500, 'INTERNAL_SERVER_ERROR'));
  }
};

export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Authorization header is missing or malformed', 401, 'UNAUTHORIZED'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAccessToken(token);
    if (payload.role === 'SUPPLIER') {
      return next(new AppError('Staff authentication required', 403, 'FORBIDDEN_PRIVILEGES'));
    }
    req.user = payload;
    // Global SUPER_ADMIN has no restaurant tenant; leave req.tenantId unset
    // so resolveTenant (if used) can still apply X-Tenant-ID / DEFAULT_TENANT_ID.
    if (payload.tenantId) {
      req.tenantId = payload.tenantId;
    }
    next();
  } catch (error: any) {
    logger.warn(`JWT verification failed: ${error.message}`);
    return next(new AppError('Invalid or expired authentication token', 403, 'TOKEN_EXPIRED'));
  }
};

/** Supplier portal JWT — separate from staff/customer tokens. */
export const authenticateSupplier = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Supplier authorization required', 401, 'UNAUTHORIZED'));
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifySupplierToken(token);
    req.supplier = payload;
    req.tenantId = payload.tenantId;
    next();
  } catch (error: any) {
    logger.warn(`Supplier JWT verification failed: ${error.message}`);
    return next(new AppError('Invalid or expired supplier token', 403, 'TOKEN_EXPIRED'));
  }
};

export const requireRoles = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('Insufficient role', 403, 'FORBIDDEN_PRIVILEGES'));
    }
    next();
  };
};

async function loadUserPermissionScopes(userId: string): Promise<string[]> {
  const cacheKey = `user:permissions:${userId}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const userWithRole = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      },
    },
  });

  if (!userWithRole?.role) {
    throw new AppError('User role not configured', 403, 'FORBIDDEN_PRIVILEGES');
  }

  const permissions = userWithRole.role.permissions.map((rp) => rp.permission.scope);
  await redisClient.setex(cacheKey, 43200, JSON.stringify(permissions));
  return permissions;
}

export const requirePermission = (requiredScope: string) => {
  return requireAnyPermission(requiredScope);
};

/** Pass if the user has any of the listed scopes (OWNER always passes). */
export const requireAnyPermission = (...requiredScopes: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const user = req.user;
    if (!user) {
      return next(new AppError('Authentication context required', 401, 'UNAUTHORIZED'));
    }

    if (user.role === 'OWNER') {
      return next();
    }

    if (requiredScopes.length === 0) {
      return next(new AppError('Permission scope not configured', 500, 'INTERNAL_SERVER_ERROR'));
    }

    try {
      const permissions = await loadUserPermissionScopes(user.id);
      const allowed = requiredScopes.some((scope) => permissions.includes(scope));
      if (!allowed) {
        return next(
          new AppError(
            `Access denied. Required scope: [${requiredScopes.join(' | ')}]`,
            403,
            'FORBIDDEN_PRIVILEGES'
          )
        );
      }
      next();
    } catch (error: any) {
      if (error instanceof AppError) return next(error);
      logger.error(`RBAC error: ${error.message}`);
      return next(new AppError('Security verification failed', 500, 'INTERNAL_SERVER_ERROR'));
    }
  };
};

/**
 * Block restaurant-tenant users when subscription is missing/expired or tenant is suspended.
 * SUPER_ADMIN bypasses (platform operator).
 */
export const requireActiveSubscription = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Authentication context required', 401, 'UNAUTHORIZED'));
    }
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }
    const tenantId = req.tenantId || req.user.tenantId;
    if (!tenantId) {
      return next(new AppError('Tenant context required', 400, 'TENANT_CONTEXT_MISSING'));
    }
    await assertTenantAccessAllowed(tenantId);
    return next();
  } catch (error: any) {
    if (error instanceof AppError) return next(error);
    logger.error(`Subscription gate error: ${error.message}`);
    return next(new AppError('Subscription verification failed', 500, 'INTERNAL_SERVER_ERROR'));
  }
};

/**
 * Enforce SaaS plan feature flags for restaurant tenants.
 * SUPER_ADMIN bypasses (platform operator). Requires tenant context on the request.
 */
export const requireFeature = (...featureKeys: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (req.user?.role === 'SUPER_ADMIN') {
        return next();
      }

      const tenantId = req.tenantId || req.user?.tenantId;
      if (!tenantId) {
        return next(new AppError('Tenant context required for plan features', 400, 'TENANT_CONTEXT_MISSING'));
      }

      if (featureKeys.length === 0) {
        return next(new AppError('Feature key not configured', 500, 'INTERNAL_SERVER_ERROR'));
      }

      for (const key of featureKeys) {
        await assertFeatureEnabled(tenantId, key);
      }
      return next();
    } catch (error: any) {
      if (error instanceof AppError) return next(error);
      logger.error(`Feature gate error: ${error.message}`);
      return next(new AppError('Feature verification failed', 500, 'INTERNAL_SERVER_ERROR'));
    }
  };
};

/**
 * Resolve tenant when X-Tenant-ID / DEFAULT_TENANT_ID is present; otherwise continue.
 * Used for login so global SUPER_ADMIN can authenticate without a restaurant header.
 */
export const optionalResolveTenant = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.tenantId) {
      return next();
    }

    const headerRaw = req.headers['x-tenant-id'];
    const headerTenantId = Array.isArray(headerRaw) ? headerRaw[0] : headerRaw;
    const candidate = (headerTenantId || env.defaultTenantId || '').trim();

    if (!candidate) {
      return next();
    }

    if (!UUID_RE.test(candidate)) {
      return next(new AppError('Invalid X-Tenant-ID format', 400, 'INVALID_TENANT_ID'));
    }

    const tenant = await prisma.tenant.findFirst({
      where: { id: candidate, deletedAt: null },
      select: { id: true },
    });

    if (!tenant) {
      return next(new AppError('Tenant not found', 404, 'TENANT_NOT_FOUND'));
    }

    req.tenantId = tenant.id;
    next();
  } catch (error: any) {
    logger.error(`Optional tenant resolution failed: ${error.message}`);
    return next(new AppError('Tenant resolution failed', 500, 'INTERNAL_SERVER_ERROR'));
  }
};
