import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import {
  Plus,
  Check,
  RefreshCw,
  AlertTriangle,
  FileText,
  CheckCircle,
  Truck,
  ArrowLeftRight,
  Scan,
  ShieldAlert,
  Calendar,
  Layers
} from 'lucide-react';
import { PaginationControls } from '../../components/PaginationControls';

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  stockLevel: string;
  lowStockThreshold: string;
}

interface Supplier {
  id: string;
  name: string;
  phone: string;
}

interface Branch {
  id: string;
  name: string;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplier: {
    name: string;
  };
  status: string;
  totalAmount: string;
  createdAt: string;
  items: {
    id: string;
    ingredient: {
      name: string;
    };
    orderedQty: string;
    unitPrice: string;
  }[];
}

export const Inventory: React.FC = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification, showConfirm } = useNotification();
  const [ingPage, setIngPage] = useState(1);
  const [ingLimit, setIngLimit] = useState(20);
  const [ingPagination, setIngPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [poPage, setPoPage] = useState(1);
  const [poLimit, setPoLimit] = useState(20);
  const [poPagination, setPoPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  // Tabs: INVENTORY, TRANSFERS, PURCHASES
  const [activeTab, setActiveTab] = useState<'INVENTORY' | 'TRANSFERS' | 'PURCHASES'>('INVENTORY');

  // Stock Adjustment Form State
  const [showAdjustForm, setShowAdjustForm] = useState(false);
  const [adjustBranchId, setAdjustBranchId] = useState('');
  const [adjustIngId, setAdjustIngId] = useState('');
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustType, setAdjustType] = useState('STOCK_IN');
  const [adjustReason, setAdjustReason] = useState('');

  // Barcode / QR Scanner simulator states
  const [showScanner, setShowScanner] = useState(false);
  const [scanCode, setScanCode] = useState('');
  const [scannedIngredient, setScannedIngredient] = useState<Ingredient | null>(null);

  // Stock Transfer Form State
  const [transferFromBranchId, setTransferFromBranchId] = useState('');
  const [transferToBranchId, setTransferToBranchId] = useState('');
  const [transferIngId, setTransferIngId] = useState('');
  const [transferQty, setTransferQty] = useState('');

  // PO Creation Form State
  const [showPOForm, setShowPOForm] = useState(false);
  const [poSupplierId, setPoSupplierId] = useState('');
  const [poItems, setPoItems] = useState<{ ingredientId: string; quantity: number; unitPrice: number }[]>([]);
  const [selectedIngId, setSelectedIngId] = useState('');
  const [selectedIngQty, setSelectedIngQty] = useState('');
  const [selectedIngPrice, setSelectedIngPrice] = useState('');

  // GRN states
  const [selectedPOForGRN, setSelectedPOForGRN] = useState<any>(null);
  const [grnBranchId, setGrnBranchId] = useState('');

  // Mock Expiry Alerts
  const [expiryAlerts] = useState([
    { name: 'Organic Fresh Milk', daysLeft: 2, batchCode: 'BAT-MILK-983', status: 'CRITICAL' },
    { name: 'Fresh Pastries', daysLeft: 1, batchCode: 'BAT-PAST-120', status: 'CRITICAL' },
    { name: 'Artisanal Coffee Beans', daysLeft: 6, batchCode: 'BAT-COF-450', status: 'WARNING' }
  ]);

  const loadData = async () => {
    try {
      const ings = await api.inventory.getIngredients({ page: ingPage, limit: ingLimit });
      setIngredients(ings.data || []);
      setIngPagination(ings.pagination);

      const sups = await api.inventory.getSuppliers({ limit: 100 });
      setSuppliers(sups.data || []);

      const purchaseOrders = await api.inventory.getPOs({ page: poPage, limit: poLimit });
      setPos(purchaseOrders.data || []);
      setPoPagination(purchaseOrders.pagination);
      const listBranches = await api.branches.getAll({ limit: 100 });
      setBranches(listBranches.data || []);

      if (listBranches.data.length > 0) {
        setAdjustBranchId(listBranches.data[0].id);
        setTransferFromBranchId(listBranches.data[0].id);
        setTransferToBranchId(listBranches.data[1]?.id || listBranches.data[0].id);
      }

      if (ings.data.length > 0) {
        setAdjustIngId(ings.data[0].id.toString());
        setTransferIngId(ings.data[0].id.toString());
        setSelectedIngId(ings.data[0].id.toString());
      }
      if (sups.data.length > 0) {
        setPoSupplierId(sups.data[0].id.toString());
      }
    } catch (error) {
      console.error('Failed to load inventory data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [ingPage, ingLimit, poPage, poLimit]);

  const handleUpdatePOStatus = async (id: string, status: string, branchId?: string) => {
    const actionLabel = status === 'PENDING' ? 'submit this Purchase Order'
      : status === 'DELIVERED' ? 'receive these goods and update stock levels (GRN Check-In)'
      : status === 'PAID' ? 'issue payment for this Purchase Order'
      : status === 'RETURNED' ? 'process a return for this Purchase Order'
      : 'update this Purchase Order';

    showConfirm(`Are you sure you want to ${actionLabel}?`, async () => {
      try {
        setLoading(true);
        await api.inventory.updatePOStatus(id, status, branchId);
        showNotification({
          title: 'PO Updated',
          message: `Purchase Order status updated to ${status} successfully.`,
          type: 'success'
        });
        // Refresh PO list
        const updatedPOs = await api.inventory.getPOs({ limit: 100 });
        setPos(updatedPOs.data || []);
        // Refresh ingredients list
        const listIngs = await api.inventory.getIngredients({ limit: 100 });
        setIngredients(listIngs.data || []);
        setSelectedPOForGRN(null);
      } catch (error: any) {
        showNotification({
          title: 'Action Failed',
          message: error.message || 'Could not update Purchase Order status.',
          type: 'error'
        });
      } finally {
        setLoading(false);
      }
    });
  };

  const handleAdjustStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustBranchId || !adjustIngId || !adjustQty) return;

    showConfirm(`Manually log this stock ${adjustType === 'STOCK_IN' ? 'Addition' : 'Deduction'}?`, async () => {
      try {
        await api.inventory.adjustStock({
          branchId: adjustBranchId,
          ingredientId: adjustIngId,
          quantity: parseFloat(adjustQty),
          type: adjustType,
          reason: adjustReason || 'Manual adjustment log',
        });

        showNotification({
          title: 'Stock Adjusted',
          message: 'Manual inventory levels updated successfully.',
          type: 'success'
        });
        setShowAdjustForm(false);
        setAdjustQty('');
        setAdjustReason('');
        loadData();
      } catch (error: any) {
        showNotification({
          title: 'Action Failed',
          message: error.message || 'Restock transaction rejected.',
          type: 'error'
        });
      }
    });
  };

  // Simulated Barcode Matcher
  const handleSimulateScan = () => {
    if (!scanCode) return;
    
    // Choose item based on scan input
    const idx = Math.abs(scanCode.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)) % ingredients.length;
    const ing = ingredients[idx];
    
    if (ing) {
      setScannedIngredient(ing);
      setAdjustIngId(ing.id);
      setAdjustType('STOCK_IN');
      showNotification({
        title: 'Barcode Matched',
        message: `Recognized product: ${ing.name}`,
        type: 'success'
      });
    } else {
      showNotification({
        title: 'Unknown Barcode',
        message: 'No raw material bound to this barcode.',
        type: 'error'
      });
    }
  };

  // Multi-Branch Stock Transfer
  const handleTransferStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferFromBranchId || !transferToBranchId || !transferIngId || !transferQty) return;

    if (transferFromBranchId === transferToBranchId) {
      showNotification({
        title: 'Transfer Error',
        message: 'Source and destination branches must be different.',
        type: 'error'
      });
      return;
    }

    const fromBranchName = branches.find(b => b.id === transferFromBranchId)?.name || 'Source';
    const toBranchName = branches.find(b => b.id === transferToBranchId)?.name || 'Destination';

    showConfirm(`Execute transfer of ${transferQty} stock units from ${fromBranchName} to ${toBranchName}?`, async () => {
      try {
        // 1. Deduct from source branch
        await api.inventory.adjustStock({
          branchId: transferFromBranchId,
          ingredientId: transferIngId,
          quantity: parseFloat(transferQty),
          type: 'STOCK_OUT',
          reason: `Inter-branch transfer to ${toBranchName}`
        });

        // 2. Add to destination branch
        await api.inventory.adjustStock({
          branchId: transferToBranchId,
          ingredientId: transferIngId,
          quantity: parseFloat(transferQty),
          type: 'STOCK_IN',
          reason: `Inter-branch transfer from ${fromBranchName}`
        });

        showNotification({
          title: 'Transfer Completed',
          message: `Successfully transferred ${transferQty} units of stock from ${fromBranchName} to ${toBranchName}.`,
          type: 'success'
        });
        setTransferQty('');
        loadData();
      } catch (error: any) {
        showNotification({
          title: 'Transfer Failed',
          message: error.message || 'Could not execute inter-branch transfer.',
          type: 'error'
        });
      }
    });
  };

  const handleAddPOItem = () => {
    if (!selectedIngId || !selectedIngQty || !selectedIngPrice) return;
    
    // Check duplicate
    if (poItems.some(it => it.ingredientId === selectedIngId)) {
      showNotification({
        title: 'Item Added',
        message: 'Ingredient already listed in this PO.',
        type: 'info'
      });
      return;
    }

    setPoItems([
      ...poItems,
      {
        ingredientId: selectedIngId,
        quantity: parseFloat(selectedIngQty),
        unitPrice: parseFloat(selectedIngPrice)
      }
    ]);
    setSelectedIngQty('');
    setSelectedIngPrice('');
  };
  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!poSupplierId || poItems.length === 0) return;

    showConfirm('Draft and submit this new Purchase Order to supplier?', async () => {
      try {
        await api.inventory.createPO({
          supplierId: poSupplierId,
          items: poItems.map(it => ({
            ingredientId: it.ingredientId,
            orderedQty: it.quantity,
            unitPrice: it.unitPrice
          }))
        });

        showNotification({
          title: 'PO Created',
          message: 'Draft Purchase Order submitted successfully.',
          type: 'success'
        });
        setShowPOForm(false);
        setPoItems([]);
        loadData();
      } catch (error: any) {
        showNotification({
          title: 'Action Failed',
          message: error.message || 'Failed to create Purchase Order.',
          type: 'error'
        });
      }
    });
  };

  return (
    <div className="space-y-6 text-left selection:bg-tastyc-copper selection:text-white">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-tastyc-copper/10 pb-4">
        <div>
          <p className="text-tastyc-copper text-xs uppercase tracking-widest font-semibold">Store Management</p>
          <h3 className="font-title text-3xl uppercase tracking-wider text-white">Central Warehouse Inventory</h3>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => {
              setScannedIngredient(null);
              setScanCode('');
              setShowScanner(true);
            }}
            className="px-4 py-2 border border-tastyc-copper/40 text-tastyc-copper hover:bg-tastyc-copper hover:text-white text-xs uppercase tracking-widest font-bold flex items-center space-x-1.5 transition-all"
          >
            <Scan className="h-4 w-4" />
            <span>Scan Barcode / QR</span>
          </button>
          
          <button
            onClick={() => setShowAdjustForm(true)}
            className="px-4 py-2 bg-tastyc-copper hover:bg-tastyc-copperLight text-white text-xs uppercase tracking-widest font-bold flex items-center space-x-1.5 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>Adjust Stock</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-tastyc-copper/5 pb-4">
        {(['INVENTORY', 'TRANSFERS', 'PURCHASES'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-[10px] uppercase tracking-widest font-semibold border transition-all ${
              activeTab === tab
                ? 'bg-tastyc-copper text-white border-tastyc-copper'
                : 'border-tastyc-copper/20 text-[#a9b8c3] hover:border-tastyc-copper/50 hover:text-white bg-tastyc-dark/20'
            }`}
          >
            {tab === 'INVENTORY' ? 'Raw Materials & Expiries' : tab === 'TRANSFERS' ? 'Inter-Branch Transfers' : 'Procurement POs'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-tastyc-copper mx-auto"></div>
          <p className="mt-4 text-[#a9b8c3] text-sm uppercase tracking-widest animate-pulse">Syncing storage databases...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: INVENTORY & EXPIRY ALERTS */}
          {activeTab === 'INVENTORY' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Left Column: Ingredients Table */}
              <div className="lg:col-span-8 bg-[#121e22] border border-tastyc-copper/10 p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-xs uppercase text-[#a9b8c3] border-b border-tastyc-copper/10 pb-2">
                        <th className="pb-3">Raw Material / Ingredient</th>
                        <th className="pb-3">Units</th>
                        <th className="pb-3">Available Stock</th>
                        <th className="pb-3">Low-Stock Trigger</th>
                        <th className="pb-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-tastyc-copper/5">
                      {ingredients.map((ing) => {
                        const level = parseFloat(ing.stockLevel);
                        const threshold = parseFloat(ing.lowStockThreshold);
                        const isLow = level <= threshold;
                        return (
                          <tr key={ing.id} className="hover:bg-tastyc-dark/20 transition-colors">
                            <td className="py-4 font-semibold text-white">{ing.name}</td>
                            <td className="text-xs text-[#a9b8c3] uppercase tracking-wider">{ing.unit}</td>
                            <td className="text-xs text-white font-mono font-bold">{level.toFixed(2)}</td>
                            <td className="text-xs text-[#a9b8c3] font-mono">{threshold.toFixed(2)}</td>
                            <td className="py-4 text-right">
                              {isLow ? (
                                <span className="inline-flex items-center space-x-1 text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-[9px] font-bold uppercase">
                                  <AlertTriangle className="h-3 w-3" />
                                  <span>Replenish</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center space-x-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-bold uppercase">
                                  <CheckCircle className="h-3 w-3" />
                                  <span>Healthy</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <PaginationControls
                  pagination={ingPagination}
                  onPageChange={setIngPage}
                  onLimitChange={(n) => {
                    setIngLimit(n);
                    setIngPage(1);
                  }}
                />
              </div>

              {/* Right Column: Expiry Alerts */}
              <div className="lg:col-span-4 bg-[#121e22] border border-tastyc-copper/10 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 border-b border-tastyc-copper/10 pb-4 mb-4">
                    <Calendar className="h-5 w-5 text-tastyc-copper" />
                    <h4 className="font-title text-xl uppercase text-white">Batch Expiry Alerts</h4>
                  </div>
                  <div className="space-y-3">
                    {expiryAlerts.map((alert, i) => (
                      <div key={i} className="bg-tastyc-dark/30 border border-tastyc-copper/10 p-3.5 flex justify-between items-center text-xs">
                        <div className="space-y-1">
                          <p className="font-semibold text-white uppercase">{alert.name}</p>
                          <p className="text-[9px] text-tastyc-copper font-mono">{alert.batchCode}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-0.5 text-[9px] font-bold uppercase border ${
                            alert.status === 'CRITICAL' ? 'bg-red-950/20 text-red-400 border-red-500/25 animate-pulse' : 'bg-amber-950/20 text-amber-500 border-amber-500/25'
                          }`}>
                            {alert.daysLeft} Days Left
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-tastyc-copper/10 pt-4 mt-6 text-[10px] text-[#a9b8c3] leading-relaxed">
                  Batches breaching absolute freshness guidelines are automatically flagged. Clear critical expiries via the waste tracker.
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: INTER-BRANCH STOCKS TRANSFERS */}
          {activeTab === 'TRANSFERS' && (
            <div className="bg-[#121e22] border border-tastyc-copper/10 p-6 max-w-xl mx-auto space-y-6">
              <div className="flex items-center space-x-2 border-b border-tastyc-copper/10 pb-3">
                <ArrowLeftRight className="h-5 w-5 text-tastyc-copper" />
                <h4 className="font-title text-xl uppercase text-white">Inter-Branch Stock Transfer</h4>
              </div>

              <form onSubmit={handleTransferStock} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">From (Source branch)</label>
                    <select
                      required
                      value={transferFromBranchId}
                      onChange={(e) => setTransferFromBranchId(e.target.value)}
                      className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white outline-none"
                    >
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">To (Destination branch)</label>
                    <select
                      required
                      value={transferToBranchId}
                      onChange={(e) => setTransferToBranchId(e.target.value)}
                      className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white outline-none"
                    >
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Select Raw Material</label>
                    <select
                      required
                      value={transferIngId}
                      onChange={(e) => setTransferIngId(e.target.value)}
                      className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white outline-none"
                    >
                      {ingredients.map(ing => (
                        <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Quantity</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={transferQty}
                      onChange={(e) => setTransferQty(e.target.value)}
                      className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-sm text-white outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-tastyc-copper hover:bg-tastyc-copperLight text-white text-xs uppercase tracking-widest font-bold transition-all"
                >
                  Execute Inter-Branch Transfer
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: PROCUREMENT POS */}
          {activeTab === 'PURCHASES' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Left Column: Purchase Orders List */}
              <div className="lg:col-span-8 bg-[#121e22] border border-tastyc-copper/10 p-6">
                <div className="flex justify-between items-center border-b border-tastyc-copper/10 pb-4 mb-4">
                  <h4 className="font-title text-xl uppercase text-white">Purchase Orders Ledger</h4>
                  <button
                    onClick={() => {
                      setPoItems([]);
                      setShowPOForm(true);
                    }}
                    className="px-3 py-1.5 bg-tastyc-copper hover:bg-tastyc-copperLight text-white text-xs uppercase font-bold flex items-center space-x-1.5 transition-all"
                  >
                    <Plus className="h-4.5 w-4.5" />
                    <span>Create PO</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="text-xs uppercase text-[#a9b8c3] border-b border-tastyc-copper/10 pb-2">
                        <th className="pb-3">PO Number</th>
                        <th className="pb-3">Vendor / Supplier</th>
                        <th className="pb-3">Invoiced Total</th>
                        <th className="pb-3">Order Date</th>
                        <th className="pb-3">Status</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-tastyc-copper/5">
                      {pos.map((po) => (
                        <tr key={po.id} className="hover:bg-tastyc-dark/20 transition-colors">
                          <td className="py-4 font-semibold text-tastyc-copper font-mono">{po.poNumber}</td>
                          <td className="text-xs text-white">{po.supplier.name}</td>
                          <td className="text-xs text-white font-mono">${parseFloat(po.totalAmount).toFixed(2)}</td>
                          <td className="text-xs text-[#a9b8c3]">
                            {new Date(po.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4">
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 border ${
                              po.status === 'DELIVERED'
                                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/20'
                                : po.status === 'SHIPPED'
                                ? 'bg-blue-950/40 text-blue-400 border-blue-500/20'
                                : po.status === 'PAID'
                                ? 'bg-amber-950/40 text-amber-400 border-amber-500/20'
                                : po.status === 'RETURNED'
                                ? 'bg-red-950/40 text-red-400 border-red-500/20'
                                : 'bg-white/5 text-[#a9b8c3] border-white/10'
                            }`}>
                              {po.status}
                            </span>
                          </td>
                          <td className="py-4 text-right space-x-1.5 whitespace-nowrap">
                            {po.status === 'DRAFT' && (
                              <button
                                onClick={() => handleUpdatePOStatus(po.id, 'PENDING')}
                                className="px-2 py-0.5 bg-tastyc-copper/20 hover:bg-tastyc-copper text-white text-[9px] uppercase font-bold rounded transition-colors"
                              >
                                Submit
                              </button>
                            )}
                            {(po.status === 'PENDING' || po.status === 'ACCEPTED' || po.status === 'SHIPPED') && (
                              <button
                                onClick={() => {
                                  setSelectedPOForGRN(po);
                                  if (branches.length > 0) {
                                    setGrnBranchId(branches[0].id);
                                  }
                                }}
                                className="px-2 py-0.5 bg-emerald-950 hover:bg-emerald-600 border border-emerald-500/30 text-white text-[9px] uppercase font-bold rounded transition-colors"
                              >
                                GRN Check-In
                              </button>
                            )}
                            {po.status === 'DELIVERED' && (
                              <>
                                <button
                                  onClick={() => handleUpdatePOStatus(po.id, 'PAID')}
                                  className="px-2 py-0.5 bg-amber-950 hover:bg-amber-600 border border-amber-500/30 text-white text-[9px] uppercase font-bold rounded transition-colors"
                                >
                                  Pay Vendor
                                </button>
                                <button
                                  onClick={() => handleUpdatePOStatus(po.id, 'RETURNED', po.branchId || undefined)}
                                  className="px-2 py-0.5 bg-red-950 hover:bg-red-600 border border-red-500/30 text-white text-[9px] uppercase font-bold rounded transition-colors"
                                >
                                  Return
                                </button>
                              </>
                            )}
                            {po.status === 'PAID' && (
                              <button
                                onClick={() => handleUpdatePOStatus(po.id, 'RETURNED', po.branchId || undefined)}
                                className="px-2 py-0.5 bg-red-950 hover:bg-red-600 border border-red-500/30 text-white text-[9px] uppercase font-bold rounded transition-colors"
                              >
                                Return
                              </button>
                            )}
                            {(po.status === 'RETURNED' || po.status === 'CANCELLED') && (
                              <span className="text-[10px] text-[#a9b8c3]">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <PaginationControls
                  pagination={poPagination}
                  onPageChange={setPoPage}
                  onLimitChange={(n) => {
                    setPoLimit(n);
                    setPoPage(1);
                  }}
                />
              </div>

              {/* Right Column: Procurement Guidelines info */}
              <div className="lg:col-span-4 bg-[#121e22] border border-tastyc-copper/10 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center space-x-2 border-b border-tastyc-copper/10 pb-4 mb-4">
                    <Truck className="h-5 w-5 text-tastyc-copper" />
                    <h4 className="font-title text-xl uppercase text-white">Vendor Portal Links</h4>
                  </div>
                  <p className="text-xs text-[#a9b8c3] leading-relaxed mb-4">
                    Suppliers log in directly via the guest portal to accept purchase orders, update shipment tracking details, and upload PDF/image invoices.
                  </p>
                  <div className="bg-tastyc-dark/30 border border-tastyc-copper/5 p-4 text-center">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#a9b8c3] block mb-2">Guest Access Route</span>
                    <a
                      href="/supplier/portal"
                      target="_blank"
                      className="text-xs text-tastyc-copper hover:text-white font-semibold underline"
                    >
                      /supplier/portal
                    </a>
                  </div>
                </div>
                <div className="text-[10px] text-[#a9b8c3]/40 border-t border-tastyc-copper/10 pt-4 mt-6">
                  Verify stock level updates in the Raw Materials tab automatically when mark POs status as DELIVERED.
                </div>
              </div>

            </div>
          )}

        </>
      )}

      {/* Adjust Stock Modal */}
      {showAdjustForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-[#121e22] border border-tastyc-copper/35 p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-tastyc-copper/10 pb-3">
              <h4 className="font-title text-xl uppercase tracking-wider text-white">Deduct/Adjust Stock</h4>
              <button onClick={() => setShowAdjustForm(false)} className="text-[#a9b8c3] hover:text-white">
                <X />
              </button>
            </div>

            <form onSubmit={handleAdjustStock} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Store Branch</label>
                <select
                  required
                  value={adjustBranchId}
                  onChange={(e) => setAdjustBranchId(e.target.value)}
                  className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white outline-none"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Deduction Type</label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value)}
                    className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white outline-none"
                  >
                    <option value="STOCK_IN">Stock In (Add)</option>
                    <option value="WASTE">Stock Out (Deduct)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Quantity</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(e.target.value)}
                    className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-sm text-white outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Select Ingredient</label>
                <select
                  required
                  value={adjustIngId}
                  onChange={(e) => setAdjustIngId(e.target.value)}
                  className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white outline-none"
                >
                  {ingredients.map(ing => (
                    <option key={ing.id} value={ing.id}>{ing.name} ({ing.unit})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Reason / Notes</label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-sm text-white outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-tastyc-copper hover:bg-tastyc-copperLight text-white text-xs uppercase tracking-widest font-bold transition-all"
              >
                Apply Stock Adjustment
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Barcode Scanner Simulator Modal */}
      {showScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-[#121e22] border border-tastyc-copper/35 p-6 w-full max-w-sm space-y-4 shadow-2xl text-center">
            <div className="flex justify-between items-center border-b border-tastyc-copper/10 pb-3 text-left">
              <h4 className="font-title text-xl uppercase tracking-wider text-white">QR / Barcode Inventory Scanner</h4>
              <button onClick={() => setShowScanner(false)} className="text-[#a9b8c3] hover:text-white">
                <X />
              </button>
            </div>

            <div className="py-6 border border-dashed border-tastyc-copper/20 bg-tastyc-dark/20 flex flex-col items-center space-y-4">
              <Scan className="h-16 w-16 text-tastyc-copper animate-pulse" />
              <div className="space-y-1">
                <p className="text-xs text-white uppercase tracking-wider font-semibold">Simulated Camera Viewfinder</p>
                <p className="text-[10px] text-[#a9b8c3]">Point device at product barcode tag</p>
              </div>
            </div>

            <div className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Scan Barcode Code / Token</label>
                <div className="flex space-x-2">
                  <select
                    value={scanCode}
                    onChange={(e) => setScanCode(e.target.value)}
                    className="flex-1 bg-tastyc-dark border border-tastyc-copper/20 p-2 text-xs text-white outline-none"
                  >
                    <option value="">Select a barcode token...</option>
                    <option value="BAR-COFFEE-01">BAR-COFFEE-01 (Coffee Beans)</option>
                    <option value="BAR-MILK-12">BAR-MILK-12 (Milk)</option>
                    <option value="BAR-SYRUP-45">BAR-SYRUP-45 (Syrup)</option>
                  </select>
                  <button
                    onClick={handleSimulateScan}
                    className="px-3 bg-tastyc-copper hover:bg-tastyc-copperLight text-white text-xs uppercase tracking-widest font-bold transition-all"
                  >
                    Read
                  </button>
                </div>
              </div>

              {scannedIngredient && (
                <div className="bg-tastyc-copper/15 border border-tastyc-copper/30 p-3 text-xs space-y-1.5">
                  <p className="font-semibold text-white uppercase">{scannedIngredient.name}</p>
                  <p className="text-[10px] text-[#a9b8c3]">Current stock: {parseFloat(scannedIngredient.stockLevel).toFixed(2)} {scannedIngredient.unit}</p>
                  
                  {/* Quick stock adjustment form */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const qtyInput = document.getElementById('scanned-qty') as HTMLInputElement;
                      const qty = qtyInput?.value;
                      if (qty) {
                        setAdjustQty(qty);
                        setAdjustReason('Scanned Barcode adjustment');
                        setShowScanner(false);
                        setShowAdjustForm(true);
                      }
                    }}
                    className="flex space-x-2 mt-2 pt-2 border-t border-tastyc-copper/10"
                  >
                    <input
                      type="number"
                      step="any"
                      id="scanned-qty"
                      required
                      placeholder="Qty"
                      className="w-20 bg-tastyc-dark border border-tastyc-copper/20 p-1 text-xs text-white outline-none"
                    />
                    <button
                      type="submit"
                      className="flex-1 py-1 bg-tastyc-copper hover:bg-tastyc-copperLight text-white text-[10px] uppercase font-bold tracking-wider"
                    >
                      Deduct/Add Stock
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create PO Modal */}
      {showPOForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-[#121e22] border border-tastyc-copper/35 p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-tastyc-copper/10 pb-3">
              <h4 className="font-title text-xl uppercase tracking-wider text-white">Create Purchase Order</h4>
              <button onClick={() => setShowPOForm(false)} className="text-[#a9b8c3] hover:text-white">
                <X />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Vendor / Supplier</label>
                <select
                  required
                  value={poSupplierId}
                  onChange={(e) => setPoSupplierId(e.target.value)}
                  className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white outline-none"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Items listing */}
              <div className="border border-tastyc-copper/15 bg-tastyc-dark/20 p-3 space-y-2 max-h-[150px] overflow-y-auto">
                <span className="text-[9px] uppercase font-bold text-[#a9b8c3] tracking-widest block border-b border-tastyc-copper/10 pb-1.5">Listed Ingredients</span>
                {poItems.map((it, idx) => {
                  const name = ingredients.find(ig => ig.id === it.ingredientId)?.name || 'Item';
                  return (
                    <div key={idx} className="flex justify-between text-xs text-white">
                      <span>{name}</span>
                      <span className="font-semibold text-tastyc-copper font-mono">{it.quantity} x ${it.unitPrice.toFixed(2)}</span>
                    </div>
                  );
                })}
                {poItems.length === 0 && (
                  <p className="text-center py-4 text-[10px] text-[#a9b8c3]/40 uppercase tracking-widest">No ingredients added yet</p>
                )}
              </div>

              {/* Add items block */}
              <div className="bg-tastyc-dark/30 border border-tastyc-copper/10 p-3 space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Select Material</label>
                  <select
                    value={selectedIngId}
                    onChange={(e) => setSelectedIngId(e.target.value)}
                    className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-xs text-white outline-none"
                  >
                    {ingredients.map(ig => (
                      <option key={ig.id} value={ig.id}>{ig.name} ({ig.unit})</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Qty</label>
                    <input
                      type="number"
                      placeholder="e.g. 5"
                      value={selectedIngQty}
                      onChange={(e) => setSelectedIngQty(e.target.value)}
                      className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-1.5 text-xs text-white outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Unit Price ($)</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 12.00"
                      value={selectedIngPrice}
                      onChange={(e) => setSelectedIngPrice(e.target.value)}
                      className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-1.5 text-xs text-white outline-none"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddPOItem}
                  className="w-full py-1.5 border border-dashed border-tastyc-copper/40 hover:border-tastyc-copper text-[#a9b8c3] hover:text-white text-[10px] uppercase font-bold tracking-wider transition-colors"
                >
                  Add Ingredient Line
                </button>
              </div>

              <button
                type="submit"
                disabled={poItems.length === 0}
                className="w-full py-3 bg-tastyc-copper hover:bg-tastyc-copperLight text-white text-xs uppercase tracking-widest font-bold transition-all disabled:opacity-40"
              >
                Submit Draft Purchase Order
              </button>
            </form>
          </div>
        </div>
      )}
      {/* GRN Check-In Modal */}
      {selectedPOForGRN && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="bg-[#121e22] border border-tastyc-copper/20 rounded shadow-2xl p-6 w-full max-w-md space-y-6 text-left">
            <div className="flex justify-between items-center border-b border-tastyc-copper/10 pb-4">
              <h3 className="font-title text-2xl uppercase tracking-wider text-white">GRN Check-In</h3>
              <button
                onClick={() => setSelectedPOForGRN(null)}
                className="text-[#a9b8c3] hover:text-white transition-colors"
              >
                <X />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-[#a9b8c3] uppercase tracking-wider font-semibold">PO Number</p>
                  <p className="text-sm font-mono text-tastyc-copper font-bold">{selectedPOForGRN.poNumber}</p>
                </div>
                <div>
                  <p className="text-[10px] text-[#a9b8c3] uppercase tracking-wider font-semibold">Supplier</p>
                  <p className="text-sm text-white font-bold">{selectedPOForGRN.supplier.name}</p>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-[#a9b8c3] uppercase tracking-wider font-semibold block mb-1">
                  Select Target Branch (Goods Receipt Note)
                </label>
                <select
                  value={grnBranchId}
                  onChange={(e) => setGrnBranchId(e.target.value)}
                  className="w-full bg-tastyc-dark/80 border border-tastyc-copper/20 px-3 py-2 text-sm text-white focus:outline-none focus:border-tastyc-copper rounded"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <p className="text-[10px] text-[#a9b8c3] uppercase tracking-wider font-semibold mb-2">Items to Restock</p>
                <div className="border border-tastyc-copper/5 bg-tastyc-dark/20 p-3 rounded space-y-2 max-h-[150px] overflow-y-auto">
                  {selectedPOForGRN.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-xs border-b border-tastyc-copper/5 pb-1">
                      <span className="text-[#a9b8c3]">{item.ingredient.name}</span>
                      <span className="font-mono text-white font-bold">{item.orderedQty} units</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex space-x-3 pt-4 border-t border-tastyc-copper/10">
              <button
                onClick={() => setSelectedPOForGRN(null)}
                className="flex-1 py-2 bg-tastyc-dark text-xs uppercase tracking-widest font-bold text-[#a9b8c3] hover:text-white border border-tastyc-copper/10 hover:border-tastyc-copper/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleUpdatePOStatus(selectedPOForGRN.id, 'DELIVERED', grnBranchId)}
                className="flex-1 py-2 bg-tastyc-copper hover:bg-tastyc-copperLight text-white text-xs uppercase tracking-widest font-bold transition-colors"
              >
                Confirm GRN Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// X Icon Wrapper
const X: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-4 w-4"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
