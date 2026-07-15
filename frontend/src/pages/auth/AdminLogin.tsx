import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDefaultAdminPath } from '../../config/rbac';
import { api } from '../../services/api';
import { Coffee, KeyRound, Mail, ShieldAlert } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [branding, setBranding] = useState<{ appName: string; logo: string | null; favicon: string | null }>({
    appName: 'Restaurant Ops',
    logo: null,
    favicon: null,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.public.branding();
        if (cancelled || !data) return;
        setBranding({
          appName: data.appName || 'Restaurant Ops',
          logo: data.logo || null,
          favicon: data.favicon || null,
        });
        if (data.appName) document.title = `${data.appName} — Admin`;
        if (data.favicon) {
          let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.getElementsByTagName('head')[0].appendChild(link);
          }
          link.href = data.favicon;
        }
      } catch {
        /* keep defaults */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });

      const token = localStorage.getItem('tastyc_token');
      if (token) {
        const userStr = localStorage.getItem('tastyc_user') || '{}';
        const user = JSON.parse(userStr);

        if (user && (user.role === 'CUSTOMER' || user.role === 'SUPPLIER')) {
          logout();
          throw new Error('Access Denied: This account is not authorized for the operations panel.');
        }

        navigate(getDefaultAdminPath(user?.role || ''));
        return;
      }

      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const brandName = branding.appName || 'Restaurant Ops';

  return (
    <div className="min-h-screen bg-[#0a1316] text-white flex flex-col lg:flex-row font-body selection:bg-tastyc-copper selection:text-white">
      <div
        className="hidden lg:block lg:w-1/2 bg-cover bg-center relative min-h-screen select-none"
        style={{ backgroundImage: `url('/login_banner.png')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0a1316] via-transparent to-black/30 z-10" />

        <div className="absolute bottom-16 left-16 z-20 max-w-lg space-y-4 text-left">
          <div className="flex items-center space-x-3">
            <div className="h-[2px] w-12 bg-tastyc-copper" />
            <span className="text-tastyc-copper text-xs uppercase tracking-widest font-bold">Back-Office Portal</span>
          </div>
          <h2 className="font-title text-5xl uppercase tracking-widest text-white leading-tight">
            {brandName}
          </h2>
          <p className="text-[#a9b8c3] text-sm leading-relaxed max-w-sm">
            Handcrafted espresso recipes, perpetual inventory audits, and Chrono-Priority KDS queues managed under a
            single B2B SaaS dashboard.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-16 relative">
        <div className="absolute h-80 w-80 bg-tastyc-copper/5 rounded-full blur-[100px] pointer-events-none top-1/4 right-1/4" />

        <div className="max-w-md w-full space-y-8 text-left z-10">
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5">
              {branding.logo ? (
                <img src={branding.logo} alt={brandName} className="h-10 w-auto object-contain" />
              ) : (
                <div className="h-10 w-10 rounded-full bg-tastyc-copper/10 flex items-center justify-center border border-tastyc-copper/25 animate-pulse">
                  <Coffee className="h-5 w-5 text-tastyc-copper" />
                </div>
              )}
              <span className="text-xs uppercase tracking-widest text-tastyc-copper font-bold">{brandName}</span>
            </div>
            <h1 className="font-title text-4xl uppercase text-white tracking-widest leading-none pt-2">
              Sign In to Panel
            </h1>
            <p className="text-xs text-[#a9b8c3] tracking-wide leading-relaxed">
              Enter your credentials to access active restaurant branch shifts, inventories, and KDS tickets.
            </p>
          </div>

          {error && (
            <div className="bg-red-950/25 border border-red-500/20 p-4 text-red-400 text-xs flex items-start space-x-3 rounded-none shadow-lg">
              <ShieldAlert className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <p className="uppercase tracking-wide leading-normal font-semibold">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-[#a9b8c3] font-bold flex items-center space-x-2">
                <Mail className="h-3.5 w-3.5 text-tastyc-copper" />
                <span>Work Email Address</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#121e22] border border-tastyc-copper/15 focus:border-tastyc-copper focus:ring-2 focus:ring-tastyc-copper/10 p-3.5 text-white text-sm outline-none transition-all duration-300 shadow-inner"
                placeholder="e.g. chef@tastyc.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-[#a9b8c3] font-bold flex items-center space-x-2">
                <KeyRound className="h-3.5 w-3.5 text-tastyc-copper" />
                <span>Security Password</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#121e22] border border-tastyc-copper/15 focus:border-tastyc-copper focus:ring-2 focus:ring-tastyc-copper/10 p-3.5 text-white text-sm outline-none transition-all duration-300 shadow-inner"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-tastyc-copper to-[#b8692c] hover:from-[#e39150] hover:to-tastyc-copper text-white font-bold uppercase tracking-widest text-xs transition-all duration-300 transform active:scale-[0.99] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-tastyc-copper/10 hover:shadow-xl"
            >
              {loading ? 'Authorizing Session...' : 'Authorize Back-Office Login'}
            </button>
          </form>

          <div className="border-t border-tastyc-copper/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[10px] uppercase tracking-wider text-[#a9b8c3]/60 gap-4">
            <p className="text-center sm:text-left leading-normal font-semibold">
              Authorized Personnel Only. <br /> All transactions audited.
            </p>
            <Link
              to="/"
              className="font-bold text-tastyc-copper hover:text-tastyc-copperLight transition-colors hover:underline"
            >
              Go to Storefront
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
