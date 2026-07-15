import * as jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
  id: string;
  email: string;
  role: string;
  /** Null for global platform SUPER_ADMIN users. */
  tenantId: string | null;
  branchId: string | null;
}

export interface SupplierTokenPayload {
  id: string;
  email: string;
  role: 'SUPPLIER';
  tenantId: string;
  supplierId: string;
}

export const signAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: '15m' });
};

export const signRefreshToken = (payload: { id: string }): string => {
  return jwt.sign(payload, env.refreshSecret, { expiresIn: '7d' });
};

export const signSupplierToken = (payload: Omit<SupplierTokenPayload, 'role'>): string => {
  return jwt.sign(
    { ...payload, role: 'SUPPLIER' satisfies SupplierTokenPayload['role'] },
    env.jwtSecret,
    { expiresIn: '12h' }
  );
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.jwtSecret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): { id: string } => {
  return jwt.verify(token, env.refreshSecret) as { id: string };
};

export const verifySupplierToken = (token: string): SupplierTokenPayload => {
  const payload = jwt.verify(token, env.jwtSecret) as SupplierTokenPayload;
  if (payload.role !== 'SUPPLIER' || !payload.supplierId) {
    throw new Error('Not a supplier token');
  }
  return payload;
};
