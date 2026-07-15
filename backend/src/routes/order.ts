import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  getTables
} from '../controllers/order';
import { validateOrder } from '../validators/order';
import { authenticateJWT, requirePermission, requireAnyPermission, resolveTenant } from '../middleware/auth';

const router = Router();

// Table layout routing
router.get('/tables', resolveTenant, getTables);

// KDS Orders routing
router.post('/', resolveTenant, validateOrder, createOrder);
router.get('/', authenticateJWT, requireAnyPermission('orders:kds', 'orders:checkout'), getOrders);
router.get('/:id', resolveTenant, getOrderById);
router.put('/:id/status', authenticateJWT, requireAnyPermission('orders:kds', 'orders:checkout'), updateOrderStatus);

export default router;
