import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import * as bcrypt from 'bcryptjs';
import { signAccessToken, signRefreshToken, verifyRefreshToken, TokenPayload } from '../utils/jwt';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/error';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { name, email, password, phone } = req.body;
  const tenantId = req.tenantId!;

  try {
    const existingUser = await prisma.user.findFirst({
      where: { email, tenantId, deletedAt: null }
    });

    if (existingUser) {
      return next(new AppError('Email address is already in use', 400, 'EMAIL_IN_USE'));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Dynamic role lookup. Customer accounts are assigned to a system CUSTOMER role.
    const customerRole = await prisma.role.findFirst({
      where: { name: 'CUSTOMER', tenantId }
    });

    if (!customerRole) {
      return next(new AppError('System customer role not configured. Run migrations.', 500, 'INTERNAL_SERVER_ERROR'));
    }

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name,
        phone,
        roleId: customerRole.id,
        tenantId,
      },
      include: {
        role: true
      }
    });

    const tokenPayload: TokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role.name,
      tenantId: user.tenantId,
      branchId: user.branchId,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken({ id: user.id });

    res.cookie('tastyc_refresh_token', refreshToken, COOKIE_OPTIONS);

    return res.status(201).json({
      success: true,
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role.name,
          tenantId: user.tenantId,
          branchId: user.branchId,
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  const tenantId = req.tenantId;

  try {
    // Global platform SUPER_ADMIN is not tied to a restaurant tenant.
    let user = await prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
        tenantId: null,
        role: { name: 'SUPER_ADMIN' },
      },
      include: { role: true },
    });

    if (!user && tenantId) {
      user = await prisma.user.findFirst({
        where: { email, tenantId, deletedAt: null },
        include: { role: true },
      });
    }

    // Staff admin login: if tenant-scoped lookup missed (wrong/default tenant header),
    // resolve by email across tenants (exclude customers).
    if (!user) {
      user = await prisma.user.findFirst({
        where: {
          email,
          deletedAt: null,
          tenantId: { not: null },
          role: { name: { not: 'CUSTOMER' } },
        },
        include: { role: true },
        orderBy: { createdAt: 'asc' },
      });
    }

    if (!user) {
      return next(new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return next(new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS'));
    }

    const tokenPayload: TokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role.name,
      tenantId: user.tenantId,
      branchId: user.branchId,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken({ id: user.id });

    res.cookie('tastyc_refresh_token', refreshToken, COOKIE_OPTIONS);

    return res.json({
      success: true,
      data: {
        accessToken,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role.name,
          tenantId: user.tenantId,
          branchId: user.branchId,
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: AuthRequest, res: Response, next: NextFunction) => {
  // Read token from cookie
  const refreshToken = req.cookies?.tastyc_refresh_token;

  if (!refreshToken) {
    return next(new AppError('Refresh token missing in cookies', 401, 'REFRESH_TOKEN_MISSING'));
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { role: true }
    });

    if (!user) {
      return next(new AppError('Session user no longer exists', 401, 'INVALID_SESSION'));
    }

    const tokenPayload: TokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role.name,
      tenantId: user.tenantId,
      branchId: user.branchId,
    };

    const accessToken = signAccessToken(tokenPayload);
    return res.json({
      success: true,
      data: {
        accessToken
      }
    });
  } catch (error) {
    return next(new AppError('Session has expired or token is invalid', 401, 'TOKEN_EXPIRED'));
  }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new AppError('Unauthorized context', 401, 'UNAUTHORIZED'));
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { role: true }
    });

    if (!user) {
      return next(new AppError('User profile not found', 404, 'RESOURCE_NOT_FOUND'));
    }

    return res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
        tenantId: user.tenantId,
        branchId: user.branchId,
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  res.clearCookie('tastyc_refresh_token', COOKIE_OPTIONS);
  return res.json({
    success: true,
    data: {
      message: 'Logged out successfully'
    }
  });
};
