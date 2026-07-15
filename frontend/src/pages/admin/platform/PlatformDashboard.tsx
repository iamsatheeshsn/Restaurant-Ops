import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Building2,
  ChevronRight,
  CreditCard,
  Globe2,
  Headphones,
  KeyRound,
  LayoutGrid,
  Shield,
  Ticket,
  Users,
  GitBranch,
} from 'lucide-react';
import { api } from '../../../services/api';
import { useNotification } from '../../../context/NotificationContext';
import { useAuth } from '../../../context/AuthContext';

const statusTone = (status: string) => {
  switch (status) {
    case 'ACTIVE':
    case 'RESOLVED':
    case 'PAID':
    case 'ok':
      return 'text-emerald-400 border-emerald-500/30 bg-emerald-950/30';
    case 'TRIAL':
    case 'IN_PROGRESS':
    case 'OPEN':
    case 'DRAFT':
      return 'text-amber-400 border-amber-500/30 bg-amber-950/30';
    case 'SUSPENDED':
    case 'CANCELLED':
    case 'CLOSED':
    case 'down':
      return 'text-red-400 border-red-500/30 bg-red-950/30';
    default:
      return 'text-[#a9b8c3] border-white/15 bg-white/5';
  }
};

const formatUsd = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    Number(n || 0)
  );

const formatUptime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 24) return `${Math.floor(h / 24)}d ${h % 24}h`;
  return `${h}h ${m}m`;
};

