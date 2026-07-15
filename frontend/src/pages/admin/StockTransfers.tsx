import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ResourceModule } from '../../components/ResourceModule';
import { useNotification } from '../../context/NotificationContext';

export const StockTransfers: React.FC = () => {
  const { showConfirm } = useNotification();
  const [branches, setBranches] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);

  useEffect(() => {
    api.branches.getAll({ limit: 100 }).then((r) => setBranches(r.data)).catch(() => undefined);
    api.inventory.getIngredients({ limit: 100 }).then((r) => setIngredients(r.data)).catch(() => undefined);
  }, []);

  return (
    <ResourceModule
      title="Stock Transfers"
      subtitle="Request and track inter-branch inventory transfers."
      columns={[
        {
          key: 'fromBranchId',
          label: 'From',
          render: (r) => r.fromBranch?.name || r.fromBranchId,
        },
        {
          key: 'toBranchId',
          label: 'To',
          render: (r) => r.toBranch?.name || r.toBranchId,
        },
        {
          key: 'ingredientId',
          label: 'Ingredient',
          render: (r) => r.ingredient?.name || r.ingredientId,
        },
        { key: 'quantity', label: 'Qty' },
        { key: 'status', label: 'Status' },
      ]}
      fields={[
        {
          name: 'fromBranchId',
          label: 'From Branch',
          type: 'select',
          required: true,
          options: branches.map((b) => ({ value: b.id, label: b.name })),
        },
        {
          name: 'toBranchId',
          label: 'To Branch',
          type: 'select',
          required: true,
          options: branches.map((b) => ({ value: b.id, label: b.name })),
        },
        {
          name: 'ingredientId',
          label: 'Ingredient',
          type: 'select',
          required: true,
          options: ingredients.map((i) => ({ value: i.id, label: i.name })),
        },
        { name: 'quantity', label: 'Quantity', type: 'number', required: true },
      ]}
      load={(params) => api.ops.transfers.list(params)}
      create={(p) => api.ops.transfers.create({ ...p, quantity: Number(p.quantity) })}
      rowActions={(row, reload) => (
        <div className="flex gap-2">
          {['APPROVED', 'IN_TRANSIT', 'COMPLETED', 'REJECTED'].map((status) => (
            <button
              key={status}
              className="text-tastyc-copper hover:underline"
              onClick={() => {
                showConfirm(`Set transfer status to ${status.replace('_', ' ')}?`, async () => {
                  await api.ops.transfers.setStatus(row.id, status);
                  reload();
                }, 'Update transfer');
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
