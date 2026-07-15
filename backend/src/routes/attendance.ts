import { Router } from 'express';
import { clockIn, clockOut, getClockStatus, getAttendanceLogs, createManualAttendance } from '../controllers/attendance';
import { authenticateJWT, requirePermission } from '../middleware/auth';

const router = Router();

router.post('/clock-in', authenticateJWT, requirePermission('attendance:clock'), clockIn);
router.post('/clock-out', authenticateJWT, requirePermission('attendance:clock'), clockOut);
// Status readable by any authenticated staff (UI clock widget); mutations still require attendance:clock
router.get('/status', authenticateJWT, getClockStatus);
router.post('/manual', authenticateJWT, requirePermission('attendance:read'), createManualAttendance);
router.get('/', authenticateJWT, requirePermission('attendance:read'), getAttendanceLogs);

export default router;
