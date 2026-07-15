import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { parsePagination, paginatedResponse } from '../utils/pagination';
import {
  ExpenseStatus,
  LeaveStatus,
  DeliveryJobStatus,
  CampaignStatus,
  TransferStatus,
  ApprovalType,
  ApprovalStatus,
  Prisma,
} from '@prisma/client';

// --- Expenses ---

export const listExpenses = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { status, branchId } = req.query;
    const where = {
      tenantId,
      ...(status ? { status: status as ExpenseStatus } : {}),
      ...(branchId ? { branchId: String(branchId) } : {}),
    };
    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.expense.count({ where }),
    ]);
    return res.json(paginatedResponse(expenses, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const createExpense = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  try {
    const { amount, category, description, branchId } = req.body;
    if (amount === undefined || !category || !description) {
      return next(new AppError('amount, category, and description are required', 400, 'VALIDATION_ERROR'));
    }
    if (!req.user?.id) {
      return next(new AppError('Authentication context required', 401, 'UNAUTHORIZED'));
    }

    const expense = await prisma.expense.create({
      data: {
        tenantId,
        branchId: branchId || null,
        amount,
        category,
        description,
        createdById: req.user.id,
        status: ExpenseStatus.PENDING,
      },
    });
    return res.status(201).json({ success: true, data: expense });
  } catch (error) {
    next(error);
  }
};

export const updateExpense = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  try {
    const { id } = req.params;
    const { amount, category, description, branchId } = req.body;

    const expense = await prisma.expense.findFirst({ where: { id, tenantId } });
    if (!expense) return next(new AppError('Expense not found', 404, 'RESOURCE_NOT_FOUND'));
    if (expense.status !== ExpenseStatus.PENDING) {
      return next(new AppError('Only pending expenses can be updated', 400, 'INVALID_STATUS'));
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        amount: amount !== undefined ? amount : expense.amount,
        category: category ?? expense.category,
        description: description ?? expense.description,
        branchId: branchId !== undefined ? branchId : expense.branchId,
      },
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteExpense = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  try {
    const { id } = req.params;
    const expense = await prisma.expense.findFirst({ where: { id, tenantId } });
    if (!expense) return next(new AppError('Expense not found', 404, 'RESOURCE_NOT_FOUND'));

    await prisma.expense.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const approveExpense = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  try {
    const { id } = req.params;
    const expense = await prisma.expense.findFirst({ where: { id, tenantId } });
    if (!expense) return next(new AppError('Expense not found', 404, 'RESOURCE_NOT_FOUND'));
    if (expense.status !== ExpenseStatus.PENDING) {
      return next(new AppError('Expense is not pending', 400, 'INVALID_STATUS'));
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        status: ExpenseStatus.APPROVED,
        approvedById: req.user?.id,
      },
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const rejectExpense = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  try {
    const { id } = req.params;
    const expense = await prisma.expense.findFirst({ where: { id, tenantId } });
    if (!expense) return next(new AppError('Expense not found', 404, 'RESOURCE_NOT_FOUND'));
    if (expense.status !== ExpenseStatus.PENDING) {
      return next(new AppError('Expense is not pending', 400, 'INVALID_STATUS'));
    }

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        status: ExpenseStatus.REJECTED,
        approvedById: req.user?.id,
      },
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// --- Staff schedules ---

export const listSchedules = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { branchId, userId } = req.query;
    const where = {
      tenantId,
      ...(branchId ? { branchId: String(branchId) } : {}),
      ...(userId ? { userId: String(userId) } : {}),
    };
    const [schedules, total] = await Promise.all([
      prisma.staffSchedule.findMany({
        where,
        orderBy: { shiftDate: 'asc' },
        skip,
        take: limit,
      }),
      prisma.staffSchedule.count({ where }),
    ]);
    return res.json(paginatedResponse(schedules, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const createSchedule = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  try {
    const { branchId, userId, shiftDate, startTime, endTime, note } = req.body;
    if (!branchId || !userId || !shiftDate || !startTime || !endTime) {
      return next(new AppError('branchId, userId, shiftDate, startTime, endTime are required', 400, 'VALIDATION_ERROR'));
    }

    const schedule = await prisma.staffSchedule.create({
      data: {
        tenantId,
        branchId,
        userId,
        shiftDate: new Date(shiftDate),
        startTime,
        endTime,
        note,
      },
    });
    return res.status(201).json({ success: true, data: schedule });
  } catch (error) {
    next(error);
  }
};

export const updateSchedule = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  try {
    const { id } = req.params;
    const { branchId, userId, shiftDate, startTime, endTime, note } = req.body;

    const schedule = await prisma.staffSchedule.findFirst({ where: { id, tenantId } });
    if (!schedule) return next(new AppError('Schedule not found', 404, 'RESOURCE_NOT_FOUND'));

    const updated = await prisma.staffSchedule.update({
      where: { id },
      data: {
        branchId: branchId ?? schedule.branchId,
        userId: userId ?? schedule.userId,
        shiftDate: shiftDate ? new Date(shiftDate) : schedule.shiftDate,
        startTime: startTime ?? schedule.startTime,
        endTime: endTime ?? schedule.endTime,
        note: note !== undefined ? note : schedule.note,
      },
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteSchedule = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  try {
    const { id } = req.params;
    const schedule = await prisma.staffSchedule.findFirst({ where: { id, tenantId } });
    if (!schedule) return next(new AppError('Schedule not found', 404, 'RESOURCE_NOT_FOUND'));

    await prisma.staffSchedule.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// --- Leave requests ---

export const listLeaves = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { status, userId } = req.query;
    const where = {
      tenantId,
      ...(status ? { status: status as LeaveStatus } : {}),
      ...(userId ? { userId: String(userId) } : {}),
    };
    const [leaves, total] = await Promise.all([
      prisma.leaveRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.leaveRequest.count({ where }),
    ]);
    return res.json(paginatedResponse(leaves, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const createLeave = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  try {
    const { userId, startDate, endDate, leaveType, reason } = req.body;
    const resolvedUserId = userId || req.user?.id;
    if (!resolvedUserId || !startDate || !endDate || !leaveType) {
      return next(new AppError('userId, startDate, endDate, and leaveType are required', 400, 'VALIDATION_ERROR'));
    }

    const leave = await prisma.leaveRequest.create({
      data: {
        tenantId,
        userId: resolvedUserId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        leaveType,
        reason,
        status: LeaveStatus.PENDING,
      },
    });
    return res.status(201).json({ success: true, data: leave });
  } catch (error) {
    next(error);
  }
};

export const updateLeaveStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status || ![LeaveStatus.APPROVED, LeaveStatus.REJECTED, LeaveStatus.PENDING].includes(status)) {
      return next(new AppError('status must be PENDING, APPROVED, or REJECTED', 400, 'VALIDATION_ERROR'));
    }

    const leave = await prisma.leaveRequest.findFirst({ where: { id, tenantId } });
    if (!leave) return next(new AppError('Leave request not found', 404, 'RESOURCE_NOT_FOUND'));

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: { status: status as LeaveStatus },
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// --- Delivery jobs ---

export const listDeliveryJobs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { status, branchId } = req.query;
    const where = {
      tenantId,
      ...(status ? { status: status as DeliveryJobStatus } : {}),
      ...(branchId ? { branchId: String(branchId) } : {}),
    };
    const [jobs, total] = await Promise.all([
      prisma.deliveryJob.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.deliveryJob.count({ where }),
    ]);
    return res.json(paginatedResponse(jobs, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const createDeliveryJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  try {
    const { orderId, branchId, assigneeId, address, proofUrl, codAmount, customerName, status } = req.body;
    if (!address) return next(new AppError('address is required', 400, 'VALIDATION_ERROR'));

    const job = await prisma.deliveryJob.create({
      data: {
        tenantId,
        orderId: orderId || null,
        branchId: branchId || null,
        assigneeId: assigneeId || null,
        address,
        proofUrl,
        codAmount: codAmount !== undefined ? codAmount : undefined,
        customerName,
        status: (status as DeliveryJobStatus) || DeliveryJobStatus.ASSIGNED,
      },
    });
    return res.status(201).json({ success: true, data: job });
  } catch (error) {
    next(error);
  }
};

export const updateDeliveryJobStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  try {
    const { id } = req.params;
    const { status, assigneeId, proofUrl } = req.body;
    if (!status) return next(new AppError('status is required', 400, 'VALIDATION_ERROR'));

    const job = await prisma.deliveryJob.findFirst({ where: { id, tenantId } });
    if (!job) return next(new AppError('Delivery job not found', 404, 'RESOURCE_NOT_FOUND'));

    const updated = await prisma.deliveryJob.update({
      where: { id },
      data: {
        status: status as DeliveryJobStatus,
        assigneeId: assigneeId !== undefined ? assigneeId : job.assigneeId,
        proofUrl: proofUrl !== undefined ? proofUrl : job.proofUrl,
      },
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// --- Marketing campaigns ---

export const listCampaigns = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const where = { tenantId };
    const [campaigns, total] = await Promise.all([
      prisma.marketingCampaign.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.marketingCampaign.count({ where }),
    ]);
    return res.json(paginatedResponse(campaigns, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const createCampaign = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  try {
    const { name, channel, audience, content, status, scheduledAt } = req.body;
    if (!name || !channel || !content) {
      return next(new AppError('name, channel, and content are required', 400, 'VALIDATION_ERROR'));
    }

    const campaign = await prisma.marketingCampaign.create({
      data: {
        tenantId,
        name,
        channel,
        audience,
        content,
        status: (status as CampaignStatus) || CampaignStatus.DRAFT,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : undefined,
      },
    });
    return res.status(201).json({ success: true, data: campaign });
  } catch (error) {
    next(error);
  }
};

export const updateCampaign = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  try {
    const { id } = req.params;
    const { name, channel, audience, content, status, scheduledAt, sentAt } = req.body;

    const campaign = await prisma.marketingCampaign.findFirst({ where: { id, tenantId } });
    if (!campaign) return next(new AppError('Campaign not found', 404, 'RESOURCE_NOT_FOUND'));

    const updated = await prisma.marketingCampaign.update({
      where: { id },
      data: {
        name: name ?? campaign.name,
        channel: channel ?? campaign.channel,
        audience: audience !== undefined ? audience : campaign.audience,
        content: content ?? campaign.content,
        status: status !== undefined ? (status as CampaignStatus) : campaign.status,
        scheduledAt: scheduledAt !== undefined ? (scheduledAt ? new Date(scheduledAt) : null) : campaign.scheduledAt,
        sentAt: sentAt !== undefined ? (sentAt ? new Date(sentAt) : null) : campaign.sentAt,
      },
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// --- Stock transfers ---

export const listStockTransfers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { status } = req.query;
    const where = {
      tenantId,
      ...(status ? { status: status as TransferStatus } : {}),
    };
    const [transfers, total] = await Promise.all([
      prisma.stockTransferRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.stockTransferRequest.count({ where }),
    ]);
    return res.json(paginatedResponse(transfers, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const createStockTransfer = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  try {
    const { fromBranchId, toBranchId, ingredientId, quantity } = req.body;
    if (!fromBranchId || !toBranchId || !ingredientId || quantity === undefined) {
      return next(new AppError('fromBranchId, toBranchId, ingredientId, and quantity are required', 400, 'VALIDATION_ERROR'));
    }
    if (!req.user?.id) {
      return next(new AppError('Authentication context required', 401, 'UNAUTHORIZED'));
    }

    const transfer = await prisma.stockTransferRequest.create({
      data: {
        tenantId,
        fromBranchId,
        toBranchId,
        ingredientId,
        quantity,
        requestedById: req.user.id,
        status: TransferStatus.REQUESTED,
      },
    });
    return res.status(201).json({ success: true, data: transfer });
  } catch (error) {
    next(error);
  }
};

export const updateStockTransferStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) return next(new AppError('status is required', 400, 'VALIDATION_ERROR'));

    const transfer = await prisma.stockTransferRequest.findFirst({ where: { id, tenantId } });
    if (!transfer) return next(new AppError('Transfer request not found', 404, 'RESOURCE_NOT_FOUND'));

    const updated = await prisma.stockTransferRequest.update({
      where: { id },
      data: {
        status: status as TransferStatus,
        approvedById:
          status === TransferStatus.APPROVED || status === TransferStatus.REJECTED
            ? req.user?.id
            : transfer.approvedById,
      },
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// --- Approvals ---

export const listApprovals = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { status, type } = req.query;
    const where = {
      tenantId,
      ...(status ? { status: status as ApprovalStatus } : {}),
      ...(type ? { type: type as ApprovalType } : {}),
    };
    const [approvals, total] = await Promise.all([
      prisma.approvalRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.approvalRequest.count({ where }),
    ]);
    return res.json(paginatedResponse(approvals, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const createApproval = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  try {
    const { type, refId, title, notes } = req.body;
    if (!type || !refId || !title) {
      return next(new AppError('type, refId, and title are required', 400, 'VALIDATION_ERROR'));
    }
    if (!req.user?.id) {
      return next(new AppError('Authentication context required', 401, 'UNAUTHORIZED'));
    }

    const approval = await prisma.approvalRequest.create({
      data: {
        tenantId,
        type: type as ApprovalType,
        refId,
        title,
        notes,
        requestedById: req.user.id,
        status: ApprovalStatus.PENDING,
      },
    });
    return res.status(201).json({ success: true, data: approval });
  } catch (error) {
    next(error);
  }
};

export const decideApproval = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    if (!status || ![ApprovalStatus.APPROVED, ApprovalStatus.REJECTED].includes(status)) {
      return next(new AppError('status must be APPROVED or REJECTED', 400, 'VALIDATION_ERROR'));
    }

    const approval = await prisma.approvalRequest.findFirst({ where: { id, tenantId } });
    if (!approval) return next(new AppError('Approval request not found', 404, 'RESOURCE_NOT_FOUND'));
    if (approval.status !== ApprovalStatus.PENDING) {
      return next(new AppError('Approval already decided', 400, 'INVALID_STATUS'));
    }

    const updated = await prisma.approvalRequest.update({
      where: { id },
      data: {
        status: status as ApprovalStatus,
        decidedById: req.user?.id,
        notes: notes !== undefined ? notes : approval.notes,
      },
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// --- Finance summary ---

export const financeSummary = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  try {
    const { from, to } = req.query;
    const fromDate = from ? new Date(String(from)) : new Date(new Date().setDate(new Date().getDate() - 30));
    const toDate = to ? new Date(String(to)) : new Date();

    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      return next(new AppError('Invalid from/to date', 400, 'VALIDATION_ERROR'));
    }

    const dateFilter = { gte: fromDate, lte: toDate };

    const [orderAgg, expenseAgg, wasteAgg] = await Promise.all([
      prisma.order.aggregate({
        where: { tenantId, createdAt: dateFilter, status: { not: 'CANCELLED' } },
        _sum: { totalAmount: true },
        _count: { _all: true },
      }),
      prisma.expense.aggregate({
        where: { tenantId, status: ExpenseStatus.APPROVED, createdAt: dateFilter },
        _sum: { amount: true },
        _count: { _all: true },
      }),
      prisma.wasteLog.aggregate({
        where: { tenantId, createdAt: dateFilter },
        _sum: { cost: true },
        _count: { _all: true },
      }),
    ]);

    const revenue = new Prisma.Decimal(orderAgg._sum.totalAmount ?? 0);
    const expensesApproved = new Prisma.Decimal(expenseAgg._sum.amount ?? 0);
    const wasteCost = new Prisma.Decimal(wasteAgg._sum.cost ?? 0);

    return res.json({
      success: true,
      data: {
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
        revenue: revenue.toString(),
        orderCount: orderAgg._count._all,
        expensesApproved: expensesApproved.toString(),
        expenseCount: expenseAgg._count._all,
        wasteCost: wasteCost.toString(),
        wasteCount: wasteAgg._count._all,
        netEstimate: revenue.minus(expensesApproved).minus(wasteCost).toString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// --- Tenant audit logs ---

export const listTenantAuditLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  try {
    const { page, limit, skip } = parsePagination(req.query, { maxLimit: 500 });
    const where = { tenantId };

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.activityLog.count({ where }),
    ]);

    return res.json(
      paginatedResponse(
        logs.map((log) => ({
          ...log,
          userEmail: log.user?.email ?? null,
        })),
        total,
        page,
        limit
      )
    );
  } catch (error) {
    next(error);
  }
};
