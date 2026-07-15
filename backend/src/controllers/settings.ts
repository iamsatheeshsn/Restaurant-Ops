import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';

export const getSettings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Global Super Admin: admin-panel branding (no restaurant tenant)
    if (!req.tenantId && req.user?.role === 'SUPER_ADMIN') {
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
          currency: 'USD',
          timezone: 'UTC',
        },
      });
    }

    const activeTenantId = req.tenantId!;

    let settings = await prisma.tenantSettings.findUnique({
      where: { tenantId: activeTenantId }
    });

    if (!settings) {
      settings = await prisma.tenantSettings.create({
        data: {
          tenantId: activeTenantId
        }
      });
    }

    return res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const activeTenantId = req.tenantId!;

  const {
    appName,
    logo,
    favicon,
    homeBannerTitle,
    homeBannerSubtitle,
    homeBannerImage,
    ourStoryTitle,
    ourStoryContent,
    ourStoryImage,
    platformHighlights,
    highlightsTitle,
    highlightsDescription,
    coffeeHouseCaption,
    hoursOfService,
    findUsAddress,
    findUsPhone,
    findUsEmail,
    findUsMapUrl,
    footerContent,
    currency,
    timezone,
    lowStockNotification,
    autoCloseShiftsAt,
  } = req.body;

  try {
    const settings = await prisma.tenantSettings.upsert({
      where: { tenantId: activeTenantId },
      update: {
        appName,
        logo,
        favicon,
        homeBannerTitle,
        homeBannerSubtitle,
        homeBannerImage,
        ourStoryTitle,
        ourStoryContent,
        ourStoryImage,
        platformHighlights,
        highlightsTitle,
        highlightsDescription,
        coffeeHouseCaption,
        hoursOfService,
        findUsAddress,
        findUsPhone,
        findUsEmail,
        findUsMapUrl,
        footerContent,
        currency,
        timezone,
        lowStockNotification,
        autoCloseShiftsAt: autoCloseShiftsAt || null,
      },
      create: {
        tenantId: activeTenantId,
        appName,
        logo,
        favicon,
        homeBannerTitle,
        homeBannerSubtitle,
        homeBannerImage,
        ourStoryTitle,
        ourStoryContent,
        ourStoryImage,
        platformHighlights,
        highlightsTitle,
        highlightsDescription,
        coffeeHouseCaption,
        hoursOfService,
        findUsAddress,
        findUsPhone,
        findUsEmail,
        findUsMapUrl,
        footerContent,
        currency,
        timezone,
        lowStockNotification,
        autoCloseShiftsAt: autoCloseShiftsAt || null,
      }
    });

    return res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    next(error);
  }
};
