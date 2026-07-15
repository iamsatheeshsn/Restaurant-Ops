import { Router } from 'express';
import {
  createCategory,
  getCategories,
  deleteCategory,
  createMenuItem,
  getMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
  uploadMenuItemImage
} from '../controllers/menu';
import { validateCategory, validateMenuItem } from '../validators/menu';
import { authenticateJWT, requireActiveSubscription, requirePermission, resolveTenant } from '../middleware/auth';

const router = Router();

// Category Routes
router.post('/categories', authenticateJWT, requireActiveSubscription, requirePermission('menu:write'), validateCategory, createCategory);
router.get('/categories', resolveTenant, getCategories);
router.delete('/categories/:id', authenticateJWT, requireActiveSubscription, requirePermission('menu:write'), deleteCategory);

// Menu Item Routes
router.post('/items', authenticateJWT, requireActiveSubscription, requirePermission('menu:write'), validateMenuItem, createMenuItem);
router.post('/items/upload', authenticateJWT, requireActiveSubscription, requirePermission('menu:write'), uploadMenuItemImage);
router.get('/items', resolveTenant, getMenuItems);
router.get('/items/:id', resolveTenant, getMenuItemById);
router.put('/items/:id', authenticateJWT, requireActiveSubscription, requirePermission('menu:write'), validateMenuItem, updateMenuItem);
router.delete('/items/:id', authenticateJWT, requireActiveSubscription, requirePermission('menu:write'), deleteMenuItem);

export default router;
