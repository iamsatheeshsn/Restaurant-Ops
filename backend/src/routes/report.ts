import { Router } from 'express';
import { getReports } from '../controllers/report';
import { authenticateJWT, requireActiveSubscription, requirePermission, requireFeature } from '../middleware/auth';

const router = Router();

router.get('/', authenticateJWT, requireActiveSubscription, requirePermission('reports:read'), requireFeature('advanced_reports'), getReports);

export default router;
