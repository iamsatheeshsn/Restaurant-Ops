import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ResourceModule } from '../../components/ResourceModule';
import { useNotification } from '../../context/NotificationContext';

export const StaffScheduling: React.FC = () => {
  const { showConfirm } = useNotification();
  const [users, setUsers] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);

  useEffect(() => {
    api.master.getUsers({ limit: 100 }).then((r) => setUsers(r.data)).catch(() => undefined);
    api.branches.getAll({ limit: 100 }).then((r) => setBranches(r.data)).catch(() => undefined);
  }, []);

  return (
    <ResourceModule
      title="Staff Scheduling"
      subtitle="Shift assignments and daily staffing for your branch."
      columns={[
        {
          key: 'shiftDate',
          label: 'Date',
          render: (r) => new Date(r.shiftDate).toLocaleDateString(),
        },
        { key: 'startTime', label: 'Start' },
        { key: 'endTime', label: 'End' },
        { key: 'userId', label: 'Staff', render: (r) => r.user?.name || r.userId },
        { key: 'branchId', label: 'Branch', render: (r) => r.branch?.name || r.branchId },
        { key: 'note', label: 'Note' },
      ]}
      fields={[
        {
          name: 'userId',
          label: 'Employee',
          type: 'select',
          required: true,
          options: users.map((u) => ({ value: u.id, label: u.name })),
        },
        {
          name: 'branchId',
          label: 'Branch',
          type: 'select',
          required: true,
          options: branches.map((b) => ({ value: b.id, label: b.name })),
        },
        { name: 'shiftDate', label: 'Shift Date', type: 'date', required: true },
        { name: 'startTime', label: 'Start (HH:MM)', required: true, placeholder: '09:00' },
        { name: 'endTime', label: 'End (HH:MM)', required: true, placeholder: '17:00' },
        { name: 'note', label: 'Note' },
      ]}
      load={(params) => api.ops.schedules.list(params)}
      create={(p) => api.ops.schedules.create(p)}
      rowActions={(row, reload) => (
        <button
          className="text-red-400 hover:underline"
          onClick={() => {
            showConfirm('Remove this shift schedule?', async () => {
              await api.ops.schedules.remove(row.id);
              reload();
            }, 'Remove schedule');
          }}
        >
          Remove
        </button>
      )}
    />
  );
};
