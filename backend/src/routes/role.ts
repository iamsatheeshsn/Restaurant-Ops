import { Router } from 'express';
import { getRoles, getPermissions, createRole, updateRole, deleteRole } from '../controllers/role';
import { authenticateJWT, requirePermission } from '../middleware/auth';

const router = Router();

// Secure role management endpoints to require staff:manage permission (Super Admin & Owners)
router.get('/', authenticateJWT, requirePermission('staff:manage'), getRoles);
router.get('/permissions', authenticateJWT, requirePermission('staff:manage'), getPermissions);
router.post('/', authenticateJWT, requirePermission('staff:manage'), createRole);
router.put('/:id', authenticateJWT, requirePermission('staff:manage'), updateRole);
router.delete('/:id', authenticateJWT, requirePermission('staff:manage'), deleteRole);

export default router;
