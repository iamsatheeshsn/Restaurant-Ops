import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Calendar, Users, Clipboard, Plus, Check, X, ShieldAlert, Sparkles, ChefHat, Activity, Package } from 'lucide-react';

interface EventBooking {
  id: string;
  title: string;
  customerName: string;
  customerPhone: string;
  guestCount: number;
  eventDate: string;
  cateringDetails: string | null;
  totalCost: string;
  status: string;
  branch: {
    name: string;
  };
}

interface ProductionBatch {
  id: string;
  name: string;
  batchQty: string;
  status: string;
  createdAt: string;
  branch: {
    name: string;
  };
}

interface Branch {
  id: string;
  name: string;
  isCentralKitchen: boolean;
}

export const EnterpriseManagement: React.FC = () => {
  const { showNotification, showConfirm } = useNotification();
  const [loading, setLoading] = useState(true);

  // Active view tab: EVENTS, MANUFACTURING
  const [activeTab, setActiveTab] = useState<'EVENTS' | 'MANUFACTURING'>('EVENTS');

  // Lists
  const [bookings, setBookings] = useState<EventBooking[]>([]);
  const [batches, setBatches] = useState<ProductionBatch[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  // Modals state
  const [showEventForm, setShowEventForm] = useState(false);
  const [showBatchForm, setShowBatchForm] = useState(false);

  // Event form inputs
  const [eventBranchId, setEventBranchId] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventCustName, setEventCustName] = useState('');
  const [eventCustPhone, setEventCustPhone] = useState('');
  const [eventGuests, setEventGuests] = useState('20');
  const [eventDate, setEventDate] = useState('');
  const [eventCatering, setEventCatering] = useState('');
  const [eventCost, setEventCost] = useState('');

  // Production batch form inputs
  const [batchBranchId, setBatchBranchId] = useState('');
  const [batchName, setBatchName] = useState('');
  const [batchQty, setBatchQty] = useState('');
  const [batchRecipeId, setBatchRecipeId] = useState('recipe-1');

  const loadData = async () => {
    try {
      const listBranches = await api.branches.getAll({ limit: 100 });
      setBranches(listBranches.data || []);
      
      const outlets = listBranches.data || [];
      if (outlets.length > 0) {
        setEventBranchId(outlets[0].id);
      }
      const kitchens = outlets.filter((b) => b.isCentralKitchen);
      if (kitchens.length > 0) {
        setBatchBranchId(kitchens[0].id);
      }

      const evs = await api.phase3.getEvents({ limit: 100 });
      setBookings(evs.data || []);

      const prs = await api.phase3.getProduction({ limit: 100 });
      setBatches(prs.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateEventStatus = (id: string, status: string) => {
    showConfirm(`Mark this catering event as ${status}?`, async () => {
      try {
        await api.phase3.updateEventStatus(id, status);
        showNotification({
          title: 'Event Updated',
          message: `Catering event marked as ${status}.`,
          type: 'success'
        });
        loadData();
      } catch (error) {
        showNotification({
          title: 'Action Failed',
          message: 'Could not sync event booking status.',
          type: 'error'
        });
      }
    }, 'Update event');
  };

  const handleUpdateBatchStatus = (id: string, status: string) => {
    showConfirm(`Mark this production batch as ${status.replace('_', ' ')}?`, async () => {
      try {
        await api.phase3.updateProductionStatus(id, status);
        showNotification({
          title: 'Batch Updated',
          message: `Central Kitchen batch marked as ${status}.`,
          type: 'success'
        });
        loadData();
      } catch (error) {
        showNotification({
          title: 'Action Failed',
          message: 'Could not update manufacturing batch.',
          type: 'error'
        });
      }
    }, 'Update batch');
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.phase3.createEvent({
        branchId: eventBranchId,
        title: eventTitle,
        customerName: eventCustName,
        customerPhone: eventCustPhone,
        guestCount: parseInt(eventGuests),
        eventDate: new Date(eventDate).toISOString(),
        cateringDetails: eventCatering,
        totalCost: parseFloat(eventCost) || 0.00
      });
      setShowEventForm(false);
      setEventTitle('');
      setEventCustName('');
      setEventCustPhone('');
      setEventCatering('');
      setEventCost('');
      loadData();
      showNotification({
        title: 'Event Scheduled',
        message: 'Catering booking scheduled successfully.',
        type: 'success'
      });
    } catch (error) {
      showNotification({
        title: 'Action Failed',
        message: 'Could not write event record.',
        type: 'error'
      });
    }
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.phase3.createProduction({
        branchId: batchBranchId,
        recipeId: batchRecipeId,
        name: batchName,
        batchQty: parseFloat(batchQty)
      });
      setShowBatchForm(false);
      setBatchName('');
      setBatchQty('');
      loadData();
      showNotification({
        title: 'Batch Scheduled',
        message: 'Central Kitchen production batch generated.',
        type: 'success'
      });
    } catch (error) {
      showNotification({
        title: 'Action Failed',
        message: 'Could not start manufacturing batch.',
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
          <h3 className="font-title text-3xl uppercase tracking-wider text-white">Catering & Kitchen Manufacturing</h3>
        </div>

        <div className="flex space-x-3">
          {activeTab === 'EVENTS' && (
            <button
              onClick={() => setShowEventForm(true)}
              className="px-4 py-2 bg-tastyc-copper hover:bg-tastyc-copperLight text-white text-xs uppercase tracking-widest font-bold flex items-center space-x-1.5 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Schedule Event</span>
            </button>
          )}

          {activeTab === 'MANUFACTURING' && (
            <button
              onClick={() => setShowBatchForm(true)}
              className="px-4 py-2 bg-tastyc-copper hover:bg-tastyc-copperLight text-white text-xs uppercase tracking-widest font-bold flex items-center space-x-1.5 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>New Production Batch</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-tastyc-copper/5 pb-4">
        {(['EVENTS', 'MANUFACTURING'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-[10px] uppercase tracking-widest font-semibold border transition-all ${
              activeTab === tab
                ? 'bg-tastyc-copper text-white border-tastyc-copper'
                : 'border-tastyc-copper/20 text-[#a9b8c3] hover:border-tastyc-copper/50 hover:text-white bg-tastyc-dark/20'
            }`}
          >
            {tab === 'EVENTS' ? 'Catering & Event Bookings' : 'Central Kitchen Manufacturing'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-tastyc-copper mx-auto"></div>
          <p className="mt-4 text-[#a9b8c3] text-sm uppercase tracking-widest">Opening Panel...</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* TAB 1: EVENTS */}
          {activeTab === 'EVENTS' && (
            <div className="bg-[#121e22] border border-tastyc-copper/10 p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs uppercase text-[#a9b8c3] border-b border-tastyc-copper/10 pb-2">
                      <th>Event Details</th>
                      <th>Catering Host Outlet</th>
                      <th>Guest Count</th>
                      <th>Menu Details</th>
                      <th>Total Cost</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-tastyc-copper/5">
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-tastyc-dark/20 transition-colors">
                        <td className="py-4">
                          <p className="font-semibold text-white">{booking.title}</p>
                          <p className="text-xs text-[#a9b8c3]">{booking.customerName} ({booking.customerPhone})</p>
                          <p className="text-[10px] text-tastyc-copper mt-0.5">
                            {new Date(booking.eventDate).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="text-xs text-white">{booking.branch.name}</td>
                        <td className="text-xs text-white font-bold">{booking.guestCount} Guests</td>
                        <td className="text-xs text-[#a9b8c3] max-w-xs truncate">{booking.cateringDetails || 'None'}</td>
                        <td className="text-xs font-bold text-white">${parseFloat(booking.totalCost).toFixed(2)}</td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end space-x-2">
                            {booking.status === 'PENDING' ? (
                              <>
                                <button
                                  onClick={() => handleUpdateEventStatus(booking.id, 'CONFIRMED')}
                                  className="px-2.5 py-1 bg-tastyc-copper hover:bg-tastyc-copperLight text-white text-[9px] font-bold uppercase tracking-widest transition-all"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => handleUpdateEventStatus(booking.id, 'CANCELLED')}
                                  className="p-1 border border-red-500/10 hover:border-red-500 text-red-400 hover:text-white transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            ) : (
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                                booking.status === 'CONFIRMED'
                                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                  : 'bg-red-500/15 border-red-500/30 text-red-400'
                              }`}>
                                {booking.status}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[#a9b8c3]/40 text-xs uppercase tracking-widest">No catering event bookings logged</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: MANUFACTURING */}
          {activeTab === 'MANUFACTURING' && (
            <div className="bg-[#121e22] border border-tastyc-copper/10 p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs uppercase text-[#a9b8c3] border-b border-tastyc-copper/10 pb-2">
                      <th>Production Batch Name</th>
                      <th>Central Kitchen Branch</th>
                      <th>Scheduled Quantity</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-tastyc-copper/5">
                    {batches.map((batch) => (
                      <tr key={batch.id} className="hover:bg-tastyc-dark/20 transition-colors">
                        <td className="py-4">
                          <p className="font-semibold text-white">{batch.name}</p>
                          <p className="text-[10px] text-[#a9b8c3]">Scheduled on {new Date(batch.createdAt).toLocaleDateString()}</p>
                        </td>
                        <td className="text-xs text-white">{batch.branch.name}</td>
                        <td className="text-xs text-tastyc-copper font-bold">{parseFloat(batch.batchQty)} units</td>
                        <td>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                            batch.status === 'COMPLETED'
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                              : batch.status === 'IN_PROGRESS'
                              ? 'bg-blue-500/15 border-blue-500/30 text-blue-400'
                              : 'bg-white/5 border border-white/10 text-[#a9b8c3]'
                          }`}>
                            {batch.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end space-x-2">
                            {batch.status === 'PENDING' && (
                              <button
                                onClick={() => handleUpdateBatchStatus(batch.id, 'IN_PROGRESS')}
                                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[9px] font-bold uppercase tracking-widest transition-all"
                              >
                                Start Production
                              </button>
                            )}
                            {batch.status === 'IN_PROGRESS' && (
                              <button
                                onClick={() => handleUpdateBatchStatus(batch.id, 'COMPLETED')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-bold uppercase tracking-widest transition-all"
                              >
                                Complete Batch
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {batches.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-[#a9b8c3]/40 text-xs uppercase tracking-widest">No manufacturing runs scheduled</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Event Modal Form */}
      {showEventForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-[#121e22] border border-tastyc-copper/35 p-6 w-full max-w-md space-y-4">
            <div className="flex justify-between items-center border-b border-tastyc-copper/10 pb-3">
              <h4 className="font-title text-xl uppercase tracking-wider text-white">Schedule Catering Event</h4>
              <button onClick={() => setShowEventForm(false)} className="text-[#a9b8c3] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateEvent} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Catering Host Branch</label>
                <select
                  value={eventBranchId}
                  onChange={(e) => setEventBranchId(e.target.value)}
                  className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-sm text-white outline-none"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Event Title</label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-sm text-white outline-none"
                  placeholder="e.g. Smith Wedding Anniversary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={eventCustName}
                    onChange={(e) => setEventCustName(e.target.value)}
                    className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-xs text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Customer Phone</label>
                  <input
                    type="tel"
                    required
                    value={eventCustPhone}
                    onChange={(e) => setEventCustPhone(e.target.value)}
                    className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 col-span-1">
                  <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Guest Count</label>
                  <input
                    type="number"
                    required
                    value={eventGuests}
                    onChange={(e) => setEventGuests(e.target.value)}
                    className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-xs text-white outline-none"
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Event Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-xs text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Catering Menu Inclusions</label>
                  <textarea
                    value={eventCatering}
                    onChange={(e) => setEventCatering(e.target.value)}
                    rows={2}
                    className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-xs text-white outline-none resize-none"
                    placeholder="e.g. 50 Muffins, 20 Lattes, 30 Butter Croissants"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Total Quote Cost ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={eventCost}
                    onChange={(e) => setEventCost(e.target.value)}
                    className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-sm text-white outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-tastyc-copper hover:bg-tastyc-copperLight text-white text-xs uppercase tracking-widest font-bold"
              >
                Schedule Catering
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Batch Modal Form */}
      {showBatchForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-[#121e22] border border-tastyc-copper/35 p-6 w-full max-w-sm space-y-4">
            <div className="flex justify-between items-center border-b border-tastyc-copper/10 pb-3">
              <h4 className="font-title text-xl uppercase tracking-wider text-white">Central Kitchen Production</h4>
              <button onClick={() => setShowBatchForm(false)} className="text-[#a9b8c3] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateBatch} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Central Kitchen Branch</label>
                <select
                  value={batchBranchId}
                  onChange={(e) => setBatchBranchId(e.target.value)}
                  className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-sm text-white outline-none"
                >
                  {branches.filter(b => b.isCentralKitchen).map((b) => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                  {branches.filter(b => b.isCentralKitchen).length === 0 && (
                    <option value="">No Central Kitchen registered!</option>
                  )}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Product Batch Name</label>
                <input
                  type="text"
                  required
                  value={batchName}
                  onChange={(e) => setBatchName(e.target.value)}
                  className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-sm text-white outline-none"
                  placeholder="e.g. Muffin Pre-Mix Batch B"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Quantity (units)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={batchQty}
                    onChange={(e) => setBatchQty(e.target.value)}
                    className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-sm text-white outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Recipe Identifier</label>
                  <select
                    value={batchRecipeId}
                    onChange={(e) => setBatchRecipeId(e.target.value)}
                    className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-xs text-white outline-none"
                  >
                    <option value="recipe-1">Blueberry Muffin Pre-mix</option>
                    <option value="recipe-2">Espresso Blend Roast</option>
                    <option value="recipe-3">Vanilla Syrup Batch</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={!batchBranchId}
                className="w-full py-2 bg-tastyc-copper hover:bg-tastyc-copperLight text-white text-xs uppercase tracking-widest font-bold disabled:opacity-50"
              >
                Schedule Batch Run
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
