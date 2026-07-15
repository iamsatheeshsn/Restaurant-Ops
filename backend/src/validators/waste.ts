import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/error';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const validateWasteLog = (req: Request, res: Response, next: NextFunction) => {
  const { branchId, ingredientId, quantity, reason } = req.body;
  const errors: string[] = [];

  if (!branchId || !UUID_REGEX.test(branchId)) {
    errors.push('A valid branch UUID is required');
  }

  if (!ingredientId || !UUID_REGEX.test(ingredientId)) {
    errors.push('A valid ingredient UUID is required');
  }

  const qty = parseFloat(quantity);
  if (isNaN(qty) || qty <= 0) {
    errors.push('Waste quantity must be a positive number');
  }

  if (!reason || reason.trim().length < 3) {
    errors.push('A valid reason (spill, expired) is required');
  }

  if (errors.length > 0) {
    return next(new AppError('Request validation failed', 400, 'INVALID_INPUT_BODY', errors));
  }

  next();
};
