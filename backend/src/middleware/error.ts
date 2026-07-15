import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';

export class AppError extends Error {
  public statusCode: number;
  public errorCode: string;
  public validationErrors?: any[];

  constructor(message: string, statusCode: number, errorCode: string, validationErrors?: any[]) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.validationErrors = validationErrors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const errorCode = err.errorCode || 'INTERNAL_SERVER_ERROR';

  // Log error stacks for unhandled exceptions or critical server failures
  if (statusCode === 500) {
    logger.error(`[Unhandled Exception] Path: ${req.path} | Error: ${err.message}\nStack: ${err.stack}`);
  } else {
    logger.warn(`[Client Error] Path: ${req.path} | Status: ${statusCode} | Code: ${errorCode} | Msg: ${err.message}`);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || 'Something went wrong on the server',
      code: errorCode,
      timestamp: new Date().toISOString(),
      ...(err.validationErrors ? { validationErrors: err.validationErrors } : {}),
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
    }
  });
};
