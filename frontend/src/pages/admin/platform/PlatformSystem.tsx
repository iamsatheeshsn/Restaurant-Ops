import React, { useEffect, useState } from 'react';
import { api } from '../../../services/api';
import { ResourceModule } from '../../../components/ResourceModule';
import { useNotification } from '../../../context/NotificationContext';

export const PlatformSystem: React.FC = () => {
  const [tab, setTab] = useState<'health' | 'analytics' | 'backups' | 'announcements'>('health');
  const [health, setHealth] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const { showNotification, showConfirm } = useNotification();

  useEffect(() => {
    if (tab === 'health') {
      api.platform.health().then(setHealth).catch((e) =>
        showNotification({ title: 'Error', message: e.message, type: 'error' })
      );
    }
    if (tab === 'analytics') {
      api.platform.analytics().then(setAnalytics).catch((e) =>
        showNotification({ title: 'Error', message: e.message, type: 'error' })
      );
    }
  }, [tab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-tastyc-copper/10 pb-2">
        {[
          ['health', 'System Health'],
          ['analytics', 'Platform Analytics'],
          ['backups', 'Backup Policies'],
          ['announcements', 'Announcements'],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id as any)}
            className={`px-4 py-2 text-[10px] uppercase tracking-widest font-bold ${
              tab === id ? 'text-tastyc-copper border-b-2 border-tastyc-copper' : 'text-[#a9b8c3]'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'health' && (
        <div className="space-y-4">
          <h1 className="font-title text-3xl uppercase tracking-widest text-white">System Health</h1>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              ['Database', health?.database || '…'],
              ['Cache', health?.cache || '…'],
              ['Uptime (s)', health?.uptimeSeconds ?? '…'],
            ].map(([label, value]) => (
              <div key={label as string} className="bg-[#121e22] border border-tastyc-copper/10 p-5">
                <p className="text-[10px] uppercase tracking-widest text-[#a9b8c3]">{label}</p>
                <p className="text-xl text-white font-semibold mt-2">{String(value)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'analytics' && (
        <div className="space-y-4">
          <h1 className="font-title text-3xl uppercase tracking-widest text-white">Platform Analytics</h1>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              ['Tenants', analytics?.totalTenants],
              ['Branches', analytics?.totalBranches],
              ['Restaurant users', analytics?.restaurantUsers],
              ['Orders (30d)', analytics?.totalOrdersLast30d],
              ['GMV (30d)', analytics?.gmvLast30d != null ? `$${Number(analytics.gmvLast30d).toLocaleString()}` : '—'],
              ['Open tickets', analytics?.openTickets],
              ['Open invoices', analytics?.openInvoices],
              ['Integrations', analytics ? `${analytics.activeIntegrations}/${analytics.integrations}` : '—'],
            ].map(([label, value]) => (
              <div key={label as string} className="bg-[#121e22] border border-tastyc-copper/10 p-5">
                <p className="text-[10px] uppercase tracking-widest text-[#a9b8c3]">{label}</p>
                <p className="text-2xl text-tastyc-copper font-semibold mt-2">{value ?? '—'}</p>
              </div>
            ))}
          </div>
          {analytics?.tenantsByStatus && (
            <div className="bg-[#121e22] border border-tastyc-copper/10 p-5">
              <p className="text-[10px] uppercase tracking-widest text-[#a9b8c3] mb-3">Tenants by status</p>
              <div className="flex flex-wrap gap-3">
                {analytics.tenantsByStatus.map((row: any) => (
                  <div key={row.status} className="border border-tastyc-copper/10 px-4 py-2 text-sm text-white">
                    <span className="text-[#a9b8c3] text-[10px] uppercase tracking-widest mr-2">{row.status}</span>
                    {row.count}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'backups' && (
        <ResourceModule
          title="Backup Policies"
          subtitle="Configure automated backup frequency and retention."
          columns={[
            { key: 'name', label: 'Policy' },
            { key: 'frequency', label: 'Frequency' },
            { key: 'retentionDays', label: 'Retention (days)' },
            { key: 'isActive', label: 'Active', render: (r) => (r.isActive ? 'Yes' : 'No') },
          ]}
          fields={[
            { name: 'name', label: 'Name', required: true },
            {
              name: 'frequency',
              label: 'Frequency',
              type: 'select',
              options: [
                { value: 'DAILY', label: 'Daily' },
                { value: 'WEEKLY', label: 'Weekly' },
                { value: 'MONTHLY', label: 'Monthly' },
              ],
            },
            { name: 'retentionDays', label: 'Retention Days', type: 'number', required: true },
            { name: 'isActive', label: 'Active', type: 'checkbox' },
          ]}
          load={(params) => api.platform.backups.list(params)}
          create={(p) =>
            api.platform.backups.save({
              ...p,
              retentionDays: Number(p.retentionDays),
              isActive: !!p.isActive,
            })
          }
        />
      )}

      {tab === 'announcements' && (
        <ResourceModule
          title="System Announcements"
          subtitle="Broadcast platform-wide notices to tenants and staff."
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'audience', label: 'Audience' },
            { key: 'isActive', label: 'Active', render: (r) => (r.isActive ? 'Yes' : 'No') },
            {
              key: 'createdAt',
              label: 'Created',
              render: (r) => new Date(r.createdAt).toLocaleString(),
            },
          ]}
          fields={[
            { name: 'title', label: 'Title', required: true },
            { name: 'body', label: 'Body', type: 'textarea', required: true },
            {
              name: 'audience',
              label: 'Audience',
              type: 'select',
              options: [
                { value: 'ALL', label: 'All' },
                { value: 'OWNERS', label: 'Owners' },
                { value: 'STAFF', label: 'Staff' },
              ],
            },
            { name: 'isActive', label: 'Active', type: 'checkbox' },
          ]}
          load={(params) => api.platform.announcements.list(params)}
          create={(p) => api.platform.announcements.save({ ...p, isActive: !!p.isActive })}
          rowActions={(row, reload) => (
            <button
              className="text-red-400 hover:underline"
              onClick={() => {
                showConfirm(`Delete announcement "${row.title || row.id}"?`, async () => {
                  await api.platform.announcements.remove(row.id);
                  reload();
                });
              }}
            >
              Delete
            </button>
          )}
        />
      )}
    </div>
  );
};
