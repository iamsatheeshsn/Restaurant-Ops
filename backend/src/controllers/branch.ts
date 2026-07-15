import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { parsePagination, paginatedResponse } from '../utils/pagination';

export const getBranches = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const tenantId = req.tenantId!;
    const { page, limit, skip } = parsePagination(req.query);
    const where = { tenantId, deletedAt: null };

    const [branches, total] = await Promise.all([
      prisma.branch.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.branch.count({ where }),
    ]);

    return res.json(paginatedResponse(branches, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const createBranch = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { name, address, phone, email, currency, country, isCentralKitchen, isWarehouse } = req.body;
  const tenantId = req.tenantId!;
  try {
    const branch = await prisma.branch.create({
      data: {
        tenantId,
        name,
        address,
        phone,
        email,
        currency: currency || 'USD',
        country: country || 'US',
        isCentralKitchen: !!isCentralKitchen,
        isWarehouse: !!isWarehouse
      }
    });
    return res.status(201).json({ success: true, data: branch });
  } catch (error) {
    next(error);
  }
};

export const updateBranch = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { name, address, phone, email, currency, country, isCentralKitchen, isWarehouse } = req.body;
  const tenantId = req.tenantId!;
  try {
    await prisma.branch.update({
      where: { id },
      data: {
        name,
        address,
        phone,
        email,
        currency,
        country,
        isCentralKitchen: isCentralKitchen !== undefined ? !!isCentralKitchen : undefined,
        isWarehouse: isWarehouse !== undefined ? !!isWarehouse : undefined
      }
    });
    return res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

export const deleteBranch = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const tenantId = req.tenantId!;
  try {
    await prisma.branch.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
