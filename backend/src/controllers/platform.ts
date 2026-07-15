import { Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { parsePagination, paginatedResponse } from '../utils/pagination';
import { uniqueTenantSlug } from '../utils/slug';
import {
  TenantStatus,
  SubscriptionTier,
  TicketStatus,
  IntegrationChannel,
} from '@prisma/client';

const startedAt = Date.now();

// --- Tenants ---

export const listTenants = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const where = { deletedAt: null };
    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        include: {
          settings: true,
          subscriptions: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 1 },
          _count: { select: { users: true, branches: true, orders: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.tenant.count({ where }),
    ]);
    return res.json(paginatedResponse(tenants, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const createTenant = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, companyName, status, slug: rawSlug, currency, timezone } = req.body;
    if (!name || !companyName) {
      return next(new AppError('name and companyName are required', 400, 'VALIDATION_ERROR'));
    }

    const slug = await uniqueTenantSlug(rawSlug || name, async (s) => {
      const hit = await prisma.tenant.findFirst({ where: { slug: s } });
      return !!hit;
    });

    const tenant = await prisma.$transaction(async (tx) => {
      const created = await tx.tenant.create({
        data: {
          name,
          companyName,
          slug,
          status: (status as TenantStatus) || TenantStatus.TRIAL,
        },
      });

      await tx.tenantSettings.create({
        data: {
          tenantId: created.id,
          appName: name,
          currency: currency || 'USD',
          timezone: timezone || 'UTC',
        },
      });

      await tx.role.create({
        data: {
          tenantId: created.id,
          name: 'OWNER',
          isSystem: true,
        },
      });

      return created;
    });

    return res.status(201).json({ success: true, data: tenant });
  } catch (error) {
    next(error);
  }
};

