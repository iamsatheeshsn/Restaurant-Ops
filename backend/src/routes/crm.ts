import { Router } from 'express';
import {
  createReservation,
  getReservations,
  updateReservationStatus,
  getWaitingList,
  addToWaitingList,
  updateWaitingListStatus,
  getCustomerProfile,
  updateCustomerProfile,
  getCoupons,
  createCoupon,
  getGiftCards,
  createGiftCard
} from '../controllers/crm';
import { authenticateJWT, requirePermission, resolveTenant } from '../middleware/auth';

const router = Router();

// Public/Guest Reservation booking
router.post('/reservations/book', resolveTenant, createReservation);

// Authenticated Staff/Admin Management routes
router.get('/reservations', authenticateJWT, requirePermission('crm:manage'), getReservations);
router.put('/reservations/:id/status', authenticateJWT, requirePermission('crm:manage'), updateReservationStatus);
router.get('/waiting-list', authenticateJWT, requirePermission('crm:manage'), getWaitingList);
router.post('/waiting-list', authenticateJWT, requirePermission('crm:manage'), addToWaitingList);
router.put('/waiting-list/:id', authenticateJWT, requirePermission('crm:manage'), updateWaitingListStatus);

// CRM customer Profile
router.get('/loyalty/profile', authenticateJWT, getCustomerProfile);
router.put('/loyalty/profile', authenticateJWT, updateCustomerProfile);

// Promo Coupons
router.get('/loyalty/coupons', authenticateJWT, requirePermission('loyalty:manage'), getCoupons);
router.post('/loyalty/coupons', authenticateJWT, requirePermission('loyalty:manage'), createCoupon);

// Gift Cards
router.get('/loyalty/gift-cards', authenticateJWT, requirePermission('loyalty:manage'), getGiftCards);
router.post('/loyalty/gift-cards', authenticateJWT, requirePermission('loyalty:manage'), createGiftCard);

export default router;
