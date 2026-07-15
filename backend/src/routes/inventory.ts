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
  authenticateJWT,
  authenticateSupplier,
  requirePermission,
  requireAnyPermission,
  resolveTenant,
} from '../middleware/auth';

const router = Router();

// Ingredient Routing
router.post('/ingredients', authenticateJWT, requirePermission('inventory:write'), validateIngredient, createIngredient);
// List: kitchen (menu:read) OR inventory roles
router.get(
  '/ingredients',
  authenticateJWT,
  requireAnyPermission('menu:read', 'inventory:write', 'inventory:adjust'),
  getIngredients
);
router.put('/ingredients/:id', authenticateJWT, requirePermission('inventory:write'), validateIngredient, updateIngredient);
router.delete('/ingredients/:id', authenticateJWT, requirePermission('inventory:write'), deleteIngredient);

// Supplier Routing
router.post('/suppliers', authenticateJWT, requirePermission('po:manage'), validateSupplier, createSupplier);
router.get('/suppliers', authenticateJWT, requireAnyPermission('po:manage', 'po:approve'), getSuppliers);
router.put('/suppliers/:id', authenticateJWT, requirePermission('po:manage'), validateSupplier, updateSupplier);
router.delete('/suppliers/:id', authenticateJWT, requirePermission('po:manage'), deleteSupplier);

// Purchase Order Routing
router.post('/purchase-orders', authenticateJWT, requirePermission('po:manage'), validatePurchaseOrder, createPurchaseOrder);
router.get('/purchase-orders', authenticateJWT, requireAnyPermission('po:manage', 'po:approve'), getPurchaseOrders);
router.put(
  '/purchase-orders/:id/status',
  authenticateJWT,
  requireAnyPermission('po:manage', 'po:approve'),
  updatePOStatus
);

// Supplier Portal — login issues JWT; PO routes require authenticateSupplier
router.post('/supplier/login', resolveTenant, supplierPortalLogin);
router.get('/supplier/purchase-orders', authenticateSupplier, getSupplierPurchaseOrders);
router.put('/purchase-orders/:id/supplier-status', authenticateSupplier, updateSupplierPOStatus);

// Stock Adjustments
router.post('/adjust', authenticateJWT, requirePermission('inventory:adjust'), validateAdjustment, logStockAdjustment);

export default router;
