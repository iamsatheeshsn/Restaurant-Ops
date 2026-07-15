import { Router } from 'express';
import {
  createIngredient,
  getIngredients,
  updateIngredient,
  deleteIngredient,
  createSupplier,
  getSuppliers,
  updateSupplier,
  deleteSupplier,
  createPurchaseOrder,
  getPurchaseOrders,
  updatePOStatus,
  logStockAdjustment,
  supplierPortalLogin,
  getSupplierPurchaseOrders,
  updateSupplierPOStatus
} from '../controllers/inventory';
import {
  validateIngredient,
  validateSupplier,
  validatePurchaseOrder,
  validateAdjustment
} from '../validators/inventory';
import {
  authenticateJWT, requireActiveSubscription,
  authenticateSupplier,
  requirePermission,
  requireAnyPermission,
  resolveTenant,
  requireFeature,
} from '../middleware/auth';

const router = Router();

// Ingredient Routing
router.post('/ingredients', authenticateJWT, requireActiveSubscription, requirePermission('inventory:write'), requireFeature('inventory'), validateIngredient, createIngredient);
// List: kitchen (menu:read) OR inventory roles
router.get(
  '/ingredients',
  authenticateJWT, requireActiveSubscription,
  requireAnyPermission('menu:read', 'inventory:write', 'inventory:adjust'),
  requireFeature('inventory'),
  getIngredients
);
router.put('/ingredients/:id', authenticateJWT, requireActiveSubscription, requirePermission('inventory:write'), requireFeature('inventory'), validateIngredient, updateIngredient);
router.delete('/ingredients/:id', authenticateJWT, requireActiveSubscription, requirePermission('inventory:write'), requireFeature('inventory'), deleteIngredient);

// Supplier Routing
router.post('/suppliers', authenticateJWT, requireActiveSubscription, requirePermission('po:manage'), requireFeature('inventory'), validateSupplier, createSupplier);
router.get('/suppliers', authenticateJWT, requireActiveSubscription, requireAnyPermission('po:manage', 'po:approve'), requireFeature('inventory'), getSuppliers);
router.put('/suppliers/:id', authenticateJWT, requireActiveSubscription, requirePermission('po:manage'), requireFeature('inventory'), validateSupplier, updateSupplier);
router.delete('/suppliers/:id', authenticateJWT, requireActiveSubscription, requirePermission('po:manage'), requireFeature('inventory'), deleteSupplier);

// Purchase Order Routing
router.post('/purchase-orders', authenticateJWT, requireActiveSubscription, requirePermission('po:manage'), requireFeature('inventory'), validatePurchaseOrder, createPurchaseOrder);
router.get('/purchase-orders', authenticateJWT, requireActiveSubscription, requireAnyPermission('po:manage', 'po:approve'), requireFeature('inventory'), getPurchaseOrders);
router.put(
  '/purchase-orders/:id/status',
  authenticateJWT, requireActiveSubscription,
  requireAnyPermission('po:manage', 'po:approve'),
  requireFeature('inventory'),
  updatePOStatus
);

// Supplier Portal — login issues JWT; PO routes require authenticateSupplier
router.post('/supplier/login', resolveTenant, supplierPortalLogin);
router.get('/supplier/purchase-orders', authenticateSupplier, getSupplierPurchaseOrders);
router.put('/purchase-orders/:id/supplier-status', authenticateSupplier, updateSupplierPOStatus);

// Stock Adjustments
router.post('/adjust', authenticateJWT, requireActiveSubscription, requirePermission('inventory:adjust'), requireFeature('inventory'), validateAdjustment, logStockAdjustment);

export default router;
