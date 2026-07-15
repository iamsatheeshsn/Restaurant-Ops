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
import { authenticateJWT, requireActiveSubscription, requirePermission, requireAnyPermission } from '../middleware/auth';

const router = Router();

// Floors — organization layout (branch managers)
router.get('/floors', authenticateJWT, requireActiveSubscription, getFloors);
router.post('/floors', authenticateJWT, requireActiveSubscription, requirePermission('branch:manage'), createFloor);
router.put('/floors/:id', authenticateJWT, requireActiveSubscription, requirePermission('branch:manage'), updateFloor);
router.delete('/floors/:id', authenticateJWT, requireActiveSubscription, requirePermission('branch:manage'), deleteFloor);

// Tables — seating floorplan (branch managers OR front-of-house tables:manage)
router.get('/tables', authenticateJWT, requireActiveSubscription, getTables);
router.post('/tables', authenticateJWT, requireActiveSubscription, requireAnyPermission('tables:manage', 'branch:manage'), createTable);
router.put('/tables/:id', authenticateJWT, requireActiveSubscription, requireAnyPermission('tables:manage', 'branch:manage'), updateTable);
router.delete('/tables/:id', authenticateJWT, requireActiveSubscription, requireAnyPermission('tables:manage', 'branch:manage'), deleteTable);

// Kitchen Sections
router.get('/sections', authenticateJWT, requireActiveSubscription, getKitchenSections);
router.post('/sections', authenticateJWT, requireActiveSubscription, requirePermission('branch:manage'), createKitchenSection);
router.put('/sections/:id', authenticateJWT, requireActiveSubscription, requirePermission('branch:manage'), updateKitchenSection);
router.delete('/sections/:id', authenticateJWT, requireActiveSubscription, requirePermission('branch:manage'), deleteKitchenSection);

// Users routing (Employees)
router.get('/users', authenticateJWT, requireActiveSubscription, requirePermission('staff:manage'), getUsers);
router.post('/users', authenticateJWT, requireActiveSubscription, requirePermission('staff:manage'), createUser);
router.put('/users/:id', authenticateJWT, requireActiveSubscription, requirePermission('staff:manage'), updateUser);
router.delete('/users/:id', authenticateJWT, requireActiveSubscription, requirePermission('staff:manage'), deleteUser);

export default router;
