import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDefaultAdminPath } from '../../config/rbac';
import { useStorefront } from '../../context/TenantContext';
import { Coffee, KeyRound, Mail, ShieldAlert } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { path } = useStorefront();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      
      const userStr = localStorage.getItem('tastyc_user') || '{}';
      const user = JSON.parse(userStr);

      if (user && user.role === 'CUSTOMER') {
        navigate(path('/menu'));
      } else if (user?.role === 'SUPPLIER') {
        navigate(path('/supplier/portal'));
      } else {
        navigate(getDefaultAdminPath(user?.role || ''));
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1316] text-white flex flex-col lg:flex-row font-body selection:bg-tastyc-copper selection:text-white">
      {/* Left Column: Stunning Image Banner (Hidden on Mobile/Tablet) */}
      <div 
        className="hidden lg:block lg:w-1/2 bg-cover bg-center relative min-h-screen select-none"
        style={{ backgroundImage: `url('/customer_banner.png')` }}
      >
        {/* Dark Overlay Mask */}
        <div className="absolute inset-0 bg-gradient-to-tr from-[#0a1316] via-transparent to-black/30 z-10" />
        
        {/* Banner Branding */}
        <div className="absolute bottom-16 left-16 z-20 max-w-lg space-y-4 text-left">
          <div className="flex items-center space-x-3">
            <div className="h-[2px] w-12 bg-tastyc-copper" />
            <span className="text-tastyc-copper text-xs uppercase tracking-widest font-bold">Tastyc Experience</span>
          </div>
          <h2 className="font-title text-5xl uppercase tracking-widest text-white leading-tight">
            Handcrafted <br /> Coffee & Pastries
          </h2>
          <p className="text-[#a9b8c3] text-sm leading-relaxed max-w-sm">
            Enjoy premium arabica espresso blends, gourmet baking, and seamless QR-table service at our Manhattan branch locations.
          </p>
        </div>
      </div>

      {/* Right Column: Premium Login Form Card */}
      <div className="flex-1 flex items-center justify-center p-8 sm:p-12 lg:p-16 relative">
        {/* Glowing atmospheric background light */}
        <div className="absolute h-80 w-80 bg-tastyc-copper/5 rounded-full blur-[100px] pointer-events-none top-1/4 right-1/4" />

        <div className="max-w-md w-full space-y-8 text-left z-10">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2.5">
              <div className="h-10 w-10 rounded-full bg-tastyc-copper/10 flex items-center justify-center border border-tastyc-copper/25 animate-pulse">
                <Coffee className="h-5 w-5 text-tastyc-copper" />
              </div>
              <span className="text-xs uppercase tracking-widest text-tastyc-copper font-bold">Storefront Portal</span>
            </div>
            <h1 className="font-title text-4xl uppercase text-white tracking-widest leading-none pt-2">
              Customer Login
            </h1>
            <p className="text-xs text-[#a9b8c3] tracking-wide leading-relaxed">
              Sign in to place guest checkout orders, track live status feeds, and review transaction histories.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-950/25 border border-red-500/20 p-4 text-red-400 text-xs flex items-start space-x-3 rounded-none shadow-lg">
              <ShieldAlert className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <p className="uppercase tracking-wide leading-normal font-semibold">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-[#a9b8c3] font-bold flex items-center space-x-2">
                <Mail className="h-3.5 w-3.5 text-tastyc-copper" />
                <span>Customer Email</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#121e22] border border-tastyc-copper/15 focus:border-tastyc-copper focus:ring-2 focus:ring-tastyc-copper/10 p-3.5 text-white text-sm outline-none transition-all duration-300 shadow-inner"
                placeholder="e.g. customer@example.com"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-[#a9b8c3] font-bold flex items-center space-x-2">
                <KeyRound className="h-3.5 w-3.5 text-tastyc-copper" />
                <span>Account Password</span>
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-tastyc-copper to-[#b8692c] hover:from-[#e39150] hover:to-tastyc-copper text-white font-bold uppercase tracking-widest text-xs transition-all duration-300 transform active:scale-[0.99] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-tastyc-copper/10 hover:shadow-xl"
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="border-t border-tastyc-copper/10 pt-6 flex flex-col items-center space-y-4 text-xs">
            <p className="text-[#a9b8c3]">
              Need a customer account?{' '}
              <Link to={path('/register')} className="text-tastyc-copper hover:text-tastyc-copperLight font-bold transition-colors">
                Register Here
              </Link>
            </p>
            <div className="pt-3 border-t border-tastyc-copper/5 w-full text-center">
              <Link 
                to="/admin/login" 
                className="text-[10px] uppercase font-bold tracking-widest text-tastyc-copper/70 hover:text-tastyc-copper transition-colors"
              >
                Sign In as Restaurant Staff
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
