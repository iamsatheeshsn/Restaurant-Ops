import React, { useEffect, useState } from 'react';
import { StorefrontSettingsForm } from '../../components/StorefrontSettingsForm';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { ROLES } from '../../config/rbac';
import { api } from '../../services/api';
import { Building2, Image, Save, Settings } from 'lucide-react';

/**
 * System Settings:
 * - Super Admin: platform admin branding + pick any tenant to edit storefront settings
 * - Owner: restaurant settings (admin branding + storefront CMS)
 */
export const SettingsManagement: React.FC = () => {
  const { refreshSettings, applySettings } = useSettings();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const isSuperAdmin = user?.role === ROLES.SUPER_ADMIN;

  const [appName, setAppName] = useState('');
  const [logo, setLogo] = useState('');
  const [favicon, setFavicon] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [tenantsLoading, setTenantsLoading] = useState(false);

  useEffect(() => {
    if (!isSuperAdmin) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await api.platform.branding.get();
        if (cancelled) return;
        setAppName(data.appName || '');
        setLogo(data.logo || '');
        setFavicon(data.favicon || '');
      } catch (error: any) {
        showNotification({
          title: 'Load failed',
          message: error.message || 'Could not load branding',
          type: 'error',
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isSuperAdmin]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    let cancelled = false;
    (async () => {
      setTenantsLoading(true);
      try {
        const result = await api.platform.tenants.list({ page: 1, limit: 100 });
        if (cancelled) return;
        setTenants(result.data || []);
        if (result.data?.length && !selectedTenantId) {
          setSelectedTenantId(result.data[0].id);
        }
      } catch (error: any) {
        showNotification({
          title: 'Tenants load failed',
          message: error.message || 'Could not load tenants',
          type: 'error',
        });
      } finally {
        if (!cancelled) setTenantsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isSuperAdmin]);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'logo' | 'favicon'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingField(field);
    try {
      const reader = new FileReader();
      const base64String = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const uploadRes = await api.platform.branding.upload(base64String, file.name);
      if (field === 'logo') setLogo(uploadRes.imageUrl);
      else setFavicon(uploadRes.imageUrl);
    } catch (error: any) {
      showNotification({
        title: 'Upload failed',
        message: error.message || 'Image upload failed',
        type: 'error',
      });
    } finally {
      setUploadingField(null);
      e.target.value = '';
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await api.platform.branding.update({
        appName: appName.trim(),
        logo: logo.trim() || null,
        favicon: favicon.trim() || null,
      });
      applySettings({
        appName: data.appName,
        logo: data.logo,
        favicon: data.favicon,
        currency: 'USD',
        timezone: 'UTC',
      });
      await refreshSettings();
      showNotification({
        title: 'Saved',
        message: 'Admin panel branding updated.',
        type: 'success',
      });
    } catch (error: any) {
      showNotification({
        title: 'Save failed',
        message: error.message || 'Could not save branding',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (isSuperAdmin) {
    const inputClass =
      'w-full bg-[#0a1316] border border-tastyc-copper/15 focus:border-tastyc-copper p-3 text-white text-sm outline-none';
    const labelClass = 'text-[10px] uppercase tracking-widest text-[#a9b8c3] font-bold';
    const selectedTenant = tenants.find((t) => t.id === selectedTenantId);

    return (
      <div className="max-w-4xl space-y-8 text-left">
        <div className="border-b border-tastyc-copper/10 pb-4">
          <p className="text-tastyc-copper text-xs uppercase tracking-widest font-semibold flex items-center gap-1.5">
            <Settings className="h-3.5 w-3.5" />
            System Settings
          </p>
          <h3 className="font-title text-3xl uppercase tracking-wider text-white mt-1">Platform settings</h3>
          <p className="text-sm text-[#a9b8c3] mt-2 leading-relaxed">
            Configure admin panel branding for the console, and edit any restaurant’s storefront settings.
          </p>
        </div>

        <form onSubmit={handleSave} className="bg-[#121e22] border border-tastyc-copper/10 p-6 space-y-6">
          <h4 className="font-title text-xl uppercase tracking-wider text-white border-b border-tastyc-copper/10 pb-3 flex items-center gap-2">
            <Image className="h-5 w-5 text-tastyc-copper" />
            Admin panel branding
          </h4>

          {loading ? (
            <p className="text-sm text-[#a9b8c3]">Loading…</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label className="space-y-1 md:col-span-2">
                <span className={labelClass}>App Name</span>
                <input
                  className={inputClass}
                  required
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="Restaurant Ops"
                />
              </label>
              <label className="space-y-1">
                <span className={labelClass}>Admin Panel Logo</span>
                <input
                  className={inputClass}
                  value={logo}
                  onChange={(e) => setLogo(e.target.value)}
                  placeholder="https://… or upload"
                />
                <input
                  type="file"
                  accept="image/*"
                  className="text-[10px] text-[#a9b8c3] mt-1"
                  onChange={(e) => handleFileUpload(e, 'logo')}
                />
                {uploadingField === 'logo' && (
                  <span className="text-[9px] text-tastyc-copper">Uploading…</span>
                )}
                {logo && (
                  <img src={logo} alt="Logo preview" className="mt-2 h-10 w-auto object-contain" />
                )}
              </label>
              <label className="space-y-1">
                <span className={labelClass}>Favicon</span>
                <input
                  className={inputClass}
                  value={favicon}
                  onChange={(e) => setFavicon(e.target.value)}
                  placeholder="https://… or upload"
                />
                <input
                  type="file"
                  accept="image/*"
                  className="text-[10px] text-[#a9b8c3] mt-1"
                  onChange={(e) => handleFileUpload(e, 'favicon')}
                />
                {uploadingField === 'favicon' && (
                  <span className="text-[9px] text-tastyc-copper">Uploading…</span>
                )}
                {favicon && (
                  <img src={favicon} alt="Favicon preview" className="mt-2 h-8 w-8 object-contain" />
                )}
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={saving || loading}
            className="inline-flex items-center gap-2 px-5 py-3 bg-tastyc-copper text-white text-[10px] uppercase tracking-widest font-bold disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" />
            {saving ? 'Saving…' : 'Save branding'}
          </button>
        </form>

        <div className="bg-[#121e22] border border-tastyc-copper/10 p-6 space-y-4">
          <div className="flex items-start gap-3">
            <Building2 className="h-5 w-5 text-tastyc-copper shrink-0 mt-0.5" />
            <div className="space-y-3 flex-1 min-w-0">
              <h4 className="font-title text-xl uppercase tracking-wider text-white">Tenant storefront settings</h4>
              <p className="text-sm text-[#a9b8c3] leading-relaxed">
                Select a restaurant to edit its public website and admin display settings (logo, banner, hours, contact).
              </p>
              <label className="block space-y-1 max-w-md">
                <span className={labelClass}>Restaurant</span>
                <select
                  className={inputClass}
                  value={selectedTenantId}
                  disabled={tenantsLoading}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                >
                  {tenantsLoading && <option value="">Loading tenants…</option>}
                  {!tenantsLoading && tenants.length === 0 && <option value="">No tenants</option>}
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                      {t.slug ? ` (/r/${t.slug})` : ''}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>

        {selectedTenantId && selectedTenant && (
          <StorefrontSettingsForm
            key={selectedTenantId}
            tenantId={selectedTenantId}
            heading={`${selectedTenant.name} settings`}
            subheading={`Public storefront and branding for /r/${selectedTenant.slug || '…'}`}
            previewSlug={selectedTenant.slug}
          />
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <StorefrontSettingsForm
        heading="System Settings"
        subheading="Admin panel branding and public website content for your restaurant."
        onSaved={() => refreshSettings()}
      />
    </div>
  );
};
