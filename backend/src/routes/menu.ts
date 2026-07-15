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
import { authenticateJWT, requirePermission, resolveTenant } from '../middleware/auth';

const router = Router();

// Category Routes
router.post('/categories', authenticateJWT, requirePermission('menu:write'), validateCategory, createCategory);
router.get('/categories', resolveTenant, getCategories);
router.delete('/categories/:id', authenticateJWT, requirePermission('menu:write'), deleteCategory);

// Menu Item Routes
router.post('/items', authenticateJWT, requirePermission('menu:write'), validateMenuItem, createMenuItem);
router.post('/items/upload', authenticateJWT, requirePermission('menu:write'), uploadMenuItemImage);
router.get('/items', resolveTenant, getMenuItems);
router.get('/items/:id', resolveTenant, getMenuItemById);
router.put('/items/:id', authenticateJWT, requirePermission('menu:write'), validateMenuItem, updateMenuItem);
router.delete('/items/:id', authenticateJWT, requirePermission('menu:write'), deleteMenuItem);

export default router;
