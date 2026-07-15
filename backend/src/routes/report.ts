import { Router } from 'express';
import { getReports } from '../controllers/report';
import { authenticateJWT, requirePermission } from '../middleware/auth';

const router = Router();

router.get('/', authenticateJWT, requirePermission('reports:read'), getReports);

export default router;
