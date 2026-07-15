import { Request } from 'express';

export type PaginationParams = {
  page: number;
  limit: number;
  skip: number;
};

export type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const DEFAULT_LIMIT = 20;
const DEFAULT_MAX = 100;

/**
 * Parse `page` / `limit` from query string.
 * Defaults: page=1, limit=20, max limit=100.
 */
export function parsePagination(
  query: Request['query'] | Record<string, unknown>,
  opts?: { defaultLimit?: number; maxLimit?: number }
): PaginationParams {
  const defaultLimit = opts?.defaultLimit ?? DEFAULT_LIMIT;
  const maxLimit = opts?.maxLimit ?? DEFAULT_MAX;

  const pageRaw = parseInt(String(query.page ?? '1'), 10);
  const limitRaw = parseInt(String(query.limit ?? String(defaultLimit)), 10);

  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const limit = Math.min(
    maxLimit,
    Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : defaultLimit
  );

  return { page, limit, skip: (page - 1) * limit };
}

export function paginationMeta(total: number, page: number, limit: number): PaginationMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / Math.max(limit, 1))),
  };
}

export function paginatedResponse<T>(data: T[], total: number, page: number, limit: number) {
  return {
    success: true as const,
    data,
    pagination: paginationMeta(total, page, limit),
  };
}
