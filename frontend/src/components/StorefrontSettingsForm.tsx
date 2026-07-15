import React, { useEffect, useState } from 'react';
import { Save, Globe, Laptop } from 'lucide-react';
import { api } from '../services/api';
import { useNotification } from '../context/NotificationContext';

export type StorefrontSettingsValues = {
  appName: string;
  logo: string;
  favicon: string;
  homeBannerTitle: string;
  homeBannerSubtitle: string;
  homeBannerImage: string;
  ourStoryTitle: string;
  ourStoryContent: string;
  ourStoryImage: string;
  platformHighlights: string;
  highlightsTitle: string;
  highlightsDescription: string;
  coffeeHouseCaption: string;
  hoursOfService: string;
  findUsAddress: string;
  findUsPhone: string;
  findUsEmail: string;
  findUsMapUrl: string;
  footerContent: string;
  currency: string;
  timezone: string;
  lowStockNotification: boolean;
  autoCloseShiftsAt: string;
};

const EMPTY: StorefrontSettingsValues = {
  appName: '',
  logo: '',
  favicon: '',
  homeBannerTitle: '',
  homeBannerSubtitle: '',
  homeBannerImage: '',
  ourStoryTitle: '',
  ourStoryContent: '',
  ourStoryImage: '',
  platformHighlights: '',
  highlightsTitle: '',
  highlightsDescription: '',
  coffeeHouseCaption: '',
  hoursOfService: '',
  findUsAddress: '',
  findUsPhone: '',
  findUsEmail: '',
  findUsMapUrl: '',
  footerContent: '',
  currency: 'USD',
  timezone: 'UTC',
  lowStockNotification: true,
  autoCloseShiftsAt: '',
};

const CURRENCIES = ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'INR', 'AED', 'SAR', 'SGD', 'JPY', 'NZD', 'CHF'];
const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Toronto',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
  'Pacific/Auckland',
];

function fromApi(data: any): StorefrontSettingsValues {
  const src = data?.settings ?? data ?? {};
  const tz = src.timezone || 'UTC';
  const cur = src.currency || 'USD';
  return {
    appName: src.appName || '',
    logo: src.logo || '',
    favicon: src.favicon || '',
    homeBannerTitle: src.homeBannerTitle || '',
    homeBannerSubtitle: src.homeBannerSubtitle || '',
    homeBannerImage: src.homeBannerImage || '',
    ourStoryTitle: src.ourStoryTitle || '',
    ourStoryContent: src.ourStoryContent || '',
    ourStoryImage: src.ourStoryImage || '',
    platformHighlights: src.platformHighlights || '',
    highlightsTitle: src.highlightsTitle || '',
    highlightsDescription: src.highlightsDescription || '',
    coffeeHouseCaption: src.coffeeHouseCaption || '',
    hoursOfService: src.hoursOfService || '',
    findUsAddress: src.findUsAddress || '',
    findUsPhone: src.findUsPhone || '',
    findUsEmail: src.findUsEmail || '',
    findUsMapUrl: src.findUsMapUrl || '',
    footerContent: src.footerContent || '',
    currency: cur,
    timezone: tz,
    lowStockNotification: src.lowStockNotification !== false,
    autoCloseShiftsAt: src.autoCloseShiftsAt || '',
  };
}

type Props = {
  /** When set, load/save via platform tenant settings API. Otherwise uses current-tenant /settings. */
  tenantId?: string;
  heading?: string;
  subheading?: string;
  previewSlug?: string | null;
  onSaved?: (settings: any) => void;
};

