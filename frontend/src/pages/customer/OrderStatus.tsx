import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Coffee, ArrowRight, ShieldCheck, Clock, RefreshCw } from 'lucide-react';
import { useStorefront } from '../../context/TenantContext';

interface OrderDetail {
  id: number;
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
    id: number;
    menuItem: {
      name: string;
      image: string | null;
    };
    quantity: number;
    price: string;
  }[];
}

export const OrderStatus: React.FC = () => {
  const { path } = useStorefront();
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrder = async () => {
    if (!id) return;
    setRefreshing(true);
    try {
      const data = await api.orders.getDetails(parseInt(id));
      setOrder(data);
    } catch (error) {
      console.error('Failed to load order status:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // Poll every 10 seconds to update status dynamically
    const interval = setInterval(fetchOrder, 10000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) {
    return (
      <div className="bg-[#0a1316] min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-tastyc-copper mx-auto"></div>
          <p className="text-[#a9b8c3] text-sm uppercase tracking-widest">Fetching Order Status...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-[#0a1316] min-h-[80vh] flex items-center justify-center py-12 px-4 text-center">
        <div className="max-w-md bg-[#121e22] border border-tastyc-copper/10 p-8 space-y-6">
          <h2 className="font-title text-3xl text-tastyc-copper uppercase">Order Not Found</h2>
          <p className="text-[#a9b8c3] text-sm">We couldn't locate any active order matching this identifier.</p>
          <Link to={path('/menu')} className="btn-premium inline-block">
            Back to Menu
          </Link>
        </div>
      </div>
    );
  }

  // Define steps for progress visualization
  const statuses = ['PENDING', 'PREPARING', 'READY', 'SERVED'];
  const currentStep = statuses.indexOf(order.status);

  return (
    <div className="bg-[#0a1316] min-h-[80vh] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8 text-left">
        {/* Header summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-tastyc-copper/10 pb-6">
          <div>
            <p className="text-tastyc-copper text-xs uppercase tracking-widest font-semibold">
              Live Tracker (Auto-updates)
            </p>
            <h1 className="font-title text-3xl uppercase tracking-wider text-white mt-1">
              Order #{order.orderNumber}
            </h1>
          </div>
          <button
            onClick={fetchOrder}
            disabled={refreshing}
            className="self-start sm:self-center flex items-center space-x-2 border border-tastyc-copper/20 hover:border-tastyc-copper px-3 py-2 text-xs uppercase tracking-widest text-[#a9b8c3] hover:text-white transition-colors"
          >
            <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refetch</span>
          </button>
        </div>

        {/* Progress Tracker Cards */}
        <div className="bg-[#121e22] border border-tastyc-copper/10 p-6 sm:p-8 space-y-8">
          {/* Progress Bar Timeline */}
          <div className="relative">
            {/* Background line */}
            <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/5 -translate-y-1/2 z-0" />
            {/* Active filled line */}
            {currentStep >= 0 && (
              <div
                className="absolute top-1/2 left-0 h-[2px] bg-tastyc-copper -translate-y-1/2 z-0 transition-all duration-500"
                style={{ width: `${(currentStep / (statuses.length - 1)) * 100}%` }}
              />
            )}

            {/* Checkpoints */}
            <div className="relative z-10 flex justify-between">
              {statuses.map((stepStatus, idx) => {
                const isActive = idx <= currentStep;
                const isCurrent = idx === currentStep;

                return (
                  <div key={stepStatus} className="flex flex-col items-center">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                        isCurrent
                          ? 'bg-tastyc-dark border-2 border-tastyc-copper text-tastyc-copper scale-110 shadow-lg shadow-tastyc-copper/10'
                          : isActive
                          ? 'bg-tastyc-copper text-white'
                          : 'bg-tastyc-dark border border-white/10 text-white/20'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <span
                      className={`mt-3 text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                        isCurrent
                          ? 'text-tastyc-copper'
                          : isActive
                          ? 'text-white font-medium'
                          : 'text-[#a9b8c3]/40'
                      }`}
                    >
                      {stepStatus}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Status Explanation Box */}
          <div className="border-t border-tastyc-copper/10 pt-6 flex items-start space-x-4 bg-tastyc-dark/20 p-4 border border-tastyc-copper/5">
            <Clock className="h-6 w-6 text-tastyc-copper shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-title text-lg uppercase tracking-wider text-white">
                {order.status === 'PENDING' && 'Order Placed'}
                {order.status === 'PREPARING' && 'Cooking Handcrafted Recipes'}
                {order.status === 'READY' && 'Awaiting Collection'}
                {order.status === 'SERVED' && 'Order Served'}
                {order.status === 'COMPLETED' && 'Completed'}
                {order.status === 'CANCELLED' && 'Cancelled'}
              </h3>
              <p className="text-xs text-[#a9b8c3] leading-relaxed">
                {order.status === 'PENDING' && 'Your order is in queue. The kitchen will accept it shortly.'}
                {order.status === 'PREPARING' && 'The chef is preparing your order. Raw ingredients are deducted.'}
                {order.status === 'READY' && 'Your order is ready. The staff will bring it to your table or counter.'}
                {order.status === 'SERVED' && 'Enjoy your meal! Let us know if you need anything else.'}
                {order.status === 'COMPLETED' && 'This order transaction has been fully completed.'}
                {order.status === 'CANCELLED' && 'This order has been cancelled.'}
              </p>
            </div>
          </div>
        </div>

        {/* Order Details Details */}
        <div className="bg-[#121e22] border border-tastyc-copper/10 p-6 space-y-6">
          <h2 className="font-title text-2xl uppercase tracking-wider text-white border-b border-tastyc-copper/10 pb-3">
            Summary Items
          </h2>

          <div className="divide-y divide-tastyc-copper/10">
            {order.items.map((item) => (
              <div key={item.id} className="py-4 flex justify-between items-center text-sm">
                <div className="flex items-center space-x-4">
                  {item.menuItem.image && (
                    <img
                      src={item.menuItem.image}
                      alt={item.menuItem.name}
                      className="w-12 h-12 object-cover border border-tastyc-copper/10"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-white">{item.menuItem.name}</p>
                    <p className="text-xs text-[#a9b8c3]">Qty: {item.quantity}</p>
                  </div>
                </div>
                <p className="font-semibold text-white">
                  ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="border-t border-tastyc-copper/15 pt-4 flex justify-between font-title text-xl text-white uppercase tracking-wider">
            <span>Total Paid</span>
            <span className="text-tastyc-copper">${parseFloat(order.total).toFixed(2)}</span>
          </div>

          {order.table && (
            <div className="pt-2 text-xs text-[#a9b8c3]">
              Dining Location: <span className="text-white font-medium">Table {order.table.number} ({order.table.floor.name})</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="flex justify-center">
          <Link to={path('/menu')} className="btn-premium">
            Back to Menu
          </Link>
        </div>
      </div>
    </div>
  );
};
