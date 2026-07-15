import React, { useState } from 'react';
import { api } from '../../../services/api';
import { ResourceModule } from '../../../components/ResourceModule';
import { useNotification } from '../../../context/NotificationContext';

export const PlatformIntegrations: React.FC = () => {
  const [tab, setTab] = useState<'integrations' | 'keys' | 'tax'>('integrations');
  const { showNotification } = useNotification();
  const [plainKey, setPlainKey] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 border-b border-tastyc-copper/10 pb-2">
        {[
          ['integrations', 'Email / SMS / WhatsApp / Payments'],
          ['keys', 'API Keys'],
          ['tax', 'Global Tax'],
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

      {tab === 'integrations' && (
        <ResourceModule
          title="Platform Integrations"
          subtitle="Configure email, SMS, WhatsApp, and payment gateway connections."
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'channel', label: 'Channel' },
            { key: 'isActive', label: 'Active', render: (r) => (r.isActive ? 'Yes' : 'No') },
          ]}
          fields={[
            { name: 'name', label: 'Name', required: true, placeholder: 'e.g. SendGrid / Twilio / Stripe' },
            {
              name: 'channel',
              label: 'Channel',
              type: 'select',
              options: [
                { value: 'EMAIL', label: 'Email' },
                { value: 'SMS', label: 'SMS' },
                { value: 'WHATSAPP', label: 'WhatsApp' },
                { value: 'PAYMENT', label: 'Payment Gateway' },
              ],
            },
            { name: 'isActive', label: 'Active', type: 'checkbox' },
          ]}
          load={(params) => api.platform.integrations.list(params)}
          create={(p) => api.platform.integrations.save({ ...p, isActive: !!p.isActive, config: {} })}
        />
      )}

      {tab === 'keys' && (
        <>
          {plainKey && (
            <div className="bg-amber-950/30 border border-amber-500/30 p-4 text-xs text-amber-200">
              Copy this API key now — it will not be shown again:
              <code className="block mt-2 break-all text-white">{plainKey}</code>
            </div>
          )}
          <ResourceModule
            title="API Keys"
            subtitle="Issue and revoke platform API keys."
            columns={[
              { key: 'name', label: 'Name' },
              { key: 'keyPrefix', label: 'Prefix' },
              {
                key: 'revokedAt',
                label: 'Status',
                render: (r) => (r.revokedAt ? 'Revoked' : 'Active'),
              },
              {
                key: 'createdAt',
                label: 'Created',
                render: (r) => new Date(r.createdAt).toLocaleString(),
              },
            ]}
            fields={[{ name: 'name', label: 'Key Name', required: true }]}
            load={(params) => api.platform.apiKeys.list(params)}
            create={async (p) => {
              const data = await api.platform.apiKeys.create(p);
              if (data?.apiKey || data?.plaintextKey) setPlainKey(data.apiKey || data.plaintextKey);
              showNotification({ title: 'Key created', message: 'Copy the plaintext key now', type: 'success' });
              return data;
            }}
            rowActions={(row, reload) =>
              !row.revokedAt ? (
                <button
                  className="text-red-400 hover:underline"
                  onClick={async () => {
                    await api.platform.apiKeys.revoke(row.id);
                    reload();
                  }}
                >
                  Revoke
                </button>
              ) : null
            }
          />
        </>
      )}

      {tab === 'tax' && (
        <ResourceModule
          title="Global Tax Settings"
          subtitle="Platform-wide tax rates applied across tenants."
          columns={[
            { key: 'country', label: 'Country' },
            { key: 'taxName', label: 'Tax Name' },
            { key: 'rate', label: 'Rate %' },
            { key: 'isDefault', label: 'Default', render: (r) => (r.isDefault ? 'Yes' : 'No') },
          ]}
          fields={[
            { name: 'country', label: 'Country Code', required: true, placeholder: 'US' },
            { name: 'taxName', label: 'Tax Name', required: true, placeholder: 'VAT / Sales Tax' },
            { name: 'rate', label: 'Rate %', type: 'number', required: true },
            { name: 'isDefault', label: 'Default', type: 'checkbox' },
          ]}
          load={(params) => api.platform.tax.list(params)}
          create={(p) =>
            api.platform.tax.save({ ...p, rate: Number(p.rate), isDefault: !!p.isDefault })
          }
          rowActions={(row, reload) => (
            <button
              className="text-red-400 hover:underline"
              onClick={async () => {
                await api.platform.tax.remove(row.id);
                reload();
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