export const updateTenantStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed: TenantStatus[] = [TenantStatus.ACTIVE, TenantStatus.SUSPENDED, TenantStatus.CANCELLED];

    if (!allowed.includes(status)) {
      return next(new AppError('status must be ACTIVE, SUSPENDED, or CANCELLED', 400, 'VALIDATION_ERROR'));
    }

    const tenant = await prisma.tenant.findFirst({ where: { id, deletedAt: null } });
    if (!tenant) return next(new AppError('Tenant not found', 404, 'RESOURCE_NOT_FOUND'));

    const updated = await prisma.tenant.update({
      where: { id },
      data: { status },
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const softDeleteTenant = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tenant = await prisma.tenant.findFirst({ where: { id, deletedAt: null } });
    if (!tenant) return next(new AppError('Tenant not found', 404, 'RESOURCE_NOT_FOUND'));

    const updated = await prisma.tenant.update({
      where: { id },
      data: { deletedAt: new Date(), status: TenantStatus.CANCELLED },
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

const STOREFRONT_FIELDS = [
  'appName',
  'logo',
  'favicon',
  'homeBannerTitle',
  'homeBannerSubtitle',
  'homeBannerImage',
  'ourStoryTitle',
  'ourStoryContent',
  'ourStoryImage',
  'platformHighlights',
  'highlightsTitle',
  'highlightsDescription',
  'coffeeHouseCaption',
  'hoursOfService',
  'findUsAddress',
  'findUsPhone',
  'findUsEmail',
  'findUsMapUrl',
  'footerContent',
  'currency',
  'timezone',
  'lowStockNotification',
  'autoCloseShiftsAt',
] as const;

export const getTenantStorefrontSettings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tenant = await prisma.tenant.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, name: true, slug: true, companyName: true, status: true },
    });
    if (!tenant) return next(new AppError('Tenant not found', 404, 'RESOURCE_NOT_FOUND'));

    let settings = await prisma.tenantSettings.findUnique({ where: { tenantId: id } });
    if (!settings) {
      settings = await prisma.tenantSettings.create({
        data: { tenantId: id, appName: tenant.name },
      });
    }

    return res.json({
      success: true,
      data: { tenant, settings },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTenantStorefrontSettings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const tenant = await prisma.tenant.findFirst({ where: { id, deletedAt: null } });
    if (!tenant) return next(new AppError('Tenant not found', 404, 'RESOURCE_NOT_FOUND'));

    const data: Record<string, unknown> = {};
    for (const key of STOREFRONT_FIELDS) {
      if (req.body[key] !== undefined) data[key] = req.body[key];
    }
    if (data.autoCloseShiftsAt === '') data.autoCloseShiftsAt = null;

    const settings = await prisma.tenantSettings.upsert({
      where: { tenantId: id },
      update: data,
      create: { tenantId: id, ...data },
    });

    return res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

// --- Plans ---

export const listPlans = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const [plans, total] = await Promise.all([
      prisma.subscriptionPlan.findMany({ orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.subscriptionPlan.count(),
    ]);
    return res.json(paginatedResponse(plans, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const upsertPlan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id, name, tier, priceMonthly, maxBranches, maxEmployees, features, isActive } = req.body;

    if (id) {
      const existing = await prisma.subscriptionPlan.findUnique({ where: { id } });
      if (!existing) return next(new AppError('Plan not found', 404, 'RESOURCE_NOT_FOUND'));

      const updated = await prisma.subscriptionPlan.update({
        where: { id },
        data: {
          name: name ?? existing.name,
          tier: (tier as SubscriptionTier) ?? existing.tier,
          priceMonthly: priceMonthly !== undefined ? priceMonthly : existing.priceMonthly,
          maxBranches: maxBranches ?? existing.maxBranches,
          maxEmployees: maxEmployees ?? existing.maxEmployees,
          features: features !== undefined ? features : existing.features,
          isActive: isActive !== undefined ? isActive : existing.isActive,
        },
      });
      return res.json({ success: true, data: updated });
    }

    if (!name || !tier || priceMonthly === undefined || maxBranches === undefined || maxEmployees === undefined) {
      return next(new AppError('name, tier, priceMonthly, maxBranches, maxEmployees are required', 400, 'VALIDATION_ERROR'));
    }

    const created = await prisma.subscriptionPlan.create({
      data: {
        name,
        tier: tier as SubscriptionTier,
        priceMonthly,
        maxBranches,
        maxEmployees,
        features: features ?? undefined,
        isActive: isActive !== undefined ? isActive : true,
      },
    });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    next(error);
  }
};

export const deletePlan = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const plan = await prisma.subscriptionPlan.findUnique({ where: { id } });
    if (!plan) return next(new AppError('Plan not found', 404, 'RESOURCE_NOT_FOUND'));

    await prisma.subscriptionPlan.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// --- Invoices ---

export const listInvoices = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { tenantId } = req.query;
    const where = tenantId ? { tenantId: String(tenantId) } : undefined;
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: { tenant: { select: { id: true, name: true, companyName: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.invoice.count({ where }),
    ]);
    return res.json(paginatedResponse(invoices, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const createInvoice = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { tenantId, amount, currency, status, dueDate, description } = req.body;
    if (!tenantId || amount === undefined || !status) {
      return next(new AppError('tenantId, amount, and status are required', 400, 'VALIDATION_ERROR'));
    }

    const tenant = await prisma.tenant.findFirst({ where: { id: tenantId, deletedAt: null } });
    if (!tenant) return next(new AppError('Tenant not found', 404, 'RESOURCE_NOT_FOUND'));

    const invoice = await prisma.invoice.create({
      data: {
        tenantId,
        amount,
        currency: currency || 'USD',
        status,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        description,
      },
    });
    return res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    next(error);
  }
};

export const updateInvoiceStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, paidAt } = req.body;
    if (!status) return next(new AppError('status is required', 400, 'VALIDATION_ERROR'));

    const invoice = await prisma.invoice.findUnique({ where: { id } });
    if (!invoice) return next(new AppError('Invoice not found', 404, 'RESOURCE_NOT_FOUND'));

    const updated = await prisma.invoice.update({
      where: { id },
      data: {
        status,
        paidAt: paidAt ? new Date(paidAt) : status === 'PAID' ? new Date() : invoice.paidAt,
      },
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// --- Feature flags ---

export const listFeatureFlags = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const [flags, total] = await Promise.all([
      prisma.planFeatureFlag.findMany({
        orderBy: [{ planTier: 'asc' }, { featureKey: 'asc' }],
        skip,
        take: limit,
      }),
      prisma.planFeatureFlag.count(),
    ]);
    return res.json(paginatedResponse(flags, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const upsertFeatureFlag = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { planTier, featureKey, enabled } = req.body;
    if (!planTier || !featureKey) {
      return next(new AppError('planTier and featureKey are required', 400, 'VALIDATION_ERROR'));
    }

    const flag = await prisma.planFeatureFlag.upsert({
      where: { planTier_featureKey: { planTier: planTier as SubscriptionTier, featureKey } },
      create: {
        planTier: planTier as SubscriptionTier,
        featureKey,
        enabled: enabled !== undefined ? enabled : true,
      },
      update: { enabled: enabled !== undefined ? enabled : true },
    });
    return res.json({ success: true, data: flag });
  } catch (error) {
    next(error);
  }
};

// --- Health & analytics ---

export const getSystemHealth = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let dbOk = false;
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbOk = true;
    } catch {
      dbOk = false;
    }

    return res.json({
      success: true,
      data: {
        database: dbOk ? 'ok' : 'down',
        cache: 'ok',
        uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPlatformAnalytics = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const [
      tenantsByStatus,
      totalTenants,
      totalBranches,
      restaurantUsers,
      platformUsers,
      totalOrdersLast30d,
      revenueAgg,
      openTickets,
      ticketsByStatus,
      openInvoices,
      invoiceOpenAgg,
      paidInvoiceAgg,
      integrations,
      activeIntegrations,
      plans,
      recentTenants,
      recentTickets,
      announcements,
    ] = await Promise.all([
      prisma.tenant.groupBy({
        by: ['status'],
        where: { deletedAt: null },
        _count: { _all: true },
      }),
      prisma.tenant.count({ where: { deletedAt: null } }),
      prisma.branch.count({ where: { deletedAt: null } }),
      prisma.user.count({ where: { deletedAt: null, tenantId: { not: null } } }),
      prisma.user.count({ where: { deletedAt: null, tenantId: null } }),
      prisma.order.count({ where: { createdAt: { gte: since } } }),
      prisma.order.aggregate({
        where: {
          createdAt: { gte: since },
          status: { in: ['COMPLETED', 'SERVED'] },
        },
        _sum: { totalAmount: true },
      }),
      prisma.supportTicket.count({
        where: { status: { in: [TicketStatus.OPEN, TicketStatus.IN_PROGRESS] } },
      }),
      prisma.supportTicket.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      prisma.invoice.count({ where: { status: { in: ['OPEN', 'DRAFT', 'OVERDUE'] } } }),
      prisma.invoice.aggregate({
        where: { status: { in: ['OPEN', 'DRAFT', 'OVERDUE'] } },
        _sum: { amount: true },
      }),
      prisma.invoice.aggregate({
        where: { status: 'PAID', paidAt: { gte: since } },
        _sum: { amount: true },
      }),
      prisma.platformIntegration.count(),
      prisma.platformIntegration.count({ where: { isActive: true } }),
      prisma.subscriptionPlan.findMany({
        where: { isActive: true },
        orderBy: { priceMonthly: 'asc' },
        select: { id: true, name: true, tier: true, priceMonthly: true, maxBranches: true, maxEmployees: true },
      }),
      prisma.tenant.findMany({
        where: { deletedAt: null },
        include: {
          subscriptions: {
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { planTier: true, status: true },
          },
          _count: { select: { users: true, branches: true, orders: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
      }),
      prisma.supportTicket.findMany({
        orderBy: { createdAt: 'desc' },
        take: 6,
        include: { tenant: { select: { id: true, name: true } } },
      }),
      prisma.systemAnnouncement.count({ where: { isActive: true } }),
    ]);

    let dbOk = false;
    try {
      await prisma.$queryRaw`SELECT 1`;
      dbOk = true;
    } catch {
      dbOk = false;
    }

    return res.json({
      success: true,
      data: {
        tenantsByStatus: tenantsByStatus.map((row) => ({
          status: row.status,
          count: row._count._all,
        })),
        totalTenants,
        totalBranches,
        restaurantUsers,
        platformUsers,
        totalUsers: restaurantUsers + platformUsers,
        totalOrdersLast30d,
        gmvLast30d: Number(revenueAgg._sum.totalAmount || 0),
        openTickets,
        ticketsByStatus: ticketsByStatus.map((row) => ({
          status: row.status,
          count: row._count._all,
        })),
        openInvoices,
        openInvoiceAmount: Number(invoiceOpenAgg._sum.amount || 0),
        paidInvoiceAmount30d: Number(paidInvoiceAgg._sum.amount || 0),
        integrations,
        activeIntegrations,
        activeAnnouncements: announcements,
        plans,
        recentTenants: recentTenants.map((t) => ({
          id: t.id,
          name: t.name,
          companyName: t.companyName,
          status: t.status,
          planTier: t.subscriptions[0]?.planTier || null,
          subscriptionStatus: t.subscriptions[0]?.status || null,
          users: t._count.users,
          branches: t._count.branches,
          orders: t._count.orders,
          createdAt: t.createdAt,
        })),
        recentTickets: recentTickets.map((t) => ({
          id: t.id,
          subject: t.subject,
          status: t.status,
          priority: t.priority,
          requesterEmail: t.requesterEmail,
          tenantName: t.tenant?.name || 'Platform',
          createdAt: t.createdAt,
        })),
        health: {
          database: dbOk ? 'ok' : 'down',
          cache: 'ok',
          uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// --- Support tickets ---

export const listTickets = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { tenantId, status } = req.query;
    const where = {
      ...(tenantId ? { tenantId: String(tenantId) } : {}),
      ...(status ? { status: status as TicketStatus } : {}),
    };
    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.supportTicket.count({ where }),
    ]);
    return res.json(paginatedResponse(tickets, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const createTicket = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { tenantId, subject, description, priority, requesterEmail, assigneeName, status } = req.body;
    if (!subject || !description || !requesterEmail) {
      return next(new AppError('subject, description, and requesterEmail are required', 400, 'VALIDATION_ERROR'));
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        tenantId: tenantId || null,
        subject,
        description,
        priority: priority || 'MEDIUM',
        requesterEmail,
        assigneeName,
        status: (status as TicketStatus) || TicketStatus.OPEN,
      },
    });
    return res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    next(error);
  }
};

export const updateTicket = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, priority, assigneeName, subject, description } = req.body;

    const ticket = await prisma.supportTicket.findUnique({ where: { id } });
    if (!ticket) return next(new AppError('Ticket not found', 404, 'RESOURCE_NOT_FOUND'));

    const updated = await prisma.supportTicket.update({
      where: { id },
      data: {
        status: status !== undefined ? (status as TicketStatus) : undefined,
        priority: priority !== undefined ? priority : undefined,
        assigneeName: assigneeName !== undefined ? assigneeName : undefined,
        subject: subject !== undefined ? subject : undefined,
        description: description !== undefined ? description : undefined,
      },
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// --- Integrations ---

export const listIntegrations = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const [integrations, total] = await Promise.all([
      prisma.platformIntegration.findMany({ orderBy: { name: 'asc' }, skip, take: limit }),
      prisma.platformIntegration.count(),
    ]);
    return res.json(paginatedResponse(integrations, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const upsertIntegration = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id, name, channel, config, isActive } = req.body;

    if (id) {
      const existing = await prisma.platformIntegration.findUnique({ where: { id } });
      if (!existing) return next(new AppError('Integration not found', 404, 'RESOURCE_NOT_FOUND'));

      const updated = await prisma.platformIntegration.update({
        where: { id },
        data: {
          name: name ?? existing.name,
          channel: (channel as IntegrationChannel) ?? existing.channel,
          config: config !== undefined ? config : existing.config,
          isActive: isActive !== undefined ? isActive : existing.isActive,
        },
      });
      return res.json({ success: true, data: updated });
    }

    if (!name || !channel) {
      return next(new AppError('name and channel are required', 400, 'VALIDATION_ERROR'));
    }

    const created = await prisma.platformIntegration.create({
      data: {
        name,
        channel: channel as IntegrationChannel,
        config: config ?? undefined,
        isActive: isActive !== undefined ? isActive : true,
      },
    });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    next(error);
  }
};

// --- API keys ---

export const listApiKeys = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { tenantId } = req.query;
    const where = tenantId ? { tenantId: String(tenantId) } : undefined;
    const [keys, total] = await Promise.all([
      prisma.apiKeyRecord.findMany({
        where,
        select: {
          id: true,
          name: true,
          keyPrefix: true,
          tenantId: true,
          createdBy: true,
          revokedAt: true,
          lastUsedAt: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.apiKeyRecord.count({ where }),
    ]);
    return res.json(paginatedResponse(keys, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const createApiKey = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, tenantId } = req.body;
    if (!name) return next(new AppError('name is required', 400, 'VALIDATION_ERROR'));

    const plaintext = `rop_${randomBytes(24).toString('hex')}`;
    const keyPrefix = plaintext.slice(0, 12);
    const keyHash = await bcrypt.hash(plaintext, 10);

    const record = await prisma.apiKeyRecord.create({
      data: {
        name,
        keyPrefix,
        keyHash,
        tenantId: tenantId || null,
        createdBy: req.user?.id,
      },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        tenantId: true,
        createdBy: true,
        revokedAt: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      data: { ...record, apiKey: plaintext },
    });
  } catch (error) {
    next(error);
  }
};

export const revokeApiKey = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const key = await prisma.apiKeyRecord.findUnique({ where: { id } });
    if (!key) return next(new AppError('API key not found', 404, 'RESOURCE_NOT_FOUND'));
    if (key.revokedAt) return next(new AppError('API key already revoked', 400, 'ALREADY_REVOKED'));

    const updated = await prisma.apiKeyRecord.update({
      where: { id },
      data: { revokedAt: new Date() },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        tenantId: true,
        revokedAt: true,
        createdAt: true,
      },
    });
    return res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

// --- Tax settings ---

export const listTaxSettings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const [settings, total] = await Promise.all([
      prisma.globalTaxSetting.findMany({
        orderBy: [{ country: 'asc' }, { taxName: 'asc' }],
        skip,
        take: limit,
      }),
      prisma.globalTaxSetting.count(),
    ]);
    return res.json(paginatedResponse(settings, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const upsertTaxSetting = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id, country, taxName, rate, isDefault } = req.body;

    if (id) {
      const existing = await prisma.globalTaxSetting.findUnique({ where: { id } });
      if (!existing) return next(new AppError('Tax setting not found', 404, 'RESOURCE_NOT_FOUND'));

      const updated = await prisma.globalTaxSetting.update({
        where: { id },
        data: {
          country: country ?? existing.country,
          taxName: taxName ?? existing.taxName,
          rate: rate !== undefined ? rate : existing.rate,
          isDefault: isDefault !== undefined ? isDefault : existing.isDefault,
        },
      });
      return res.json({ success: true, data: updated });
    }

    if (!country || !taxName || rate === undefined) {
      return next(new AppError('country, taxName, and rate are required', 400, 'VALIDATION_ERROR'));
    }

    const created = await prisma.globalTaxSetting.create({
      data: {
        country,
        taxName,
        rate,
        isDefault: isDefault !== undefined ? isDefault : false,
      },
    });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    next(error);
  }
};

export const deleteTaxSetting = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const setting = await prisma.globalTaxSetting.findUnique({ where: { id } });
    if (!setting) return next(new AppError('Tax setting not found', 404, 'RESOURCE_NOT_FOUND'));

    await prisma.globalTaxSetting.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// --- Backup policies ---

export const listBackupPolicies = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const [policies, total] = await Promise.all([
      prisma.backupPolicy.findMany({ orderBy: { name: 'asc' }, skip, take: limit }),
      prisma.backupPolicy.count(),
    ]);
    return res.json(paginatedResponse(policies, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const upsertBackupPolicy = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id, name, frequency, retentionDays, isActive, lastRunAt } = req.body;

    if (id) {
      const existing = await prisma.backupPolicy.findUnique({ where: { id } });
      if (!existing) return next(new AppError('Backup policy not found', 404, 'RESOURCE_NOT_FOUND'));

      const updated = await prisma.backupPolicy.update({
        where: { id },
        data: {
          name: name ?? existing.name,
          frequency: frequency ?? existing.frequency,
          retentionDays: retentionDays ?? existing.retentionDays,
          isActive: isActive !== undefined ? isActive : existing.isActive,
          lastRunAt: lastRunAt !== undefined ? (lastRunAt ? new Date(lastRunAt) : null) : existing.lastRunAt,
        },
      });
      return res.json({ success: true, data: updated });
    }

    if (!name || !frequency || retentionDays === undefined) {
      return next(new AppError('name, frequency, and retentionDays are required', 400, 'VALIDATION_ERROR'));
    }

    const created = await prisma.backupPolicy.create({
      data: {
        name,
        frequency,
        retentionDays,
        isActive: isActive !== undefined ? isActive : true,
        lastRunAt: lastRunAt ? new Date(lastRunAt) : undefined,
      },
    });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    next(error);
  }
};

// --- Announcements ---

export const listAnnouncements = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const [announcements, total] = await Promise.all([
      prisma.systemAnnouncement.findMany({ orderBy: { createdAt: 'desc' }, skip, take: limit }),
      prisma.systemAnnouncement.count(),
    ]);
    return res.json(paginatedResponse(announcements, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const upsertAnnouncement = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id, title, body, audience, startsAt, endsAt, isActive } = req.body;

    if (id) {
      const existing = await prisma.systemAnnouncement.findUnique({ where: { id } });
      if (!existing) return next(new AppError('Announcement not found', 404, 'RESOURCE_NOT_FOUND'));

      const updated = await prisma.systemAnnouncement.update({
        where: { id },
        data: {
          title: title ?? existing.title,
          body: body ?? existing.body,
          audience: audience ?? existing.audience,
          startsAt: startsAt !== undefined ? (startsAt ? new Date(startsAt) : null) : existing.startsAt,
          endsAt: endsAt !== undefined ? (endsAt ? new Date(endsAt) : null) : existing.endsAt,
          isActive: isActive !== undefined ? isActive : existing.isActive,
        },
      });
      return res.json({ success: true, data: updated });
    }

    if (!title || !body) {
      return next(new AppError('title and body are required', 400, 'VALIDATION_ERROR'));
    }

    const created = await prisma.systemAnnouncement.create({
      data: {
        title,
        body,
        audience: audience || 'ALL',
        startsAt: startsAt ? new Date(startsAt) : undefined,
        endsAt: endsAt ? new Date(endsAt) : undefined,
        isActive: isActive !== undefined ? isActive : true,
      },
    });
    return res.status(201).json({ success: true, data: created });
  } catch (error) {
    next(error);
  }
};

export const deleteAnnouncement = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const announcement = await prisma.systemAnnouncement.findUnique({ where: { id } });
    if (!announcement) return next(new AppError('Announcement not found', 404, 'RESOURCE_NOT_FOUND'));

    await prisma.systemAnnouncement.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// --- Platform-wide audit logs (SUPER_ADMIN) ---

export const listAuditLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination(req.query, { maxLimit: 500 });
    const { tenantId } = req.query;
    const where = tenantId ? { tenantId: String(tenantId) } : undefined;

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where,
        include: {
          user: { select: { id: true, email: true, name: true } },
          tenant: { select: { id: true, name: true } },
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

// --- Platform admin-panel branding (System Settings) ---

async function ensurePlatformBranding() {
  const existing = await prisma.platformBranding.findFirst({ orderBy: { updatedAt: 'desc' } });
  if (existing) return existing;
  return prisma.platformBranding.create({
    data: {
      appName: 'Restaurant Ops',
      logo: null,
      favicon: null,
    },
  });
}

export const getPlatformBranding = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const branding = await ensurePlatformBranding();
    return res.json({ success: true, data: branding });
  } catch (error) {
    next(error);
  }
};

export const updatePlatformBranding = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { appName, logo, favicon } = req.body;
    const existing = await ensurePlatformBranding();

    const updated = await prisma.platformBranding.update({
      where: { id: existing.id },
      data: {
        appName: appName !== undefined ? String(appName).trim() || existing.appName : existing.appName,
        logo: logo !== undefined ? (logo ? String(logo) : null) : existing.logo,
        favicon: favicon !== undefined ? (favicon ? String(favicon) : null) : existing.favicon,
      },
    });

    return res.json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const uploadPlatformBrandingAsset = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { imageBase64, filename } = req.body;

  if (!imageBase64 || !filename) {
    return next(new AppError('imageBase64 and filename are required', 400, 'INVALID_INPUT_BODY'));
  }

  try {
    const cleanExt = path.extname(filename).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.ico', '.svg'];
    if (!allowedExts.includes(cleanExt)) {
      return next(new AppError('Only image files are allowed', 400, 'INVALID_FILE_TYPE'));
    }

    const matches = String(imageBase64).match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return next(new AppError('Invalid base64 image format', 400, 'INVALID_BASE64_FORMAT'));
    }

    const imageBuffer = Buffer.from(matches[2], 'base64');
    const uploadsDir = path.resolve('C:/xampp/htdocs/restaurant_operations_platform/frontend/public/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const uniqueFilename = `${Date.now()}-branding-${path.basename(filename, cleanExt)}${cleanExt}`;
    fs.writeFileSync(path.join(uploadsDir, uniqueFilename), imageBuffer);

    return res.json({
      success: true,
      data: { imageUrl: `/uploads/${uniqueFilename}` },
    });
  } catch (error: any) {
    next(new AppError(`File write failed: ${error.message}`, 500, 'FILE_WRITE_ERROR'));
  }
};
