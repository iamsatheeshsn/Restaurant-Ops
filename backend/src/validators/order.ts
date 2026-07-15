import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/error';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const validateOrder = (req: Request, res: Response, next: NextFunction) => {
  const { type, branchId, tableId, items } = req.body;
  const errors: string[] = [];

  if (!branchId || !UUID_REGEX.test(branchId)) {
    errors.push('A valid branch UUID is required');
  }

  const validTypes = ['DINE_IN', 'TAKE_AWAY', 'DELIVERY', 'ONLINE'];
  if (!type || !validTypes.includes(type)) {
    errors.push(`Order type must be one of: ${validTypes.join(', ')}`);
  }

  if (type === 'DINE_IN') {
    if (!tableId || !UUID_REGEX.test(tableId)) {
      errors.push('Table UUID is required for DINE_IN orders');
    }
  }

  if (!items || !Array.isArray(items) || items.length === 0) {
    errors.push('Order must contain at least one menu item');
  } else {
    items.forEach((item: any, idx: number) => {
      if (!item.menuItemId || !UUID_REGEX.test(item.menuItemId)) {
        errors.push(`Item at index ${idx} requires a valid menu item UUID`);
      }
      const qty = parseInt(item.quantity);
      if (isNaN(qty) || qty <= 0) {
        errors.push(`Item at index ${idx} requires a positive quantity integer`);
      }
    });
  }

  if (errors.length > 0) {
    return next(new AppError('Request validation failed', 400, 'INVALID_INPUT_BODY', errors));
  }

  next();
};
