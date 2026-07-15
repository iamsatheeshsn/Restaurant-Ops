import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Plus, Edit2, Trash2, Home, Landmark, Check, X, ShieldAlert, Award, Globe, DollarSign } from 'lucide-react';
import { PaginationControls } from '../../components/PaginationControls';

interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string | null;
  currency: string;
  country: string;
  isCentralKitchen: boolean;
  isWarehouse: boolean;
}

export const FranchiseManagement: React.FC = () => {
  const { showNotification } = useNotification();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  // Form modals state
  const [showForm, setShowForm] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Form inputs
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [country, setCountry] = useState('US');
  const [isCentralKitchen, setIsCentralKitchen] = useState(false);
  const [isWarehouse, setIsWarehouse] = useState(false);

  const fetchBranches = async () => {
    try {
      const result = await api.branches.getAll({ page, limit });
      setBranches(result.data || []);
      setPagination(result.pagination);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, [page, limit]);

  const handleEditClick = (b: Branch) => {
    setEditingBranch(b);
    setName(b.name);
    setAddress(b.address);
    setPhone(b.phone);
    setEmail(b.email || '');
    setCurrency(b.currency);
    setCountry(b.country);
    setIsCentralKitchen(b.isCentralKitchen);
    setIsWarehouse(b.isWarehouse);
    setShowForm(true);
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name,
      address,
      phone,
      email: email || null,
      currency,
      country,
      isCentralKitchen,
      isWarehouse
    };

    try {
      if (editingBranch) {
        await api.branches.update(editingBranch.id, payload);
        showNotification({
          title: 'Franchise Updated',
          message: 'Branch configuration saved successfully.',
          type: 'success'
        });
      } else {
        await api.branches.create(payload);
        showNotification({
          title: 'Franchise Registered',
          message: 'New branch created under your subscription.',
          type: 'success'
        });
      }

      setShowForm(false);
      setEditingBranch(null);
      setName('');
      setAddress('');
      setPhone('');
      setEmail('');
      setIsCentralKitchen(false);
      setIsWarehouse(false);
      fetchBranches();
    } catch (error) {
      showNotification({
        title: 'Action Failed',
        message: 'Could not write branch record.',
        type: 'error'
      });
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.branches.delete(id);
      showNotification({
        title: 'Branch Deleted',
        message: 'Location removed successfully.',
        type: 'success'
      });
      fetchBranches();
    } catch (error) {
      showNotification({
        title: 'Action Failed',
        message: 'Could not remove branch.',
        type: 'error'
      });
    }
  };

  return (
    <div className="space-y-6 text-left selection:bg-tastyc-copper selection:text-white">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-tastyc-copper/10 pb-4">
        <div>
          <p className="text-tastyc-copper text-xs uppercase tracking-widest font-semibold">Enterprise Operations</p>
          <h3 className="font-title text-3xl uppercase tracking-wider text-white">Franchise & Branches</h3>
        </div>

        <button
          onClick={() => {
            setEditingBranch(null);
            setName('');
            setAddress('');
            setPhone('');
            setEmail('');
            setCurrency('USD');
            setCountry('US');
            setIsCentralKitchen(false);
            setIsWarehouse(false);
            setShowForm(true);
          }}
          className="px-4 py-2 bg-tastyc-copper hover:bg-tastyc-copperLight text-white text-xs uppercase tracking-widest font-bold flex items-center space-x-1.5 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Branch</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-tastyc-copper mx-auto"></div>
          <p className="mt-4 text-[#a9b8c3] text-sm uppercase tracking-widest">Loading franchise registry...</p>
        </div>
      ) : (
        <div className="bg-[#121e22] border border-tastyc-copper/10 p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase text-[#a9b8c3] border-b border-tastyc-copper/10 pb-2">
                  <th>Location Name</th>
                  <th>Contact Details</th>
                  <th>Region / Country</th>
                  <th>Currency</th>
                  <th>Role / Type</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tastyc-copper/5">
                {branches.map((b) => (
                  <tr key={b.id} className="hover:bg-tastyc-dark/20 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center space-x-2.5">
                        <div className="h-8 w-8 bg-tastyc-copper/10 rounded-full flex items-center justify-center text-tastyc-copper">
                          <Landmark className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{b.name}</p>
                          <p className="text-[10px] text-[#a9b8c3]">{b.address}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-xs text-white">
                      <p>{b.phone}</p>
                      <p className="text-[10px] text-[#a9b8c3]">{b.email || 'No email registered'}</p>
                    </td>
                    <td className="text-xs text-white uppercase tracking-wider font-semibold">
                      <span className="flex items-center space-x-1">
                        <Globe className="h-3.5 w-3.5 text-[#a9b8c3]" />
                        <span>{b.country}</span>
                      </span>
                    </td>
                    <td className="text-xs text-tastyc-copper font-bold uppercase">
                      <span className="flex items-center space-x-0.5">
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>{b.currency}</span>
                      </span>
                    </td>
                    <td className="text-xs">
                      <div className="flex flex-wrap gap-1.5">
                        {b.isCentralKitchen && (
                          <span className="bg-amber-500/15 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">
                            Central Kitchen
                          </span>
                        )}
                        {b.isWarehouse && (
                          <span className="bg-blue-500/15 border border-blue-500/30 text-blue-400 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">
                            Warehouse
                          </span>
                        )}
                        {!b.isCentralKitchen && !b.isWarehouse && (
                          <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">
                            Outlet Store
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditClick(b)}
                          className="p-1 border border-tastyc-copper/20 hover:border-tastyc-copper text-[#a9b8c3] hover:text-white transition-all"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(b.id)}
                          className="p-1 border border-red-500/10 hover:border-red-500 text-red-400 hover:text-white transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-[#121e22] border border-tastyc-copper/35 p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center border-b border-tastyc-copper/10 pb-3">
              <h4 className="font-title text-xl uppercase tracking-wider text-white">
                {editingBranch ? 'Edit Branch' : 'Register Branch'}
              </h4>
              <button onClick={() => setShowForm(false)} className="text-[#a9b8c3] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateOrUpdate} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Branch Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-sm text-white outline-none"
                  placeholder="e.g. London Coffee Lounge"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-sm text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Phone</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-xs text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Country</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-xs text-white outline-none uppercase"
                    placeholder="e.g. GB"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Currency</label>
                  <input
                    type="text"
                    required
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-xs text-white outline-none uppercase"
                    placeholder="e.g. GBP"
                  />
                </div>
              </div>

              {/* Branch configuration checks */}
              <div className="border-t border-tastyc-copper/10 pt-3 space-y-2">
                <label className="text-[9px] uppercase font-bold text-tastyc-copper tracking-widest">Enterprise Role Types</label>
                <div className="flex items-center space-x-6">
                  <label className="flex items-center space-x-2 text-xs text-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isCentralKitchen}
                      onChange={(e) => setIsCentralKitchen(e.target.checked)}
                      className="accent-tastyc-copper"
                    />
                    <span>Central Kitchen</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs text-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isWarehouse}
                      onChange={(e) => setIsWarehouse(e.target.checked)}
                      className="accent-tastyc-copper"
                    />
                    <span>Warehouse</span>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-tastyc-copper hover:bg-tastyc-copperLight text-white text-xs uppercase tracking-widest font-bold transition-all"
              >
                {editingBranch ? 'Save Changes' : 'Create Branch'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
