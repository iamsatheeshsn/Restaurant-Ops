import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { ResourceModule } from '../../../components/ResourceModule';
import { useNotification } from '../../../context/NotificationContext';

const INVOICE_STATUSES = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'OPEN', label: 'Open / Sent' },
  { value: 'PAID', label: 'Paid' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'VOID', label: 'Void' },
] as const;

function statusClass(status: string) {
  const s = (status || '').toUpperCase();
  if (s === 'PAID') return 'border-emerald-500/30 text-emerald-400';
  if (s === 'OVERDUE') return 'border-red-500/30 text-red-400';
  if (s === 'VOID') return 'border-white/15 text-[#a9b8c3]';
  if (s === 'OPEN' || s === 'SENT') return 'border-tastyc-copper/40 text-tastyc-copper';
  return 'border-white/20 text-[#a9b8c3]';
}

const InvoiceRowActions: React.FC<{ row: any; reload: () => void }> = ({ row, reload }) => {
  const { showNotification, showConfirm } = useNotification();
  const [busy, setBusy] = useState<string | null>(null);
  const status = String(row.status || '').toUpperCase();
  const locked = status === 'PAID' || status === 'VOID';

  const setStatus = async (next: string, label: string) => {
    if (busy) return;
    setBusy(next);
    try {
      await api.platform.invoices.setStatus(row.id, next);
      showNotification({
        title: 'Invoice updated',
        message: `Marked as ${label}.`,
        type: 'success',
      });
      await Promise.resolve(reload());
    } catch (err: any) {
      showNotification({
        title: 'Action failed',
        message: err?.message || 'Could not update invoice status',
        type: 'error',
      });
    } finally {
      setBusy(null);
    }
  };

  const voidInvoice = () => {
    showConfirm(`Void invoice for ${row.tenant?.name || 'this tenant'}?`, () => {
      void setStatus('VOID', 'Void');
    }, 'Void invoice');
  };

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {status !== 'PAID' && status !== 'VOID' && (
        <button
          type="button"
          disabled={!!busy}
          className="text-emerald-400 hover:underline font-semibold disabled:opacity-40"
          onClick={() =>
            showConfirm(`Mark invoice for ${row.tenant?.name || 'this tenant'} as Paid?`, () => {
              void setStatus('PAID', 'Paid');
            }, 'Mark paid')
          }
        >
          {busy === 'PAID' ? 'Saving…' : 'Mark Paid'}
        </button>
      )}
      {(status === 'DRAFT' || status === 'SENT') && (
        <button
          type="button"
          disabled={!!busy}
          className="text-tastyc-copper hover:underline disabled:opacity-40"
          onClick={() =>
            showConfirm(`Send / open invoice for ${row.tenant?.name || 'this tenant'}?`, () => {
              void setStatus('OPEN', 'Open');
            }, 'Send invoice')
          }
        >
          {busy === 'OPEN' ? 'Saving…' : 'Send / Open'}
        </button>
      )}
      {!locked && status !== 'OVERDUE' && (
        <button
          type="button"
          disabled={!!busy}
          className="text-amber-400 hover:underline disabled:opacity-40"
          onClick={() =>
            showConfirm(`Mark invoice for ${row.tenant?.name || 'this tenant'} as Overdue?`, () => {
              void setStatus('OVERDUE', 'Overdue');
            }, 'Mark overdue')
          }
        >
          {busy === 'OVERDUE' ? 'Saving…' : 'Overdue'}
        </button>
      )}
      {status !== 'VOID' && (
        <button
          type="button"
          disabled={!!busy}
          className="text-red-400 hover:underline disabled:opacity-40"
          onClick={voidInvoice}
        >
          Void
        </button>
      )}
      {locked && <span className="text-[10px] uppercase tracking-wider text-[#a9b8c3]/70">{status}</span>}
    </div>
  );
};

