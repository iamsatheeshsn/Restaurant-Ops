import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { ShoppingBag, ChevronLeft, CreditCard, Landmark, Check } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useStorefront } from '../../context/TenantContext';

interface Table {
  id: number;
  number: string;
  seating: number;
  floor: {
    name: string;
  };
}

export const Checkout: React.FC = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const { formatPrice } = useSettings();
  const { path } = useStorefront();

  const [orderType, setOrderType] = useState<'DINE_IN' | 'TAKE_AWAY' | 'DELIVERY'>('DINE_IN');
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cart.length === 0) {
      navigate(path('/menu'));
    }

    const fetchTables = async () => {
      try {
        const data = await api.orders.getTablesList({ limit: 100 });
        setTables(data.data || []);
        const storedTableId = sessionStorage.getItem('tastyc_table_id');
        if (storedTableId) {
          setSelectedTableId(storedTableId);
        } else if (data.data.length > 0) {
          setSelectedTableId(data.data[0].id.toString());
        }
      } catch (error) {
        console.error('Failed to load tables:', error);
      }
    };
    fetchTables();
  }, [cart, navigate, path]);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        type: orderType,
        tableId: orderType === 'DINE_IN' ? selectedTableId : null,
        items: cart.map((item) => ({
          menuItemId: item.id.toString(),
          quantity: item.quantity.toString(),
        })),
      };

      const order = await api.orders.create(orderData);
      clearCart();
      showNotification({
        title: 'Order Placed',
        message: `Order placed successfully! Order Number: ${order.orderNumber}`,
        type: 'success'
      });
      navigate(path(`/order-status/${order.id}`));
    } catch (error: any) {
      showNotification({
        title: 'Order Failed',
        message: error.message || 'Failed to place order',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0a1316] min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8 text-left">
        {/* Back link */}
        <button
          onClick={() => navigate(path('/menu'))}
          className="flex items-center space-x-2 text-[#a9b8c3] hover:text-white transition-colors text-xs uppercase tracking-widest font-semibold"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back to Menu</span>
        </button>

        <h1 className="font-title text-4xl uppercase tracking-wider text-white">
          Review & Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Checkout Form */}
          <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-6">
            <div className="bg-[#121e22] border border-tastyc-copper/10 p-6 space-y-6">
              <h2 className="font-title text-2xl uppercase tracking-wider text-white border-b border-tastyc-copper/10 pb-3">
                1. Service Type
              </h2>

              {/* Selection button group */}
              <div className="grid grid-cols-3 gap-4">
                {(['DINE_IN', 'TAKE_AWAY', 'DELIVERY'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setOrderType(type)}
                    className={`py-3 text-xs uppercase tracking-wider font-semibold border transition-all duration-300 ${
                      orderType === type
                        ? 'border-tastyc-copper text-tastyc-copper bg-tastyc-copper/5'
                        : 'border-white/10 text-[#a9b8c3] hover:border-white/30 hover:text-white'
                    }`}
                  >
                    {type.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {/* Conditionally render Table dropdown */}
              {orderType === 'DINE_IN' && (
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-wider text-[#a9b8c3] font-semibold">
                    Select Your Table
                  </label>
                  <select
                    value={selectedTableId}
                    onChange={(e) => setSelectedTableId(e.target.value)}
                    className="w-full bg-tastyc-dark border border-tastyc-copper/20 focus:border-tastyc-copper p-3 rounded-none text-white text-sm outline-none transition-colors"
                  >
                    {tables.map((t) => (
                      <option key={t.id} value={t.id}>
                        Table {t.number} ({t.seating} Seats) — {t.floor.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Payment Section */}
            <div className="bg-[#121e22] border border-tastyc-copper/10 p-6 space-y-4">
              <h2 className="font-title text-2xl uppercase tracking-wider text-white border-b border-tastyc-copper/10 pb-3">
                2. Payment Method
              </h2>
              <div className="border border-tastyc-copper/30 bg-tastyc-copper/5 p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Landmark className="h-5 w-5 text-tastyc-copper" />
                  <div>
                    <p className="text-sm font-semibold text-white">Cash / Pay at Counter</p>
                    <p className="text-xs text-[#a9b8c3]">Settlement will be done on service delivery.</p>
                  </div>
                </div>
                <div className="h-5 w-5 bg-tastyc-copper rounded-full flex items-center justify-center">
                  <Check className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-tastyc-copper hover:bg-tastyc-copperLight text-white font-bold uppercase tracking-widest text-xs transition-colors duration-300 disabled:bg-[#a9b8c3]/20 disabled:text-[#a9b8c3]/40"
            >
              {loading ? 'Processing...' : `Place Order (${formatPrice(cartTotal)})`}
            </button>
          </form>

          {/* Cart Sidebar Summary */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#121e22] border border-tastyc-copper/10 p-6 space-y-6">
              <h2 className="font-title text-2xl uppercase tracking-wider text-white border-b border-tastyc-copper/10 pb-3">
                Order Summary
              </h2>

              {/* Items List */}
              <div className="divide-y divide-tastyc-copper/10 max-h-[300px] overflow-y-auto pr-2">
                {cart.map((item) => (
                  <div key={item.id} className="py-4 flex justify-between items-center text-sm">
                    <div className="space-y-1">
                      <p className="font-semibold text-white">{item.name}</p>
                      <p className="text-xs text-[#a9b8c3]">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-white">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-tastyc-copper/15 pt-4 space-y-2">
                <div className="flex justify-between text-xs text-[#a9b8c3]">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-xs text-[#a9b8c3]">
                  <span>Tax (Included)</span>
                  <span>{formatPrice(0)}</span>
                </div>
                <div className="flex justify-between font-title text-xl text-white uppercase tracking-wider pt-2">
                  <span>Total</span>
                  <span className="text-tastyc-copper">{formatPrice(cartTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
