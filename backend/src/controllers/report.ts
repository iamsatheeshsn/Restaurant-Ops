import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';

export const getReports = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const activeTenantId = req.tenantId!;
    if (!activeTenantId) {
      return next(new AppError('No active tenant context found', 400, 'TENANT_CONTEXT_MISSING'));
    }

    const { branchId, startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return next(new AppError('Date range (startDate & endDate) is required', 400, 'INVALID_INPUT_BODY'));
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    // 1. Compile completed Sales Revenue
    const salesResult = await prisma.order.aggregate({
      where: {
        tenantId: activeTenantId,
        ...(branchId ? { branchId: branchId as string } : {}),
        status: { in: ['COMPLETED', 'SERVED'] },
        createdAt: { gte: start, lte: end }
      },
      _sum: {
        totalAmount: true,
        subtotal: true,
        tax: true
      },
      _count: {
        id: true
      }
    });

    // 2. Compile Food Waste Financial Loss
    const wasteResult = await prisma.wasteLog.aggregate({
      where: {
        tenantId: activeTenantId,
        ...(branchId ? { branchId: branchId as string } : {}),
        createdAt: { gte: start, lte: end }
      },
      _sum: {
        cost: true,
        quantity: true
      }
    });

    // 3. Compile Procurement Expenditures (POs delivered)
    const poResult = await prisma.purchaseOrder.aggregate({
      where: {
        tenantId: activeTenantId,
        status: 'DELIVERED',
        createdAt: { gte: start, lte: end }
      },
      _sum: {
        totalAmount: true
      }
    });

    // 4. Active Order Counts by Status
    const ordersGroup = await prisma.order.groupBy({
      by: ['status'],
      where: {
        tenantId: activeTenantId,
        ...(branchId ? { branchId: branchId as string } : {}),
        createdAt: { gte: start, lte: end }
      },
      _count: {
        id: true
      }
    });

    const statusCounts = ordersGroup.reduce((acc: any, curr) => {
      acc[curr.status] = curr._count.id;
      return acc;
    }, {});

    // 5. Gather 5 Most Recent Transactions
    const recentOrders = await prisma.order.findMany({
      where: {
        tenantId: activeTenantId,
        ...(branchId ? { branchId: branchId as string } : {})
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });

    // 6. Gather Low Stock warning details
    const ingredients = await prisma.ingredient.findMany({
      where: {
        tenantId: activeTenantId
      }
    });

    const lowStockAlerts = ingredients
      .filter(ing => ing.stockLevel <= ing.lowStockThreshold)
      .map(ing => ({
        id: ing.id,
        name: ing.name,
        stockLevel: Number(ing.stockLevel),
        unit: ing.unit
      }));

    // 7. Gather Pending POs Count
    const pendingPurchaseOrdersCount = await prisma.purchaseOrder.count({
      where: {
        tenantId: activeTenantId,
        status: { in: ['PENDING', 'DRAFT'] }
      }
    });

    // 8. Count active staff attendance
    const staffActiveCount = await prisma.staffAttendance.count({
      where: {
        tenantId: activeTenantId,
        clockOut: null
      }
    });

    // 9. Compute Food Cost (COGS from recipe ingredients)
    const completedOrderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          tenantId: activeTenantId,
          status: { in: ['COMPLETED', 'SERVED'] },
          createdAt: { gte: start, lte: end }
        }
      },
      include: {
        menuItem: {
          include: {
            recipes: {
              include: {
                ingredient: true
              }
            }
          }
        }
      }
    });

    // Fetch last purchase prices for all ingredients to build a cost map
    const lastPoItems = await prisma.purchaseOrderItem.findMany({
      where: {
        purchaseOrder: {
          tenantId: activeTenantId,
          status: 'DELIVERED'
        }
      },
      orderBy: { purchaseOrder: { createdAt: 'desc' } }
    });

    const ingredientCostMap = new Map<string, number>();
    for (const poItem of lastPoItems) {
      if (!ingredientCostMap.has(poItem.ingredientId)) {
        ingredientCostMap.set(poItem.ingredientId, Number(poItem.unitPrice));
      }
    }

    let foodCost = 0;
    for (const item of completedOrderItems) {
      if (item.menuItem && item.menuItem.recipes) {
        for (const recipe of item.menuItem.recipes) {
          const ingredientCost = ingredientCostMap.get(recipe.ingredientId) || 1.00;
          const recipeQty = Number(recipe.quantity || 0);
          foodCost += ingredientCost * recipeQty * item.quantity;
        }
      }
    }

    // 10. Compute Item Velocity (Top Selling & Slow Moving)
    const salesByItem = await prisma.orderItem.groupBy({
      by: ['menuItemId'],
      where: {
        order: {
          tenantId: activeTenantId,
          status: { in: ['COMPLETED', 'SERVED'] },
          createdAt: { gte: start, lte: end }
        }
      },
      _sum: {
        quantity: true
      }
    });

    const menuItemsDetails = await prisma.menuItem.findMany({
      where: { tenantId: activeTenantId }
    });
    const menuItemMap = new Map(menuItemsDetails.map(m => [m.id, m]));

    const itemsReport = salesByItem.map(item => {
      const dbItem = menuItemMap.get(item.menuItemId);
      return {
        id: item.menuItemId,
        name: dbItem?.name || 'Unknown Item',
        quantity: Number(item._sum.quantity || 0),
        price: Number(dbItem?.price || 0)
      };
    });

    const topSelling = [...itemsReport].sort((a, b) => b.quantity - a.quantity).slice(0, 5);
    const slowMoving = [...itemsReport].sort((a, b) => a.quantity - b.quantity).slice(0, 5);

    // 11. Compute Branch Comparison Metrics
    const branchSales = await prisma.order.groupBy({
      by: ['branchId'],
      where: {
        tenantId: activeTenantId,
        status: { in: ['COMPLETED', 'SERVED'] },
        createdAt: { gte: start, lte: end }
      },
      _sum: {
        totalAmount: true
      },
      _count: {
        id: true
      }
    });

    const branchesList = await prisma.branch.findMany({
      where: { tenantId: activeTenantId }
    });
    const branchMap = new Map(branchesList.map(b => [b.id, b]));

    const branchComparison = branchSales.map(bs => {
      const b = branchMap.get(bs.branchId);
      return {
        branchId: bs.branchId,
        branchName: b?.name || 'Primary Branch',
        revenue: Number(bs._sum.totalAmount || 0),
        salesCount: bs._count.id || 0
      };
    });

    const totalRevenue = Number(salesResult._sum.totalAmount || 0);
    const wasteCost = Number(wasteResult._sum.cost || 0);
    const procurementCost = Number(poResult._sum.totalAmount || 0);
    const profit = totalRevenue - foodCost - wasteCost - procurementCost;

    // 12. Total inventory value
    const totalInventoryValue = ingredients.reduce((acc, ing) => {
      const ingredientCost = ingredientCostMap.get(ing.id) || 1.00;
      return acc + (Number(ing.stockLevel) * ingredientCost);
    }, 0);

    return res.json({
      success: true,
      data: {
        dateRange: {
          start: start.toISOString(),
          end: end.toISOString()
        },
        sales: {
          totalOrders: salesResult._count.id,
          subtotal: salesResult._sum.subtotal || 0,
          tax: salesResult._sum.tax || 0,
          totalRevenue
        },
        waste: {
          totalCost: wasteCost,
          totalQuantity: wasteResult._sum.quantity || 0
        },
        procurement: {
          totalExpenditure: procurementCost
        },
        foodCost,
        profit,
        inventoryValue: totalInventoryValue,
        topSelling,
        slowMoving,
        branchComparison,
        statusSummary: {
          PENDING: statusCounts['PENDING'] || 0,
          PREPARING: statusCounts['PREPARING'] || 0,
          READY: statusCounts['READY'] || 0,
          SERVED: statusCounts['SERVED'] || 0,
          COMPLETED: statusCounts['COMPLETED'] || 0,
          CANCELLED: statusCounts['CANCELLED'] || 0
        },
        recentOrders: recentOrders.map(o => ({
          id: o.id,
          orderNumber: o.orderNumber,
          type: o.type,
          status: o.status,
          totalAmount: Number(o.totalAmount),
          createdAt: o.createdAt
        })),
        lowStockAlerts,
        pendingPurchaseOrders: pendingPurchaseOrdersCount,
        staffActive: staffActiveCount
      }
    });
  } catch (error) {
    next(error);
  }
};
