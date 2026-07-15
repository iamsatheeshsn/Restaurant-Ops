import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { parsePagination, paginatedResponse } from '../utils/pagination';
import { TenantStatus } from '@prisma/client';

const PUBLIC_STATUSES: TenantStatus[] = [TenantStatus.ACTIVE, TenantStatus.TRIAL];

/** Public admin-panel branding (login page, before auth). */
export const getPublicBranding = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let branding = await prisma.platformBranding.findFirst({ orderBy: { updatedAt: 'desc' } });
    if (!branding) {
      branding = await prisma.platformBranding.create({
        data: { appName: 'Restaurant Ops', logo: null, favicon: null },
      });
    }
    return res.json({
      success: true,
      data: {
        appName: branding.appName,
        logo: branding.logo,
        favicon: branding.favicon,
      },
    });
  } catch (error) {
    next(error);
  }
};

/** Directory of restaurants that have a public storefront. */
export const listPublicTenants = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const where = {
      deletedAt: null,
      status: { in: PUBLIC_STATUSES },
    };

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        select: {
          id: true,
          name: true,
          companyName: true,
          slug: true,
          status: true,
          settings: {
            select: {
              appName: true,
              logo: true,
              homeBannerImage: true,
              homeBannerSubtitle: true,
              currency: true,
              findUsAddress: true,
            },
          },
          _count: { select: { branches: true } },
        },
        orderBy: { name: 'asc' },
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

/** Resolve a storefront slug to tenant + branding settings. */
export const resolvePublicTenant = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const slug = String(req.params.slug || '')
      .trim()
      .toLowerCase();

    if (!slug) {
      return next(new AppError('Tenant slug is required', 400, 'VALIDATION_ERROR'));
    }

    const tenant = await prisma.tenant.findFirst({
      where: {
        slug,
        deletedAt: null,
        status: { in: PUBLIC_STATUSES },
      },
      select: {
        id: true,
        name: true,
        companyName: true,
        slug: true,
        status: true,
        settings: true,
        branches: {
          where: { deletedAt: null },
          select: { id: true, name: true, address: true, phone: true },
          orderBy: { name: 'asc' },
          take: 20,
        },
      },
    });

    if (!tenant) {
      return next(new AppError('Restaurant storefront not found', 404, 'TENANT_NOT_FOUND'));
    }

    return res.json({
      success: true,
      data: {
        id: tenant.id,
        name: tenant.name,
        companyName: tenant.companyName,
        slug: tenant.slug,
        status: tenant.status,
        settings: tenant.settings,
        branches: tenant.branches,
      },
    });
  } catch (error) {
    next(error);
  }
};
