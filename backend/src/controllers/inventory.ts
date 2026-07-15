import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { parsePagination, paginatedResponse } from '../utils/pagination';
import { Prisma } from '@prisma/client';
import { signSupplierToken } from '../utils/jwt';

// --- Ingredient Handlers ---

export const createIngredient = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { name, unit, lowStockThreshold } = req.body;
  const tenantId = req.tenantId!;

  try {
    const existing = await prisma.ingredient.findFirst({
      where: { name, tenantId, deletedAt: null }
    });

    if (existing) {
      return next(new AppError('Ingredient with this name already exists', 400, 'INGREDIENT_EXISTS'));
    }

    const ingredient = await prisma.ingredient.create({
      data: {
        name,
        unit,
        lowStockThreshold: new Prisma.Decimal(lowStockThreshold),
        stockLevel: new Prisma.Decimal(0),
        tenantId
      }
    });

    return res.status(201).json({
      success: true,
      data: ingredient
    });
  } catch (error) {
    next(error);
  }
};

export const getIngredients = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;

  try {
    const { page, limit, skip } = parsePagination(req.query);
    const where = { tenantId, deletedAt: null };
    const [ingredients, total] = await Promise.all([
      prisma.ingredient.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.ingredient.count({ where }),
    ]);

    const mapped = ingredients.map(ing => ({
      ...ing,
      isLowStock: ing.stockLevel.lessThanOrEqualTo(ing.lowStockThreshold)
    }));

    return res.json(paginatedResponse(mapped, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const updateIngredient = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { name, unit, lowStockThreshold } = req.body;
  const tenantId = req.tenantId!;

  try {
    const ing = await prisma.ingredient.findFirst({
      where: { id, tenantId, deletedAt: null }
    });

    if (!ing) {
      return next(new AppError('Ingredient not found', 404, 'RESOURCE_NOT_FOUND'));
    }

    const updated = await prisma.ingredient.update({
      where: { id },
      data: {
        name,
        unit,
        lowStockThreshold: lowStockThreshold ? new Prisma.Decimal(lowStockThreshold) : undefined
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

export const deleteIngredient = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const tenantId = req.tenantId!;

  try {
    const ing = await prisma.ingredient.findFirst({
      where: { id, tenantId, deletedAt: null }
    });

    if (!ing) {
      return next(new AppError('Ingredient not found', 404, 'RESOURCE_NOT_FOUND'));
    }

    await prisma.ingredient.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// --- Supplier Handlers ---

export const createSupplier = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { name, contactName, phone, email } = req.body;
  const tenantId = req.tenantId!;

  try {
    const supplier = await prisma.supplier.create({
      data: {
        name,
        contactName,
        phone,
        email,
        tenantId
      }
    });

    return res.status(201).json({
      success: true,
      data: supplier
    });
  } catch (error) {
    next(error);
  }
};

export const getSuppliers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;

  try {
    const { page, limit, skip } = parsePagination(req.query);
    const where = { tenantId, deletedAt: null };
    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.supplier.count({ where }),
    ]);

    return res.json(paginatedResponse(suppliers, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const updateSupplier = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { name, contactName, phone, email } = req.body;
  const tenantId = req.tenantId!;

  try {
    const supplier = await prisma.supplier.findFirst({
      where: { id, tenantId, deletedAt: null }
    });

    if (!supplier) {
      return next(new AppError('Supplier not found', 404, 'RESOURCE_NOT_FOUND'));
    }

    const updated = await prisma.supplier.update({
      where: { id },
      data: { name, contactName, phone, email }
    });

    return res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSupplier = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const tenantId = req.tenantId!;

  try {
    const supplier = await prisma.supplier.findFirst({
      where: { id, tenantId, deletedAt: null }
    });

    if (!supplier) {
      return next(new AppError('Supplier not found', 404, 'RESOURCE_NOT_FOUND'));
    }

    await prisma.supplier.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// --- Purchase Order Handlers ---

export const createPurchaseOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { supplierId, items } = req.body;
  const tenantId = req.tenantId!;

  try {
    // 1. Verify supplier belongs to tenant
    const supplier = await prisma.supplier.findFirst({
      where: { id: supplierId, tenantId, deletedAt: null }
    });

    if (!supplier) {
      return next(new AppError('Invalid supplier selection', 400, 'RESOURCE_NOT_FOUND'));
    }

    // 2. Generate unique PO number and compute total amount
    const poNumber = `PO-${Date.now()}`;
    const totalAmount = items.reduce((sum: number, item: any) => {
      return sum + (parseFloat(item.orderedQty) * parseFloat(item.unitPrice));
    }, 0);

    const result = await prisma.$transaction(async (tx) => {
      const po = await tx.purchaseOrder.create({
        data: {
          tenantId,
          supplierId,
          poNumber,
          totalAmount: new Prisma.Decimal(totalAmount),
          status: 'DRAFT'
        }
      });

      await tx.purchaseOrderItem.createMany({
        data: items.map((it: any) => ({
          purchaseOrderId: po.id,
          ingredientId: it.ingredientId,
          orderedQty: new Prisma.Decimal(it.orderedQty),
          receivedQty: new Prisma.Decimal(0),
          unitPrice: new Prisma.Decimal(it.unitPrice)
        }))
      });

      return tx.purchaseOrder.findUnique({
        where: { id: po.id },
        include: {
          items: {
            include: {
              ingredient: true
            }
          },
          supplier: true
        }
      });
    });

    return res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const getPurchaseOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;

  try {
    const { page, limit, skip } = parsePagination(req.query);
    const where = { tenantId };
    const [pos, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: {
          supplier: true,
          items: {
            include: {
              ingredient: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.purchaseOrder.count({ where }),
    ]);

    return res.json(paginatedResponse(pos, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const updatePOStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { status, branchId } = req.body; // branchId is required if status is DELIVERED
  const tenantId = req.tenantId!;

  try {
    const po = await prisma.purchaseOrder.findFirst({
      where: { id, tenantId },
      include: { items: true }
    });

    if (!po) {
      return next(new AppError('Purchase order not found', 404, 'RESOURCE_NOT_FOUND'));
    }

    if (po.status === 'RETURNED') {
      return next(new AppError('Cannot update a purchase order that has already been returned', 400, 'INVALID_PO_STATUS'));
    }

    // If marking as delivered, trigger GRN restocking calculations
    if (status === 'DELIVERED') {
      if (po.status === 'DELIVERED' || po.status === 'PAID') {
        return next(new AppError('Purchase order has already been received/delivered', 400, 'INVALID_PO_STATUS'));
      }
      if (!branchId) {
        return next(new AppError('Branch selection (branchId) is required to receive inventory delivery', 400, 'INVALID_INPUT_BODY'));
      }

      // Verify branch exists under tenant
      const branch = await prisma.branch.findFirst({
        where: { id: branchId, tenantId, deletedAt: null }
      });
      if (!branch) {
        return next(new AppError('Invalid branch selection', 400, 'RESOURCE_NOT_FOUND'));
      }

      const updatedPo = await prisma.$transaction(async (tx) => {
        // 1. Update PO Status
        const updated = await tx.purchaseOrder.update({
          where: { id },
          data: { status: 'DELIVERED', branchId } as any
        });

        // 2. Loop items to increment stock level and log STOCK_IN movements
        for (const item of po.items) {
          // Increment ingredient stock
          await tx.ingredient.update({
            where: { id: item.ingredientId },
            data: {
              stockLevel: { increment: item.orderedQty }
            }
          });

          // Log stock movement
          await tx.stockMovement.create({
            data: {
              tenantId,
              branchId,
              ingredientId: item.ingredientId,
              quantity: item.orderedQty,
              type: 'STOCK_IN',
              reason: `Received Purchase Order: ${po.poNumber}`,
              createdById: req.user!.id
            }
          });
        }

        return updated;
      });

      return res.json({
        success: true,
        data: updatedPo
      });
    }

    // If marking as returned, trigger purchase return inventory decrement (if it was previously received)
    if (status === 'RETURNED') {
      const wasReceived = po.status === 'DELIVERED' || po.status === 'PAID';
      const targetBranchId = branchId || (po as any).branchId;
      
      if (wasReceived && !targetBranchId) {
        return next(new AppError('Branch (branchId) is required to process return from stock', 400, 'INVALID_INPUT_BODY'));
      }

      const updatedPo = await prisma.$transaction(async (tx) => {
        // 1. Update PO Status
        const updated = await tx.purchaseOrder.update({
          where: { id },
          data: { status: 'RETURNED' } as any
        });

        // 2. If it was received, decrement inventory and log STOCK_OUT movements
        if (wasReceived) {
          for (const item of po.items) {
            // Decrement ingredient stock
            await tx.ingredient.update({
              where: { id: item.ingredientId },
              data: {
                stockLevel: { decrement: item.orderedQty }
              }
            });

            // Log stock movement
            await tx.stockMovement.create({
              data: {
                tenantId,
                branchId: targetBranchId,
                ingredientId: item.ingredientId,
                quantity: item.orderedQty,
                type: 'STOCK_OUT',
                reason: `Returned Purchase Order: ${po.poNumber}`,
                createdById: req.user!.id
              }
            });
          }
        }

        return updated;
      });

      return res.json({
        success: true,
        data: updatedPo
      });
    }

    // Default status transition (e.g. DRAFT -> PENDING -> ACCEPTED -> PAID)
    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: { status: status as any }
    });

    return res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// --- Manual Stock Adjustments ---

export const logStockAdjustment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { branchId, ingredientId, quantity, type, reason } = req.body;
  const tenantId = req.tenantId!;

  try {
    // Verify ingredient exists under tenant
    const ingredient = await prisma.ingredient.findFirst({
      where: { id: ingredientId, tenantId, deletedAt: null }
    });

    if (!ingredient) {
      return next(new AppError('Ingredient not found', 404, 'RESOURCE_NOT_FOUND'));
    }

    const qty = new Prisma.Decimal(quantity);

    const result = await prisma.$transaction(async (tx) => {
      // 1. Log Stock Movement
      const movement = await tx.stockMovement.create({
        data: {
          tenantId,
          branchId,
          ingredientId,
          quantity: qty,
          type,
          reason,
          createdById: req.user!.id
        }
      });

      // 2. Adjust Ingredient stock level
      const factor = (type === 'STOCK_IN' || type === 'TRANSFER_IN') ? 1 : -1;
      const adjustment = qty.times(factor);

      // Verify that this adjustment does not fall below zero (unless permitted, but standard is fail-secure)
      if (factor === -1 && ingredient.stockLevel.plus(adjustment).lessThan(0)) {
        throw new AppError(`Insufficient stock. Current level: ${ingredient.stockLevel} ${ingredient.unit}`, 400, 'INSUFFICIENT_STOCK');
      }

      await tx.ingredient.update({
        where: { id: ingredientId },
        data: {
          stockLevel: { increment: adjustment }
        }
      });

      return movement;
    });

    return res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

export const supplierPortalLogin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { email } = req.body;
  const tenantId = req.tenantId!;

  try {
    if (!email || typeof email !== 'string') {
      return next(new AppError('Supplier email is required', 400, 'VALIDATION_ERROR'));
    }

    const supplier = await prisma.supplier.findFirst({
      where: {
        email: email.trim().toLowerCase(),
        tenantId,
        deletedAt: null,
      },
    });

    if (!supplier) {
      return next(new AppError('Supplier email not found for this tenant', 404, 'RESOURCE_NOT_FOUND'));
    }

    const accessToken = signSupplierToken({
      id: supplier.id,
      email: supplier.email || email,
      tenantId: supplier.tenantId,
      supplierId: supplier.id,
    });

    return res.json({
      success: true,
      data: {
        accessToken,
        supplier: {
          id: supplier.id,
          name: supplier.name,
          contactName: supplier.contactName,
          phone: supplier.phone,
          email: supplier.email,
          tenantId: supplier.tenantId,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSupplierPurchaseOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const supplierId = req.supplier!.supplierId;
  const tenantId = req.tenantId!;

  try {
    const { page, limit, skip } = parsePagination(req.query);
    const where = { supplierId, tenantId };
    const [pos, total] = await Promise.all([
      prisma.purchaseOrder.findMany({
        where,
        include: {
          items: {
            include: {
              ingredient: true,
            },
          },
          supplier: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.purchaseOrder.count({ where }),
    ]);
    return res.json(paginatedResponse(pos, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const updateSupplierPOStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { status, invoiceUrl } = req.body;
  const supplierId = req.supplier!.supplierId;
  const tenantId = req.tenantId!;

  try {
    const po = await prisma.purchaseOrder.findFirst({
      where: { id, supplierId, tenantId },
    });
    if (!po) {
      return next(new AppError('Purchase Order not found', 404, 'RESOURCE_NOT_FOUND'));
    }
    if (po.status === 'DELIVERED') {
      return next(new AppError('Delivered orders cannot be modified', 400, 'INVALID_STATE'));
    }

    const allowedStatuses = ['PENDING', 'ACCEPTED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (status && !allowedStatuses.includes(status)) {
      return next(new AppError('Invalid supplier status transition', 400, 'VALIDATION_ERROR'));
    }

    const updated = await prisma.purchaseOrder.update({
      where: { id },
      data: {
        status: status || po.status,
        invoiceUrl: invoiceUrl !== undefined ? invoiceUrl : po.invoiceUrl,
      },
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};
