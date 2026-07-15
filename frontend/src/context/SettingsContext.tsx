import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

interface SettingsContextType {
  settings: any;
  loading: boolean;
  currency: string;
  currencySymbol: string;
  appName: string;
  refreshSettings: () => Promise<void>;
  /** Apply settings already fetched (e.g. from public tenant resolve) without an extra request. */
  applySettings: (data: any) => void;
  formatPrice: (amount: number | string | any) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  AUD: 'A$',
  CAD: 'C$',
  INR: '₹',
  AED: 'dh',
  SAR: 'SR',
};

function readStoredRole(): { role?: string; tenantId?: string | null } {
  try {
    return JSON.parse(localStorage.getItem('tastyc_user') || '{}');
  } catch {
    return {};
  }
}

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const applySettings = useCallback((data: any) => {
    if (!data) return;
    setSettings(data);
    if (data.tenantId) {
      localStorage.setItem('tastyc_tenant_id', data.tenantId);
    }
    setLoading(false);
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      const stored = readStoredRole();
      const role = user?.role || stored.role;
      const tenantId = user?.tenantId !== undefined ? user.tenantId : stored.tenantId;
      const token = localStorage.getItem('tastyc_token');

      // Global Super Admin → platform admin-panel branding (admin routes only)
      if (token && role === 'SUPER_ADMIN' && !tenantId) {
        const onAdmin = typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
        if (!onAdmin) {
          setLoading(false);
          return;
        }
        try {
          const branding = await api.platform.branding.get();
          setSettings({
            appName: branding.appName,
            logo: branding.logo,
            favicon: branding.favicon,
            currency: 'USD',
            timezone: 'UTC',
          });
          return;
        } catch (err) {
          const publicBranding = await api.public.branding();
          setSettings({
            appName: publicBranding.appName,
            logo: publicBranding.logo,
            favicon: publicBranding.favicon,
            currency: 'USD',
            timezone: 'UTC',
          });
          return;
        }
      }

      const data = await api.settings.get();
      setSettings(data);
      if (data?.tenantId) {
        localStorage.setItem('tastyc_tenant_id', data.tenantId);
      }
    } catch (error) {
      console.error('Failed to load global application settings:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    refreshSettings();
  }, [authLoading, isAuthenticated, user?.id, user?.role, refreshSettings]);

  const currency = settings?.currency || 'USD';
  const currencySymbol = SYMBOLS[currency] || '$';
  const appName = settings?.appName || 'Restaurant Ops';

  const formatPrice = useCallback(
    (amount: number | string | any) => {
      const val = parseFloat(amount);
      if (isNaN(val)) return `${currencySymbol}0.00`;
      return `${currencySymbol}${val.toFixed(2)}`;
    },
    [currencySymbol]
  );

  useEffect(() => {
    if (settings?.appName) {
      document.title = settings.appName;
    }
    if (settings?.favicon) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = settings.favicon;
    }
  }, [settings]);

  const value = useMemo(
    () => ({
      settings,
      loading,
      currency,
      currencySymbol,
      appName,
      refreshSettings,
      applySettings,
      formatPrice,
    }),
    [settings, loading, currency, currencySymbol, appName, refreshSettings, applySettings, formatPrice]
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
