import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useSettings } from '../context/SettingsContext';
import { api } from '../services/api';
import { ADMIN_MENU_GROUPS } from '../config/rbac';
import {
  Coffee,
  Clock,
  LogOut,
  Menu,
  X,
  Store,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
} from 'lucide-react';

export const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();
  const { settings, refreshSettings } = useSettings();

  const isActive = (path: string) => location.pathname === path;

  const menuGroups = ADMIN_MENU_GROUPS;

  const [clockedIn, setClockedIn] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('tastyc_sidebar_collapsed') === 'true';
  });

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const activeGroup = menuGroups.find((group) =>
      group.items.some((item) => item.path === location.pathname)
    );
    const initial: Record<string, boolean> = {};
    menuGroups.forEach((g) => {
      initial[g.title] = activeGroup ? activeGroup.title === g.title : g.title === 'Overview';
    });
    return initial;
  });

  // Ensure Super Admin panel always shows saved platform branding after navigation/reload
  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);
  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  useEffect(() => {
    const activeGroup = menuGroups.find((group) =>
      group.items.some((item) => item.path === location.pathname)
    );
    if (activeGroup) {
      const next: Record<string, boolean> = {};
      menuGroups.forEach((g) => {
        next[g.title] = g.title === activeGroup.title;
      });
      setOpenGroups(next);
    }
  }, [location.pathname]);

  useEffect(() => {
    const fetchAttendanceStatus = async () => {
      try {
        const status = await api.attendance.getStatus();
        setClockedIn(status.clockedIn);
      } catch (error) {
        console.error('Failed to get attendance status:', error);
      }
    };
    fetchAttendanceStatus();
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('tastyc_sidebar_collapsed', next.toString());
      return next;
    });
  };

  const handleClockToggle = async () => {
    try {
      if (clockedIn) {
        const session = await api.attendance.clockOut();
        setClockedIn(false);
        showNotification({
          title: 'Shift Ended',
          message: `Clocked out at ${new Date(session.clockOut).toLocaleTimeString()}`,
          type: 'info',
        });
      } else {
        const session = await api.attendance.clockIn();
        setClockedIn(true);
        showNotification({
          title: 'Shift Started',
          message: `Clocked in at ${new Date(session.clockIn).toLocaleTimeString()}`,
          type: 'success',
        });
      }
    } catch (error: any) {
      showNotification({
        title: 'Action Failed',
        message: error.message || 'Attendance action failed',
        type: 'error',
      });
    }
  };

  return (
    <div className="min-h-screen md:h-screen bg-[#0a1316] text-white flex flex-col md:flex-row font-body selection:bg-tastyc-copper selection:text-white md:overflow-hidden">
      <div className="md:hidden flex items-center justify-between bg-[#121e22] px-4 h-16 border-b border-tastyc-copper/10">
        <div className="flex items-center space-x-2">
          {settings?.logo ? (
            <img src={settings.logo} alt={settings.appName} className="h-6 w-auto object-contain shrink-0" />
          ) : (
            <Coffee className="h-6 w-6 text-tastyc-copper shrink-0" />
          )}
          <span className="font-title tracking-widest text-lg text-white">
            {settings?.appName || 'Restaurant Ops'} Admin
          </span>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-1 text-tastyc-copper">
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <aside
        className={`bg-[#121e22] border-r border-tastyc-copper/15 flex flex-col justify-between shrink-0 transition-all duration-300 relative h-full md:h-full ${
          mobileMenuOpen ? 'w-full block' : 'hidden md:flex'
        } ${isCollapsed ? 'md:w-20' : 'md:w-64'}`}
      >
        <button
          onClick={toggleSidebar}
          className="hidden md:flex absolute top-7 -right-3 z-30 h-6 w-6 rounded-full bg-[#121e22] border border-tastyc-copper/20 hover:border-tastyc-copper items-center justify-center text-[#a9b8c3] hover:text-white transition-all shadow-md"
        >
          {isCollapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>

        <div className="flex flex-col min-h-0 flex-1">
          <div
            className={`flex items-center h-20 border-b border-tastyc-copper/10 px-6 ${
              isCollapsed ? 'justify-center' : 'justify-between'
            }`}
          >
            <div className="flex items-center space-x-3">
              {settings?.logo ? (
                <img src={settings.logo} alt={settings.appName} className="h-6 w-auto object-contain shrink-0" />
              ) : (
                <Coffee className="h-6 w-6 text-tastyc-copper shrink-0" />
              )}
              {!isCollapsed && (
                <span className="font-title tracking-widest text-lg text-white uppercase transition-all duration-300">
                  {settings?.appName || 'Restaurant Ops'} Panel
                </span>
              )}
            </div>
          </div>

          <nav className="p-4 space-y-6 overflow-y-auto">
            {menuGroups.map((group) => {
              const allowedItems = group.items.filter((item) => {
                if (user && !item.roles.includes(user.role as any)) return false;
                if (!item.feature || !user) return true;
                if (user.role === 'SUPER_ADMIN') return true;
                const features = user.subscription?.features;
                if (!features) return true;
                return features.includes(item.feature);
              });

              if (allowedItems.length === 0) return null;

              return (
                <div key={group.title} className="space-y-1.5">
                  {!isCollapsed ? (
                    <button
                      onClick={() => toggleGroup(group.title)}
                      className="w-full flex items-center justify-between text-[9px] uppercase font-bold tracking-[0.2em] text-[#a9b8c3]/40 hover:text-white px-4 py-2 text-left transition-colors"
                    >
                      <span>{group.title}</span>
                      {openGroups[group.title] ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </button>
                  ) : (
                    <div className="border-b border-tastyc-copper/5 my-2 w-full" />
                  )}

                  {(!isCollapsed ? openGroups[group.title] : true) && (
                    <div className="space-y-1">
                      {allowedItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center px-4 py-3 text-xs tracking-wider uppercase transition-all duration-200 ${
                              isCollapsed ? 'justify-center rounded-none' : 'space-x-3 text-left'
                            } ${
                              active
                                ? 'bg-tastyc-copper/10 border-l-2 border-tastyc-copper text-tastyc-copper font-semibold shadow-inner'
                                : 'text-[#a9b8c3] hover:bg-tastyc-dark/40 hover:text-white'
                            }`}
                            title={isCollapsed ? item.name : undefined}
                          >
                            <Icon className="h-4 w-4 shrink-0" />
                            {!isCollapsed && <span>{item.name}</span>}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        <div className={`p-4 border-t border-tastyc-copper/10 space-y-4 ${isCollapsed ? 'items-center' : ''}`}>
          <div className={`flex ${isCollapsed ? 'flex-col items-center space-y-4' : 'items-center justify-between'}`}>
            {!isCollapsed ? (
              <div className="text-left max-w-[150px]">
                <p className="text-xs font-bold text-white uppercase tracking-wider truncate">{user?.name}</p>
                <p className="text-[9px] text-tastyc-copper font-semibold uppercase tracking-wide truncate">
                  {user?.role?.replace(/_/g, ' ')}
                </p>
              </div>
            ) : (
              <div
                className="h-7 w-7 rounded-full bg-tastyc-copper/10 border border-tastyc-copper/30 flex items-center justify-center text-[10px] font-bold text-tastyc-copper uppercase"
                title={`${user?.name} (${user?.role})`}
              >
                {user?.name?.slice(0, 2)}
              </div>
            )}
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="p-2 hover:bg-red-950/20 text-[#a9b8c3] hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center bg-tastyc-dark/40 hover:bg-tastyc-copper/10 border border-tastyc-copper/15 hover:border-tastyc-copper/50 text-[10px] uppercase font-bold tracking-widest transition-all ${
              isCollapsed ? 'h-8 w-8 rounded-none' : 'w-full py-2.5 space-x-2'
            }`}
            title="Open Storefront"
          >
            <Store className="h-3.5 w-3.5 shrink-0" />
            {!isCollapsed && <span>Storefront</span>}
          </a>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-[#121e22]/50 border-b border-tastyc-copper/10 flex items-center justify-between px-6 sm:px-8 shrink-0 relative z-20">
          <h2 className="font-title text-2xl uppercase text-white tracking-widest hidden sm:block">
            {menuGroups.flatMap((g) => g.items).find((i) => isActive(i.path))?.name ||
              'Operations Panel'}
          </h2>

          <div className="flex items-center space-x-6 ml-auto sm:ml-0">
            <div className="flex items-center space-x-3">
              <span className="text-xs text-[#a9b8c3] hidden md:inline">
                {clockedIn ? 'Clocked In (Active Shift)' : 'Not Clocked In'}
              </span>
              <button
                onClick={handleClockToggle}
                className={`flex items-center space-x-2 px-4 py-2 text-xs uppercase tracking-widest border transition-all duration-300 font-semibold ${
                  clockedIn
                    ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-900/20'
                    : 'border-tastyc-copper/40 text-tastyc-copper hover:bg-tastyc-copper hover:text-white'
                }`}
              >
                <Clock className="h-4 w-4" />
                <span>{clockedIn ? 'Clock Out' : 'Clock In'}</span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 sm:p-8 overflow-y-auto bg-[#0a1316] relative">{children}</main>
      </div>
    </div>
  );
};
