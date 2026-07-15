import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Coffee, MapPin, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';

/** Platform landing: pick a restaurant storefront. */
export const RestaurantDirectory: React.FC = () => {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.public
      .listTenants({ limit: 50 })
      .then((r) => setTenants(r.data || []))
      .catch((e) => setError(e.message || 'Could not load restaurants'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[#0a1316] text-white">
      <div className="max-w-6xl mx-auto px-4 py-16 space-y-10">
        <div className="text-center space-y-4">
          <p className="text-tastyc-copper text-xs uppercase tracking-[0.3em] font-semibold">Tastyc Platform</p>
          <h1 className="font-title text-4xl sm:text-5xl uppercase tracking-wider">Choose a restaurant</h1>
          <p className="text-[#a9b8c3] text-sm max-w-xl mx-auto">
            Each restaurant has its own menu, table booking, and loyalty experience under{' '}
            <span className="text-white font-mono text-xs">/r/&lt;slug&gt;</span>.
          </p>
          <div className="pt-2">
            <Link
              to="/admin/login"
              className="text-[10px] uppercase tracking-widest text-tastyc-copper border border-tastyc-copper/30 px-4 py-2 hover:bg-tastyc-copper/10"
            >
              Staff / Admin login
            </Link>
          </div>
        </div>

        {loading && (
          <p className="text-center text-[#a9b8c3] text-xs uppercase tracking-widest">Loading restaurants…</p>
        )}
        {error && <p className="text-center text-red-400 text-sm">{error}</p>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenants.map((t) => (
            <Link
              key={t.id}
              to={`/r/${t.slug}`}
              className="group bg-[#121e22] border border-tastyc-copper/10 hover:border-tastyc-copper/40 p-6 flex flex-col gap-4 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {t.settings?.logo ? (
                    <img src={t.settings.logo} alt="" className="h-10 w-10 object-contain" />
                  ) : (
                    <Coffee className="h-8 w-8 text-tastyc-copper" />
                  )}
                  <div>
                    <h2 className="font-title text-xl uppercase tracking-wider text-white group-hover:text-tastyc-copper transition-colors">
                      {t.settings?.appName || t.name}
                    </h2>
                    <p className="text-[10px] text-[#a9b8c3] uppercase tracking-widest mt-0.5">/{t.slug}</p>
                  </div>
                </div>
                <span
                  className={`text-[9px] uppercase font-bold px-2 py-0.5 border ${
                    t.status === 'ACTIVE'
                      ? 'text-emerald-400 border-emerald-500/30'
                      : 'text-amber-400 border-amber-500/30'
                  }`}
                >
                  {t.status}
                </span>
              </div>
              <p className="text-xs text-[#a9b8c3] line-clamp-2">
                {t.settings?.homeBannerSubtitle || t.companyName}
              </p>
              {t.settings?.findUsAddress && (
                <p className="text-[10px] text-[#a9b8c3] flex items-start gap-1.5">
                  <MapPin className="h-3 w-3 mt-0.5 shrink-0 text-tastyc-copper" />
                  <span className="line-clamp-2">{t.settings.findUsAddress}</span>
                </p>
              )}
              <span className="mt-auto inline-flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold text-tastyc-copper">
                Open storefront <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>

        {!loading && tenants.length === 0 && !error && (
          <p className="text-center text-[#a9b8c3] text-sm">No public restaurants yet.</p>
        )}
      </div>
    </div>
  );
};
