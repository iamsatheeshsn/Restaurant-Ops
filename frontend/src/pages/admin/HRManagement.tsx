import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ResourceModule } from '../../components/ResourceModule';
import { useNotification } from '../../context/NotificationContext';

export const HRManagement: React.FC = () => {
  const { showConfirm } = useNotification();
  const [tab, setTab] = useState<'leaves' | 'payroll'>('leaves');
  const [users, setUsers] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);

  useEffect(() => {
    api.master.getUsers({ limit: 100 }).then((r) => setUsers(r.data)).catch(() => undefined);
    if (tab === 'payroll') {
      api.attendance.getAll({ limit: 100 }).then((r) => setAttendance(r.data)).catch(() => setAttendance([]));
    }
  }, [tab]);

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-tastyc-copper/10 pb-2">
        {[
          ['leaves', 'Leave Approvals'],
          ['payroll', 'Payroll Prep'],
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

      {tab === 'leaves' && (
        <ResourceModule
          title="Leave Requests"
          subtitle="Employee leave requests and HR approvals."
          columns={[
            { key: 'userId', label: 'Employee', render: (r) => r.user?.name || r.userId },
            { key: 'leaveType', label: 'Type' },
            {
              key: 'startDate',
              label: 'From',
              render: (r) => new Date(r.startDate).toLocaleDateString(),
            },
            {
              key: 'endDate',
              label: 'To',
              render: (r) => new Date(r.endDate).toLocaleDateString(),
            },
            { key: 'status', label: 'Status' },
            { key: 'reason', label: 'Reason' },
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
              name: 'leaveType',
              label: 'Type',
              type: 'select',
              options: [
                { value: 'ANNUAL', label: 'Annual' },
                { value: 'SICK', label: 'Sick' },
                { value: 'UNPAID', label: 'Unpaid' },
              ],
            },
            { name: 'startDate', label: 'Start', type: 'date', required: true },
            { name: 'endDate', label: 'End', type: 'date', required: true },
            { name: 'reason', label: 'Reason', type: 'textarea' },
          ]}
          load={(params) => api.ops.leaves.list(params)}
          create={(p) => api.ops.leaves.create(p)}
          rowActions={(row, reload) =>
            row.status === 'PENDING' ? (
              <div className="flex gap-2">
                <button
                  className="text-emerald-400 hover:underline"
                  onClick={() => {
                    showConfirm('Approve this leave request?', async () => {
                      await api.ops.leaves.setStatus(row.id, 'APPROVED');
                      reload();
                    }, 'Approve leave');
                  }}
                >
                  Approve
                </button>
                <button
                  className="text-red-400 hover:underline"
                  onClick={() => {
                    showConfirm('Reject this leave request?', async () => {
                      await api.ops.leaves.setStatus(row.id, 'REJECTED');
                      reload();
                    }, 'Reject leave');
                  }}
                >
                  Reject
                </button>
              </div>
            ) : null
          }
        />
      )}

      {tab === 'payroll' && (
        <div className="space-y-4">
          <h1 className="font-title text-3xl uppercase tracking-widest text-white">Payroll Preparation</h1>
          <p className="text-xs text-[#a9b8c3]">
            Attendance snapshot used to prepare payroll exports. Full payroll runs stay with your accountant workflow.
          </p>
          <div className="bg-[#121e22] border border-tastyc-copper/10 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-tastyc-copper/10 text-[10px] uppercase tracking-widest text-[#a9b8c3]">
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Clock In</th>
                  <th className="px-4 py-3">Clock Out</th>
                </tr>
              </thead>
              <tbody>
                {(attendance || []).slice(0, 50).map((a: any) => (
                  <tr key={a.id} className="border-b border-white/5 text-white">
                    <td className="px-4 py-3">{a.user?.name || a.userId}</td>
                    <td className="px-4 py-3">{a.clockIn ? new Date(a.clockIn).toLocaleString() : '—'}</td>
                    <td className="px-4 py-3">{a.clockOut ? new Date(a.clockOut).toLocaleString() : 'Open'}</td>
                  </tr>
                ))}
                {(!attendance || attendance.length === 0) && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-[#a9b8c3]">
                      No attendance rows loaded. Use Attendance Shifts for detailed logs.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