export const StorefrontSettingsForm: React.FC<Props> = ({
  tenantId,
  heading = 'Storefront settings',
  subheading,
  previewSlug,
  onSaved,
}) => {
  const { showNotification } = useNotification();
  const [form, setForm] = useState<StorefrontSettingsValues>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const set = <K extends keyof StorefrontSettingsValues>(key: K, value: StorefrontSettingsValues[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        if (tenantId) {
          // Ensure image uploads attach to this restaurant
          localStorage.setItem('tastyc_tenant_id', tenantId);
          const data = await api.platform.tenants.getSettings(tenantId);
          if (!cancelled) setForm(fromApi(data));
        } else {
          const data = await api.settings.get();
          if (!cancelled) setForm(fromApi(data));
        }
      } catch (e: any) {
        showNotification({
          title: 'Load failed',
          message: e.message || 'Could not load storefront settings',
          type: 'error',
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tenantId]);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: keyof StorefrontSettingsValues
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (tenantId) localStorage.setItem('tastyc_tenant_id', tenantId);

    setUploadingField(fieldName);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = reader.result as string;
        const uploadRes = await api.menu.uploadImage(base64String, file.name);
        set(fieldName, uploadRes.imageUrl);
        showNotification({
          title: 'Uploaded',
          message: `${file.name} ready to save with storefront settings.`,
          type: 'success',
        });
      } catch (error: any) {
        showNotification({
          title: 'Upload failed',
          message: error.message || 'Image upload failed',
          type: 'error',
        });
      } finally {
        setUploadingField(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const saved = tenantId
        ? await api.platform.tenants.updateSettings(tenantId, form)
        : await api.settings.update(form);
      showNotification({
        title: 'Saved',
        message: tenantId
          ? 'Storefront settings updated — refresh the restaurant site to see changes.'
          : 'Storefront settings updated successfully.',
        type: 'success',
      });
      onSaved?.(saved);
    } catch (error: any) {
      showNotification({
        title: 'Save failed',
        message: error.message || 'Could not save settings',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-tastyc-copper mx-auto" />
        <p className="mt-4 text-[#a9b8c3] text-xs uppercase tracking-widest">Loading storefront…</p>
      </div>
    );
  }

  const inputClass =
    'w-full bg-tastyc-dark border border-tastyc-copper/20 focus:border-tastyc-copper p-2.5 text-sm text-white outline-none transition-colors';
  const labelClass = 'text-[10px] uppercase font-bold text-[#a9b8c3]';

  return (
    <form onSubmit={handleSave} className="space-y-8 text-left pb-8">
      <div className="border-b border-tastyc-copper/10 pb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-tastyc-copper text-xs uppercase tracking-widest font-semibold">Per-tenant website</p>
          <h3 className="font-title text-2xl sm:text-3xl uppercase tracking-wider text-white">{heading}</h3>
          {subheading && <p className="text-xs text-[#a9b8c3] mt-1 max-w-2xl">{subheading}</p>}
        </div>
        {previewSlug && (
          <a
            href={`/r/${previewSlug}`}
            target="_blank"
            rel="noreferrer"
            className="text-[10px] uppercase tracking-widest font-bold text-tastyc-copper border border-tastyc-copper/30 px-3 py-2 hover:bg-tastyc-copper/10"
          >
            Preview /r/{previewSlug}
          </a>
        )}
      </div>

      <div className="bg-[#121e22] border border-tastyc-copper/10 p-6 space-y-6">
        <h4 className="font-title text-xl uppercase tracking-wider text-white border-b border-tastyc-copper/10 pb-3 flex items-center gap-2">
          <Laptop className="h-5 w-5 text-tastyc-copper" />
          Brand identity
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <label className="space-y-1">
            <span className={labelClass}>App Name</span>
            <input className={inputClass} required value={form.appName} onChange={(e) => set('appName', e.target.value)} />
          </label>
          <label className="space-y-1">
            <span className={labelClass}>Admin Panel Logo</span>
            <input className={inputClass} value={form.logo} onChange={(e) => set('logo', e.target.value)} />
            <input type="file" accept="image/*" className="text-[10px] text-[#a9b8c3] mt-1" onChange={(e) => handleFileUpload(e, 'logo')} />
            {uploadingField === 'logo' && <span className="text-[9px] text-tastyc-copper">Uploading…</span>}
          </label>
          <label className="space-y-1">
            <span className={labelClass}>Favicon</span>
            <input className={inputClass} value={form.favicon} onChange={(e) => set('favicon', e.target.value)} />
            <input type="file" accept="image/*" className="text-[10px] text-[#a9b8c3] mt-1" onChange={(e) => handleFileUpload(e, 'favicon')} />
          </label>
        </div>
      </div>

      <div className="bg-[#121e22] border border-tastyc-copper/10 p-6 space-y-6">
        <h4 className="font-title text-xl uppercase tracking-wider text-white border-b border-tastyc-copper/10 pb-3 flex items-center gap-2">
          <Globe className="h-5 w-5 text-tastyc-copper" />
          Locale &amp; operations
        </h4>
        <p className="text-xs text-[#a9b8c3] -mt-2">
          Currency and timezone drive pricing display, reports, and shift schedules for this restaurant.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="space-y-1">
            <span className={labelClass}>Currency</span>
            <select className={inputClass} value={form.currency} onChange={(e) => set('currency', e.target.value)}>
              {!CURRENCIES.includes(form.currency) && form.currency && (
                <option value={form.currency}>{form.currency}</option>
              )}
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className={labelClass}>Timezone</span>
            <select className={inputClass} value={form.timezone} onChange={(e) => set('timezone', e.target.value)}>
              {!TIMEZONES.includes(form.timezone) && form.timezone && (
                <option value={form.timezone}>{form.timezone}</option>
              )}
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className={labelClass}>Auto-close shifts at (HH:MM)</span>
            <input
              className={inputClass}
              placeholder="e.g. 23:59"
              value={form.autoCloseShiftsAt}
              onChange={(e) => set('autoCloseShiftsAt', e.target.value)}
            />
          </label>
          <label className="flex items-center gap-3 pt-6 cursor-pointer">
            <input
              type="checkbox"
              checked={form.lowStockNotification}
              onChange={(e) => set('lowStockNotification', e.target.checked)}
              className="h-4 w-4 accent-tastyc-copper"
            />
            <span className={labelClass}>Low-stock email / in-app notifications</span>
          </label>
        </div>
      </div>

      <div className="bg-[#121e22] border border-tastyc-copper/10 p-6 space-y-6">
        <h4 className="font-title text-xl uppercase tracking-wider text-white border-b border-tastyc-copper/10 pb-3 flex items-center gap-2">
          <Globe className="h-5 w-5 text-tastyc-copper" />
          Homepage hero
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="space-y-1">
            <span className={labelClass}>Banner title</span>
            <input className={inputClass} required value={form.homeBannerTitle} onChange={(e) => set('homeBannerTitle', e.target.value)} />
          </label>
          <label className="space-y-1">
            <span className={labelClass}>Caption</span>
            <input className={inputClass} value={form.coffeeHouseCaption} onChange={(e) => set('coffeeHouseCaption', e.target.value)} />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className={labelClass}>Banner subtitle</span>
            <textarea
              className={`${inputClass} min-h-[70px]`}
              value={form.homeBannerSubtitle}
              onChange={(e) => set('homeBannerSubtitle', e.target.value)}
            />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className={labelClass}>Banner image URL</span>
            <input className={inputClass} value={form.homeBannerImage} onChange={(e) => set('homeBannerImage', e.target.value)} />
            <input type="file" accept="image/*" className="text-[10px] text-[#a9b8c3] mt-1" onChange={(e) => handleFileUpload(e, 'homeBannerImage')} />
          </label>
        </div>
      </div>

      <div className="bg-[#121e22] border border-tastyc-copper/10 p-6 space-y-6">
        <h4 className="font-title text-xl uppercase tracking-wider text-white border-b border-tastyc-copper/10 pb-3">Our story & highlights</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="space-y-1">
            <span className={labelClass}>Story title</span>
            <input className={inputClass} value={form.ourStoryTitle} onChange={(e) => set('ourStoryTitle', e.target.value)} />
          </label>
          <label className="space-y-1">
            <span className={labelClass}>Story image URL</span>
            <input className={inputClass} value={form.ourStoryImage} onChange={(e) => set('ourStoryImage', e.target.value)} />
            <input type="file" accept="image/*" className="text-[10px] text-[#a9b8c3] mt-1" onChange={(e) => handleFileUpload(e, 'ourStoryImage')} />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className={labelClass}>Story content</span>
            <textarea
              className={`${inputClass} min-h-[90px]`}
              value={form.ourStoryContent}
              onChange={(e) => set('ourStoryContent', e.target.value)}
            />
          </label>
          <label className="space-y-1">
            <span className={labelClass}>Highlights title</span>
            <input className={inputClass} value={form.highlightsTitle} onChange={(e) => set('highlightsTitle', e.target.value)} />
          </label>
          <label className="space-y-1">
            <span className={labelClass}>Highlights caption</span>
            <input className={inputClass} value={form.highlightsDescription} onChange={(e) => set('highlightsDescription', e.target.value)} />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className={labelClass}>Highlights (comma-separated)</span>
            <input
              className={inputClass}
              value={form.platformHighlights}
              onChange={(e) => set('platformHighlights', e.target.value)}
              placeholder="Organic Beans, Artisanal Brewing, Cozy Atmosphere"
            />
          </label>
        </div>
      </div>

      <div className="bg-[#121e22] border border-tastyc-copper/10 p-6 space-y-6">
        <h4 className="font-title text-xl uppercase tracking-wider text-white border-b border-tastyc-copper/10 pb-3">Hours & location</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="space-y-1 md:col-span-2">
            <span className={labelClass}>Hours of service</span>
            <input className={inputClass} value={form.hoursOfService} onChange={(e) => set('hoursOfService', e.target.value)} />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className={labelClass}>Address</span>
            <input className={inputClass} value={form.findUsAddress} onChange={(e) => set('findUsAddress', e.target.value)} />
          </label>
          <label className="space-y-1">
            <span className={labelClass}>Phone</span>
            <input className={inputClass} value={form.findUsPhone} onChange={(e) => set('findUsPhone', e.target.value)} />
          </label>
          <label className="space-y-1">
            <span className={labelClass}>Email</span>
            <input type="email" className={inputClass} value={form.findUsEmail} onChange={(e) => set('findUsEmail', e.target.value)} />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className={labelClass}>Map embed URL</span>
            <input className={inputClass} value={form.findUsMapUrl} onChange={(e) => set('findUsMapUrl', e.target.value)} />
          </label>
          <label className="space-y-1 md:col-span-2">
            <span className={labelClass}>Footer text</span>
            <input className={inputClass} value={form.footerContent} onChange={(e) => set('footerContent', e.target.value)} />
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full py-4 bg-tastyc-copper hover:bg-tastyc-copperLight text-white font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Save className="h-4 w-4" />
        {saving ? 'Saving…' : 'Save storefront settings'}
      </button>
    </form>
  );
};