export const PlatformBilling: React.FC = () => {
  const [tab, setTab] = useState<'plans' | 'invoices' | 'features'>('plans');
  const { showNotification, showConfirm } = useNotification();
  const [tenants, setTenants] = useState<any[]>([]);

  useEffect(() => {
    api.platform.tenants
      .list({ limit: 100 })
      .then((r) => setTenants(Array.isArray(r.data) ? r.data : []))
      .catch((err) =>
        showNotification({
          title: 'Tenants unavailable',
          message: err?.message || 'Could not load tenants for invoicing',
          type: 'error',
        })
      );
  }, []);

  const tabs = [
    { id: 'plans' as const, label: 'Subscription Plans' },
    { id: 'invoices' as const, label: 'Billing & Invoices' },
    { id: 'features' as const, label: 'Feature Access' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-tastyc-copper/10 pb-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold ${
              tab === t.id ? 'text-tastyc-copper border-b-2 border-tastyc-copper' : 'text-[#a9b8c3]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'plans' && (
        <ResourceModule
          title="Subscription Plans"
          subtitle="Manage SaaS plans and limits for restaurant tenants."
          columns={[
            { key: 'name', label: 'Plan' },
            { key: 'tier', label: 'Tier' },
            { key: 'priceMonthly', label: 'Price / mo' },
            { key: 'maxBranches', label: 'Branches' },
            { key: 'maxEmployees', label: 'Employees' },
            {
              key: 'isActive',
              label: 'Active',
              render: (r) => (r.isActive ? 'Yes' : 'No'),
            },
          ]}
          fields={[
            { name: 'name', label: 'Name', required: true },
            {
              name: 'tier',
              label: 'Tier',
              type: 'select',
              options: [
                { value: 'STARTER', label: 'Starter' },
                { value: 'GROWTH', label: 'Growth' },
                { value: 'ENTERPRISE', label: 'Enterprise' },
              ],
            },
            { name: 'priceMonthly', label: 'Monthly Price', type: 'number', required: true },
            { name: 'maxBranches', label: 'Max Branches', type: 'number', required: true },
            { name: 'maxEmployees', label: 'Max Employees', type: 'number', required: true },
          ]}
          load={(params) => api.platform.plans.list(params)}
          create={(p) =>
            api.platform.plans.save({
              ...p,
              priceMonthly: Number(p.priceMonthly),
              maxBranches: Number(p.maxBranches),
              maxEmployees: Number(p.maxEmployees),
              isActive: true,
            })
          }
          rowActions={(row, reload) => (
            <button
              type="button"
              className="text-red-400 hover:underline"
              onClick={() => {
                showConfirm(`Delete plan "${row.name}"?`, async () => {
                  try {
                    await api.platform.plans.remove(row.id);
                    showNotification({ title: 'Deleted', message: 'Plan removed', type: 'success' });
                    reload();
                  } catch (err: any) {
                    showNotification({
                      title: 'Delete failed',
                      message: err?.message || 'Could not delete plan',
                      type: 'error',
                    });
                  }
                }, 'Delete plan');
              }}
            >
              Delete
            </button>
          )}
        />
      )}

      {tab === 'invoices' && (
        <ResourceModule
          title="Billing & Invoices"
          subtitle="Issue and track platform invoices for tenants."
          columns={[
            { key: 'tenant.name', label: 'Tenant', render: (r) => r.tenant?.name || r.tenantId },
            {
              key: 'amount',
              label: 'Amount',
              render: (r) => `${r.currency || 'USD'} ${Number(r.amount).toFixed(2)}`,
            },
            {
              key: 'status',
              label: 'Status',
              render: (r) => (
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 border ${statusClass(r.status)}`}>
                  {r.status}
                </span>
              ),
            },
            {
              key: 'dueDate',
              label: 'Due',
              render: (r) => (r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '—'),
            },
            {
              key: 'description',
              label: 'Description',
              render: (r) => r.description || '—',
            },
          ]}
          fields={[
            {
              name: 'tenantId',
              label: 'Tenant',
              type: 'select',
              required: true,
              options: tenants.map((t) => ({ value: t.id, label: t.name })),
            },
            { name: 'amount', label: 'Amount', type: 'number', required: true },
            { name: 'currency', label: 'Currency', placeholder: 'USD' },
            { name: 'dueDate', label: 'Due Date', type: 'date' },
            { name: 'description', label: 'Description', type: 'textarea' },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: INVOICE_STATUSES.map((s) => ({ value: s.value, label: s.label })),
            },
          ]}
          load={(params) => api.platform.invoices.list(params)}
          create={(p) =>
            api.platform.invoices.create({
              ...p,
              amount: Number(p.amount),
              currency: p.currency || 'USD',
              status: p.status || 'DRAFT',
              dueDate: p.dueDate || undefined,
            })
          }
          rowActions={(row, reload) => <InvoiceRowActions row={row} reload={reload} />}
        />
      )}

      {tab === 'features' && (
        <ResourceModule
          title="Feature Access by Plan"
          subtitle="Toggle which features each subscription tier can use."
          columns={[
            { key: 'planTier', label: 'Plan Tier' },
            { key: 'featureKey', label: 'Feature' },
            {
              key: 'enabled',
              label: 'Enabled',
              render: (r) => (r.enabled ? 'On' : 'Off'),
            },
          ]}
          fields={[
            {
              name: 'planTier',
              label: 'Plan Tier',
              type: 'select',
              options: [
                { value: 'STARTER', label: 'Starter' },
                { value: 'GROWTH', label: 'Growth' },
                { value: 'ENTERPRISE', label: 'Enterprise' },
              ],
            },
            { name: 'featureKey', label: 'Feature Key', required: true, placeholder: 'e.g. catering, delivery' },
            { name: 'enabled', label: 'Enabled', type: 'checkbox' },
          ]}
          load={(params) => api.platform.featureFlags.list(params)}
          create={(p) => api.platform.featureFlags.save({ ...p, enabled: !!p.enabled })}
        />
      )}
    </div>
  );
};
