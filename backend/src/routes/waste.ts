import { Router } from 'express';
import { logWaste, getWasteLogs } from '../controllers/waste';
import { validateWasteLog } from '../validators/waste';
import { authenticateJWT, requirePermission, requireAnyPermission } from '../middleware/auth';

const router = Router();

router.post('/', authenticateJWT, requirePermission('waste:write'), validateWasteLog, logWaste);
router.get('/', authenticateJWT, requireAnyPermission('waste:write', 'waste:approve'), getWasteLogs);

export default router;
