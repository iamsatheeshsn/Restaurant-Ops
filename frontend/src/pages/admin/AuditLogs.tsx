import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { ResourceModule } from '../../components/ResourceModule';

export const AuditLogs: React.FC = () => {
  const { user } = useAuth();
  const isPlatform = user?.role === 'SUPER_ADMIN';

  return (
    <ResourceModule
      title={isPlatform ? 'Platform Audit Logs' : 'Organization Audit Logs'}
      subtitle={
        isPlatform
          ? 'Cross-tenant activity for compliance and security review.'
          : 'Read-only audit trail for your restaurant organization.'
      }
      columns={[
        {
          key: 'createdAt',
          label: 'When',
          render: (r) => new Date(r.createdAt).toLocaleString(),
        },
        { key: 'action', label: 'Action' },
        {
          key: 'user',
          label: 'User',
          render: (r) => r.user?.email || r.user?.name || 'System',
        },
        {
          key: 'tenant',
          label: 'Tenant',
          render: (r) => r.tenant?.name || r.tenantId || '—',
        },
        { key: 'details', label: 'Details' },
        { key: 'ipAddress', label: 'IP' },
      ]}
      load={(params) => (isPlatform ? api.platform.auditLogs(params) : api.ops.auditLogs(params))}
      emptyText="No audit events recorded yet."
    />
  );
};
