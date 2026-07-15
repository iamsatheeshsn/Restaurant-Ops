import { Router } from 'express';
import { getBranches, createBranch, updateBranch, deleteBranch } from '../controllers/branch';
import { authenticateJWT, requireActiveSubscription, requirePermission, resolveTenant } from '../middleware/auth';

const router = Router();

router.get('/', resolveTenant, getBranches);
router.post('/', authenticateJWT, requireActiveSubscription, requirePermission('branch:manage'), createBranch);
router.put('/:id', authenticateJWT, requireActiveSubscription, requirePermission('branch:manage'), updateBranch);
router.delete('/:id', authenticateJWT, requireActiveSubscription, requirePermission('branch:manage'), deleteBranch);

export default router;
