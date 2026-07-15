import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { parsePagination, paginatedResponse } from '../utils/pagination';
import { Prisma } from '@prisma/client';

// --- Reservations & Booking ---

export const createReservation = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  const { customerName, customerEmail, customerPhone, partySize, reservationTime, notes, tableId } = req.body;

  try {
    const reservation = await prisma.reservation.create({
      data: {
        tenantId,
        customerName,
        customerEmail,
        customerPhone,
        partySize: parseInt(partySize) || 2,
        reservationTime: new Date(reservationTime),
        notes,
        tableId
      }
    });

    return res.status(201).json({
      success: true,
      data: reservation
    });
  } catch (error) {
    next(error);
  }
};

export const getReservations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;

  try {
    const { page, limit, skip } = parsePagination(req.query);
    const where = { tenantId };
    const [reservations, total] = await Promise.all([
      prisma.reservation.findMany({
        where,
        include: { table: true },
        orderBy: { reservationTime: 'asc' },
        skip,
        take: limit,
      }),
      prisma.reservation.count({ where }),
    ]);

    return res.json(paginatedResponse(reservations, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const updateReservationStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { status, tableId } = req.body;
  const tenantId = req.tenantId!;

  try {
    const reservation = await prisma.reservation.findFirst({
      where: { id, tenantId }
    });

    if (!reservation) {
      return next(new AppError('Reservation not found', 404, 'RESOURCE_NOT_FOUND'));
    }

    const updated = await prisma.reservation.update({
      where: { id },
      data: {
        status: status || reservation.status,
        tableId: tableId !== undefined ? tableId : reservation.tableId
      }
    });

    return res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// --- Waiting List ---

export const getWaitingList = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;

  try {
    const { page, limit, skip } = parsePagination(req.query);
    const where = { tenantId, status: 'WAITING' as const };
    const [waitlist, total] = await Promise.all([
      prisma.waitingList.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      prisma.waitingList.count({ where }),
    ]);

    return res.json(paginatedResponse(waitlist, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const addToWaitingList = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { customerName, customerPhone, partySize } = req.body;
  const tenantId = req.tenantId!;

  try {
    const wait = await prisma.waitingList.create({
      data: {
        tenantId,
        customerName,
        customerPhone,
        partySize: parseInt(partySize) || 2,
        status: 'WAITING'
      }
    });

    return res.status(201).json({
      success: true,
      data: wait
    });
  } catch (error) {
    next(error);
  }
};

export const updateWaitingListStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { status } = req.body;
  const tenantId = req.tenantId!;

  try {
    const wait = await prisma.waitingList.findFirst({
      where: { id, tenantId }
    });

    if (!wait) {
      return next(new AppError('Waitlist entry not found', 404, 'RESOURCE_NOT_FOUND'));
    }

    const updated = await prisma.waitingList.update({
      where: { id },
      data: { status }
    });

    return res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// --- CRM & Customer Loyalty Profiles ---

export const getCustomerProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user!.id;

  try {
    let profile = await prisma.customerProfile.findUnique({
      where: { userId }
    });

    if (!profile) {
      // Auto-create a default CRM profile if none exists
      profile = await prisma.customerProfile.create({
        data: {
          userId,
          pointsBalance: 150, // default reward points
          membershipTier: 'SILVER',
          walletBalance: new Prisma.Decimal(10.00) // default wallet bonus
        }
      });
    }

    return res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

export const updateCustomerProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const userId = req.user!.id;
  const { birthday, favoriteFood } = req.body;

  try {
    const profile = await prisma.customerProfile.upsert({
      where: { userId },
      update: {
        birthday: birthday ? new Date(birthday) : undefined,
        favoriteFood
      },
      create: {
        userId,
        birthday: birthday ? new Date(birthday) : null,
        favoriteFood,
        pointsBalance: 150,
        membershipTier: 'SILVER',
        walletBalance: new Prisma.Decimal(10.00)
      }
    });

    return res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

// --- Coupons & Promos ---

export const getCoupons = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;

  try {
    const { page, limit, skip } = parsePagination(req.query);
    const where = { tenantId, isActive: true };
    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.coupon.count({ where }),
    ]);

    return res.json(paginatedResponse(coupons, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const createCoupon = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { code, discountType, value, minOrderAmount, expiryDate } = req.body;
  const tenantId = req.tenantId!;

  try {
    const coupon = await prisma.coupon.create({
      data: {
        tenantId,
        code: code.toUpperCase(),
        discountType,
        value: new Prisma.Decimal(value),
        minOrderAmount: minOrderAmount ? new Prisma.Decimal(minOrderAmount) : 0.00,
        expiryDate: expiryDate ? new Date(expiryDate) : null
      }
    });

    return res.status(201).json({
      success: true,
      data: coupon
    });
  } catch (error) {
    next(error);
  }
};

// --- Gift Cards ---

export const getGiftCards = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;

  try {
    const { page, limit, skip } = parsePagination(req.query);
    const where = { tenantId, isActive: true };
    const [cards, total] = await Promise.all([
      prisma.giftCard.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.giftCard.count({ where }),
    ]);

    return res.json(paginatedResponse(cards, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const createGiftCard = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { code, balance, expiryDate } = req.body;
  const tenantId = req.tenantId!;

  try {
    const card = await prisma.giftCard.create({
      data: {
        tenantId,
        code: code.toUpperCase(),
        balance: new Prisma.Decimal(balance),
        expiryDate: expiryDate ? new Date(expiryDate) : null
      }
    });

    return res.status(201).json({
      success: true,
      data: card
    });
  } catch (error) {
    next(error);
  }
};
