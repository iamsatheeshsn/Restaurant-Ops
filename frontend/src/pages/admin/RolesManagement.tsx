import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { ROLES } from '../../config/rbac';
import { Shield, Trash2, Plus, CheckSquare, Square, Save, AlertCircle } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  isSystem: boolean;
  permissions: string[];
  tenantId?: string | null;
  tenantName?: string | null;
}

interface Permission {
  id: string;
  scope: string;
  description: string;
}

export const RolesManagement: React.FC = () => {
  const { user } = useAuth();
  const { showNotification, showConfirm } = useNotification();
  const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN;

  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<any[]>([]);
  const [filterTenantId, setFilterTenantId] = useState('');

  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPerms, setEditPerms] = useState<string[]>([]);

  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPerms, setNewPerms] = useState<string[]>([]);

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (!isSuperAdmin) return;
    (async () => {
      try {
        const result = await api.platform.tenants.list({ page: 1, limit: 100 });
        setTenants(result.data || []);
        if (result.data?.length) {
          setFilterTenantId(result.data[0].id);
        } else {
          setLoading(false);
        }
      } catch (e: any) {
        setLoading(false);
        showNotification({ title: 'Tenants load failed', message: e.message, type: 'error' });
      }
    })();
  }, [isSuperAdmin]);

  const fetchRoleData = async (tenantId?: string) => {
    try {
      setLoading(true);
      const scopeTenant = isSuperAdmin ? tenantId || filterTenantId || undefined : undefined;
      const [allRoles, allPerms] = await Promise.all([
        api.roles.getAll(scopeTenant),
        api.roles.getPermissions(),
      ]);
      setRoles(allRoles || []);
      setPermissions(allPerms || []);

      if (allRoles?.length) {
        const stillSelected = allRoles.find((r: Role) => r.id === selectedRoleId);
        if (stillSelected) {
          selectRole(stillSelected);
        } else {
          selectRole(allRoles[0]);
        }
      } else {
        setSelectedRoleId(null);
      }
    } catch (error: any) {
      console.error('Failed to load RBAC configurations:', error);
      setMessage({ text: error.message || 'Failed to load roles and permissions data', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuperAdmin && !filterTenantId) return;
    fetchRoleData(filterTenantId || undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin, filterTenantId]);

  const selectRole = (role: Role) => {
    setIsCreating(false);
    setSelectedRoleId(role.id);
    setEditName(role.name);
    setEditPerms(role.permissions);
  };

  const handleTogglePerm = (scope: string, isNew: boolean) => {
    if (isNew) {
      setNewPerms((prev) => (prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]));
    } else {
      setEditPerms((prev) => (prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]));
    }
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoleId) return;
    setMessage(null);

    try {
      const role = roles.find((r) => r.id === selectedRoleId);
      await api.roles.update(selectedRoleId, {
        name: role?.isSystem ? undefined : editName,
        permissions: editPerms,
      });
      setMessage({ text: 'Role permissions updated successfully!', type: 'success' });
      showNotification({ title: 'Saved', message: 'Role permissions updated.', type: 'success' });
      await fetchRoleData();
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to update role', type: 'error' });
      showNotification({ title: 'Update failed', message: err.message || 'Failed to update role', type: 'error' });
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    if (isSuperAdmin && !filterTenantId) {
      showNotification({
        title: 'Select restaurant',
        message: 'Choose a restaurant tenant before creating a role.',
        type: 'error',
      });
      return;
    }
    setMessage(null);

    try {
      await api.roles.create({
        name: newName,
        permissions: newPerms,
        ...(isSuperAdmin ? { tenantId: filterTenantId } : {}),
      });
      setMessage({ text: `Custom role ${newName.toUpperCase()} created successfully!`, type: 'success' });
      showNotification({
        title: 'Created',
        message: `Role ${newName.toUpperCase()} created.`,
        type: 'success',
      });
      setNewName('');
      setNewPerms([]);
      setIsCreating(false);
      await fetchRoleData();
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to create role', type: 'error' });
      showNotification({ title: 'Create failed', message: err.message || 'Failed to create role', type: 'error' });
    }
  };

  const handleDeleteRole = (roleId: string) => {
    showConfirm(
      'Are you sure you want to delete this custom role? This action cannot be undone.',
      async () => {
        setMessage(null);
        try {
          await api.roles.delete(roleId);
          setMessage({ text: 'Custom role deleted successfully', type: 'success' });
          showNotification({ title: 'Deleted', message: 'Custom role deleted.', type: 'success' });
          setSelectedRoleId(null);
          await fetchRoleData();
        } catch (err: any) {
          setMessage({ text: err.message || 'Failed to delete role', type: 'error' });
          showNotification({ title: 'Delete failed', message: err.message || 'Failed to delete role', type: 'error' });
        }
      }
    );
  };

  if (loading && roles.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-tastyc-copper mx-auto"></div>
        <p className="mt-4 text-[#a9b8c3] text-sm uppercase tracking-widest">Loading Security Matrix...</p>
      </div>
    );
  }

  const activeRole = roles.find((r) => r.id === selectedRoleId);
  const selectedTenant = tenants.find((t) => t.id === filterTenantId);

  return (
    <div className="space-y-8 text-left selection:bg-tastyc-copper selection:text-white">
      {isSuperAdmin && (
        <div className="bg-[#121e22] border border-tastyc-copper/10 p-4 flex flex-col sm:flex-row sm:items-end gap-4">
          <label className="space-y-1 flex-1 max-w-md">
            <span className="text-[10px] uppercase tracking-widest text-[#a9b8c3] font-bold">Restaurant tenant</span>
            <select
              className="w-full bg-[#0a1316] border border-tastyc-copper/15 focus:border-tastyc-copper p-3 text-white text-sm outline-none"
              value={filterTenantId}
              onChange={(e) => {
                setSelectedRoleId(null);
                setIsCreating(false);
                setFilterTenantId(e.target.value);
              }}
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </label>
          <p className="text-xs text-[#a9b8c3] leading-relaxed pb-1">
            Roles are unique per restaurant. Viewing{' '}
            <span className="text-white font-semibold">{selectedTenant?.name || '…'}</span> only — no cross-tenant
            duplicates.
          </p>
        </div>
      )}

      {message && (
        <div
          className={`p-4 flex items-center space-x-3 shadow-lg ${
            message.type === 'success'
              ? 'bg-emerald-950/20 border border-emerald-500/20 text-emerald-400'
              : 'bg-red-950/20 border border-red-500/20 text-red-400'
          }`}
        >
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-xs font-semibold uppercase tracking-wider">{message.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-[#121e22] border border-tastyc-copper/10 p-6 space-y-6 flex flex-col lg:h-[620px] w-full">
            <div className="flex justify-between items-center border-b border-tastyc-copper/10 pb-4 h-10 shrink-0">
              <h3 className="font-title text-2xl uppercase tracking-wider text-white">Active System Roles</h3>
              <button
                onClick={() => {
                  setIsCreating(true);
                  setSelectedRoleId(null);
                }}
                className="p-2 border border-tastyc-copper/30 hover:border-tastyc-copper text-tastyc-copper hover:text-white hover:bg-tastyc-copper transition-all duration-300 flex items-center justify-center h-8 w-8"
                title="Create Custom Role"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2 overflow-y-auto flex-1 pr-1 min-h-0 scrollbar-thin">
              {roles.map((role) => (
                <div
                  key={role.id}
                  onClick={() => selectRole(role)}
                  className={`p-4 border transition-all duration-300 cursor-pointer flex justify-between items-center ${
                    selectedRoleId === role.id && !isCreating
                      ? 'border-tastyc-copper bg-tastyc-copper/5'
                      : 'border-white/5 hover:border-white/20 bg-tastyc-dark/20'
                  }`}
                >
                  <div className="space-y-1">
                    <p className="text-sm font-semibold uppercase text-white tracking-wider">
                      {role.name.replace(/_/g, ' ')}
                    </p>
                    <p className="text-[10px] text-[#a9b8c3] font-medium tracking-wide">
                      {role.permissions.length} Scopes Assigned
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    {role.name === 'OWNER' || role.name === 'SUPER_ADMIN' ? (
                      <span className="text-[9px] uppercase font-bold px-2 py-0.5 border border-tastyc-copper/30 text-tastyc-copper bg-tastyc-copper/5 font-semibold">
                        System
                      </span>
                    ) : (
                      <>
                        <span className="text-[9px] uppercase font-bold px-2 py-0.5 border border-white/10 text-[#a9b8c3] bg-white/5 font-semibold">
                          {role.isSystem ? 'System' : 'Custom'}
                        </span>
                        {!role.isSystem && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteRole(role.id);
                            }}
                            className="text-[#a9b8c3] hover:text-red-400 p-1 transition-colors"
                            title={`Delete ${role.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
              {roles.length === 0 && (
                <p className="text-xs text-[#a9b8c3] py-8 text-center">No roles for this restaurant.</p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col">
          {isCreating ? (
            <form
              onSubmit={handleCreateRole}
              className="bg-[#121e22] border border-tastyc-copper/10 p-6 space-y-6 flex flex-col lg:h-[620px] w-full justify-between"
            >
              <div className="flex justify-between items-center border-b border-tastyc-copper/10 pb-4 h-10 shrink-0">
                <h3 className="font-title text-2xl uppercase tracking-wider text-white">Define Custom Role</h3>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-tastyc-copper" />
                  <span className="text-xs uppercase font-bold tracking-widest text-tastyc-copper">Custom</span>
                </div>
              </div>

              <div className="space-y-2 shrink-0">
                <label className="text-xs uppercase tracking-wider text-[#a9b8c3] font-semibold">Role Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. MARKETING_DIRECTOR"
                  required
                  className="w-full bg-tastyc-dark border border-tastyc-copper/20 focus:border-tastyc-copper p-3 rounded-none text-white text-sm outline-none transition-colors"
                />
              </div>

              <div className="space-y-4 flex-1 flex flex-col min-h-0">
                <label className="text-xs uppercase tracking-wider text-[#a9b8c3] font-semibold block border-b border-tastyc-copper/5 pb-2 shrink-0">
                  Assign Action Scopes
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto flex-1 pr-1 min-h-0 scrollbar-thin">
                  {permissions.map((p) => {
                    const isChecked = newPerms.includes(p.scope);
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleTogglePerm(p.scope, true)}
                        className={`p-3 border transition-colors duration-200 cursor-pointer flex items-start space-x-3 ${
                          isChecked ? 'border-tastyc-copper bg-tastyc-copper/5' : 'border-white/5 hover:border-white/10'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="h-4 w-4 shrink-0 text-tastyc-copper mt-0.5" />
                        ) : (
                          <Square className="h-4 w-4 shrink-0 text-[#a9b8c3] mt-0.5" />
                        )}
                        <div>
                          <p className="text-xs font-semibold text-white uppercase tracking-wider">{p.scope}</p>
                          <p className="text-[10px] text-[#a9b8c3] mt-0.5 leading-relaxed">{p.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-tastyc-copper hover:bg-tastyc-copperLight text-white font-bold uppercase tracking-widest text-xs transition-colors duration-300 shrink-0"
              >
                Create Custom Role
              </button>
            </form>
          ) : activeRole ? (
            <form
              onSubmit={handleSaveRole}
              className="bg-[#121e22] border border-tastyc-copper/10 p-6 space-y-6 flex flex-col lg:h-[620px] w-full justify-between"
            >
              <div className="flex justify-between items-center border-b border-tastyc-copper/10 pb-4 h-10 shrink-0">
                <h3 className="font-title text-2xl uppercase tracking-wider text-white">Configure Permissions</h3>
                <div className="flex items-center space-x-2">
                  <Shield className="h-4 w-4 text-tastyc-copper" />
                  <span className="text-xs uppercase font-bold tracking-widest text-tastyc-copper">{activeRole.name}</span>
                </div>
              </div>

              {!activeRole.isSystem && (
                <div className="space-y-2 shrink-0">
                  <label className="text-xs uppercase tracking-wider text-[#a9b8c3] font-semibold">Role Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    required
                    className="w-full bg-tastyc-dark border border-tastyc-copper/20 focus:border-tastyc-copper p-3 rounded-none text-white text-sm outline-none transition-colors"
                  />
                </div>
              )}

              <div className="space-y-4 flex-1 flex flex-col min-h-0">
                <label className="text-xs uppercase tracking-wider text-[#a9b8c3] font-semibold block border-b border-tastyc-copper/5 pb-2 shrink-0">
                  Assign Action Scopes
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-y-auto flex-1 pr-1 min-h-0 scrollbar-thin">
                  {permissions.map((p) => {
                    const isChecked = editPerms.includes(p.scope);
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleTogglePerm(p.scope, false)}
                        className={`p-3 border transition-colors duration-200 cursor-pointer flex items-start space-x-3 ${
                          isChecked ? 'border-tastyc-copper bg-tastyc-copper/5' : 'border-white/5 hover:border-white/10'
                        }`}
                      >
                        {isChecked ? (
                          <CheckSquare className="h-4 w-4 shrink-0 text-tastyc-copper mt-0.5" />
                        ) : (
                          <Square className="h-4 w-4 shrink-0 text-[#a9b8c3] mt-0.5" />
                        )}
                        <div>
                          <p className="text-xs font-semibold text-white uppercase tracking-wider">{p.scope}</p>
                          <p className="text-[10px] text-[#a9b8c3] mt-0.5 leading-relaxed">{p.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-tastyc-copper hover:bg-tastyc-copperLight text-white font-bold uppercase tracking-widest text-xs flex items-center justify-center space-x-2 transition-colors duration-300 shrink-0"
              >
                <Save className="h-4 w-4" />
                <span>Save Role Permissions</span>
              </button>
            </form>
          ) : (
            <div className="bg-[#121e22] border border-tastyc-copper/10 p-12 text-center text-[#a9b8c3]/40 lg:h-[620px] flex flex-col justify-center items-center w-full">
              <Shield className="h-10 w-10 mx-auto opacity-30 text-tastyc-copper mb-4" />
              <p className="text-xs uppercase tracking-widest font-semibold">Select a role from the left list to edit</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
