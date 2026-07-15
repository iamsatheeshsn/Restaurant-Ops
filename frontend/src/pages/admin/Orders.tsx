import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Play, Check, Send, CheckCircle, RefreshCw, Layers } from 'lucide-react';
import { PaginationControls } from '../../components/PaginationControls';

interface Order {
  id: string;
  orderNumber: string;
  type: string;
  status: string;
  total: string;
  createdAt: string;
  table: {
    number: string;
    floor: {
      name: string;
    };
  } | null;
  items: {
    id: string;
    menuItem: {
      name: string;
      category?: {
        name: string;
      } | null;
    };
    quantity: number;
  }[];
}

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification, showConfirm } = useNotification();
  const [sections, setSections] = useState<any[]>([]);
  const [selectedSection, setSelectedSection] = useState<string>('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0, totalPages: 1 });

  const fetchOrders = async () => {
    try {
      const result = await api.orders.getAll({ page, limit });
      setOrders(result.data || []);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const fetchSections = async () => {
      try {
        const data = await api.master.getSections({ limit: 100 });
        setSections(data.data || []);
      } catch (error) {
        console.error('Failed to load kitchen sections:', error);
      }
    };
    fetchSections();

    // Poll every 5 seconds for real-time kitchen updates
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, [page, limit]);

  const handleStatusChange = async (orderId: string, nextStatus: string) => {
    try {
      await api.orders.updateStatus(orderId, nextStatus);
      fetchOrders(); // Reload board
    } catch (error: any) {
      showNotification({
        title: 'Action Failed',
        message: error.message || 'Failed to update order status',
        type: 'error'
      });
    }
  };

  // Helper to determine if menu item belongs to a specific kitchen station
  const matchesStation = (item: any) => {
    if (selectedSection === 'ALL') return true;
    const catName = (item.menuItem?.category?.name || '').toUpperCase();
    const secName = (selectedSection || '').toUpperCase();
    
    if (secName === 'GRILL') {
      return catName.includes('BURGER') || catName.includes('PANINI') || catName.includes('SANDWICH') || catName.includes('MAINS') || catName.includes('GRILL') || catName.includes('PIZZA');
    }
    if (secName === 'DRINKS') {
      return catName.includes('COFFEE') || catName.includes('BEVERAGE') || catName.includes('TEA') || catName.includes('DRINK') || catName.includes('SODA') || catName.includes('SHAKE') || catName.includes('MOCKTAIL') || catName.includes('JUICE') || catName.includes('ESPRESSO');
    }
    if (secName === 'DESSERTS') {
      return catName.includes('DESSERT') || catName.includes('BAKERY') || catName.includes('PASTRY') || catName.includes('SWEETS') || catName.includes('CAKE') || catName.includes('CROISSANT');
    }
    
    return catName.includes(secName) || secName.includes(catName);
  };

  // Map orders, filtering out items that do not match the selected kitchen station
  const filteredOrders = orders
    .map((order) => {
      const matchingItems = (order.items || []).filter(matchesStation);
      return {
        ...order,
        items: matchingItems,
      };
    })
    .filter((order) => order.items.length > 0);

  // Filter orders into KDS workflow columns
  const pendingOrders = filteredOrders.filter((o) => o.status === 'PENDING');
  const preparingOrders = filteredOrders.filter((o) => o.status === 'PREPARING');
  const readyOrders = filteredOrders.filter((o) => o.status === 'READY');
  const completedOrders = filteredOrders.filter((o) => o.status === 'SERVED' || o.status === 'COMPLETED');

  const getElapsedTime = (createdAt: string) => {
    const elapsed = Date.now() - new Date(createdAt).getTime();
    const mins = Math.floor(elapsed / 60000);
    return mins > 0 ? `${mins}m ago` : 'Just now';
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-tastyc-copper/10 pb-4">
        <div>
          <p className="text-tastyc-copper text-xs uppercase tracking-widest font-semibold">Kitchen Display System</p>
          <h3 className="font-title text-3xl uppercase tracking-wider text-white">Active KDS Tickets</h3>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center space-x-2 border border-tastyc-copper/20 hover:border-tastyc-copper px-3 py-1.5 text-xs uppercase text-[#a9b8c3] hover:text-white transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Station Selector Bar */}
      <div className="flex flex-wrap gap-2 border-b border-tastyc-copper/5 pb-4">
        <button
          onClick={() => setSelectedSection('ALL')}
          className={`px-4 py-2 text-[10px] uppercase tracking-widest font-semibold transition-all border ${
            selectedSection === 'ALL'
              ? 'bg-tastyc-copper text-white border-tastyc-copper'
              : 'border-tastyc-copper/20 text-[#a9b8c3] hover:border-tastyc-copper/50 hover:text-white bg-tastyc-dark/20'
          }`}
        >
          All Stations
        </button>
        {sections.map((sec) => (
          <button
            key={sec.id}
            onClick={() => setSelectedSection(sec.name)}
            className={`px-4 py-2 text-[10px] uppercase tracking-widest font-semibold transition-all border ${
              selectedSection === sec.name
                ? 'bg-tastyc-copper text-white border-tastyc-copper'
                : 'border-tastyc-copper/20 text-[#a9b8c3] hover:border-tastyc-copper/50 hover:text-white bg-tastyc-dark/20'
            }`}
          >
            {sec.name} Station
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-tastyc-copper mx-auto"></div>
          <p className="mt-4 text-[#a9b8c3] text-sm uppercase tracking-widest">Loading Tickets...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-260px)] overflow-hidden">
          {/* COLUMN 1: PENDING */}
          <div className="bg-[#121e22]/50 border border-tastyc-copper/10 rounded-lg flex flex-col h-full">
            <div className="p-4 bg-tastyc-card border-b border-tastyc-copper/10 flex justify-between items-center">
              <span className="text-xs uppercase font-bold text-[#a9b8c3] tracking-widest">1. Incoming (Queue)</span>
              <span className="bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] rounded font-bold text-white">
                {pendingOrders.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {pendingOrders.map((o) => (
                <div key={o.id} className="bg-tastyc-card border border-tastyc-copper/15 p-4 space-y-4 shadow-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-xs text-tastyc-copper">{o.orderNumber}</p>
                      <p className="text-[10px] text-[#a9b8c3] uppercase font-bold tracking-wide mt-0.5">
                        {o.table ? `Table ${o.table.number}` : o.type.replace('_', ' ')}
                      </p>
                    </div>
                    <span className="text-[9px] font-bold text-[#a9b8c3]/60 uppercase">{getElapsedTime(o.createdAt)}</span>
                  </div>
                  {/* Items */}
                  <div className="space-y-1 bg-tastyc-dark/25 p-2.5 text-xs text-[#a9b8c3] border border-tastyc-copper/5">
                    {o.items.map((i) => (
                      <p key={i.id} className="font-medium text-white">
                        <span className="text-tastyc-copper font-bold">{i.quantity}x</span> {i.menuItem.name}
                      </p>
                    ))}
                  </div>
                  {/* Action */}
                  <button
                    onClick={() => showConfirm(`Accept order ${o.orderNumber} for cooking?`, () => handleStatusChange(o.id, 'PREPARING'))}
                    className="w-full flex items-center justify-center space-x-1.5 py-2 border border-tastyc-copper text-tastyc-copper hover:bg-tastyc-copper hover:text-white transition-all text-[10px] uppercase font-bold tracking-wider"
                  >
                    <Play className="h-3.5 w-3.5" />
                    <span>Accept & Cook</span>
                  </button>
                </div>
              ))}
              {pendingOrders.length === 0 && (
                <p className="text-center text-xs text-[#a9b8c3]/40 py-8 uppercase tracking-widest font-semibold">No new orders</p>
              )}
            </div>
          </div>

          {/* COLUMN 2: PREPARING */}
          <div className="bg-[#121e22]/50 border border-tastyc-copper/10 rounded-lg flex flex-col h-full">
            <div className="p-4 bg-tastyc-card border-b border-tastyc-copper/10 flex justify-between items-center">
              <span className="text-xs uppercase font-bold text-tastyc-copper tracking-widest">2. Preparing</span>
              <span className="bg-tastyc-copper/10 border border-tastyc-copper/20 px-2 py-0.5 text-[10px] rounded font-bold text-tastyc-copper">
                {preparingOrders.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {preparingOrders.map((o) => (
                <div key={o.id} className="bg-tastyc-card border border-tastyc-copper/25 p-4 space-y-4 shadow-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-xs text-tastyc-copper">{o.orderNumber}</p>
                      <p className="text-[10px] text-[#a9b8c3] uppercase font-bold tracking-wide mt-0.5">
                        {o.table ? `Table ${o.table.number}` : o.type.replace('_', ' ')}
                      </p>
                    </div>
                    <span className="text-[9px] font-bold text-tastyc-copper uppercase">{getElapsedTime(o.createdAt)}</span>
                  </div>
                  {/* Items */}
                  <div className="space-y-1 bg-tastyc-dark/25 p-2.5 text-xs text-[#a9b8c3] border border-tastyc-copper/5">
                    {o.items.map((i) => (
                      <p key={i.id} className="font-medium text-white">
                        <span className="text-tastyc-copper font-bold">{i.quantity}x</span> {i.menuItem.name}
                      </p>
                    ))}
                  </div>
                  {/* Action */}
                  <button
                    onClick={() => showConfirm(`Mark order ${o.orderNumber} as ready?`, () => handleStatusChange(o.id, 'READY'))}
                    className="w-full flex items-center justify-center space-x-1.5 py-2 border border-emerald-500 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all text-[10px] uppercase font-bold tracking-wider"
                  >
                    <Check className="h-3.5 w-3.5" />
                    <span>Complete Preparation</span>
                  </button>
                </div>
              ))}
              {preparingOrders.length === 0 && (
                <p className="text-center text-xs text-[#a9b8c3]/40 py-8 uppercase tracking-widest font-semibold">No active cooking</p>
              )}
            </div>
          </div>

          {/* COLUMN 3: READY */}
          <div className="bg-[#121e22]/50 border border-tastyc-copper/10 rounded-lg flex flex-col h-full">
            <div className="p-4 bg-tastyc-card border-b border-tastyc-copper/10 flex justify-between items-center">
              <span className="text-xs uppercase font-bold text-emerald-400 tracking-widest">3. Ready for Service</span>
              <span className="bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] rounded font-bold text-emerald-400">
                {readyOrders.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {readyOrders.map((o) => (
                <div key={o.id} className="bg-tastyc-card border border-emerald-500/20 p-4 space-y-4 shadow-md">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-xs text-tastyc-copper">{o.orderNumber}</p>
                      <p className="text-[10px] text-[#a9b8c3] uppercase font-bold tracking-wide mt-0.5">
                        {o.table ? `Table ${o.table.number}` : o.type.replace('_', ' ')}
                      </p>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-400 uppercase">{getElapsedTime(o.createdAt)}</span>
                  </div>
                  {/* Items */}
                  <div className="space-y-1 bg-tastyc-dark/25 p-2.5 text-xs text-[#a9b8c3] border border-tastyc-copper/5">
                    {o.items.map((i) => (
                      <p key={i.id} className="font-medium text-white">
                        <span className="text-tastyc-copper font-bold">{i.quantity}x</span> {i.menuItem.name}
                      </p>
                    ))}
                  </div>
                  {/* Action */}
                  <button
                    onClick={() => showConfirm(`Mark order ${o.orderNumber} as served/delivered?`, () => handleStatusChange(o.id, 'SERVED'))}
                    className="w-full flex items-center justify-center space-x-1.5 py-2 border border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white transition-all text-[10px] uppercase font-bold tracking-wider"
                  >
                    <Send className="h-3.5 w-3.5" />
                    <span>Deliver to Guest</span>
                  </button>
                </div>
              ))}
              {readyOrders.length === 0 && (
                <p className="text-center text-xs text-[#a9b8c3]/40 py-8 uppercase tracking-widest font-semibold">No ready trays</p>
              )}
            </div>
          </div>

          {/* COLUMN 4: SERVED & COMPLETED */}
          <div className="bg-[#121e22]/50 border border-tastyc-copper/10 rounded-lg flex flex-col h-full">
            <div className="p-4 bg-tastyc-card border-b border-tastyc-copper/10 flex justify-between items-center">
              <span className="text-xs uppercase font-bold text-[#a9b8c3] tracking-widest">4. Served / Closed</span>
              <span className="bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] rounded font-bold text-white">
                {completedOrders.length}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {completedOrders.map((o) => (
                <div key={o.id} className="bg-tastyc-card border border-white/5 p-4 space-y-4 opacity-75">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-xs text-[#a9b8c3]">{o.orderNumber}</p>
                      <p className="text-[10px] text-[#a9b8c3]/60 uppercase font-bold tracking-wide mt-0.5">
                        {o.table ? `Table ${o.table.number}` : o.type.replace('_', ' ')}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase">{o.status}</span>
                  </div>
                  {/* Items */}
                  <div className="space-y-1 bg-tastyc-dark/25 p-2 text-xs text-[#a9b8c3]">
                    {o.items.map((i) => (
                      <p key={i.id}>
                        {i.quantity}x {i.menuItem.name}
                      </p>
                    ))}
                  </div>
                  {/* Action to complete billing transaction */}
                  {o.status === 'SERVED' && (
                    <button
                      onClick={() => showConfirm(`Complete billing and close ticket for order ${o.orderNumber}?`, () => handleStatusChange(o.id, 'COMPLETED'))}
                      className="w-full flex items-center justify-center space-x-1.5 py-2 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all text-[10px] uppercase font-bold tracking-wider"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Complete Billing</span>
                    </button>
                  )}
                </div>
              ))}
              {completedOrders.length === 0 && (
                <p className="text-center text-xs text-[#a9b8c3]/40 py-8 uppercase tracking-widest font-semibold">No closed tickets</p>
              )}
            </div>
          </div>
        </div>
      )}
      <PaginationControls
        pagination={pagination}
        onPageChange={setPage}
        onLimitChange={(n) => {
          setLimit(n);
          setPage(1);
        }}
      />
    </div>
  );
};
