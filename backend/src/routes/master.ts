import { Router } from 'express';
import {
  getFloors,
  createFloor,
  updateFloor,
  deleteFloor,
  getTables,
  createTable,
  updateTable,
  deleteTable,
  getKitchenSections,
  createKitchenSection,
  updateKitchenSection,
  deleteKitchenSection,
  getUsers,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/master';
import { authenticateJWT, requirePermission, requireAnyPermission } from '../middleware/auth';

const router = Router();

// Floors — organization layout (branch managers)
router.get('/floors', authenticateJWT, getFloors);
router.post('/floors', authenticateJWT, requirePermission('branch:manage'), createFloor);
router.put('/floors/:id', authenticateJWT, requirePermission('branch:manage'), updateFloor);
router.delete('/floors/:id', authenticateJWT, requirePermission('branch:manage'), deleteFloor);

// Tables — seating floorplan (branch managers OR front-of-house tables:manage)
router.get('/tables', authenticateJWT, getTables);
router.post('/tables', authenticateJWT, requireAnyPermission('tables:manage', 'branch:manage'), createTable);
router.put('/tables/:id', authenticateJWT, requireAnyPermission('tables:manage', 'branch:manage'), updateTable);
router.delete('/tables/:id', authenticateJWT, requireAnyPermission('tables:manage', 'branch:manage'), deleteTable);

// Kitchen Sections
router.get('/sections', authenticateJWT, getKitchenSections);
router.post('/sections', authenticateJWT, requirePermission('branch:manage'), createKitchenSection);
router.put('/sections/:id', authenticateJWT, requirePermission('branch:manage'), updateKitchenSection);
router.delete('/sections/:id', authenticateJWT, requirePermission('branch:manage'), deleteKitchenSection);

// Users routing (Employees)
router.get('/users', authenticateJWT, requirePermission('staff:manage'), getUsers);
router.post('/users', authenticateJWT, requirePermission('staff:manage'), createUser);
router.put('/users/:id', authenticateJWT, requirePermission('staff:manage'), updateUser);
router.delete('/users/:id', authenticateJWT, requirePermission('staff:manage'), deleteUser);

export default router;
