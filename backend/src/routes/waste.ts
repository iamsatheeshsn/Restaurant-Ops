import { Router } from 'express';
import { logWaste, getWasteLogs } from '../controllers/waste';
import { validateWasteLog } from '../validators/waste';
import { authenticateJWT, requireActiveSubscription, requirePermission, requireAnyPermission } from '../middleware/auth';

const router = Router();

router.post('/', authenticateJWT, requireActiveSubscription, requirePermission('waste:write'), validateWasteLog, logWaste);
router.get('/', authenticateJWT, requireActiveSubscription, requireAnyPermission('waste:write', 'waste:approve'), getWasteLogs);

export default router;
