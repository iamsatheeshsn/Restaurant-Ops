import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { parsePagination, paginatedResponse } from '../utils/pagination';
import { Prisma } from '@prisma/client';

export const logWaste = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { branchId, ingredientId, quantity, reason } = req.body;
  const tenantId = req.tenantId!;
  const employeeId = req.user!.id;

  try {
    // 1. Verify ingredient exists under tenant
    const ingredient = await prisma.ingredient.findFirst({
      where: { id: ingredientId, tenantId, deletedAt: null }
    });

    if (!ingredient) {
      return next(new AppError('Ingredient not found', 404, 'RESOURCE_NOT_FOUND'));
    }

    const qty = new Prisma.Decimal(quantity);
    if (ingredient.stockLevel.lessThan(qty)) {
      return next(new AppError(`Insufficient stock. Available: ${ingredient.stockLevel} ${ingredient.unit}`, 400, 'INSUFFICIENT_STOCK'));
    }

    // 2. Fetch last purchase unit price to compute exact financial loss
    const lastPoItem = await prisma.purchaseOrderItem.findFirst({
      where: {
        ingredientId,
        purchaseOrder: {
          tenantId,
          status: 'DELIVERED'
        }
      },
      orderBy: { purchaseOrder: { createdAt: 'desc' } }
    });

    const unitPrice = lastPoItem ? lastPoItem.unitPrice : new Prisma.Decimal(1.00); // fallback unit price
    const cost = qty.times(unitPrice);

    // 3. Run database transaction: log waste, update stock level, create movement
    const result = await prisma.$transaction(async (tx) => {
      const waste = await tx.wasteLog.create({
        data: {
          tenantId,
          branchId,
          ingredientId,
          quantity: qty,
          cost,
          reason,
          employeeId
        },
        include: {
          ingredient: true,
          employee: {
            select: { name: true }
          }
        }
      });

      // Decrement stock
      await tx.ingredient.update({
        where: { id: ingredientId },
        data: {
          stockLevel: { decrement: qty }
        }
      });

      // Log movement
      await tx.stockMovement.create({
        data: {
          tenantId,
          branchId,
          ingredientId,
          quantity: qty,
          type: 'WASTE',
          reason: `Waste logged: ${reason}`,
          createdById: employeeId
        }
      });

      return waste;
    });

    return res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getWasteLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  const { branchId } = req.query;

  try {
    const { page, limit, skip } = parsePagination(req.query);
    const where = {
      tenantId,
      ...(branchId ? { branchId: branchId as string } : {})
    };
    const [logs, total] = await Promise.all([
      prisma.wasteLog.findMany({
        where,
        include: {
          ingredient: true,
          employee: {
            select: { name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.wasteLog.count({ where }),
    ]);

    return res.json(paginatedResponse(logs, total, page, limit));
  } catch (error) {
    next(error);
  }
};
