import React from 'react';
import { api } from '../../services/api';
import { ResourceModule } from '../../components/ResourceModule';
import { useNotification } from '../../context/NotificationContext';

export const ExpensesManagement: React.FC = () => {
  const { showNotification } = useNotification();

  return (
    <ResourceModule
      title="Expenses"
      subtitle="Log expenses and approve within policy limits."
      columns={[
        { key: 'category', label: 'Category' },
        { key: 'amount', label: 'Amount' },
        { key: 'description', label: 'Description' },
        { key: 'status', label: 'Status' },
        {
          key: 'createdAt',
          label: 'Date',
          render: (r) => new Date(r.createdAt).toLocaleDateString(),
        },
      ]}
      fields={[
        { name: 'category', label: 'Category', required: true, placeholder: 'Supplies / Utilities / Misc' },
        { name: 'amount', label: 'Amount', type: 'number', required: true },
        { name: 'description', label: 'Description', type: 'textarea', required: true },
      ]}
      load={(params) => api.ops.expenses.list(params)}
      create={(p) => api.ops.expenses.create({ ...p, amount: Number(p.amount) })}
      rowActions={(row, reload) =>
        row.status === 'PENDING' ? (
          <div className="flex gap-2">
            <button
              className="text-emerald-400 hover:underline"
              onClick={async () => {
                await api.ops.expenses.approve(row.id);
                showNotification({ title: 'Approved', message: 'Expense approved', type: 'success' });
                reload();
              }}
            >
              Approve
            </button>
            <button
              className="text-red-400 hover:underline"
              onClick={async () => {
                await api.ops.expenses.reject(row.id);
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
};
