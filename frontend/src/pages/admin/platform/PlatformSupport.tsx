import React from 'react';
import { api } from '../../../services/api';
import { ResourceModule } from '../../../components/ResourceModule';
import { useNotification } from '../../../context/NotificationContext';

export const PlatformSupport: React.FC = () => {
  const { showConfirm } = useNotification();
  return (
    <ResourceModule
      title="Support Tickets"
      subtitle="Manage platform support requests from restaurant tenants."
      columns={[
        { key: 'subject', label: 'Subject' },
        { key: 'requesterEmail', label: 'Requester' },
        { key: 'priority', label: 'Priority' },
        { key: 'status', label: 'Status' },
        {
          key: 'createdAt',
          label: 'Opened',
          render: (r) => new Date(r.createdAt).toLocaleString(),
        },
      ]}
      fields={[
        { name: 'subject', label: 'Subject', required: true },
        { name: 'requesterEmail', label: 'Requester Email', required: true },
        { name: 'description', label: 'Description', type: 'textarea', required: true },
        {
          name: 'priority',
          label: 'Priority',
          type: 'select',
          options: [
            { value: 'LOW', label: 'Low' },
            { value: 'MEDIUM', label: 'Medium' },
            { value: 'HIGH', label: 'High' },
            { value: 'URGENT', label: 'Urgent' },
          ],
        },
      ]}
      load={(params) => api.platform.tickets.list(params)}
      create={(p) => api.platform.tickets.create(p)}
      rowActions={(row, reload) => (
        <div className="flex gap-2">
          {['IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((status) => (
            <button
              key={status}
              className="text-tastyc-copper hover:underline"
              onClick={() => {
                showConfirm(`Set ticket "${row.subject}" to ${status.replace('_', ' ')}?`, async () => {
                  await api.platform.tickets.update(row.id, { status });
                  reload();
                }, 'Update ticket');
              }}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      )}
    />
  );
};
