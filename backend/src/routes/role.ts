import { Router } from 'express';
import { getRoles, getPermissions, createRole, updateRole, deleteRole } from '../controllers/role';
import { authenticateJWT, requireActiveSubscription, requirePermission } from '../middleware/auth';

const router = Router();

// Secure role management endpoints to require staff:manage permission (Super Admin & Owners)
router.get('/', authenticateJWT, requireActiveSubscription, requirePermission('staff:manage'), getRoles);
router.get('/permissions', authenticateJWT, requireActiveSubscription, requirePermission('staff:manage'), getPermissions);
router.post('/', authenticateJWT, requireActiveSubscription, requirePermission('staff:manage'), createRole);
router.put('/:id', authenticateJWT, requireActiveSubscription, requirePermission('staff:manage'), updateRole);
router.delete('/:id', authenticateJWT, requireActiveSubscription, requirePermission('staff:manage'), deleteRole);

export default router;
