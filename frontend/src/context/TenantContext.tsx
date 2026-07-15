import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { useCart } from './CartContext';
import { useSettings } from './SettingsContext';

export type StorefrontTenant = {
  id: string;
  name: string;
  companyName: string;
  slug: string;
  status: string;
  settings?: any;
  branches?: Array<{ id: string; name: string; address: string; phone: string }>;
};

type TenantContextValue = {
  tenant: StorefrontTenant | null;
  slug: string | null;
  basePath: string;
  loading: boolean;
  error: string | null;
  path: (suffix?: string) => string;
  refresh: () => Promise<void>;
};

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

const TENANT_STORAGE_KEY = 'tastyc_tenant_id';
const SLUG_STORAGE_KEY = 'tastyc_tenant_slug';

export function applyTenantId(tenantId: string, slug?: string) {
  localStorage.setItem(TENANT_STORAGE_KEY, tenantId);
  if (slug) localStorage.setItem(SLUG_STORAGE_KEY, slug);
}

/** Provider for /r/:slug storefront routes — resolves tenant and sets X-Tenant-ID. */
export const StorefrontTenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { slug: routeSlug } = useParams<{ slug: string }>();
  const slug = (routeSlug || '').toLowerCase();
  const [tenant, setTenant] = useState<StorefrontTenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { clearCart } = useCart();
  const { applySettings } = useSettings();

  const clearCartRef = useRef(clearCart);
  const applySettingsRef = useRef(applySettings);
  const resolvedSlugRef = useRef<string | null>(null);

  clearCartRef.current = clearCart;
  applySettingsRef.current = applySettings;

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!slug) {
        setError('Missing restaurant slug');
        setLoading(false);
        return;
      }

      // Only full-screen load when switching restaurants / first paint
      const switching = resolvedSlugRef.current !== slug;
      if (switching) {
        setLoading(true);
        setTenant(null);
      }
      setError(null);

      try {
        const data = await api.public.resolveTenant(slug);
        if (cancelled) return;

        const prevSlug = localStorage.getItem(SLUG_STORAGE_KEY);
        if (prevSlug && prevSlug !== data.slug) {
          clearCartRef.current();
        }

        applyTenantId(data.id, data.slug);

        if (data.settings) {
          applySettingsRef.current({
            ...data.settings,
            tenantId: data.id,
            appName: data.settings.appName || data.name,
          });
        }

        resolvedSlugRef.current = data.slug;
        setTenant(data);
      } catch (e: any) {
        if (cancelled) return;
        resolvedSlugRef.current = null;
        setTenant(null);
        setError(e?.message || 'Restaurant not found');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const basePath = slug ? `/r/${slug}` : '';

  const path = useCallback(
    (suffix = '') => {
      const clean = suffix.startsWith('/') ? suffix : suffix ? `/${suffix}` : '';
      return `${basePath}${clean}` || '/';
    },
    [basePath]
  );

  const refresh = useCallback(async () => {
    if (!slug) return;
    setError(null);
    try {
      const data = await api.public.resolveTenant(slug);
      applyTenantId(data.id, data.slug);
      if (data.settings) {
        applySettingsRef.current({
          ...data.settings,
          tenantId: data.id,
          appName: data.settings.appName || data.name,
        });
      }
      resolvedSlugRef.current = data.slug;
      setTenant(data);
    } catch (e: any) {
      setError(e?.message || 'Restaurant not found');
    }
  }, [slug]);

  const value = useMemo(
    () => ({
      tenant,
      slug: slug || null,
      basePath,
      loading,
      error,
      path,
      refresh,
    }),
    [tenant, slug, basePath, loading, error, path, refresh]
  );

  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
};

export const useStorefront = () => {
  const ctx = useContext(TenantContext);
  if (!ctx) {
    throw new Error('useStorefront must be used within StorefrontTenantProvider');
  }
  return ctx;
};

/** Safe variant for shared components that may render outside a storefront. */
export const useOptionalStorefront = () => useContext(TenantContext);
