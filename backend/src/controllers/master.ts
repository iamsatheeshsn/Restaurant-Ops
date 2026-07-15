import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { parsePagination, paginatedResponse } from '../utils/pagination';
import * as bcrypt from 'bcryptjs';
import { assertEmployeeLimit } from '../services/subscription';

// --- Floors ---

export const getFloors = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const where = { tenantId };
    const [floors, total] = await Promise.all([
      prisma.floor.findMany({
        where,
        include: { branch: true },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.floor.count({ where }),
    ]);
    return res.json(paginatedResponse(floors, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const createFloor = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { name, branchId } = req.body;
  const tenantId = req.tenantId!;
  try {
    const floor = await prisma.floor.create({
      data: {
        tenantId,
        branchId,
        name
      }
    });
    return res.status(201).json({ success: true, data: floor });
  } catch (error) {
    next(error);
  }
};

export const updateFloor = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { name, branchId } = req.body;
  const tenantId = req.tenantId!;
  try {
    const floor = await prisma.floor.findFirst({ where: { id, tenantId } });
    if (!floor) return next(new AppError('Floor not found', 404, 'RESOURCE_NOT_FOUND'));

    const updated = await prisma.floor.update({
      where: { id },
      data: {
        name,
        branchId
      }
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteFloor = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const tenantId = req.tenantId!;
  try {
    const floor = await prisma.floor.findFirst({ where: { id, tenantId } });
    if (!floor) return next(new AppError('Floor not found', 404, 'RESOURCE_NOT_FOUND'));

    await prisma.floor.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// --- Tables ---

export const getTables = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const where = { tenantId };
    const [tables, total] = await Promise.all([
      prisma.table.findMany({
        where,
        include: { floor: true },
        orderBy: { number: 'asc' },
        skip,
        take: limit,
      }),
      prisma.table.count({ where }),
    ]);
    return res.json(paginatedResponse(tables, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const createTable = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { number, seatingCapacity, floorId } = req.body;
  const tenantId = req.tenantId!;
  try {
    const table = await prisma.table.create({
      data: {
        tenantId,
        floorId,
        number,
        seatingCapacity: parseInt(seatingCapacity) || 2,
        qrToken: `table-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
      }
    });
    return res.status(201).json({ success: true, data: table });
  } catch (error) {
    next(error);
  }
};

export const updateTable = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { number, seatingCapacity, floorId } = req.body;
  const tenantId = req.tenantId!;
  try {
    const table = await prisma.table.findFirst({ where: { id, tenantId } });
    if (!table) return next(new AppError('Table not found', 404, 'RESOURCE_NOT_FOUND'));

    const updated = await prisma.table.update({
      where: { id },
      data: {
        number,
        seatingCapacity: seatingCapacity !== undefined ? parseInt(seatingCapacity) : undefined,
        floorId
      }
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteTable = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const tenantId = req.tenantId!;
  try {
    const table = await prisma.table.findFirst({ where: { id, tenantId } });
    if (!table) return next(new AppError('Table not found', 404, 'RESOURCE_NOT_FOUND'));

    await prisma.table.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// --- Kitchen Sections ---

export const getKitchenSections = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const where = { tenantId };
    const [sections, total] = await Promise.all([
      prisma.kitchenSection.findMany({
        where,
        include: { branch: true },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.kitchenSection.count({ where }),
    ]);
    return res.json(paginatedResponse(sections, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const createKitchenSection = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { name, branchId } = req.body;
  const tenantId = req.tenantId!;
  try {
    const section = await prisma.kitchenSection.create({
      data: {
        tenantId,
        branchId,
        name
      }
    });
    return res.status(201).json({ success: true, data: section });
  } catch (error) {
    next(error);
  }
};

export const updateKitchenSection = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { name, branchId } = req.body;
  const tenantId = req.tenantId!;
  try {
    const section = await prisma.kitchenSection.findFirst({ where: { id, tenantId } });
    if (!section) return next(new AppError('Kitchen Section not found', 404, 'RESOURCE_NOT_FOUND'));

    const updated = await prisma.kitchenSection.update({
      where: { id },
      data: { name, branchId }
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteKitchenSection = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const tenantId = req.tenantId!;
  try {
    const section = await prisma.kitchenSection.findFirst({ where: { id, tenantId } });
    if (!section) return next(new AppError('Kitchen Section not found', 404, 'RESOURCE_NOT_FOUND'));

    await prisma.kitchenSection.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// --- Employee/User Management ---

export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const where = { tenantId, deletedAt: null };
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { role: true, branch: true },
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);
    return res.json(paginatedResponse(users, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { name, email, password, phone, roleId, branchId } = req.body;
  const tenantId = req.tenantId!;
  try {
    const existing = await prisma.user.findFirst({ where: { email, tenantId, deletedAt: null } });
    if (existing) return next(new AppError('Email address already exists', 400, 'EMAIL_EXISTS'));

    if (roleId) {
      const role = await prisma.role.findFirst({
        where: { id: roleId, tenantId, deletedAt: null },
      });
      if (!role) {
        return next(new AppError('Invalid role for this restaurant', 400, 'INVALID_ROLE'));
      }
      if (role.name === 'SUPER_ADMIN') {
        return next(new AppError('Cannot assign platform SUPER_ADMIN via restaurant staff', 403, 'ACTION_FORBIDDEN'));
      }
      if (role.name !== 'CUSTOMER') {
        await assertEmployeeLimit(tenantId);
      }
    } else {
      await assertEmployeeLimit(tenantId);
    }

    const hashedPassword = await bcrypt.hash(password || 'password123', 10);
    const user = await prisma.user.create({
      data: {
        tenantId,
        name,
        email,
        passwordHash: hashedPassword,
        phone,
        roleId,
        branchId
      }
    });
    return res.status(201).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { name, email, phone, roleId, branchId, password } = req.body;
  const tenantId = req.tenantId!;
  try {
    const user = await prisma.user.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!user) return next(new AppError('Employee not found', 404, 'RESOURCE_NOT_FOUND'));

    if (roleId) {
      const role = await prisma.role.findFirst({
        where: { id: roleId, tenantId, deletedAt: null },
      });
      if (!role) {
        return next(new AppError('Invalid role for this restaurant', 400, 'INVALID_ROLE'));
      }
      if (role.name === 'SUPER_ADMIN') {
        return next(new AppError('Cannot assign platform SUPER_ADMIN via restaurant staff', 403, 'ACTION_FORBIDDEN'));
      }
    }

    const hashedPassword = password ? await bcrypt.hash(password, 10) : undefined;

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        roleId,
        branchId,
        passwordHash: hashedPassword
      }
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const tenantId = req.tenantId!;
  try {
    const user = await prisma.user.findFirst({ where: { id, tenantId, deletedAt: null } });
    if (!user) return next(new AppError('Employee not found', 404, 'RESOURCE_NOT_FOUND'));

    await prisma.user.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
