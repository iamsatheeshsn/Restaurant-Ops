import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, User, LogOut, Menu, X, Coffee } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useOptionalStorefront } from '../context/TenantContext';
import { ADMIN_PANEL_ROLES, getDefaultAdminPath } from '../config/rbac';

export const CustomerLayout: React.FC<{ children: React.ReactNode; onOpenCart: () => void }> = ({
  children,
  onOpenCart,
}) => {
  const { cartCount } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  const { settings } = useSettings();
  const storefront = useOptionalStorefront();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const base = storefront?.basePath || '';
  const href = (suffix: string) => {
    if (!base) return suffix || '/';
    const clean = suffix === '/' ? '' : suffix;
    return `${base}${clean}`;
  };

  const isActive = (suffix: string) => {
    const target = href(suffix);
    return location.pathname === target || (suffix === '/' && location.pathname === base);
  };

  const brandName = settings?.appName || storefront?.tenant?.name || 'Tastyc';

  return (
    <div className="min-h-screen bg-[#0a1316] text-white flex flex-col justify-between">
      <header className="sticky top-0 z-40 tastyc-blur border-b border-tastyc-copper/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <Link to={href('/')} className="flex items-center space-x-2.5">
              {settings?.logo ? (
                <img src={settings.logo} alt={brandName} className="h-8 w-auto object-contain" />
              ) : (
                <Coffee className="h-7 w-7 text-tastyc-copper" />
              )}
              <span className="font-title text-2xl tracking-widest text-white uppercase">{brandName}</span>
            </Link>

            <nav className="hidden md:flex space-x-10">
              {[
                ['/', 'Home'],
                ['/menu', 'Menu'],
                ['/reservations', 'Book Table'],
                ['/loyalty', 'Loyalty Club'],
              ].map(([suffix, label]) => (
                <Link
                  key={suffix}
                  to={href(suffix)}
                  className={`font-medium tracking-wider uppercase text-xs transition-colors duration-300 ${
                    isActive(suffix) ? 'text-tastyc-copper' : 'text-[#a9b8c3] hover:text-white'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-6">
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  {user && ADMIN_PANEL_ROLES.includes(user.role as any) && (
                    <Link
                      to={getDefaultAdminPath(user.role)}
                      className="hidden sm:inline-block px-4 py-2 border border-tastyc-copper/30 hover:border-tastyc-copper text-[10px] uppercase font-bold tracking-widest text-tastyc-copper hover:text-white hover:bg-tastyc-copper/10 transition-all duration-300"
                    >
                      Staff Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      navigate(href('/'));
                    }}
                    className="p-1 text-[#a9b8c3] hover:text-red-400 transition-colors"
                    title={`Logout (${user?.name})`}
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <Link to={href('/login')} className="p-1 text-[#a9b8c3] hover:text-white transition-colors" title="Sign In">
                  <User className="h-5 w-5" />
                </Link>
              )}

              <button onClick={onOpenCart} className="relative p-1 text-[#a9b8c3] hover:text-white transition-colors">
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-tastyc-copper rounded-full flex items-center justify-center text-[9px] font-bold text-white ring-2 ring-[#0a1316]">
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-1 text-[#a9b8c3] hover:text-white transition-colors"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-[#121e22] border-t border-tastyc-copper/10 px-4 pt-2 pb-4 space-y-1">
            {[
              ['/', 'Home'],
              ['/menu', 'Menu'],
              ['/reservations', 'Book Table'],
              ['/loyalty', 'Loyalty Club'],
            ].map(([suffix, label]) => (
              <Link
                key={suffix}
                to={href(suffix)}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md font-medium tracking-wider uppercase text-xs hover:bg-tastyc-dark text-[#a9b8c3] hover:text-white"
              >
                {label}
              </Link>
            ))}
            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                  navigate(href('/'));
                }}
                className="w-full text-left flex items-center space-x-2 px-3 py-2 rounded-md font-medium tracking-wider uppercase text-xs hover:bg-red-950/20 text-red-400"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout ({user?.name})</span>
              </button>
            ) : (
              <Link
                to={href('/login')}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-center border border-tastyc-copper text-tastyc-copper font-medium tracking-widest uppercase text-xs"
              >
                Sign In
              </Link>
            )}
          </div>
        )}
      </header>

      <main className="flex-grow">{children}</main>

      <footer className="bg-[#121e22] border-t border-tastyc-copper/10 py-12 text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center sm:text-left">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h4 className="font-title text-xl text-tastyc-copper uppercase tracking-widest">{brandName}</h4>
              <p className="text-sm text-[#a9b8c3] leading-relaxed max-w-sm">
                Beyond espresso. Premium recipes, handcrafted bakeries, and seamless digital service under one roof.
              </p>
              <div className="pt-2 flex flex-wrap gap-2">
                <Link
                  to={href('/supplier/portal')}
                  className="text-[10px] text-tastyc-copper hover:text-white uppercase tracking-wider font-semibold border border-tastyc-copper/30 hover:border-white px-3 py-1.5 transition-all"
                >
                  Supplier Portal
                </Link>
                <Link
                  to="/"
                  className="text-[10px] text-[#a9b8c3] hover:text-white uppercase tracking-wider font-semibold border border-white/10 px-3 py-1.5 transition-all"
                >
                  All restaurants
                </Link>
              </div>
            </div>
            <div className="space-y-4">
              <h4 className="font-title text-xl text-tastyc-copper uppercase tracking-widest">Hours of Service</h4>
              <p className="text-sm text-[#a9b8c3] leading-relaxed whitespace-pre-line">
                {settings?.hoursOfService || 'Monday — Friday: 7:00 AM — 10:00 PM \nSaturday — Sunday: 8:00 AM — 11:00 PM'}
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="font-title text-xl text-tastyc-copper uppercase tracking-widest">Find Us</h4>
              <p className="text-sm text-[#a9b8c3] leading-relaxed whitespace-pre-line">
                {settings?.findUsAddress || '456 Copper Avenue, Suite 101, Metro City'}
                {settings?.findUsPhone && `\nPhone: ${settings.findUsPhone}`}
                {settings?.findUsEmail && `\nEmail: ${settings.findUsEmail}`}
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-tastyc-copper/5 text-center">
            <p className="text-xs text-[#a9b8c3]">
              {settings?.footerContent || `© ${new Date().getFullYear()} Tastyc Platform. All Rights Reserved.`}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
