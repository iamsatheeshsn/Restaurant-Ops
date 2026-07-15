import React from 'react';
import { api } from '../../services/api';
import { ResourceModule } from '../../components/ResourceModule';
import { useNotification } from '../../context/NotificationContext';

export const ApprovalsCenter: React.FC = () => {
  const { showConfirm } = useNotification();
  return (
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
            { value: 'PURCHASE', label: 'Purchase' },
            { value: 'ADJUSTMENT', label: 'Adjustment' },
            { value: 'EXPENSE', label: 'Expense' },
            { value: 'WASTE', label: 'Waste' },
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
              onClick={() => {
                showConfirm(`Approve "${row.title}"?`, async () => {
                  await api.ops.approvals.decide(row.id, 'APPROVED');
                  reload();
                }, 'Approve request');
              }}
            >
              Approve
            </button>
            <button
              className="text-red-400 hover:underline"
              onClick={() => {
                showConfirm(`Reject "${row.title}"?`, async () => {
                  await api.ops.approvals.decide(row.id, 'REJECTED');
                  reload();
                }, 'Reject request');
              }}
            >
              Reject
            </button>
          </div>
        ) : null
      }
    />
  );
};
