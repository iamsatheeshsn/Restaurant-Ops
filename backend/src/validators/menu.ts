import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/error';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const validateCategory = (req: Request, res: Response, next: NextFunction) => {
  const { name } = req.body;
  const errors: string[] = [];

  if (!name || name.trim().length < 2) {
    errors.push('Category name must be at least 2 characters long');
  }

  if (errors.length > 0) {
    return next(new AppError('Request validation failed', 400, 'INVALID_INPUT_BODY', errors));
  }

  next();
};

export const validateMenuItem = (req: Request, res: Response, next: NextFunction) => {
  const { name, price, categoryId, recipes } = req.body;
  const errors: string[] = [];

  if (!name || name.trim().length < 2) {
    errors.push('Menu item name must be at least 2 characters long');
  }

  const parsedPrice = parseFloat(price);
  if (isNaN(parsedPrice) || parsedPrice <= 0) {
    errors.push('Price must be a valid positive decimal number');
  }

  if (!categoryId || !UUID_REGEX.test(categoryId)) {
    errors.push('A valid category UUID is required');
  }

  if (recipes && !Array.isArray(recipes)) {
    errors.push('Recipes must be an array of ingredient mappings');
  } else if (recipes) {
    recipes.forEach((r: any, idx: number) => {
      if (!r.ingredientId || !UUID_REGEX.test(r.ingredientId)) {
        errors.push(`Recipe at index ${idx} requires a valid ingredient UUID`);
      }
      const qty = parseFloat(r.quantity);
      if (isNaN(qty) || qty <= 0) {
        errors.push(`Recipe at index ${idx} requires a positive quantity value`);
      }
    });
  }

  if (errors.length > 0) {
    return next(new AppError('Request validation failed', 400, 'INVALID_INPUT_BODY', errors));
  }

  next();
};
