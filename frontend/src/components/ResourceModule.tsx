import React, { useEffect, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { PaginationControls } from './PaginationControls';
import type { PaginatedResult } from '../services/api';

export type FieldType = 'text' | 'number' | 'textarea' | 'select' | 'date' | 'checkbox';

export interface FormField {
  name: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface Column {
  key: string;
  label: string;
  render?: (row: any) => React.ReactNode;
}

interface Props {
  title: string;
  subtitle?: string;
  columns: Column[];
  fields?: FormField[];
  load: (params: { page: number; limit: number }) => Promise<PaginatedResult>;
  create?: (payload: Record<string, any>) => Promise<any>;
  rowActions?: (row: any, reload: () => void) => React.ReactNode;
  emptyText?: string;
  headerExtra?: React.ReactNode;
}

export const ResourceModule: React.FC<Props> = ({
  title,
  subtitle,
  columns,
  fields = [],
  load,
  create,
  rowActions,
  emptyText = 'No records yet.',
  headerExtra,
}) => {
  const { showNotification } = useNotification();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  const reload = async (opts?: { page?: number; limit?: number; resetPage?: boolean }) => {
    const nextPage = opts?.resetPage ? 1 : opts?.page ?? page;
    const nextLimit = opts?.limit ?? limit;
    if (opts?.resetPage) setPage(1);
    setLoading(true);
    try {
      const result = await load({ page: nextPage, limit: nextLimit });
      setRows(Array.isArray(result?.data) ? result.data : []);
      setPagination(result?.pagination || { page: nextPage, limit: nextLimit, total: 0, totalPages: 1 });
    } catch (e: any) {
      showNotification({ title: 'Load failed', message: e.message || 'Could not load data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, [page, limit]);

  const openCreate = () => {
    const initial: Record<string, any> = {};
    fields.forEach((f) => {
      initial[f.name] = f.type === 'checkbox' ? false : f.options?.[0]?.value || '';
    });
    setForm(initial);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!create) return;
    setSaving(true);
    try {
      await create(form);
      showNotification({ title: 'Saved', message: 'Record created successfully', type: 'success' });
      setShowForm(false);
      await reload({ resetPage: true });
    } catch (err: any) {
      showNotification({ title: 'Save failed', message: err.message || 'Could not save', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const cellValue = (row: any, key: string) => {
    const parts = key.split('.');
    let v: any = row;
    for (const p of parts) v = v?.[p];
    if (v === null || v === undefined) return '—';
    if (typeof v === 'boolean') return v ? 'Yes' : 'No';
    if (typeof v === 'object') return JSON.stringify(v);
    return String(v);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-title text-3xl uppercase tracking-widest text-white">{title}</h1>
          {subtitle && <p className="text-xs text-[#a9b8c3] mt-2 max-w-2xl leading-relaxed">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          {headerExtra}
          <button
            onClick={() => reload()}
            className="px-3 py-2 border border-tastyc-copper/20 text-[#a9b8c3] hover:text-white text-xs uppercase tracking-wider"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          {create && fields.length > 0 && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 bg-tastyc-copper text-white text-xs uppercase tracking-widest font-semibold"
            >
              <Plus className="h-3.5 w-3.5" /> Add
            </button>
          )}
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[#121e22] border border-tastyc-copper/15 p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fields.map((f) => (
              <label key={f.name} className={`space-y-1.5 text-left ${f.type === 'textarea' ? 'sm:col-span-2' : ''}`}>
                <span className="text-[10px] uppercase tracking-wider text-[#a9b8c3] font-semibold">{f.label}</span>
                {f.type === 'textarea' ? (
                  <textarea
                    required={f.required}
                    value={form[f.name] || ''}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white outline-none focus:border-tastyc-copper min-h-[80px]"
                  />
                ) : f.type === 'select' ? (
                  <select
                    required={f.required}
                    value={form[f.name] || ''}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
                    className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white outline-none focus:border-tastyc-copper"
                  >
                    {f.options?.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                ) : f.type === 'checkbox' ? (
                  <input
                    type="checkbox"
                    checked={!!form[f.name]}
                    onChange={(e) => setForm({ ...form, [f.name]: e.target.checked })}
                    className="h-4 w-4 accent-tastyc-copper"
                  />
                ) : (
                  <input
                    type={f.type || 'text'}
                    required={f.required}
                    placeholder={f.placeholder}
                    value={form[f.name] ?? ''}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        [f.name]: f.type === 'number' ? e.target.value : e.target.value,
                      })
                    }
                    className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white outline-none focus:border-tastyc-copper"
                  />
                )}
              </label>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-xs uppercase text-[#a9b8c3]">
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-tastyc-copper text-white text-xs uppercase tracking-widest font-semibold disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-[#121e22] border border-tastyc-copper/10 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-tastyc-copper/10 text-[10px] uppercase tracking-widest text-[#a9b8c3]">
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-3 font-semibold">
                  {c.label}
                </th>
              ))}
              {rowActions && <th className="px-4 py-3 font-semibold">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + (rowActions ? 1 : 0)} className="px-4 py-10 text-center text-xs text-[#a9b8c3]">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (rowActions ? 1 : 0)} className="px-4 py-10 text-center text-xs text-[#a9b8c3]">
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id || JSON.stringify(row)} className="border-b border-white/5 hover:bg-tastyc-dark/30">
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3 text-xs text-white">
                      {c.render ? c.render(row) : cellValue(row, c.key)}
                    </td>
                  ))}
                  {rowActions && <td className="px-4 py-3 text-xs">{rowActions(row, () => reload())}</td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="px-4 pb-4">
          <PaginationControls
            pagination={pagination}
            onPageChange={setPage}
            onLimitChange={(n) => {
              setLimit(n);
              setPage(1);
            }}
          />
        </div>
      </div>
    </div>
  );
};
