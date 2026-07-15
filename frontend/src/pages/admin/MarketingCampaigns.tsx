import React from 'react';
import { api } from '../../services/api';
import { ResourceModule } from '../../components/ResourceModule';
import { useNotification } from '../../context/NotificationContext';

export const MarketingCampaigns: React.FC = () => {
  const { showConfirm } = useNotification();
  return (
    <ResourceModule
      title="Marketing Campaigns"
      subtitle="SMS, WhatsApp, and email campaigns with audience targeting."
      columns={[
        { key: 'name', label: 'Campaign' },
        { key: 'channel', label: 'Channel' },
        { key: 'status', label: 'Status' },
        { key: 'audience', label: 'Audience' },
        {
          key: 'scheduledAt',
          label: 'Scheduled',
          render: (r) => (r.scheduledAt ? new Date(r.scheduledAt).toLocaleString() : '—'),
        },
      ]}
      fields={[
        { name: 'name', label: 'Name', required: true },
        {
          name: 'channel',
          label: 'Channel',
          type: 'select',
          options: [
            { value: 'SMS', label: 'SMS' },
            { value: 'WHATSAPP', label: 'WhatsApp' },
            { value: 'EMAIL', label: 'Email' },
          ],
        },
        { name: 'audience', label: 'Audience / Segment', placeholder: 'All customers / VIP / Lapsed' },
        { name: 'content', label: 'Message Content', type: 'textarea', required: true },
        {
          name: 'status',
          label: 'Status',
          type: 'select',
          options: [
            { value: 'DRAFT', label: 'Draft' },
            { value: 'SCHEDULED', label: 'Scheduled' },
            { value: 'SENT', label: 'Sent' },
          ],
        },
      ]}
      load={(params) => api.ops.campaigns.list(params)}
      create={(p) => api.ops.campaigns.create(p)}
      rowActions={(row, reload) => (
        <button
          className="text-tastyc-copper hover:underline"
          onClick={() => {
            showConfirm(`Mark campaign "${row.name}" as Sent?`, async () => {
              await api.ops.campaigns.update(row.id, { status: 'SENT', sentAt: new Date().toISOString() });
              reload();
            }, 'Mark sent');
          }}
        >
          Mark Sent
        </button>
      )}
    />
  );
};
