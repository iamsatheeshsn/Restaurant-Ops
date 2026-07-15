import { Router } from 'express';
import {
  getEventBookings,
  createEventBooking,
  updateEventBookingStatus,
  getNutritionInfo,
  updateNutritionInfo,
  getProductionBatches,
  createProductionBatch,
  updateProductionBatchStatus
} from '../controllers/phase3';
import { authenticateJWT, resolveTenant, requirePermission, requireAnyPermission } from '../middleware/auth';

const router = Router();

// Event & Catering Management
router.get('/events', authenticateJWT, requireAnyPermission('catering:manage', 'menu:read'), getEventBookings);
router.post('/events', authenticateJWT, requirePermission('catering:manage'), createEventBooking);
router.put('/events/:id/status', authenticateJWT, requirePermission('catering:manage'), updateEventBookingStatus);

// Nutrition Settings
router.get('/nutrition/:menuItemId', resolveTenant, getNutritionInfo);
router.put('/nutrition/:menuItemId', authenticateJWT, requireAnyPermission('menu:write', 'catering:manage'), updateNutritionInfo);

// Central Kitchen Manufacturing
router.get('/production', authenticateJWT, requireAnyPermission('catering:manage', 'menu:read'), getProductionBatches);
router.post('/production', authenticateJWT, requirePermission('catering:manage'), createProductionBatch);
router.put('/production/:id/status', authenticateJWT, requirePermission('catering:manage'), updateProductionBatchStatus);

export default router;
