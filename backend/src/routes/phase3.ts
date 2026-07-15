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
import { authenticateJWT, requireActiveSubscription, resolveTenant, requirePermission, requireAnyPermission, requireFeature } from '../middleware/auth';

const router = Router();

// Event & Catering Management
router.get('/events', authenticateJWT, requireActiveSubscription, requireAnyPermission('catering:manage', 'menu:read'), requireFeature('catering'), getEventBookings);
router.post('/events', authenticateJWT, requireActiveSubscription, requirePermission('catering:manage'), requireFeature('catering'), createEventBooking);
router.put('/events/:id/status', authenticateJWT, requireActiveSubscription, requirePermission('catering:manage'), requireFeature('catering'), updateEventBookingStatus);

// Nutrition Settings
router.get('/nutrition/:menuItemId', resolveTenant, getNutritionInfo);
router.put('/nutrition/:menuItemId', authenticateJWT, requireActiveSubscription, requireAnyPermission('menu:write', 'catering:manage'), updateNutritionInfo);

// Central Kitchen Manufacturing
router.get('/production', authenticateJWT, requireActiveSubscription, requireAnyPermission('catering:manage', 'menu:read'), requireFeature('catering'), getProductionBatches);
router.post('/production', authenticateJWT, requireActiveSubscription, requirePermission('catering:manage'), requireFeature('catering'), createProductionBatch);
router.put('/production/:id/status', authenticateJWT, requireActiveSubscription, requirePermission('catering:manage'), requireFeature('catering'), updateProductionBatchStatus);

export default router;
