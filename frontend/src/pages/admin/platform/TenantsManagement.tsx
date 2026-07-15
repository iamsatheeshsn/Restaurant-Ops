import React, { useCallback, useEffect, useState } from 'react';
import { Plus, RefreshCw, X } from 'lucide-react';
import { api } from '../../../services/api';
import { useNotification } from '../../../context/NotificationContext';
import { StorefrontSettingsForm } from '../../../components/StorefrontSettingsForm';
import { PaginationControls } from '../../../components/PaginationControls';

export const TenantsManagement: React.FC = () => {
  const { showNotification, showConfirm } = useNotification();
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: '',
    companyName: '',
    slug: '',
    status: 'TRIAL',
    currency: 'USD',
    timezone: 'UTC',
    planTier: 'STARTER',
  });
  const [editingTenant, setEditingTenant] = useState<any | null>(null);
  const [plans, setPlans] = useState<any[]>([]);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.platform.tenants.list({ page, limit });
      setRows(result.data || []);
      setPagination(result.pagination);
    } catch (e: any) {
      showNotification({ title: 'Load failed', message: e.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    reload();
  }, [reload]);

  useEffect(() => {
    api.platform.plans
      .list({ limit: 50 })
      .then((r) => setPlans((r.data || []).filter((p: any) => p.isActive !== false)))
      .catch(() => setPlans([]));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const created = await api.platform.tenants.create({
        name: form.name,
        companyName: form.companyName,
        slug: form.slug || undefined,
        status: form.status,
        currency: form.currency,
        timezone: form.timezone,
        planTier: form.planTier,
      });
      showNotification({ title: 'Created', message: `${created.name} is ready on ${form.planTier}`, type: 'success' });
      setShowCreate(false);
      setForm({
        name: '',
        companyName: '',
        slug: '',
        status: 'TRIAL',
        currency: 'USD',
        timezone: 'UTC',
        planTier: 'STARTER',
      });
      setPage(1);
      await reload();
      setEditingTenant(created);
    } catch (err: any) {
      showNotification({ title: 'Create failed', message: err.message, type: 'error' });
    } finally {
      setCreating(false);
    }
  };

  const changePlan = (tenant: any, planTier: string) => {
    const current = tenant.subscriptions?.[0]?.planTier || 'none';
    if (current === planTier) return;
    showConfirm(`Change plan for ${tenant.name} from ${current} to ${planTier}?`, async () => {
      try {
        await api.platform.tenants.assignPlan(tenant.id, { planTier });
        showNotification({ title: 'Plan updated', message: `${tenant.name} → ${planTier}`, type: 'success' });
        await reload();
      } catch (err: any) {
        showNotification({ title: 'Plan change failed', message: err.message, type: 'error' });
        await reload();
      }
    }, 'Change plan');
  };

  if (editingTenant) {
    return (
      <div className="space-y-4 max-w-4xl">
        <button
          type="button"
          onClick={() => setEditingTenant(null)}
          className="text-[10px] uppercase tracking-widest text-[#a9b8c3] hover:text-white flex items-center gap-1"
        >
          <X className="h-3.5 w-3.5" /> Back to tenants
        </button>
        <StorefrontSettingsForm
          key={editingTenant.id}
          tenantId={editingTenant.id}
          heading={`${editingTenant.name} settings`}
          subheading={`Locale (currency, timezone), branding, and public site content for /r/${editingTenant.slug || '…'}.`}
          previewSlug={editingTenant.slug}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="font-title text-3xl uppercase tracking-widest text-white">Restaurant Tenants</h1>
          <p className="text-xs text-[#a9b8c3] mt-2 max-w-2xl leading-relaxed">
            Manage accounts and each restaurant’s public storefront branding. Open Storefront to edit the website that
            customers see at <span className="font-mono text-white">/r/&lt;slug&gt;</span>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={reload}
            className="px-3 py-2 border border-tastyc-copper/20 text-[#a9b8c3] hover:text-white text-xs uppercase tracking-wider"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 bg-tastyc-copper text-white text-xs uppercase tracking-widest font-semibold"
          >
            <Plus className="h-3.5 w-3.5" /> Add tenant
          </button>
        </div>
      </div>

      {showCreate && (
        <form onSubmit={handleCreate} className="bg-[#121e22] border border-tastyc-copper/15 p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="space-y-1.5 text-left">
              <span className="text-[10px] uppercase tracking-wider text-[#a9b8c3] font-semibold">Restaurant name</span>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white outline-none focus:border-tastyc-copper"
              />
            </label>
            <label className="space-y-1.5 text-left">
              <span className="text-[10px] uppercase tracking-wider text-[#a9b8c3] font-semibold">Company name</span>
              <input
                required
                value={form.companyName}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white outline-none focus:border-tastyc-copper"
              />
            </label>
            <label className="space-y-1.5 text-left">
              <span className="text-[10px] uppercase tracking-wider text-[#a9b8c3] font-semibold">Slug (optional)</span>
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="auto from name → /r/slug"
                className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white outline-none focus:border-tastyc-copper"
              />
            </label>
            <label className="space-y-1.5 text-left">
              <span className="text-[10px] uppercase tracking-wider text-[#a9b8c3] font-semibold">Status</span>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white outline-none focus:border-tastyc-copper"
              >
                <option value="TRIAL">Trial</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </label>
            <label className="space-y-1.5 text-left">
              <span className="text-[10px] uppercase tracking-wider text-[#a9b8c3] font-semibold">Currency</span>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white outline-none focus:border-tastyc-copper"
              >
                {['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'INR', 'AED', 'SAR', 'SGD', 'JPY'].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5 text-left">
              <span className="text-[10px] uppercase tracking-wider text-[#a9b8c3] font-semibold">Timezone</span>
              <select
                value={form.timezone}
                onChange={(e) => setForm({ ...form, timezone: e.target.value })}
                className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white outline-none focus:border-tastyc-copper"
              >
                {[
                  'UTC',
                  'America/New_York',
                  'America/Los_Angeles',
                  'Europe/London',
                  'Asia/Kolkata',
                  'Asia/Dubai',
                  'Asia/Singapore',
                  'Australia/Sydney',
                ].map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5 text-left sm:col-span-2">
              <span className="text-[10px] uppercase tracking-wider text-[#a9b8c3] font-semibold">
                Subscription plan
              </span>
              <select
                required
                value={form.planTier}
                onChange={(e) => setForm({ ...form, planTier: e.target.value })}
                className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white outline-none focus:border-tastyc-copper"
              >
                {(plans.length
                  ? plans
                  : [
                      { tier: 'STARTER', name: 'Starter', maxBranches: 1, maxEmployees: 10, priceMonthly: 49 },
                      { tier: 'GROWTH', name: 'Growth', maxBranches: 5, maxEmployees: 50, priceMonthly: 129 },
                      { tier: 'ENTERPRISE', name: 'Enterprise', maxBranches: 100, maxEmployees: 500, priceMonthly: 349 },
                    ]
                ).map((p: any) => (
                  <option key={p.tier || p.id} value={p.tier}>
                    {p.name} ({p.tier}) — {p.maxBranches} branches / {p.maxEmployees} staff
                    {p.priceMonthly != null ? ` · $${p.priceMonthly}/mo` : ''}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={() => setShowCreate(false)} className="px-4 py-2 text-xs uppercase text-[#a9b8c3]">
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 bg-tastyc-copper text-white text-xs uppercase tracking-widest font-semibold disabled:opacity-50"
            >
              {creating ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      )}

      <div className="bg-[#121e22] border border-tastyc-copper/10 overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-tastyc-copper/10 text-[10px] uppercase tracking-widest text-[#a9b8c3]">
              <th className="px-4 py-3 font-semibold">Restaurant</th>
              <th className="px-4 py-3 font-semibold">Storefront</th>
              <th className="px-4 py-3 font-semibold">Plan</th>
              <th className="px-4 py-3 font-semibold">Currency</th>
              <th className="px-4 py-3 font-semibold">Timezone</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-xs text-[#a9b8c3]">
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-xs text-[#a9b8c3]">
                  No tenants yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-white/5 hover:bg-tastyc-dark/30">
                  <td className="px-4 py-3 text-xs text-white font-semibold">{row.name}</td>
                  <td className="px-4 py-3 text-xs text-tastyc-copper font-mono">
                    {row.slug ? `/r/${row.slug}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <select
                      className="bg-tastyc-dark border border-tastyc-copper/20 px-2 py-1 text-[10px] uppercase tracking-wider text-white outline-none focus:border-tastyc-copper"
                      value={row.subscriptions?.[0]?.planTier || ''}
                      onChange={(e) => {
                        if (e.target.value) changePlan(row, e.target.value);
                      }}
                    >
                      {!row.subscriptions?.[0]?.planTier && <option value="">No plan</option>}
                      {['STARTER', 'GROWTH', 'ENTERPRISE'].map((tier) => (
                        <option key={tier} value={tier}>
                          {tier}
                          {row.subscriptions?.[0]?.planTier === tier
                            ? ` · ${row.subscriptions[0].maxBranches}b / ${row.subscriptions[0].maxEmployees}e`
                            : ''}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#a9b8c3]">{row.settings?.currency || 'USD'}</td>
                  <td className="px-4 py-3 text-xs text-[#a9b8c3]">{row.settings?.timezone || 'UTC'}</td>
                  <td className="px-4 py-3 text-xs">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 border ${
                        row.status === 'ACTIVE'
                          ? 'border-emerald-500/30 text-emerald-400'
                          : row.status === 'SUSPENDED'
                            ? 'border-amber-500/30 text-amber-400'
                            : 'border-white/20 text-[#a9b8c3]'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="flex flex-wrap gap-2">
                      <button
                        className="text-tastyc-copper hover:underline font-semibold"
                        onClick={() => setEditingTenant(row)}
                      >
                        Settings
                      </button>
                      {row.slug && (
                        <a href={`/r/${row.slug}`} target="_blank" rel="noreferrer" className="text-[#a9b8c3] hover:underline">
                          Open site
                        </a>
                      )}
                      {row.status !== 'ACTIVE' && (
                        <button
                          className="text-emerald-400 hover:underline"
                          onClick={() => {
                            showConfirm(`Activate tenant ${row.name}?`, async () => {
                              await api.platform.tenants.setStatus(row.id, 'ACTIVE');
                              showNotification({ title: 'Activated', message: `${row.name} is active`, type: 'success' });
                              reload();
                            }, 'Activate tenant');
                          }}
                        >
                          Activate
                        </button>
                      )}
                      {row.status !== 'SUSPENDED' && (
                        <button
                          className="text-amber-400 hover:underline"
                          onClick={() => {
                            showConfirm(`Suspend tenant ${row.name}? Restaurant users will lose access.`, async () => {
                              await api.platform.tenants.setStatus(row.id, 'SUSPENDED');
                              showNotification({ title: 'Suspended', message: `${row.name} suspended`, type: 'info' });
                              reload();
                            }, 'Suspend tenant');
                          }}
                        >
                          Suspend
                        </button>
                      )}
                      <button
                        className="text-red-400 hover:underline"
                        onClick={() => {
                          showConfirm(`Delete tenant ${row.name}? This cannot be easily undone.`, async () => {
                            try {
                              await api.platform.tenants.remove(row.id);
                              showNotification({ title: 'Deleted', message: 'Tenant soft-deleted', type: 'success' });
                              reload();
                            } catch (err: any) {
                              showNotification({
                                title: 'Delete failed',
                                message: err.message || 'Could not delete tenant',
                                type: 'error',
                              });
                            }
                          });
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
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
