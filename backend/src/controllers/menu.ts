import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';
import { parsePagination, paginatedResponse } from '../utils/pagination';
import { Prisma } from '@prisma/client';

// --- Category Handlers ---

export const createCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { name } = req.body;
  const tenantId = req.tenantId!;

  try {
    const existing = await prisma.menuCategory.findFirst({
      where: { name, tenantId, deletedAt: null }
    });

    if (existing) {
      return next(new AppError('Category already exists under this tenant', 400, 'CATEGORY_EXISTS'));
    }

    const category = await prisma.menuCategory.create({
      data: {
        name,
        tenantId
      }
    });

    return res.status(201).json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;

  try {
    const { page, limit, skip } = parsePagination(req.query);
    const where = { tenantId, deletedAt: null };
    const [categories, total] = await Promise.all([
      prisma.menuCategory.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
      }),
      prisma.menuCategory.count({ where }),
    ]);

    return res.json(paginatedResponse(categories, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const tenantId = req.tenantId!;

  try {
    const category = await prisma.menuCategory.findFirst({
      where: { id, tenantId, deletedAt: null }
    });

    if (!category) {
      return next(new AppError('Category not found', 404, 'RESOURCE_NOT_FOUND'));
    }

    await prisma.menuCategory.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// --- Menu Item Handlers ---

export const createMenuItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { name, description, price, imageUrl, categoryId, modifiers, recipes, happyHourPrice, happyHourStart, happyHourEnd, isCombo, comboItems } = req.body;
  const tenantId = req.tenantId!;

  try {
    // 1. Verify category exists under tenant context
    const category = await prisma.menuCategory.findFirst({
      where: { id: categoryId, tenantId, deletedAt: null }
    });

    if (!category) {
      return next(new AppError('Invalid category selection', 400, 'INVALID_INPUT_BODY'));
    }

    // 2. Run transaction to create item, modifiers, and recipe mappings
    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.menuItem.create({
        data: {
          tenantId,
          categoryId,
          name,
          description,
          price: new Prisma.Decimal(price),
          imageUrl,
          isAvailable: true,
          happyHourPrice: happyHourPrice ? new Prisma.Decimal(happyHourPrice) : null,
          happyHourStart,
          happyHourEnd,
          isCombo: !!isCombo,
          comboItems
        }
      });

      // Modifiers list
      if (modifiers && Array.isArray(modifiers)) {
        await tx.menuModifier.createMany({
          data: modifiers.map((m: any) => ({
            tenantId,
            menuItemId: item.id,
            name: m.name,
            price: new Prisma.Decimal(m.price || 0),
            isAvailable: true
          }))
        });
      }

      // Recipe BOM mappings
      if (recipes && Array.isArray(recipes)) {
        // Validate ingredient ids belong to tenant
        const ingredientIds = recipes.map((r: any) => r.ingredientId);
        const count = await tx.ingredient.count({
          where: { id: { in: ingredientIds }, tenantId, deletedAt: null }
        });

        if (count !== recipes.length) {
          throw new AppError('One or more recipe ingredients do not exist under this tenant', 400, 'RESOURCE_NOT_FOUND');
        }

        await tx.recipe.createMany({
          data: recipes.map((r: any) => ({
            menuItemId: item.id,
            ingredientId: r.ingredientId,
            quantity: new Prisma.Decimal(r.quantity)
          }))
        });
      }

      return tx.menuItem.findUnique({
        where: { id: item.id },
        include: {
          modifiers: true,
          recipes: {
            include: {
              ingredient: true
            }
          }
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

export const getMenuItems = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const tenantId = req.tenantId!;
  const { categoryId } = req.query;
  const { page, limit, skip } = parsePagination(req.query);

  try {
    const whereClause: Prisma.MenuItemWhereInput = {
      tenantId,
      deletedAt: null,
      ...(categoryId ? { categoryId: categoryId as string } : {})
    };

    const [items, total] = await Promise.all([
      prisma.menuItem.findMany({
        where: whereClause,
        include: {
          category: true,
          modifiers: true,
          nutritionInfo: true,
        },
        skip,
        take: limit,
        orderBy: { name: 'asc' }
      }),
      prisma.menuItem.count({ where: whereClause })
    ]);

    return res.json(paginatedResponse(items, total, page, limit));
  } catch (error) {
    next(error);
  }
};

export const getMenuItemById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const tenantId = req.tenantId!;

  try {
    const item = await prisma.menuItem.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        category: true,
        modifiers: true,
        nutritionInfo: true,
        recipes: {
          include: {
            ingredient: true
          }
        }
      }
    });

    if (!item) {
      return next(new AppError('Menu item not found', 404, 'RESOURCE_NOT_FOUND'));
    }

    return res.json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

export const updateMenuItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { name, description, price, imageUrl, categoryId, isAvailable, modifiers, recipes, happyHourPrice, happyHourStart, happyHourEnd, isCombo, comboItems } = req.body;
  const tenantId = req.tenantId!;

  try {
    const item = await prisma.menuItem.findFirst({
      where: { id, tenantId, deletedAt: null }
    });

    if (!item) {
      return next(new AppError('Menu item not found', 404, 'RESOURCE_NOT_FOUND'));
    }

    if (categoryId) {
      const category = await prisma.menuCategory.findFirst({
        where: { id: categoryId, tenantId, deletedAt: null }
      });
      if (!category) {
        return next(new AppError('Invalid category selection', 400, 'INVALID_INPUT_BODY'));
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update main details
      await tx.menuItem.update({
        where: { id },
        data: {
          name,
          description,
          price: price ? new Prisma.Decimal(price) : undefined,
          imageUrl,
          categoryId,
          isAvailable,
          happyHourPrice: happyHourPrice === null ? null : happyHourPrice ? new Prisma.Decimal(happyHourPrice) : undefined,
          happyHourStart,
          happyHourEnd,
          isCombo: isCombo !== undefined ? !!isCombo : undefined,
          comboItems
        }
      });

      // 2. Modifiers logic: clean and write new
      if (modifiers && Array.isArray(modifiers)) {
        await tx.menuModifier.deleteMany({ where: { menuItemId: id } });
        await tx.menuModifier.createMany({
          data: modifiers.map((m: any) => ({
            tenantId,
            menuItemId: id,
            name: m.name,
            price: new Prisma.Decimal(m.price || 0),
            isAvailable: true
          }))
        });
      }

      // 3. Recipes logic: clean and write new
      if (recipes && Array.isArray(recipes)) {
        const ingredientIds = recipes.map((r: any) => r.ingredientId);
        const count = await tx.ingredient.count({
          where: { id: { in: ingredientIds }, tenantId, deletedAt: null }
        });

        if (count !== recipes.length) {
          throw new AppError('One or more recipe ingredients do not exist under this tenant', 400, 'RESOURCE_NOT_FOUND');
        }

        await tx.recipe.deleteMany({ where: { menuItemId: id } });
        await tx.recipe.createMany({
          data: recipes.map((r: any) => ({
            menuItemId: id,
            ingredientId: r.ingredientId,
            quantity: new Prisma.Decimal(r.quantity)
          }))
        });
      }

      return tx.menuItem.findUnique({
        where: { id },
        include: {
          modifiers: true,
          recipes: {
            include: {
              ingredient: true
            }
          }
        }
      });
    });

    return res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

export const deleteMenuItem = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const tenantId = req.tenantId!;

  try {
    const item = await prisma.menuItem.findFirst({
      where: { id, tenantId, deletedAt: null }
    });

    if (!item) {
      return next(new AppError('Menu item not found', 404, 'RESOURCE_NOT_FOUND'));
    }

    await prisma.menuItem.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

import fs from 'fs';
import path from 'path';

export const uploadMenuItemImage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { imageBase64, filename } = req.body;

  if (!imageBase64 || !filename) {
    return next(new AppError('imageBase64 and filename are required', 400, 'INVALID_INPUT_BODY'));
  }

  try {
    const cleanExt = path.extname(filename).toLowerCase();
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    if (!allowedExts.includes(cleanExt)) {
      return next(new AppError('Only image files (jpg, jpeg, png, webp, gif) are allowed', 400, 'INVALID_FILE_TYPE'));
    }

    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return next(new AppError('Invalid base64 image format', 400, 'INVALID_BASE64_FORMAT'));
    }

    const imageBuffer = Buffer.from(matches[2], 'base64');
    
    // Write directly into client's public uploads folder
    const uploadsDir = path.resolve('C:/xampp/htdocs/restaurant_operations_platform/frontend/public/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const uniqueFilename = `${Date.now()}-${path.basename(filename, cleanExt)}${cleanExt}`;
    const destinationPath = path.join(uploadsDir, uniqueFilename);

    fs.writeFileSync(destinationPath, imageBuffer);

    return res.json({
      success: true,
      data: {
        imageUrl: `/uploads/${uniqueFilename}`
      }
    });
  } catch (error: any) {
    next(new AppError(`File write failed: ${error.message}`, 500, 'FILE_WRITE_ERROR'));
  }
};
