import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  DollarSign,
  Clock,
  AlertTriangle,
  Users,
  Clipboard,
  ShoppingBag,
  TrendingUp,
  Activity,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useSettings } from '../../context/SettingsContext';
import { useAuth } from '../../context/AuthContext';
import { PlatformDashboard } from './platform/PlatformDashboard';
import { ROLES } from '../../config/rbac';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === ROLES.SUPER_ADMIN) {
    return <PlatformDashboard />;
  }
  return <RestaurantOpsDashboard />;
};

const RestaurantOpsDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();
  const { formatPrice } = useSettings();
  const [dashboardTab, setDashboardTab] = useState<'OVERVIEW' | 'REPORTS'>('OVERVIEW');

  const fetchStats = async () => {
    try {
      const data = await api.orders.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      showNotification({
        title: 'Network Warning',
        message: 'Could not sync real-time database analytics.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-tastyc-copper"></div>
          <div className="absolute inset-0 flex items-center justify-center text-tastyc-copper font-bold animate-pulse">
            T
          </div>
        </div>
        <p className="text-[#a9b8c3] text-xs uppercase tracking-widest font-semibold">Compiling operation indicators...</p>
      </div>
    );
  }

  const activeStaff = stats.staffActiveCount || 0;
  const lowStockCount = stats.lowStockCount || 0;

  return (
    <div className="space-y-8 text-left selection:bg-tastyc-copper selection:text-white">
      
      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-tastyc-copper/10 pb-6">
        <div>
          <p className="text-tastyc-copper text-xs uppercase tracking-widest font-semibold flex items-center space-x-1.5">
            <Activity className="h-3.5 w-3.5 animate-pulse" />
            <span>Operations Dashboard</span>
          </p>
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-3 mt-1">
            <h2 className="font-title text-3xl sm:text-4xl uppercase tracking-wider text-white">
              {dashboardTab === 'OVERVIEW' ? 'Real-Time Analytics' : 'Management Reports'}
            </h2>
            <div className="flex bg-tastyc-dark/40 border border-tastyc-copper/10 p-0.5 rounded-sm">
              <button
                onClick={() => setDashboardTab('OVERVIEW')}
                className={`px-3 py-1 text-[9px] uppercase tracking-wider font-bold transition-all ${
                  dashboardTab === 'OVERVIEW' ? 'bg-tastyc-copper text-white' : 'text-[#a9b8c3] hover:text-white'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setDashboardTab('REPORTS')}
                className={`px-3 py-1 text-[9px] uppercase tracking-wider font-bold transition-all ${
                  dashboardTab === 'REPORTS' ? 'bg-tastyc-copper text-white' : 'text-[#a9b8c3] hover:text-white'
                }`}
              >
                Operations Reports
              </button>
            </div>
          </div>
        </div>
        <div className="bg-[#121e22] border border-tastyc-copper/15 px-4 py-2.5 flex items-center space-x-3 text-xs">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></div>
          <span className="text-[#a9b8c3] font-medium">Linked to Operations Database</span>
        </div>
      </div>

      {/* Overview Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        
        {/* Revenue */}
        <div className="relative bg-[#121e22]/60 backdrop-blur-md border border-tastyc-copper/10 p-6 flex flex-col justify-between hover:border-tastyc-copper/45 hover:shadow-lg transition-all duration-300 group">
          <div className="absolute top-0 left-0 w-1 h-0 bg-tastyc-copper group-hover:h-full transition-all duration-300"></div>
          <div className="flex justify-between items-start">
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#a9b8c3]">Total Revenue</p>
            <div className="h-8 w-8 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500/25 transition-all">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="font-title text-3xl text-white font-bold tracking-wide">{formatPrice(stats.totalRevenue)}</p>
            <p className="text-[9px] text-emerald-400 mt-1 flex items-center space-x-1">
              <TrendingUp className="h-3 w-3" />
              <span>30-Day Sum</span>
            </p>
          </div>
        </div>

        {/* Completed Sales */}
        <div className="relative bg-[#121e22]/60 backdrop-blur-md border border-tastyc-copper/10 p-6 flex flex-col justify-between hover:border-tastyc-copper/45 hover:shadow-lg transition-all duration-300 group">
          <div className="absolute top-0 left-0 w-1 h-0 bg-tastyc-copper group-hover:h-full transition-all duration-300"></div>
          <div className="flex justify-between items-start">
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#a9b8c3]">Completed Sales</p>
            <div className="h-8 w-8 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500 group-hover:bg-amber-500/25 transition-all">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="font-title text-3xl text-white font-bold tracking-wide">{stats.totalSalesCount} Sales</p>
            <p className="text-[9px] text-[#a9b8c3] mt-1">Paid & Settled Today</p>
          </div>
        </div>

        {/* Active Orders */}
        <div className="relative bg-[#121e22]/60 backdrop-blur-md border border-tastyc-copper/10 p-6 flex flex-col justify-between hover:border-tastyc-copper/45 hover:shadow-lg transition-all duration-300 group">
          <div className="absolute top-0 left-0 w-1 h-0 bg-tastyc-copper group-hover:h-full transition-all duration-300"></div>
          <div className="flex justify-between items-start">
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#a9b8c3]">Active Orders</p>
            <div className="h-8 w-8 bg-tastyc-copper/10 rounded-full flex items-center justify-center text-tastyc-copper group-hover:bg-tastyc-copper/25 transition-all">
              <Clock className="h-4 w-4 animate-spin-slow" />
            </div>
          </div>
          <div className="mt-4">
            <p className="font-title text-3xl text-white font-bold tracking-wide">{stats.activeOrdersCount} Active</p>
            <p className="text-[9px] text-tastyc-copper mt-1">Currently in Prep</p>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="relative bg-[#121e22]/60 backdrop-blur-md border border-tastyc-copper/10 p-6 flex flex-col justify-between hover:border-tastyc-copper/45 hover:shadow-lg transition-all duration-300 group">
          <div className="absolute top-0 left-0 w-1 h-0 bg-tastyc-copper group-hover:h-full transition-all duration-300"></div>
          <div className="flex justify-between items-start">
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#a9b8c3]">Stock Alerts</p>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center group-hover:scale-105 transition-all ${
              lowStockCount > 0 ? 'bg-red-500/10 text-red-400' : 'bg-white/5 text-[#a9b8c3]'
            }`}>
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className={`font-title text-3xl font-bold tracking-wide ${lowStockCount > 0 ? 'text-red-400' : 'text-white'}`}>
              {lowStockCount} Warns
            </p>
            <p className="text-[9px] text-[#a9b8c3] mt-1">Thresholds Breached</p>
          </div>
        </div>

        {/* Staff Active */}
        <div className="relative bg-[#121e22]/60 backdrop-blur-md border border-tastyc-copper/10 p-6 flex flex-col justify-between hover:border-tastyc-copper/45 hover:shadow-lg transition-all duration-300 group">
          <div className="absolute top-0 left-0 w-1 h-0 bg-tastyc-copper group-hover:h-full transition-all duration-300"></div>
          <div className="flex justify-between items-start">
            <p className="text-[10px] uppercase font-bold tracking-wider text-[#a9b8c3]">Clocked-in Staff</p>
            <div className="h-8 w-8 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-400 group-hover:bg-blue-500/25 transition-all">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-4">
            <p className="font-title text-3xl text-white font-bold tracking-wide">{activeStaff} Active</p>
            <p className="text-[9px] text-blue-400 mt-1">On Shift Right Now</p>
          </div>
        </div>

      </div>

      {dashboardTab === 'OVERVIEW' ? (
        <>
          {/* ROW 1: KITCHEN PIPELINE & STOCK ALERTS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Kitchen Display System Progress Pipeline */}
            <div className="lg:col-span-8 flex flex-col">
              <div className="bg-[#121e22] border border-tastyc-copper/10 p-6 space-y-6 flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between border-b border-tastyc-copper/10 pb-4">
                  <h3 className="font-title text-xl uppercase tracking-wider text-white">
                    Kitchen Prep Pipeline
                  </h3>
                  <span className="text-[10px] uppercase font-bold text-[#a9b8c3] tracking-widest bg-tastyc-dark border border-tastyc-copper/15 px-2.5 py-1">
                    Active Queue Status
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative flex-1 mt-4">
                  
                  {/* Card 1: Queue */}
                  <div className="relative bg-tastyc-dark/30 border border-tastyc-copper/5 p-5 flex flex-col justify-between hover:border-tastyc-copper/20 transition-all duration-200">
                    <div className="space-y-1">
                      <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-[#a9b8c3]">Order Queue</p>
                      <p className="text-sm font-semibold text-white">Pending Prep</p>
                    </div>
                    <div className="flex justify-between items-baseline mt-4">
                      <span className="text-3xl font-title font-bold text-white">{stats.kitchenStatus.pending}</span>
                      <span className="text-[9px] uppercase tracking-widest text-[#a9b8c3]/40">Orders</span>
                    </div>
                  </div>

                  {/* Card 2: Preparing */}
                  <div className="relative bg-tastyc-dark/30 border border-tastyc-copper/10 p-5 flex flex-col justify-between hover:border-tastyc-copper/35 transition-all duration-200">
                    <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-tastyc-copper"></div>
                    <div className="space-y-1">
                      <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-tastyc-copper">In Production</p>
                      <p className="text-sm font-semibold text-white">Preparing Items</p>
                    </div>
                    <div className="flex justify-between items-baseline mt-4">
                      <span className="text-3xl font-title font-bold text-tastyc-copper">{stats.kitchenStatus.preparing}</span>
                      <span className="text-[9px] uppercase tracking-widest text-[#a9b8c3]/40">Active</span>
                    </div>
                  </div>

                  {/* Card 3: Ready */}
                  <div className="relative bg-[#121e22]/50 border border-emerald-500/10 p-5 flex flex-col justify-between hover:border-emerald-500/30 transition-all duration-200">
                    <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-emerald-500"></div>
                    <div className="space-y-1">
                      <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-emerald-400">Ready For Pickup</p>
                      <p className="text-sm font-semibold text-white">Completed Plates</p>
                    </div>
                    <div className="flex justify-between items-baseline mt-4">
                      <span className="text-3xl font-title font-bold text-emerald-400">{stats.kitchenStatus.ready}</span>
                      <span className="text-[9px] uppercase tracking-widest text-emerald-500/40">Ready</span>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Stock Alerts & Thresholds Warnings */}
            <div className="lg:col-span-4 flex flex-col">
              <div className="bg-[#121e22] border border-tastyc-copper/10 p-6 space-y-6 flex-1 flex flex-col">
                <div className="border-b border-tastyc-copper/10 pb-4">
                  <h3 className="font-title text-xl uppercase tracking-wider text-white">
                    Inventory Alerts
                  </h3>
                  <p className="text-[10px] text-[#a9b8c3] mt-0.5">Critical stock thresholds monitored</p>
                </div>

                <div className="space-y-3 overflow-y-auto flex-1 max-h-[190px] pr-1">
                  {stats.lowStockAlerts.map((alert: any) => (
                    <div key={alert.id} className="bg-tastyc-dark/30 border border-tastyc-copper/10 p-3.5 flex justify-between items-center text-xs hover:border-red-500/30 transition-colors">
                      <div className="space-y-1">
                        <p className="font-semibold text-white uppercase tracking-wider flex items-center space-x-1.5">
                          <ShieldAlert className="h-3.5 w-3.5 text-red-400 shrink-0" />
                          <span>{alert.name}</span>
                        </p>
                        <p className="text-[9px] text-[#a9b8c3]">Requires replenishment PO</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-red-400 font-mono">{alert.stockLevel.toFixed(1)}</p>
                        <p className="text-[9px] text-[#a9b8c3] font-medium uppercase font-mono">{alert.unit}</p>
                      </div>
                    </div>
                  ))}
                  
                  {stats.lowStockAlerts.length === 0 && (
                    <div className="text-center py-10 text-xs text-[#a9b8c3] uppercase tracking-widest border border-dashed border-tastyc-copper/5">
                      All inventory healthy
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* ROW 2: RECENT TRANSACTIONS & PROCUREMENT RUNS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Transactions Registry */}
            <div className="lg:col-span-8 flex flex-col">
              <div className="bg-[#121e22] border border-tastyc-copper/10 p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="flex justify-between items-center border-b border-tastyc-copper/10 pb-4">
                  <h3 className="font-title text-xl uppercase tracking-wider text-white">
                    Recent Transactions
                  </h3>
                  <Link
                    to="/admin/orders"
                    className="text-[10px] uppercase font-bold tracking-widest text-tastyc-copper hover:text-white flex items-center space-x-1 transition-colors"
                  >
                    <span>View Full KDS</span>
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-xs uppercase text-[#a9b8c3] border-b border-tastyc-copper/5 pb-2">
                        <th className="py-3">Order Number</th>
                        <th>Service Type</th>
                        <th>Total</th>
                        <th>Time</th>
                        <th className="text-right">KDS Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-tastyc-copper/5">
                      {stats.recentOrders.map((o: any) => (
                        <tr key={o.id} className="text-white hover:bg-tastyc-dark/20 transition-colors">
                          <td className="py-4 font-semibold text-tastyc-copper font-mono">{o.orderNumber}</td>
                          <td className="text-xs font-semibold uppercase tracking-wider">{o.type.replace('_', ' ')}</td>
                          <td className="font-medium font-mono">{formatPrice(o.total)}</td>
                          <td className="text-xs text-[#a9b8c3]">
                            {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td className="py-4 text-right">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 border ${
                              o.status === 'COMPLETED' || o.status === 'SERVED'
                                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20'
                                : o.status === 'PREPARING'
                                ? 'bg-tastyc-copper/10 text-tastyc-copper border-tastyc-copper/20'
                                : 'bg-white/5 text-[#a9b8c3] border-white/10'
                            }`}>
                              {o.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {stats.recentOrders.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-[#a9b8c3] text-xs uppercase tracking-widest border border-dashed border-tastyc-copper/5">
                            No orders recorded today
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Pending Purchase Orders Logs */}
            <div className="lg:col-span-4 flex flex-col">
              <div className="bg-[#121e22] border border-tastyc-copper/10 p-6 space-y-4 flex-1 flex flex-col justify-between">
                <div className="border-b border-tastyc-copper/10 pb-4">
                  <h3 className="font-title text-xl uppercase tracking-wider text-white">
                    Procurement Runs
                  </h3>
                </div>

                <div className="flex-1 flex flex-col justify-center py-6">
                  <div className="flex items-center space-x-4 bg-tastyc-dark/20 p-6 border border-tastyc-copper/5">
                    <Clipboard className="h-10 w-10 text-tastyc-copper shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-widest text-[#a9b8c3]">Awaiting Deliveries</p>
                      <p className="text-3xl font-bold text-tastyc-copper mt-1">
                        {stats.pendingPurchaseOrders} Active POs
                      </p>
                    </div>
                  </div>
                </div>
                
                <p className="text-[10px] text-[#a9b8c3] leading-relaxed">
                  Track vendor inventory delivery cycles, inspect generated invoice files, and verify ingredient stock log adjustments in the Inventory panel.
                </p>
              </div>
            </div>

          </div>
        </>
      ) : (
        <div className="space-y-8 animate-fadeIn">
          {/* Operations Summary row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-[#121e22] border border-tastyc-copper/10 p-5">
              <p className="text-[10px] uppercase font-bold text-[#a9b8c3] tracking-widest">Daily Sales (30 Days)</p>
              <p className="text-2xl font-title font-bold text-white mt-2">{formatPrice(stats.totalRevenue)}</p>
              <p className="text-[9px] text-[#a9b8c3]/60 mt-1">{stats.totalSalesCount} Settled Orders</p>
            </div>
            <div className="bg-[#121e22] border border-tastyc-copper/10 p-5">
              <p className="text-[10px] uppercase font-bold text-[#a9b8c3] tracking-widest">Cost of Goods Sold (COGS)</p>
              <p className="text-2xl font-title font-bold text-red-400 mt-2">{formatPrice(stats.foodCost)}</p>
              <p className="text-[9px] text-[#a9b8c3]/60 mt-1">Calculated from recipe values</p>
            </div>
            <div className="bg-[#121e22] border border-tastyc-copper/10 p-5">
              <p className="text-[10px] uppercase font-bold text-[#a9b8c3] tracking-widest">Purchase Expenditures</p>
              <p className="text-2xl font-title font-bold text-amber-500 mt-2">{formatPrice(stats.procurementCost)}</p>
              <p className="text-[9px] text-[#a9b8c3]/60 mt-1">Delivered PO values</p>
            </div>
            <div className="bg-[#121e22] border border-tastyc-copper/10 p-5">
              <p className="text-[10px] uppercase font-bold text-[#a9b8c3] tracking-widest">Net Operating Profit</p>
              <p className={`text-2xl font-title font-bold mt-2 ${stats.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatPrice(stats.profit)}
              </p>
              <p className="text-[9px] text-[#a9b8c3]/60 mt-1">Sales - COGS - POs - Waste</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#121e22] border border-red-500/25 p-5">
              <p className="text-[10px] uppercase font-bold text-[#a9b8c3] tracking-widest">Wastage Losses</p>
              <p className="text-2xl font-title font-bold text-red-400 mt-2">{formatPrice(stats.wasteCost)}</p>
              <p className="text-[9px] text-[#a9b8c3]/60 mt-1">Expired, spilled or kitchen waste</p>
            </div>
            <div className="bg-[#121e22] border border-emerald-500/25 p-5">
              <p className="text-[10px] uppercase font-bold text-[#a9b8c3] tracking-widest">Inventory Assets Value</p>
              <p className="text-2xl font-title font-bold text-emerald-400 mt-2">{formatPrice(stats.inventoryValue)}</p>
              <p className="text-[9px] text-[#a9b8c3]/60 mt-1">Total current stock value</p>
            </div>
            <div className="bg-[#121e22] border border-tastyc-copper/15 p-5 flex flex-col justify-center">
              <p className="text-[10px] uppercase font-bold text-[#a9b8c3] tracking-widest">Low Stock Warnings</p>
              <p className="text-2xl font-title font-bold text-tastyc-copper mt-2">{stats.lowStockCount} Warnings</p>
              <p className="text-[9px] text-[#a9b8c3]/60 mt-1">Active items below threshold</p>
            </div>
          </div>

          {/* Item velocities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#121e22] border border-tastyc-copper/10 p-6 space-y-4">
              <h4 className="font-title text-lg uppercase tracking-wider text-white border-b border-tastyc-copper/5 pb-2">
                Top Selling Menu Items
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[#a9b8c3] uppercase tracking-wider pb-1">
                      <th className="py-2">Item Name</th>
                      <th>Qty Sold</th>
                      <th className="text-right">Unit Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-tastyc-copper/5">
                    {stats.topSelling.map((it: any) => (
                      <tr key={it.id} className="text-white hover:bg-tastyc-dark/10">
                        <td className="py-2 font-semibold text-tastyc-copper">{it.name}</td>
                        <td className="font-semibold">{it.quantity}</td>
                        <td className="text-right">{formatPrice(it.price)}</td>
                      </tr>
                    ))}
                    {stats.topSelling.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-4 text-center text-[#a9b8c3]/40 uppercase tracking-widest">No selling metrics</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-[#121e22] border border-tastyc-copper/10 p-6 space-y-4">
              <h4 className="font-title text-lg uppercase tracking-wider text-white border-b border-tastyc-copper/5 pb-2">
                Slow Moving Items
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[#a9b8c3] uppercase tracking-wider pb-1">
                      <th className="py-2">Item Name</th>
                      <th>Qty Sold</th>
                      <th className="text-right">Unit Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-tastyc-copper/5">
                    {stats.slowMoving.map((it: any) => (
                      <tr key={it.id} className="text-white hover:bg-tastyc-dark/10">
                        <td className="py-2 font-semibold text-[#a9b8c3]">{it.name}</td>
                        <td className="font-semibold">{it.quantity}</td>
                        <td className="text-right">{formatPrice(it.price)}</td>
                      </tr>
                    ))}
                    {stats.slowMoving.length === 0 && (
                      <tr>
                        <td colSpan={3} className="py-4 text-center text-[#a9b8c3]/40 uppercase tracking-widest">No velocities recorded</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Branch Comparison */}
          <div className="bg-[#121e22] border border-tastyc-copper/10 p-6 space-y-4">
            <h4 className="font-title text-lg uppercase tracking-wider text-white border-b border-tastyc-copper/5 pb-2">
              Branch Performance Comparison
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[#a9b8c3] uppercase tracking-wider pb-1">
                    <th className="py-2">Branch Name</th>
                    <th>Sales Transactions</th>
                    <th className="text-right">Gross Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tastyc-copper/5">
                  {stats.branchComparison.map((bc: any) => (
                    <tr key={bc.branchId} className="text-white hover:bg-tastyc-dark/10">
                      <td className="py-3 font-semibold text-tastyc-copper">{bc.branchName}</td>
                      <td>{bc.salesCount} Sales</td>
                      <td className="text-right font-semibold font-mono text-emerald-400">{formatPrice(bc.revenue)}</td>
                    </tr>
                  ))}
                  {stats.branchComparison.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-[#a9b8c3]/40 uppercase tracking-widest">No branch sales</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
