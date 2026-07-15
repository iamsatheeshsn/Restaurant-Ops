import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type PaginationState = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type Props = {
  pagination: PaginationState;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];
  className?: string;
};

export const PaginationControls: React.FC<Props> = ({
  pagination,
  onPageChange,
  onLimitChange,
  limitOptions = [10, 20, 50],
  className = '',
}) => {
  const { page, limit, total, totalPages } = pagination;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 text-xs text-[#a9b8c3] ${className}`}
    >
      <p className="uppercase tracking-wider">
        Showing <span className="text-white font-semibold">{from}</span>–
        <span className="text-white font-semibold">{to}</span> of{' '}
        <span className="text-white font-semibold">{total}</span>
      </p>
      <div className="flex items-center gap-3">
        {onLimitChange && (
          <label className="flex items-center gap-2">
            <span className="uppercase tracking-wider">Per page</span>
            <select
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="bg-tastyc-dark border border-tastyc-copper/20 px-2 py-1 text-white outline-none"
            >
              {limitOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="p-1.5 border border-tastyc-copper/20 disabled:opacity-30 hover:border-tastyc-copper/50"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="px-2 text-white font-semibold tabular-nums">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="p-1.5 border border-tastyc-copper/20 disabled:opacity-30 hover:border-tastyc-copper/50"
            aria-label="Next page"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
