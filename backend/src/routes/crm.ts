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
import { authenticateJWT, requireActiveSubscription, requirePermission, resolveTenant, requireFeature } from '../middleware/auth';

const router = Router();

// Public/Guest Reservation booking
router.post('/reservations/book', resolveTenant, createReservation);

// Authenticated Staff/Admin Management routes
router.get('/reservations', authenticateJWT, requireActiveSubscription, requirePermission('crm:manage'), getReservations);
router.put('/reservations/:id/status', authenticateJWT, requireActiveSubscription, requirePermission('crm:manage'), updateReservationStatus);
router.get('/waiting-list', authenticateJWT, requireActiveSubscription, requirePermission('crm:manage'), getWaitingList);
router.post('/waiting-list', authenticateJWT, requireActiveSubscription, requirePermission('crm:manage'), addToWaitingList);
router.put('/waiting-list/:id', authenticateJWT, requireActiveSubscription, requirePermission('crm:manage'), updateWaitingListStatus);

// CRM customer Profile
router.get('/loyalty/profile', authenticateJWT, requireActiveSubscription, getCustomerProfile);
router.put('/loyalty/profile', authenticateJWT, requireActiveSubscription, updateCustomerProfile);

// Promo Coupons
router.get('/loyalty/coupons', authenticateJWT, requireActiveSubscription, requirePermission('loyalty:manage'), requireFeature('loyalty'), getCoupons);
router.post('/loyalty/coupons', authenticateJWT, requireActiveSubscription, requirePermission('loyalty:manage'), requireFeature('loyalty'), createCoupon);

// Gift Cards
router.get('/loyalty/gift-cards', authenticateJWT, requireActiveSubscription, requirePermission('loyalty:manage'), requireFeature('loyalty'), getGiftCards);
router.post('/loyalty/gift-cards', authenticateJWT, requireActiveSubscription, requirePermission('loyalty:manage'), requireFeature('loyalty'), createGiftCard);

export default router;
