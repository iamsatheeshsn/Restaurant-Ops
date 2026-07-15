import React from 'react';
import { api } from '../../services/api';
import { ResourceModule } from '../../components/ResourceModule';

export const ApprovalsCenter: React.FC = () => (
  <ResourceModule
    title="Approvals"
    subtitle="Approve purchases, inventory adjustments, expenses, waste, and transfers."
    columns={[
      { key: 'type', label: 'Type' },
      { key: 'title', label: 'Title' },
      { key: 'status', label: 'Status' },
      { key: 'refId', label: 'Ref' },
      {
        key: 'createdAt',
        label: 'Requested',
        render: (r) => new Date(r.createdAt).toLocaleString(),
      },
    ]}
    fields={[
      {
        name: 'type',
        label: 'Type',
        type: 'select',
        options: [
          { value: 'PO', label: 'Purchase Order' },
          { value: 'EXPENSE', label: 'Expense' },
          { value: 'WASTE', label: 'Waste' },
          { value: 'INVENTORY', label: 'Inventory' },
          { value: 'TRANSFER', label: 'Transfer' },
        ],
      },
      { name: 'title', label: 'Title', required: true },
      { name: 'refId', label: 'Reference ID', required: true },
      { name: 'notes', label: 'Notes', type: 'textarea' },
    ]}
    load={(params) => api.ops.approvals.list(params)}
    create={(p) => api.ops.approvals.create(p)}
    rowActions={(row, reload) =>
      row.status === 'PENDING' ? (
        <div className="flex gap-2">
          <button
            className="text-emerald-400 hover:underline"
            onClick={async () => {
              await api.ops.approvals.decide(row.id, 'APPROVED');
              reload();
            }}
          >
            Approve
          </button>
          <button
            className="text-red-400 hover:underline"
            onClick={async () => {
              await api.ops.approvals.decide(row.id, 'REJECTED');
              reload();
            }}
          >
            Reject
          </button>
        </div>
      ) : null
    }
  />
);
