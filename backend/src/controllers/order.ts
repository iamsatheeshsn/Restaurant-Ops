import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { parsePagination, paginatedResponse } from '../utils/pagination';
import { Prisma } from '@prisma/client';

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { type, branchId, tableId, items } = req.body;
  let tenantId = req.tenantId;
  const customerId = req.user?.id || null;

  try {
    if (!tenantId && branchId) {
      const branchInfo = await prisma.branch.findUnique({
        where: { id: branchId }
      });
      if (branchInfo) {
        tenantId = branchInfo.tenantId;
      }
    }

    if (!tenantId) {
      return next(new AppError('Tenant context is required', 400, 'INVALID_TENANT'));
    }

    // 1. Verify branch exists under tenant
    const branch = await prisma.branch.findFirst({
      where: { id: branchId, tenantId, deletedAt: null }
    });

    if (!branch) {
      return next(new AppError('Invalid branch selection', 400, 'RESOURCE_NOT_FOUND'));
    }

    // 2. Verify table exists if dine-in
    if (type === 'DINE_IN' && tableId) {
      const table = await prisma.table.findFirst({
        where: { id: tableId, tenantId }
      });
      if (!table) {
        return next(new AppError('Invalid seating table selection', 400, 'RESOURCE_NOT_FOUND'));
      }
    }

    // 3. Generate unique order number
    const orderNumber = `ORD-${Date.now()}`;

    // 4. Fetch menu items to compute prices and fetch recipes
    const menuItemIds = items.map((it: any) => it.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds }, tenantId, deletedAt: null },
      include: {
        recipes: {
          include: {
            ingredient: true
          }
        }
      }
    });

    if (menuItems.length !== items.length) {
      return next(new AppError('One or more menu items are invalid or unavailable', 400, 'RESOURCE_NOT_FOUND'));
    }

    // Map menu item helper dictionary
    const itemMap = new Map(menuItems.map(item => [item.id, item]));

    // Compute totals
    let subtotal = new Prisma.Decimal(0);
    const orderItemsData = items.map((it: any) => {
      const dbItem = itemMap.get(it.menuItemId)!;
      const unitPrice = dbItem.price;
      const quantity = parseInt(it.quantity);
      subtotal = subtotal.plus(unitPrice.times(quantity));

      return {
        menuItemId: it.menuItemId,
        quantity,
        unitPrice
      };
    });

    const tax = subtotal.times(0.1); // 10% standard tax rate
    const totalAmount = subtotal.plus(tax);

    // 5. Execute transaction: create order, decrement ingredients stock, log movements
    const result = await prisma.$transaction(async (tx) => {
      // Create Order
      const order = await tx.order.create({
        data: {
          tenantId: tenantId as string,
          branchId,
          orderNumber,
          type,
          status: 'PENDING',
          tableId,
          customerId,
          subtotal,
          tax,
          totalAmount
        }
      });

      // Create Order Line Items & process recipes auto-decrements
      for (const line of orderItemsData) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            menuItemId: line.menuItemId,
            quantity: line.quantity,
            unitPrice: line.unitPrice
          }
        });

        // Loop over recipes to decrement raw ingredients
        const dbItem = itemMap.get(line.menuItemId)!;
        for (const recipe of dbItem.recipes) {
          const qtyNeeded = recipe.quantity.times(line.quantity);

          // Decrement ingredient stock level
          await tx.ingredient.update({
            where: { id: recipe.ingredientId },
            data: {
              stockLevel: { decrement: qtyNeeded }
            }
          });

          // Log stock out movement
          await tx.stockMovement.create({
            data: {
              tenantId: tenantId as string,
              branchId,
              ingredientId: recipe.ingredientId,
              quantity: qtyNeeded,
              type: 'STOCK_OUT',
              reason: `Order checkout: ${orderNumber}`,
              createdById: customerId
            }
          });
        }
      }

      return tx.order.findUnique({
        where: { id: order.id },
        include: {
          items: {
            include: {
              menuItem: true
            }
          },
          table: true
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

export const getOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  const { branchId, status } = req.query;

  try {
    const { page, limit, skip } = parsePagination(req.query);
    const whereClause: Prisma.OrderWhereInput = {
      tenantId,
      ...(branchId ? { branchId: branchId as string } : {}),
      ...(status ? { status: status as any } : {})
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: whereClause,
        include: {
          items: {
            include: {
              menuItem: {
                include: { category: true },
              },
            },
          },
          table: {
            include: { floor: true },
          },
          customer: {
            select: {
              name: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where: whereClause }),
    ]);

    return res.json(paginatedResponse(orders, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const tenantId = req.tenantId!;

  try {
    const order = await prisma.order.findFirst({
      where: { id, tenantId },
      include: {
        items: {
          include: {
            menuItem: true
          }
        },
        table: true,
        customer: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

    if (!order) {
      return next(new AppError('Order not found', 404, 'RESOURCE_NOT_FOUND'));
    }

    return res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { status } = req.body;
  const tenantId = req.tenantId!;

  try {
    const order = await prisma.order.findFirst({
      where: { id, tenantId }
    });

    if (!order) {
      return next(new AppError('Order not found', 404, 'RESOURCE_NOT_FOUND'));
    }

    const updated = await prisma.order.update({
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

// --- Seating Tables Layouts Handlers ---

export const getTables = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const activeTenantId = req.tenantId!;
    const { page, limit, skip } = parsePagination(req.query);

    let branchId = req.query.branchId as string;
    if (!branchId) {
      const firstBranch = await prisma.branch.findFirst({
        where: { tenantId: activeTenantId, deletedAt: null }
      });
      if (!firstBranch) {
        return next(new AppError('No branch configured for this tenant', 404, 'RESOURCE_NOT_FOUND'));
      }
      branchId = firstBranch.id;
    }

    const where = { tenantId: activeTenantId, floor: { branchId } };
    const [tables, total] = await Promise.all([
      prisma.table.findMany({
        where,
        include: { floor: { select: { name: true } } },
        orderBy: { number: 'asc' },
        skip,
        take: limit,
      }),
      prisma.table.count({ where }),
    ]);

    const flatTables = tables.map(t => ({
      id: t.id,
      number: t.number,
      seating: t.seatingCapacity,
      floor: {
        name: t.floor.name
      }
    }));

    return res.json(paginatedResponse(flatTables, total, page, limit));
  } catch (error) {
    next(error);
  }
};
