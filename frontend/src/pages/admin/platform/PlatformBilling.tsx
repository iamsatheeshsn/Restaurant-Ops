import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { ResourceModule } from '../../../components/ResourceModule';
import { useNotification } from '../../../context/NotificationContext';

export const PlatformBilling: React.FC = () => {
  const [tab, setTab] = useState<'plans' | 'invoices' | 'features'>('plans');
  const { showNotification } = useNotification();
  const [tenants, setTenants] = useState<any[]>([]);

  useEffect(() => {
    api.platform.tenants.list({ limit: 100 }).then((r) => setTenants(r.data)).catch(() => undefined);
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
              className="text-red-400 hover:underline"
              onClick={async () => {
                await api.platform.plans.remove(row.id);
                showNotification({ title: 'Deleted', message: 'Plan removed', type: 'success' });
                reload();
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
            { key: 'amount', label: 'Amount' },
            { key: 'currency', label: 'Currency' },
            { key: 'status', label: 'Status' },
            {
              key: 'dueDate',
              label: 'Due',
              render: (r) => (r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '—'),
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
            { name: 'description', label: 'Description', type: 'textarea' },
            {
              name: 'status',
              label: 'Status',
              type: 'select',
              options: [
                { value: 'DRAFT', label: 'Draft' },
                { value: 'SENT', label: 'Sent' },
                { value: 'PAID', label: 'Paid' },
                { value: 'OVERDUE', label: 'Overdue' },
              ],
            },
          ]}
          load={(params) => api.platform.invoices.list(params)}
          create={(p) => api.platform.invoices.create({ ...p, amount: Number(p.amount), currency: p.currency || 'USD' })}
          rowActions={(row, reload) => (
            <button
              className="text-emerald-400 hover:underline"
              onClick={async () => {
                await api.platform.invoices.setStatus(row.id, 'PAID');
                reload();
              }}
            >
              Mark Paid
            </button>
          )}
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
