import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Plus, Trash2, ShieldAlert, Sparkles, PlusCircle } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { PaginationControls } from '../../components/PaginationControls';

interface Ingredient {
  id: string;
  name: string;
  unit: string;
}

interface WasteLog {
  id: string;
  ingredient: {
    name: string;
    unit: string;
  };
  quantity: string;
  cost: string;
  reason: string;
  employee: {
    name: string;
    role: string;
  };
  createdAt: string;
}

export const WasteManagement: React.FC = () => {
  const [logs, setLogs] = useState<WasteLog[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const { showNotification } = useNotification();
  const { formatPrice } = useSettings();

  // Form states
  const [showLogForm, setShowLogForm] = useState(false);
  const [ingredientId, setIngredientId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('Expired');

  const loadData = async () => {
    try {
      const wLogs = await api.waste.getAll({ page, limit });
      setLogs(wLogs.data || []);
      setPagination(wLogs.pagination);

      const ings = await api.inventory.getIngredients({ limit: 100 });
      setIngredients(ings.data || []);

      if (ings.data.length > 0) setIngredientId(ings.data[0].id.toString());
    } catch (error) {
      console.error('Failed to load waste data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, limit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingredientId || !quantity || !reason) return;

    try {
      await api.waste.log({
        ingredientId,
        quantity: parseFloat(quantity),
        reason,
      });
      showNotification({
        title: 'Waste Logged',
        message: 'Damages logged successfully!',
        type: 'success'
      });
      setShowLogForm(false);
      setQuantity('');
      loadData();
    } catch (error: any) {
      showNotification({
        title: 'Action Failed',
        message: error.message || 'Failed to log waste',
        type: 'error'
      });
    }
  };

  const totalWasteCost = logs.reduce((acc, log) => acc + parseFloat(log.cost), 0);

  return (
    <div className="space-y-8 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-tastyc-copper/10 pb-4">
        <div>
          <p className="text-tastyc-copper text-xs uppercase tracking-widest font-semibold">Loss Prevention</p>
          <h3 className="font-title text-3xl uppercase tracking-wider text-white">Waste & Damages</h3>
        </div>

        <button
          onClick={() => setShowLogForm(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-tastyc-copper hover:bg-tastyc-copperLight text-white transition-all text-xs uppercase tracking-widest font-semibold"
        >
          <PlusCircle className="h-4 w-4" />
          <span>Log Damages</span>
        </button>
      </div>

      {/* Log waste Modal Overlay */}
      {showLogForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-[#121e22] border border-tastyc-copper/35 p-6 w-full max-w-sm space-y-4">
            <div className="flex justify-between items-center border-b border-tastyc-copper/10 pb-3">
              <h4 className="font-title text-xl uppercase tracking-wider text-white">Log Damages</h4>
              <button onClick={() => setShowLogForm(false)} className="text-[#a9b8c3] hover:text-white">
                <Plus className="h-4 w-4 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Select Ingredient</label>
                <select
                  value={ingredientId}
                  onChange={(e) => setIngredientId(e.target.value)}
                  className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white outline-none"
                >
                  {ingredients.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.unit})
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Reason</label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white outline-none"
                  >
                    <option value="Expired">Expired</option>
                    <option value="Damaged">Damaged</option>
                    <option value="Kitchen Waste">Kitchen Waste</option>
                    <option value="Spilled">Spilled</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Quantity</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-tastyc-copper text-white text-xs uppercase tracking-widest font-bold"
              >
                Log Cost
              </button>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-tastyc-copper mx-auto"></div>
          <p className="mt-4 text-[#a9b8c3] text-sm uppercase tracking-widest">Loading Waste Logs...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Table logs */}
          <div className="lg:col-span-8 bg-[#121e22] border border-tastyc-copper/10 p-6 space-y-4">
            <h3 className="font-title text-2xl uppercase tracking-wider text-white border-b border-tastyc-copper/10 pb-3">
              Damage Logs
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase text-[#a9b8c3] border-b border-tastyc-copper/10 pb-2">
                    <th className="py-3">Ingredient</th>
                    <th>Qty</th>
                    <th>Reason</th>
                    <th>Logged By</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tastyc-copper/5">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-tastyc-dark/20 transition-colors">
                      <td className="py-3.5 font-semibold text-white">{log.ingredient.name}</td>
                      <td className="font-medium text-red-400">
                        -{parseFloat(log.quantity).toFixed(2)}{' '}
                        <span className="text-[10px] text-[#a9b8c3] uppercase">{log.ingredient.unit}</span>
                      </td>
                      <td>
                        <span className="text-[10px] uppercase font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5">
                          {log.reason}
                        </span>
                      </td>
                      <td className="text-xs">
                        <span className="text-white font-medium">{log.employee.name}</span>
                        <p className="text-[9px] text-tastyc-copper uppercase font-semibold">{log.employee.role}</p>
                      </td>
                      <td className="text-xs text-[#a9b8c3]">
                        {new Date(log.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-[#a9b8c3] text-xs uppercase tracking-widest">
                        No waste logged
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
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

          {/* Right Summary Costs card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#121e22] border border-tastyc-copper/10 p-6 space-y-4">
              <h3 className="font-title text-2xl uppercase tracking-wider text-white border-b border-tastyc-copper/10 pb-3">
                Loss Analytics
              </h3>
              <div className="bg-red-950/20 border border-red-500/25 p-4 flex items-center space-x-4">
                <ShieldAlert className="h-8 w-8 text-red-400 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-[#a9b8c3] uppercase">Financial Loss</p>
                  <p className="text-2xl font-bold text-red-400 mt-1">
                    {formatPrice(totalWasteCost)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
