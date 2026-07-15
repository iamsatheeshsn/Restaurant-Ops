import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { useNotification } from '../../context/NotificationContext';
import { PaginationControls } from '../../components/PaginationControls';

/** Cashier shift closing / cash drawer / daily settlement surface. */
export const CashDrawer: React.FC = () => {
  const { formatPrice } = useSettings();
  const { showNotification } = useNotification();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingFloat, setOpeningFloat] = useState('100');
  const [countedCash, setCountedCash] = useState('');
  const [closed, setClosed] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  useEffect(() => {
    setLoading(true);
    api.orders
      .getAll({ page, limit })
      .then((result) => {
        setOrders(result.data || []);
        setPagination(result.pagination);
      })
      .catch((e) => showNotification({ title: 'Error', message: e.message, type: 'error' }))
      .finally(() => setLoading(false));
  }, [page, limit]);

  const today = new Date().toDateString();
  const todays = orders.filter((o) => new Date(o.createdAt).toDateString() === today);
  const salesTotal = todays.reduce((sum, o) => sum + Number(o.totalAmount || o.grandTotal || o.total || 0), 0);
  const expected = Number(openingFloat || 0) + salesTotal;
  const variance = countedCash === '' ? null : Number(countedCash) - expected;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-title text-3xl uppercase tracking-widest text-white">Cash Drawer</h1>
        <p className="text-xs text-[#a9b8c3] mt-2">
          Billing settlement, cash drawer float, refunds tracking, and shift closing.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#121e22] border border-tastyc-copper/10 p-5">
          <p className="text-[10px] uppercase tracking-widest text-[#a9b8c3]">Today&apos;s Tickets</p>
          <p className="text-2xl text-white mt-2">{loading ? '…' : todays.length}</p>
        </div>
        <div className="bg-[#121e22] border border-tastyc-copper/10 p-5">
          <p className="text-[10px] uppercase tracking-widest text-[#a9b8c3]">Sales Total</p>
          <p className="text-2xl text-tastyc-copper mt-2">{formatPrice(salesTotal)}</p>
        </div>
        <div className="bg-[#121e22] border border-tastyc-copper/10 p-5">
          <p className="text-[10px] uppercase tracking-widest text-[#a9b8c3]">Shift</p>
          <p className="text-2xl text-white mt-2">{closed ? 'Closed' : 'Open'}</p>
        </div>
      </div>

      <div className="bg-[#121e22] border border-tastyc-copper/10 p-5 space-y-4">
        <h2 className="text-xs uppercase tracking-widest text-tastyc-copper font-bold">Daily Settlement</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="space-y-1">
            <span className="text-[10px] uppercase text-[#a9b8c3]">Opening Float</span>
            <input
              type="number"
              value={openingFloat}
              onChange={(e) => setOpeningFloat(e.target.value)}
              className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white"
            />
          </label>
          <label className="space-y-1">
            <span className="text-[10px] uppercase text-[#a9b8c3]">Counted Cash</span>
            <input
              type="number"
              value={countedCash}
              onChange={(e) => setCountedCash(e.target.value)}
              className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white"
            />
          </label>
        </div>
        <p className="text-xs text-[#a9b8c3]">
          Expected drawer: <span className="text-white">{formatPrice(expected)}</span>
          {variance !== null && (
            <>
              {' '}
              · Variance:{' '}
              <span className={variance === 0 ? 'text-emerald-400' : 'text-amber-400'}>
                {formatPrice(variance)}
              </span>
            </>
          )}
        </p>
        <button
          onClick={() => {
            setClosed(true);
            showNotification({
              title: 'Shift Closed',
              message: 'Daily settlement recorded for this session.',
              type: 'success',
            });
          }}
          disabled={closed}
          className="px-4 py-2 bg-tastyc-copper text-white text-xs uppercase tracking-widest font-semibold disabled:opacity-40"
        >
          Close Shift
        </button>
      </div>

      <div className="bg-[#121e22] border border-tastyc-copper/10 overflow-hidden">
        <div className="px-5 py-4 border-b border-tastyc-copper/10">
          <h2 className="text-xs uppercase tracking-widest text-tastyc-copper font-bold">Tickets</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-[10px] uppercase tracking-widest text-[#a9b8c3] border-b border-white/5">
              <tr>
                <th className="px-5 py-3">Order</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Total</th>
                <th className="px-5 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-[#a9b8c3]">
                    Loading…
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-[#a9b8c3]">
                    No tickets yet
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="border-t border-white/5 text-white">
                    <td className="px-5 py-3 font-mono text-xs">{o.orderNumber}</td>
                    <td className="px-5 py-3 text-xs">{o.type}</td>
                    <td className="px-5 py-3 text-xs text-tastyc-copper">{o.status}</td>
                    <td className="px-5 py-3 text-xs">
                      {formatPrice(Number(o.totalAmount || o.total || 0))}
                    </td>
                    <td className="px-5 py-3 text-xs text-[#a9b8c3]">
                      {new Date(o.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 pb-4">
          <PaginationControls
            pagination={pagination}
            onPageChange={setPage}
            onLimitChange={(n) => {
              setLimit(n);
              setPage(1);
            }}
          />
        </div>
      </div>
    </div>
  );
};
