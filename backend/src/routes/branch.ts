import { Router } from 'express';
import { getBranches, createBranch, updateBranch, deleteBranch } from '../controllers/branch';
import { authenticateJWT, requirePermission, resolveTenant } from '../middleware/auth';

const router = Router();

router.get('/', resolveTenant, getBranches);
router.post('/', authenticateJWT, requirePermission('branch:manage'), createBranch);
router.put('/:id', authenticateJWT, requirePermission('branch:manage'), updateBranch);
router.delete('/:id', authenticateJWT, requirePermission('branch:manage'), deleteBranch);

export default router;