export const PlatformDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const { user } = useAuth();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const analytics = await api.platform.analytics();
        if (!cancelled) setData(analytics);
      } catch (error: any) {
        showNotification({
          title: 'Platform sync failed',
          message: error?.message || 'Could not load platform analytics.',
          type: 'error',
        });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-tastyc-copper" />
          <div className="absolute inset-0 flex items-center justify-center text-tastyc-copper font-bold animate-pulse">
            T
          </div>
        </div>
        <p className="text-[#a9b8c3] text-xs uppercase tracking-widest font-semibold">
          Loading platform console…
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center text-[#a9b8c3] text-sm">
        Platform analytics unavailable.
      </div>
    );
  }

  const statusMap = Object.fromEntries(
    (data.tenantsByStatus || []).map((r: any) => [r.status, r.count])
  ) as Record<string, number>;

  const quickLinks = [
    { to: '/admin/platform/tenants', label: 'Tenants', icon: Building2 },
    { to: '/admin/platform/billing', label: 'Billing', icon: CreditCard },
    { to: '/admin/platform/support', label: 'Support', icon: Headphones },
    { to: '/admin/platform/integrations', label: 'Integrations', icon: KeyRound },
    { to: '/admin/platform/system', label: 'System', icon: Activity },
    { to: '/admin/audit', label: 'Audit', icon: Shield },
  ];

  return (
    <div className="space-y-8 text-left selection:bg-tastyc-copper selection:text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-tastyc-copper/10 pb-6">
        <div>
          <p className="text-tastyc-copper text-xs uppercase tracking-widest font-semibold flex items-center gap-1.5">
            <Globe2 className="h-3.5 w-3.5" />
            <span>Global Platform Console</span>
          </p>
          <h2 className="font-title text-3xl sm:text-4xl uppercase tracking-wider text-white mt-1">
            Super Admin Dashboard
          </h2>
          <p className="text-sm text-[#a9b8c3] mt-2 max-w-xl">
            Cross-tenant health, billing, and support — not tied to a single restaurant.
            {user?.name ? ` Signed in as ${user.name}.` : ''}
          </p>
        </div>
        <div className="bg-[#121e22] border border-tastyc-copper/15 px-4 py-2.5 flex items-center gap-3 text-xs">
          <div
            className={`h-2 w-2 rounded-full ${
              data.health?.database === 'ok' ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
            }`}
          />
          <span className="text-[#a9b8c3] font-medium">
            DB {String(data.health?.database || '…').toUpperCase()} · Uptime{' '}
            {formatUptime(Number(data.health?.uptimeSeconds || 0))}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {[
          {
            label: 'Tenants',
            value: data.totalTenants,
            hint: `${statusMap.ACTIVE || 0} active · ${statusMap.TRIAL || 0} trial`,
            icon: Building2,
            tone: 'text-tastyc-copper',
          },
          {
            label: 'Branches',
            value: data.totalBranches,
            hint: 'Across all restaurants',
            icon: GitBranch,
            tone: 'text-blue-400',
          },
          {
            label: 'Restaurant users',
            value: data.restaurantUsers,
            hint: `${data.platformUsers || 0} platform admins`,
            icon: Users,
            tone: 'text-emerald-400',
          },
          {
            label: 'Orders (30d)',
            value: data.totalOrdersLast30d,
            hint: `GMV ${formatUsd(data.gmvLast30d)}`,
            icon: LayoutGrid,
            tone: 'text-amber-400',
          },
          {
            label: 'Open tickets',
            value: data.openTickets,
            hint: 'Needs attention',
            icon: Ticket,
            tone: data.openTickets > 0 ? 'text-amber-400' : 'text-white',
          },
          {
            label: 'Open invoices',
            value: data.openInvoices,
            hint: formatUsd(data.openInvoiceAmount),
            icon: CreditCard,
            tone: 'text-emerald-400',
          },
        ].map((card) => (
          <div
            key={card.label}
            className="relative bg-[#121e22]/60 border border-tastyc-copper/10 p-5 hover:border-tastyc-copper/40 transition-all group"
          >
            <div className="flex justify-between items-start">
              <p className="text-[10px] uppercase font-bold tracking-wider text-[#a9b8c3]">{card.label}</p>
              <card.icon className={`h-4 w-4 ${card.tone} opacity-80`} />
            </div>
            <p className={`font-title text-3xl font-bold tracking-wide mt-3 ${card.tone}`}>{card.value}</p>
            <p className="text-[9px] text-[#a9b8c3] mt-1">{card.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {quickLinks.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="bg-[#121e22] border border-tastyc-copper/10 px-4 py-3 flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold text-[#a9b8c3] hover:text-white hover:border-tastyc-copper/40 transition-colors"
          >
            <Icon className="h-3.5 w-3.5 text-tastyc-copper" />
            {label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 bg-[#121e22] border border-tastyc-copper/10 p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-tastyc-copper/10 pb-4">
            <div>
              <h3 className="font-title text-xl uppercase tracking-wider text-white">Restaurant tenants</h3>
              <p className="text-[10px] text-[#a9b8c3] mt-0.5">Latest accounts on the platform</p>
            </div>
            <Link
              to="/admin/platform/tenants"
              className="text-[10px] uppercase font-bold tracking-widest text-tastyc-copper hover:text-white flex items-center gap-1"
            >
              Manage <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-[10px] uppercase text-[#a9b8c3] border-b border-tastyc-copper/5">
                  <th className="py-3">Restaurant</th>
                  <th>Plan</th>
                  <th>Branches</th>
                  <th>Users</th>
                  <th className="text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tastyc-copper/5">
                {(data.recentTenants || []).map((t: any) => (
                  <tr key={t.id} className="text-white hover:bg-tastyc-dark/20">
                    <td className="py-3">
                      <p className="font-semibold text-tastyc-copper">{t.name}</p>
                      <p className="text-[10px] text-[#a9b8c3]">{t.companyName}</p>
                    </td>
                    <td className="text-xs uppercase tracking-wider text-[#a9b8c3]">
                      {t.planTier || '—'}
                    </td>
                    <td>{t.branches}</td>
                    <td>{t.users}</td>
                    <td className="text-right">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${statusTone(
                          t.status
                        )}`}
                      >
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {(data.recentTenants || []).length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-[#a9b8c3] text-xs uppercase tracking-widest">
                      No tenants yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-8">
          <div className="bg-[#121e22] border border-tastyc-copper/10 p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-tastyc-copper/10 pb-4">
              <h3 className="font-title text-xl uppercase tracking-wider text-white">Support queue</h3>
              <Link
                to="/admin/platform/support"
                className="text-[10px] uppercase font-bold tracking-widest text-tastyc-copper hover:text-white flex items-center gap-1"
              >
                Inbox <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="space-y-3 max-h-[280px] overflow-y-auto">
              {(data.recentTickets || []).map((t: any) => (
                <div
                  key={t.id}
                  className="bg-tastyc-dark/30 border border-tastyc-copper/10 p-3.5 space-y-1.5"
                >
                  <div className="flex justify-between gap-2 items-start">
                    <p className="text-sm font-semibold text-white leading-snug">{t.subject}</p>
                    <span
                      className={`shrink-0 text-[9px] font-bold uppercase px-2 py-0.5 border ${statusTone(
                        t.status
                      )}`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#a9b8c3]">
                    {t.tenantName} · {t.requesterEmail} · {t.priority}
                  </p>
                </div>
              ))}
              {(data.recentTickets || []).length === 0 && (
                <p className="text-center py-8 text-xs text-[#a9b8c3] uppercase tracking-widest">
                  No tickets
                </p>
              )}
            </div>
          </div>

          <div className="bg-[#121e22] border border-tastyc-copper/10 p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-tastyc-copper/10 pb-4">
              <h3 className="font-title text-xl uppercase tracking-wider text-white">Catalog & billing</h3>
              <Link
                to="/admin/platform/billing"
                className="text-[10px] uppercase font-bold tracking-widest text-tastyc-copper hover:text-white flex items-center gap-1"
              >
                Plans <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-tastyc-dark/30 border border-tastyc-copper/5 p-3">
                <p className="text-[9px] uppercase tracking-widest text-[#a9b8c3]">Paid (30d)</p>
                <p className="text-lg font-title text-emerald-400 mt-1">
                  {formatUsd(data.paidInvoiceAmount30d)}
                </p>
              </div>
              <div className="bg-tastyc-dark/30 border border-tastyc-copper/5 p-3">
                <p className="text-[9px] uppercase tracking-widest text-[#a9b8c3]">Integrations</p>
                <p className="text-lg font-title text-white mt-1">
                  {data.activeIntegrations}/{data.integrations} active
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {(data.plans || []).map((p: any) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center text-xs border border-tastyc-copper/5 px-3 py-2"
                >
                  <div>
                    <p className="font-semibold text-white">{p.name}</p>
                    <p className="text-[9px] text-[#a9b8c3] uppercase tracking-wider">
                      {p.tier} · {p.maxBranches} branches · {p.maxEmployees} staff
                    </p>
                  </div>
                  <p className="font-mono text-tastyc-copper">{formatUsd(Number(p.priceMonthly))}/mo</p>
                </div>
              ))}
              {(data.plans || []).length === 0 && (
                <p className="text-[10px] text-[#a9b8c3] uppercase tracking-widest text-center py-4">
                  No subscription plans seeded
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(['ACTIVE', 'TRIAL', 'SUSPENDED', 'CANCELLED'] as const).map((status) => (
          <div key={status} className="bg-[#121e22] border border-tastyc-copper/10 p-4">
            <p className="text-[10px] uppercase tracking-widest text-[#a9b8c3]">{status}</p>
            <p className={`text-2xl font-title font-bold mt-1 ${statusTone(status).split(' ')[0]}`}>
              {statusMap[status] || 0}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
