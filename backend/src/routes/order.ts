import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getTables
} from '../controllers/order';
import { validateOrder } from '../validators/order';
import { authenticateJWT, requireActiveSubscription, requirePermission, requireAnyPermission, resolveTenant, requireFeature } from '../middleware/auth';

const router = Router();

// Table layout routing
router.get('/tables', resolveTenant, getTables);

// KDS Orders routing
router.post('/', resolveTenant, validateOrder, createOrder);
router.get('/', authenticateJWT, requireActiveSubscription, requireAnyPermission('orders:kds', 'orders:checkout'), requireFeature('kds'), getOrders);
router.get('/:id', resolveTenant, getOrderById);
router.put('/:id/status', authenticateJWT, requireActiveSubscription, requireAnyPermission('orders:kds', 'orders:checkout'), requireFeature('kds'), updateOrderStatus);

export default router;
