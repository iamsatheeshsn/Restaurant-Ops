import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middleware/error';

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;
  const errors: string[] = [];

  if (!name || name.trim().length < 3) {
    errors.push('Name must be at least 3 characters long');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('A valid email address is required');
  }

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }

  if (errors.length > 0) {
    return next(new AppError('Request validation failed', 400, 'INVALID_INPUT_BODY', errors));
  }

  next();
};

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  const errors: string[] = [];

  if (!email) errors.push('Email is required');
  if (!password) errors.push('Password is required');

  if (errors.length > 0) {
    return next(new AppError('Request validation failed', 400, 'INVALID_INPUT_BODY', errors));
  }

  next();
};
