import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ResourceModule } from '../../components/ResourceModule';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

export const DeliveryHub: React.FC = () => {
  const { user } = useAuth();
  const { showConfirm } = useNotification();
  const [staff, setStaff] = useState<any[]>([]);

  useEffect(() => {
    api.master
      .getUsers({ limit: 100 })
      .then((r) =>
        setStaff((r.data || []).filter((u: any) => ['DELIVERY_STAFF', 'DELIVERY_MANAGER'].includes(u.role?.name || u.role)))
      )
      .catch(() => undefined);
  }, []);

  return (
    <ResourceModule
      title="Delivery Hub"
      subtitle="Assign riders, track deliveries, and capture proof of delivery / COD."
      columns={[
        { key: 'customerName', label: 'Customer' },
        { key: 'address', label: 'Address' },
        { key: 'status', label: 'Status' },
        { key: 'assigneeId', label: 'Rider', render: (r) => r.assignee?.name || r.assigneeId || 'Unassigned' },
        { key: 'codAmount', label: 'COD' },
        {
          key: 'createdAt',
          label: 'Created',
          render: (r) => new Date(r.createdAt).toLocaleString(),
        },
      ]}
      fields={
        user?.role === 'DELIVERY_STAFF'
          ? []
          : [
              { name: 'customerName', label: 'Customer Name', required: true },
              { name: 'address', label: 'Delivery Address', type: 'textarea', required: true },
              { name: 'codAmount', label: 'COD Amount', type: 'number' },
              {
                name: 'assigneeId',
                label: 'Assign Rider',
                type: 'select',
                options: [
                  { value: '', label: 'Unassigned' },
                  ...staff.map((s) => ({ value: s.id, label: s.name })),
                ],
              },
            ]
      }
      load={(params) => api.ops.delivery.list(params)}
      create={
        user?.role === 'DELIVERY_STAFF'
          ? undefined
          : (p) =>
              api.ops.delivery.create({
                ...p,
                assigneeId: p.assigneeId || null,
                codAmount: p.codAmount ? Number(p.codAmount) : null,
              })
      }
      rowActions={(row, reload) => (
        <div className="flex flex-wrap gap-2">
          {['ASSIGNED', 'EN_ROUTE', 'DELIVERED', 'FAILED'].map((status) => (
            <button
              key={status}
              className="text-tastyc-copper hover:underline"
              onClick={() => {
                showConfirm(`Set delivery job to ${status.replace('_', ' ')}?`, async () => {
                  await api.ops.delivery.setStatus(row.id, { status });
                  reload();
                }, 'Update delivery');
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
