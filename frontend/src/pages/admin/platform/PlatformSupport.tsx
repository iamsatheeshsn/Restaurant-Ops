import React from 'react';
import { api } from '../../../services/api';
import { ResourceModule } from '../../../components/ResourceModule';

export const PlatformSupport: React.FC = () => (
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
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'requesterEmail', label: 'Requester Email', required: true },
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
            onClick={async () => {
              await api.platform.tickets.update(row.id, { status });
              reload();
            }}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>
    )}
  />
);
