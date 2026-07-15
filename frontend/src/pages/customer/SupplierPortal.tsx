import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { ShieldAlert, FileText, Check, Truck, Upload, LogOut, CheckCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { PaginationControls } from '../../components/PaginationControls';

interface Supplier {
  id: string;
  name: string;
  contactName: string | null;
  phone: string;
  email: string | null;
}

interface PurchaseOrder {
  id: string;
  poNumber: string;
  status: string;
  totalAmount: string;
  createdAt: string;
  invoiceUrl: string | null;
  items: {
    id: string;
    ingredient: {
      name: string;
      unit: string;
    };
    orderedQty: string;
    unitPrice: string;
  }[];
}

export const SupplierPortal: React.FC = () => {
  const { showNotification } = useNotification();
  const { formatPrice } = useSettings();

  // Authentication
  const [email, setEmail] = useState('');
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loadingLogin, setLoadingLogin] = useState(false);

  // Portal dashboard
  const [pos, setPos] = useState<PurchaseOrder[]>([]);
  const [loadingPOs, setLoadingPOs] = useState(false);
  const [expandedPoId, setExpandedPoId] = useState<string | null>(null);
  const [uploadingPoId, setUploadingPoId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  // Check if supplier session is already stored
  useEffect(() => {
    const saved = localStorage.getItem('tastyc_supplier');
    const token = localStorage.getItem('tastyc_supplier_token');
    if (saved && token) {
      try {
        const parsed = JSON.parse(saved);
        setSupplier(parsed);
      } catch (e) {
        localStorage.removeItem('tastyc_supplier');
        localStorage.removeItem('tastyc_supplier_token');
      }
    } else {
      localStorage.removeItem('tastyc_supplier');
      localStorage.removeItem('tastyc_supplier_token');
    }
  }, []);

  // Fetch POs once supplier is logged in
  useEffect(() => {
    if (supplier) {
      fetchPOs();
    }
  }, [supplier, page, limit]);

  const fetchPOs = async () => {
    if (!supplier) return;
    setLoadingPOs(true);
    try {
      const result = await api.supplier.getPOs({ page, limit });
      setPos(result.data || []);
      setPagination(result.pagination);
    } catch (error) {
      console.error(error);
      showNotification({
        title: 'Error',
        message: 'Failed to retrieve your Purchase Orders.',
        type: 'error'
      });
    } finally {
      setLoadingPOs(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoadingLogin(true);

    try {
      const data = await api.supplier.login(email);
      setSupplier(data.supplier);
      localStorage.setItem('tastyc_supplier', JSON.stringify(data.supplier));
      showNotification({
        title: 'Portal Access Granted',
        message: `Welcome, ${data.supplier.name}!`,
        type: 'success'
      });
    } catch (error: any) {
      showNotification({
        title: 'Access Denied',
        message: error.message || 'Supplier email not found.',
        type: 'error'
      });
    } finally {
      setLoadingLogin(false);
    }
  };

  const handleLogout = () => {
    setSupplier(null);
    setPos([]);
    api.supplier.logout();
    showNotification({
      title: 'Signed Out',
      message: 'You have logged out of the Supplier Portal.',
      type: 'info'
    });
  };

  const handleStatusChange = async (poId: string, nextStatus: string) => {
    try {
      await api.supplier.updatePOStatus(poId, nextStatus);
      showNotification({
        title: 'Order Updated',
        message: `Purchase Order marked as ${nextStatus}`,
        type: 'success'
      });
      fetchPOs();
    } catch (error) {
      showNotification({
        title: 'Action Failed',
        message: 'Could not update status.',
        type: 'error'
      });
    }
  };

  const handleInvoiceUpload = async (e: React.ChangeEvent<HTMLInputElement>, poId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPoId(poId);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = reader.result as string;
        const uploadRes = await api.menu.uploadImage(base64String, file.name);
        await api.supplier.updatePOStatus(poId, undefined, uploadRes.imageUrl);
        showNotification({
          title: 'Invoice Uploaded',
          message: 'Digital Invoice uploaded and registered under PO records.',
          type: 'success'
        });
        fetchPOs();
      } catch (error: any) {
        showNotification({
          title: 'Upload Failed',
          message: error.message || 'File processing failed.',
          type: 'error'
        });
      } finally {
        setUploadingPoId(null);
      }
    };
    reader.readAsDataURL(file);
  };

  // Login View
  if (!supplier) {
    return (
      <div className="bg-[#0a1316] min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-tastyc-copper selection:text-white">
        <div className="max-w-md w-full space-y-8 bg-[#121e22] border border-tastyc-copper/25 p-8 shadow-2xl relative text-left">
          <div className="text-center space-y-2">
            <h2 className="font-title text-3xl uppercase tracking-wider text-white">Supplier Portal</h2>
            <p className="text-xs text-[#a9b8c3] tracking-widest uppercase">Manage Purchase Orders & Invoicing</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[#a9b8c3] tracking-widest">Registered Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-tastyc-dark border border-tastyc-copper/20 focus:border-tastyc-copper p-3 text-sm text-white outline-none transition-colors"
                placeholder="supplier@company.com"
              />
            </div>
            <button
              type="submit"
              disabled={loadingLogin}
              className="w-full py-3.5 bg-tastyc-copper hover:bg-tastyc-copperLight text-white font-bold uppercase tracking-widest text-xs transition-all disabled:opacity-50"
            >
              {loadingLogin ? 'Authorizing Portal...' : 'Access Portal'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0a1316] min-h-[85vh] py-12 px-4 sm:px-6 lg:px-8 text-left selection:bg-tastyc-copper selection:text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-tastyc-copper/10 pb-6 gap-4">
          <div>
            <p className="text-tastyc-copper text-xs uppercase tracking-widest font-semibold">Vendor Console</p>
            <h3 className="font-title text-3xl uppercase tracking-wider text-white">{supplier.name}</h3>
            <p className="text-xs text-[#a9b8c3] mt-1">Contact: {supplier.contactName} | Phone: {supplier.phone}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 border border-red-500/20 hover:border-red-500 px-4 py-2 text-xs uppercase tracking-wider font-semibold text-red-400 hover:text-white transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Purchase Orders Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-title text-xl uppercase text-white tracking-widest">Active Purchase Orders</h4>
            <button onClick={fetchPOs} className="text-[#a9b8c3] hover:text-white text-xs uppercase tracking-wider font-semibold flex items-center space-x-1">
              <RefreshCwIcon className="h-3 w-3 mr-1" />
              Refresh list
            </button>
          </div>

          {loadingPOs ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-tastyc-copper mx-auto"></div>
              <p className="mt-4 text-[#a9b8c3] text-xs uppercase tracking-widest">Retrieving PO records...</p>
            </div>
          ) : pos.length === 0 ? (
            <div className="bg-[#121e22] border border-tastyc-copper/10 p-12 text-center text-[#a9b8c3]/40 text-sm uppercase tracking-widest">
              No Purchase Orders mapped to your supplier account.
            </div>
          ) : (
            <div className="space-y-4">
              {pos.map((po) => {
                const isOpen = expandedPoId === po.id;
                return (
                  <div key={po.id} className="bg-[#121e22] border border-tastyc-copper/10 hover:border-tastyc-copper/30 transition-all duration-300">
                    {/* Header bar */}
                    <div
                      onClick={() => setExpandedPoId(isOpen ? null : po.id)}
                      className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer select-none"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="h-9 w-9 bg-tastyc-copper/10 rounded-full flex items-center justify-center text-tastyc-copper">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm uppercase tracking-wider">{po.poNumber}</p>
                          <p className="text-[10px] text-[#a9b8c3]">Created on {new Date(po.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-xs uppercase font-bold text-tastyc-copper">Total Amount</p>
                          <p className="text-white text-sm font-bold">{formatPrice(po.totalAmount)}</p>
                        </div>

                        <div>
                          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase border ${
                            po.status === 'DELIVERED'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : po.status === 'SHIPPED'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                              : po.status === 'ACCEPTED'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-white/5 text-[#a9b8c3] border-white/10'
                          }`}>
                            {po.status}
                          </span>
                        </div>

                        <div>
                          {isOpen ? <ChevronUp className="h-5 w-5 text-[#a9b8c3]" /> : <ChevronDown className="h-5 w-5 text-[#a9b8c3]" />}
                        </div>
                      </div>
                    </div>

                    {/* Expandable items and actions */}
                    {isOpen && (
                      <div className="border-t border-tastyc-copper/10 p-5 space-y-6 bg-tastyc-dark/10">
                        {/* Items Table */}
                        <div className="space-y-2">
                          <h5 className="text-[10px] uppercase font-bold text-tastyc-copper tracking-wider">Ordered Ingredients</h5>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs text-[#a9b8c3]">
                              <thead>
                                <tr className="border-b border-tastyc-copper/5 pb-1">
                                  <th className="py-2">Ingredient</th>
                                  <th>Ordered Qty</th>
                                  <th>Unit Price</th>
                                  <th className="text-right">Subtotal</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-tastyc-copper/5">
                                {po.items.map((item) => (
                                  <tr key={item.id}>
                                    <td className="py-2 text-white font-medium">{item.ingredient.name}</td>
                                    <td>{parseFloat(item.orderedQty)} {item.ingredient.unit}</td>
                                    <td>{formatPrice(item.unitPrice)}</td>
                                    <td className="text-right text-white">{formatPrice(parseFloat(item.orderedQty) * parseFloat(item.unitPrice))}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Invoice display */}
                        {po.invoiceUrl && (
                          <div className="bg-[#0a1316] border border-tastyc-copper/5 p-4 rounded flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <CheckCircle className="h-5 w-5 text-emerald-400" />
                              <div>
                                <p className="text-xs font-semibold text-white">Digital Invoice Registered</p>
                                <a
                                  href={po.invoiceUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] text-tastyc-copper hover:underline uppercase tracking-wider"
                                >
                                  View Uploaded Invoice
                                </a>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Actions block */}
                        {po.status !== 'DELIVERED' && (
                          <div className="flex flex-wrap gap-4 border-t border-tastyc-copper/5 pt-4">
                            {po.status === 'PENDING' && (
                              <button
                                onClick={() => handleStatusChange(po.id, 'ACCEPTED')}
                                className="flex items-center space-x-1 px-4 py-2 bg-tastyc-copper hover:bg-tastyc-copperLight text-white text-[10px] uppercase font-bold tracking-widest transition-all"
                              >
                                <Check className="h-4 w-4" />
                                <span>Accept Order</span>
                              </button>
                            )}

                            {po.status === 'ACCEPTED' && (
                              <button
                                onClick={() => handleStatusChange(po.id, 'SHIPPED')}
                                className="flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-[10px] uppercase font-bold tracking-widest transition-all"
                              >
                                <Truck className="h-4 w-4" />
                                <span>Mark as Shipped</span>
                              </button>
                            )}

                            {/* Upload Invoice File */}
                            <div className="relative">
                              <input
                                type="file"
                                id={`invoice-${po.id}`}
                                accept="image/*,application/pdf"
                                onChange={(e) => handleInvoiceUpload(e, po.id)}
                                disabled={uploadingPoId === po.id}
                                className="hidden"
                              />
                              <label
                                htmlFor={`invoice-${po.id}`}
                                className="flex items-center space-x-2 border border-tastyc-copper/40 hover:border-tastyc-copper text-tastyc-copper hover:text-white px-4 py-2 text-[10px] uppercase font-bold tracking-widest cursor-pointer transition-all disabled:opacity-50"
                              >
                                <Upload className="h-4 w-4" />
                                <span>{uploadingPoId === po.id ? 'Uploading...' : po.invoiceUrl ? 'Re-upload Invoice' : 'Upload Invoice'}</span>
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {!loadingPOs && pos.length > 0 && (
            <PaginationControls
              pagination={pagination}
              onPageChange={setPage}
              onLimitChange={(n) => {
                setLimit(n);
                setPage(1);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// Simple icon wrapper
const RefreshCwIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
  </svg>
);
