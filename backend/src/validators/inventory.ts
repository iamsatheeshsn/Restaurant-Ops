import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/error';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const validateIngredient = (req: Request, res: Response, next: NextFunction) => {
  const { name, unit, lowStockThreshold } = req.body;
  const errors: string[] = [];

  if (!name || name.trim().length < 2) {
    errors.push('Ingredient name must be at least 2 characters long');
  }

  const validUnits = ['KG', 'GRAM', 'LITER', 'ML', 'PCS', 'BOX'];
  if (!unit || !validUnits.includes(unit)) {
    errors.push(`Unit must be one of: ${validUnits.join(', ')}`);
  }

  const threshold = parseFloat(lowStockThreshold);
  if (isNaN(threshold) || threshold < 0) {
    errors.push('Low stock threshold must be a valid positive number');
  }

  if (errors.length > 0) {
    return next(new AppError('Request validation failed', 400, 'INVALID_INPUT_BODY', errors));
  }

  next();
};

export const validateSupplier = (req: Request, res: Response, next: NextFunction) => {
  const { name, phone, email } = req.body;
  const errors: string[] = [];

  if (!name || name.trim().length < 2) {
    errors.push('Supplier name must be at least 2 characters long');
  }

  if (!phone) {
    errors.push('Supplier phone number is required');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (email && !emailRegex.test(email)) {
    errors.push('Invalid email address format');
  }

  if (errors.length > 0) {
    return next(new AppError('Request validation failed', 400, 'INVALID_INPUT_BODY', errors));
  }

  next();
};

export const validatePurchaseOrder = (req: Request, res: Response, next: NextFunction) => {
  const { supplierId, items } = req.body;
  const errors: string[] = [];

  if (!supplierId || !UUID_REGEX.test(supplierId)) {
    errors.push('A valid supplier UUID is required');
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push('At least one order item is required');
  } else {
    items.forEach((item: any, idx: number) => {
      if (!item.ingredientId || !UUID_REGEX.test(item.ingredientId)) {
        errors.push(`Item at index ${idx} requires a valid ingredient UUID`);
      }
      const qty = parseFloat(item.orderedQty);
      if (isNaN(qty) || qty <= 0) {
        errors.push(`Item at index ${idx} requires a positive ordered quantity`);
      }
      const price = parseFloat(item.unitPrice);
      if (isNaN(price) || price < 0) {
        errors.push(`Item at index ${idx} requires a valid unit price`);
      }
    });
  }

  if (errors.length > 0) {
    return next(new AppError('Request validation failed', 400, 'INVALID_INPUT_BODY', errors));
  }

  next();
};

export const validateAdjustment = (req: Request, res: Response, next: NextFunction) => {
  const { branchId, ingredientId, quantity, type } = req.body;
  const errors: string[] = [];

  if (!branchId || !UUID_REGEX.test(branchId)) {
    errors.push('A valid branch UUID is required');
  }

  if (!ingredientId || !UUID_REGEX.test(ingredientId)) {
    errors.push('A valid ingredient UUID is required');
  }

  const qty = parseFloat(quantity);
  if (isNaN(qty) || qty <= 0) {
    errors.push('Quantity must be a positive number');
  }

  const validTypes = ['STOCK_IN', 'STOCK_OUT', 'WASTE', 'TRANSFER_IN', 'TRANSFER_OUT'];
  if (!type || !validTypes.includes(type)) {
    errors.push(`Type must be one of: ${validTypes.join(', ')}`);
  }

  if (errors.length > 0) {
    return next(new AppError('Request validation failed', 400, 'INVALID_INPUT_BODY', errors));
  }

  next();
};
