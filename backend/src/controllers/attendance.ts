import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { parsePagination, paginatedResponse } from '../utils/pagination';

export const clockIn = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  const userId = req.user!.id;

  try {
    // Check for open attendance shift
    const active = await prisma.staffAttendance.findFirst({
      where: { tenantId, userId, clockOut: null }
    });

    if (active) {
      return next(new AppError('You are already clocked in to an active shift', 400, 'SHIFT_ALREADY_ACTIVE'));
    }

    const log = await prisma.staffAttendance.create({
      data: {
        tenantId,
        userId
      }
    });

    return res.status(201).json({
      success: true,
      data: log
    });
  } catch (error) {
    next(error);
  }
};

export const clockOut = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  const userId = req.user!.id;

  try {
    const active = await prisma.staffAttendance.findFirst({
      where: { tenantId, userId, clockOut: null }
    });

    if (!active) {
      return next(new AppError('No active clock-in shift found', 400, 'NO_ACTIVE_SHIFT'));
    }

    const log = await prisma.staffAttendance.update({
      where: { id: active.id },
      data: {
        clockOut: new Date()
      }
    });

    return res.json({
      success: true,
      data: log
    });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  const { userId } = req.query;

  try {
    const { page, limit, skip } = parsePagination(req.query);
    const where = {
      tenantId,
      ...(userId ? { userId: userId as string } : {})
    };
    const [logs, total] = await Promise.all([
      prisma.staffAttendance.findMany({
        where,
        include: {
          user: {
            select: {
              name: true,
              email: true,
              role: true
            }
          }
        },
        orderBy: { clockIn: 'desc' },
        skip,
        take: limit,
      }),
      prisma.staffAttendance.count({ where }),
    ]);

    return res.json(paginatedResponse(logs, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const getClockStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  const userId = req.user!.id;

  try {
    const active = await prisma.staffAttendance.findFirst({
      where: { tenantId, userId, clockOut: null }
    });

    return res.json({
      success: true,
      data: {
        isClockedIn: !!active,
        clockInTime: active ? active.clockIn : null
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createManualAttendance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  const { userId, clockIn, clockOut } = req.body;

  try {
    const log = await prisma.staffAttendance.create({
      data: {
        tenantId,
        userId,
        clockIn: new Date(clockIn),
        clockOut: clockOut ? new Date(clockOut) : null
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      data: log
    });
  } catch (error) {
    next(error);
  }
};
