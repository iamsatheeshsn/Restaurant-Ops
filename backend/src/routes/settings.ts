import { Router, Response, NextFunction } from 'express';
import { getSettings, updateSettings } from '../controllers/settings';
import { authenticateJWT, requirePermission, resolveTenant, AuthRequest } from '../middleware/auth';

const router = Router();

/**
 * GET settings:
 * - Super Admin (no tenant): platform admin-panel branding
 * - Authenticated staff with tenant: that restaurant's settings
 * - Public / unauthenticated: resolve tenant from X-Tenant-ID / DEFAULT_TENANT_ID
 */
router.get('/', (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authenticateJWT(req, res, (err?: any) => {
      if (err) return next(err);
      if (req.user?.role === 'SUPER_ADMIN' && !req.user.tenantId) {
        return getSettings(req, res, next);
      }
      if (req.tenantId) {
        return getSettings(req, res, next);
      }
      return resolveTenant(req, res, (resolveErr?: any) => {
        if (resolveErr) return next(resolveErr);
        return getSettings(req, res, next);
      });
    });
  }
  return resolveTenant(req, res, (resolveErr?: any) => {
    if (resolveErr) return next(resolveErr);
    return getSettings(req, res, next);
  });
});

router.put('/', authenticateJWT, requirePermission('settings:write'), updateSettings);

export default router;
