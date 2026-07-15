import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useSettings } from '../../context/SettingsContext';
import { useNotification } from '../../context/NotificationContext';

export const FinanceReports: React.FC = () => {
  const { formatPrice } = useSettings();
  const { showNotification } = useNotification();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.ops
      .financeSummary()
      .then(setData)
      .catch((e) => showNotification({ title: 'Error', message: e.message, type: 'error' }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-xs text-[#a9b8c3]">Loading finance summary…</p>;

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-title text-3xl uppercase tracking-widest text-white">Finance & P&amp;L</h1>
        <p className="text-xs text-[#a9b8c3] mt-2">
          Sales reconciliation, expenses, waste cost, and profit &amp; loss snapshot.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ['Gross Sales', data?.revenue],
          ['Approved Expenses', data?.expensesApproved],
          ['Waste Cost', data?.wasteCost],
          ['Net (approx)', data?.netEstimate],
        ].map(([label, value]) => (
          <div key={label as string} className="bg-[#121e22] border border-tastyc-copper/10 p-5">
            <p className="text-[10px] uppercase tracking-widest text-[#a9b8c3]">{label}</p>
            <p className="text-2xl text-white font-semibold mt-2">
              {formatPrice(Number(value || 0))}
            </p>
          </div>
        ))}
      </div>
      {data?.orderCount !== undefined && (
        <p className="text-xs text-[#a9b8c3]">Orders in period: {data.orderCount}</p>
      )}
    </div>
  );
};
