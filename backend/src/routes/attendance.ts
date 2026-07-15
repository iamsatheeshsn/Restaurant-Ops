import { Router } from 'express';
import { clockIn, clockOut, getClockStatus, getAttendanceLogs, createManualAttendance } from '../controllers/attendance';
import { authenticateJWT, requireActiveSubscription, requirePermission } from '../middleware/auth';

const router = Router();

router.post('/clock-in', authenticateJWT, requireActiveSubscription, requirePermission('attendance:clock'), clockIn);
router.post('/clock-out', authenticateJWT, requireActiveSubscription, requirePermission('attendance:clock'), clockOut);
// Status readable by any authenticated staff (UI clock widget); mutations still require attendance:clock
router.get('/status', authenticateJWT, requireActiveSubscription, getClockStatus);
router.post('/manual', authenticateJWT, requireActiveSubscription, requirePermission('attendance:read'), createManualAttendance);
router.get('/', authenticateJWT, requireActiveSubscription, requirePermission('attendance:read'), getAttendanceLogs);

export default router;