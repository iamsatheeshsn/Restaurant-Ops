import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { parsePagination, paginatedResponse } from '../utils/pagination';
import { Prisma } from '@prisma/client';

// --- Event Booking & Catering Management ---

export const getEventBookings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const where = { tenantId };
    const [bookings, total] = await Promise.all([
      prisma.eventBooking.findMany({
        where,
        include: { branch: true },
        orderBy: { eventDate: 'asc' },
        skip,
        take: limit,
      }),
      prisma.eventBooking.count({ where }),
    ]);
    return res.json(paginatedResponse(bookings, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const createEventBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { branchId, title, customerName, customerPhone, guestCount, eventDate, cateringDetails, totalCost } = req.body;
  const tenantId = req.tenantId!;
  try {
    const booking = await prisma.eventBooking.create({
      data: {
        tenantId,
        branchId,
        title,
        customerName,
        customerPhone,
        guestCount: parseInt(guestCount) || 10,
        eventDate: new Date(eventDate),
        cateringDetails,
        totalCost: new Prisma.Decimal(totalCost || 0.00),
        status: 'PENDING'
      }
    });
    return res.status(201).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

export const updateEventBookingStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { status } = req.body;
  const tenantId = req.tenantId!;
  try {
    const booking = await prisma.eventBooking.findFirst({ where: { id, tenantId } });
    if (!booking) return next(new AppError('Event Booking not found', 404, 'RESOURCE_NOT_FOUND'));

    const updated = await prisma.eventBooking.update({
      where: { id },
      data: { status }
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// --- Nutrition Configurator ---

export const getNutritionInfo = async (req: Request, res: Response, next: NextFunction) => {
  const { menuItemId } = req.params;
  try {
    const info = await prisma.nutritionInfo.findUnique({
      where: { menuItemId }
    });
    return res.json({ success: true, data: info });
  } catch (error) {
    next(error);
  }
};

export const updateNutritionInfo = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { menuItemId } = req.params;
  const { calories, allergens, protein, carbs, fat } = req.body;
  try {
    const info = await prisma.nutritionInfo.upsert({
      where: { menuItemId },
      update: {
        calories: parseInt(calories) || 0,
        allergens,
        protein: new Prisma.Decimal(protein || 0.0),
        carbs: new Prisma.Decimal(carbs || 0.0),
        fat: new Prisma.Decimal(fat || 0.0)
      },
      create: {
        menuItemId,
        calories: parseInt(calories) || 0,
        allergens,
        protein: new Prisma.Decimal(protein || 0.0),
        carbs: new Prisma.Decimal(carbs || 0.0),
        fat: new Prisma.Decimal(fat || 0.0)
      }
    });
    return res.json({ success: true, data: info });
  } catch (error) {
    next(error);
  }
};

// --- Central Kitchen & Manufacturing Batches ---

export const getProductionBatches = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const where = { tenantId };
    const [batches, total] = await Promise.all([
      prisma.productionBatch.findMany({
        where,
        include: { branch: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.productionBatch.count({ where }),
    ]);
    return res.json(paginatedResponse(batches, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const createProductionBatch = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { branchId, recipeId, name, batchQty } = req.body;
  const tenantId = req.tenantId!;
  try {
    const batch = await prisma.productionBatch.create({
      data: {
        tenantId,
        branchId, // Central Kitchen Branch
        recipeId,
        name,
        batchQty: new Prisma.Decimal(batchQty),
        status: 'PENDING'
      }
    });
    return res.status(201).json({ success: true, data: batch });
  } catch (error) {
    next(error);
  }
};

export const updateProductionBatchStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { status } = req.body;
  const tenantId = req.tenantId!;
  try {
    const batch = await prisma.productionBatch.findFirst({ where: { id, tenantId } });
    if (!batch) return next(new AppError('Production Batch not found', 404, 'RESOURCE_NOT_FOUND'));

    const updated = await prisma.productionBatch.update({
      where: { id },
      data: { status }
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};
