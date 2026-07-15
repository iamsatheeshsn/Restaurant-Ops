import dotenv from 'dotenv';

dotenv.config();

function requireSecret(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `[Config] Missing required environment variable ${name}. ` +
        `Set it in backend/.env — hardcoded JWT fallbacks are not allowed.`
    );
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  jwtSecret: requireSecret('JWT_SECRET'),
  refreshSecret: requireSecret('REFRESH_SECRET'),
  /** Comma-separated browser origins allowed by CORS (credentials-compatible). */
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:4173')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  /**
   * Optional single-tenant default used when X-Tenant-ID is absent
   * (local/demo). Production multi-tenant should omit this and require the header.
   */
  defaultTenantId: process.env.DEFAULT_TENANT_ID?.trim() || null,
};
