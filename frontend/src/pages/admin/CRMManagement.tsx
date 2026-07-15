import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Calendar, Users, Clock, Plus, Check, X, ShieldAlert, Sparkles, Tag, Gift, Award, ListFilter } from 'lucide-react';

interface Reservation {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  partySize: number;
  reservationTime: string;
  status: string;
  notes: string | null;
  tableId: string | null;
  table: {
    number: string;
  } | null;
}

interface WaitlistEntry {
  id: string;
  customerName: string;
  customerPhone: string;
  partySize: number;
  status: string;
  createdAt: string;
}

interface Table {
  id: string;
  number: string;
}

interface Coupon {
  id: string;
  code: string;
  discountType: string;
  value: string;
  minOrderAmount: string;
}

interface GiftCard {
  id: string;
  code: string;
  balance: string;
}

export const CRMManagement: React.FC = () => {
  const { showNotification, showConfirm } = useNotification();
  const [loading, setLoading] = useState(true);

  // Active view tab: RESERVATIONS, WAITLIST, CAMPAIGNS
  const [activeTab, setActiveTab] = useState<'RESERVATIONS' | 'WAITLIST' | 'CAMPAIGNS'>('RESERVATIONS');

  // Lists
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);

  // Modals state
  const [showWaitlistForm, setShowWaitlistForm] = useState(false);
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [campaignType, setCampaignType] = useState<'COUPON' | 'GIFT_CARD'>('COUPON');

  // Forms inputs
  const [waitName, setWaitName] = useState('');
  const [waitPhone, setWaitPhone] = useState('');
  const [waitParty, setWaitParty] = useState('2');

  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('PERCENTAGE');
  const [value, setValue] = useState('');
  const [minOrder, setMinOrder] = useState('');
  const [balance, setBalance] = useState('');

  // Table Allocation Widget
  const [allocatingResId, setAllocatingResId] = useState<string | null>(null);
  const [allocatingTableId, setAllocatingTableId] = useState('');

  const loadData = async () => {
    try {
      const res = await api.crm.getReservations({ limit: 100 });
      setReservations(res.data || []);

      const wait = await api.crm.getWaitlist({ limit: 100 });
      setWaitlist(wait.data || []);

      const listTables = await api.orders.getTablesList({ limit: 100 });
      setTables(listTables.data || []);
      if (listTables.data.length > 0) setAllocatingTableId(listTables.data[0].id);

      const activeCoupons = await api.crm.getCoupons({ limit: 100 });
      setCoupons(activeCoupons.data || []);

      const activeCards = await api.crm.getGiftCards({ limit: 100 });
      setGiftCards(activeCards.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateResStatus = async (id: string, status: string, tableId?: string | null) => {
    try {
      await api.crm.updateReservation(id, { status, tableId });
      showNotification({
        title: 'Booking Updated',
        message: `Reservation marked as ${status}.`,
        type: 'success'
      });
      setAllocatingResId(null);
      loadData();
    } catch (error) {
      showNotification({
        title: 'Action Failed',
        message: 'Could not sync reservation status.',
        type: 'error'
      });
    }
  };

  const handleAddWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.crm.addToWaitlist({
        customerName: waitName,
        customerPhone: waitPhone,
        partySize: parseInt(waitParty)
      });
      setShowWaitlistForm(false);
      setWaitName('');
      setWaitPhone('');
      loadData();
      showNotification({
        title: 'Added to Waitlist',
        message: `${waitName} added to the queue.`,
        type: 'success'
      });
    } catch (error) {
      showNotification({
        title: 'Action Failed',
        message: 'Could not create waitlist entry.',
        type: 'error'
      });
    }
  };

  const handleUpdateWaitlistStatus = async (id: string, status: string) => {
    try {
      await api.crm.updateWaitlist(id, status);
      showNotification({
        title: 'Waitlist Seated',
        message: `Customer status marked as ${status}.`,
        type: 'success'
      });
      loadData();
    } catch (error) {
      showNotification({
        title: 'Action Failed',
        message: 'Failed to update waitlist queue.',
        type: 'error'
      });
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (campaignType === 'COUPON') {
        await api.crm.createCoupon({
          code,
          discountType,
          value: parseFloat(value),
          minOrderAmount: parseFloat(minOrder) || 0.00
        });
      } else {
        await api.crm.createGiftCard({
          code,
          balance: parseFloat(balance)
        });
      }
      setShowCampaignForm(false);
      setCode('');
      setValue('');
      setMinOrder('');
      setBalance('');
      loadData();
      showNotification({
        title: 'Campaign Created',
        message: `${campaignType.replace('_', ' ')} issued successfully.`,
        type: 'success'
      });
    } catch (error) {
      showNotification({
        title: 'Action Failed',
        message: 'Could not create campaign code.',
        type: 'error'
      });
    }
  };

  return (
    <div className="space-y-6 text-left selection:bg-tastyc-copper selection:text-white">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-tastyc-copper/10 pb-4">
        <div>
          <p className="text-tastyc-copper text-xs uppercase tracking-widest font-semibold">CRM & Dining Board</p>
          <h3 className="font-title text-3xl uppercase tracking-wider text-white">Reservations & Loyalty</h3>
        </div>

        <div className="flex space-x-3">
          {activeTab === 'WAITLIST' && (
            <button
              onClick={() => setShowWaitlistForm(true)}
              className="px-4 py-2 bg-tastyc-copper hover:bg-tastyc-copperLight text-white text-xs uppercase tracking-widest font-bold flex items-center space-x-1.5 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Add to Waitlist</span>
            </button>
          )}

          {activeTab === 'CAMPAIGNS' && (
            <button
              onClick={() => setShowCampaignForm(true)}
              className="px-4 py-2 bg-tastyc-copper hover:bg-tastyc-copperLight text-white text-xs uppercase tracking-widest font-bold flex items-center space-x-1.5 transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Issue Coupon / Gift</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-tastyc-copper/5 pb-4">
        {(['RESERVATIONS', 'WAITLIST', 'CAMPAIGNS'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-[10px] uppercase tracking-widest font-semibold border transition-all ${
              activeTab === tab
                ? 'bg-tastyc-copper text-white border-tastyc-copper'
                : 'border-tastyc-copper/20 text-[#a9b8c3] hover:border-tastyc-copper/50 hover:text-white bg-tastyc-dark/20'
            }`}
          >
            {tab.replace('_', ' ')}
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
          {/* TAB 1: RESERVATIONS */}
          {activeTab === 'RESERVATIONS' && (
            <div className="bg-[#121e22] border border-tastyc-copper/10 p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs uppercase text-[#a9b8c3] border-b border-tastyc-copper/10 pb-2">
                      <th>Customer Details</th>
                      <th>Party Size</th>
                      <th>Time Slot</th>
                      <th>Allocated Table</th>
                      <th>Notes</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-tastyc-copper/5">
                    {reservations.map((res) => (
                      <tr key={res.id} className="hover:bg-tastyc-dark/20 transition-colors">
                        <td className="py-4">
                          <p className="font-semibold text-white">{res.customerName}</p>
                          <p className="text-xs text-[#a9b8c3]">{res.customerPhone} | {res.customerEmail}</p>
                        </td>
                        <td className="text-xs text-white font-bold">{res.partySize} Guests</td>
                        <td className="text-xs text-white">
                          {new Date(res.reservationTime).toLocaleDateString()}{' '}
                          <span className="text-tastyc-copper font-semibold ml-1">
                            {new Date(res.reservationTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </td>
                        <td className="py-4 text-xs font-semibold text-white">
                          {allocatingResId === res.id ? (
                            <div className="flex items-center space-x-2">
                              <select
                                value={allocatingTableId}
                                onChange={(e) => setAllocatingTableId(e.target.value)}
                                className="bg-tastyc-dark border border-tastyc-copper/20 p-1 text-xs text-white outline-none"
                              >
                                {tables.map((t) => (
                                  <option key={t.id} value={t.id}>Table {t.number}</option>
                                ))}
                              </select>
                              <button
                                onClick={() => showConfirm('Confirm table allocation and reservation booking?', () => handleUpdateResStatus(res.id, 'CONFIRMED', allocatingTableId))}
                                className="p-1 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10"
                                title="Allocate & Confirm"
                              >
                                <Check className="h-3 w-3" />
                              </button>
                            </div>
                          ) : res.table ? (
                            <span className="text-emerald-400">Table {res.table.number}</span>
                          ) : (
                            <button
                              onClick={() => setAllocatingResId(res.id)}
                              className="text-[9px] uppercase tracking-widest font-bold border border-dashed border-tastyc-copper/40 text-tastyc-copper px-2 py-0.5 hover:bg-tastyc-copper/5"
                            >
                              Allocate Table
                            </button>
                          )}
                        </td>
                        <td className="text-xs text-[#a9b8c3] max-w-xs truncate">{res.notes || 'None'}</td>
                        <td className="py-4 text-right">
                          <div className="flex justify-end space-x-2">
                            {res.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => showConfirm('Are you sure you want to confirm this reservation?', () => handleUpdateResStatus(res.id, 'CONFIRMED'))}
                                  className="px-2.5 py-1 bg-tastyc-copper hover:bg-tastyc-copperLight text-white text-[9px] font-bold uppercase tracking-widest transition-all"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => showConfirm('Are you sure you want to cancel this reservation?', () => handleUpdateResStatus(res.id, 'CANCELLED'))}
                                  className="p-1 border border-red-500/10 hover:border-red-500 text-red-400 hover:text-white transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            )}
                            {res.status !== 'PENDING' && (
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                                res.status === 'CONFIRMED'
                                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                                  : 'bg-red-500/15 border-red-500/30 text-red-400'
                              }`}>
                                {res.status}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {reservations.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-[#a9b8c3] text-xs uppercase tracking-widest">No reservations logged</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: WAITING LIST */}
          {activeTab === 'WAITLIST' && (
            <div className="bg-[#121e22] border border-tastyc-copper/10 p-6">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs uppercase text-[#a9b8c3] border-b border-tastyc-copper/10 pb-2">
                      <th>Customer Details</th>
                      <th>Party Size</th>
                      <th>Wait Duration</th>
                      <th>Status</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-tastyc-copper/5">
                    {waitlist.map((w) => {
                      const mins = Math.floor((Date.now() - new Date(w.createdAt).getTime()) / 60000);
                      return (
                        <tr key={w.id} className="hover:bg-tastyc-dark/20 transition-colors">
                          <td className="py-4">
                            <p className="font-semibold text-white">{w.customerName}</p>
                            <p className="text-xs text-[#a9b8c3]">{w.customerPhone}</p>
                          </td>
                          <td className="text-xs text-white font-bold">{w.partySize} Guests</td>
                          <td className="text-xs text-white">
                            <span className="text-tastyc-copper font-semibold">{mins > 0 ? `${mins} mins` : 'Just now'}</span>
                          </td>
                          <td>
                            <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-2 py-0.5 rounded text-[9px] font-bold uppercase animate-pulse">
                              {w.status}
                            </span>
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => showConfirm('Confirm seating guests and free waitlist slot?', () => handleUpdateWaitlistStatus(w.id, 'SEATED'))}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-bold uppercase tracking-widest transition-all"
                              >
                                Seat Guests
                              </button>
                              <button
                                onClick={() => showConfirm('Remove this customer from waitlist?', () => handleUpdateWaitlistStatus(w.id, 'CANCELLED'))}
                                className="p-1 border border-red-500/15 hover:border-red-500 text-red-400 hover:text-white transition-colors"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {waitlist.length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-[#a9b8c3]/40 text-xs uppercase tracking-widest">Waiting list is currently empty</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CAMPAIGNS */}
          {activeTab === 'CAMPAIGNS' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Coupons list */}
              <div className="bg-[#121e22] border border-tastyc-copper/10 p-6 space-y-4">
                <div className="flex items-center space-x-2 text-tastyc-copper border-b border-tastyc-copper/10 pb-2">
                  <Tag className="h-5 w-5" />
                  <h4 className="font-title text-xl uppercase tracking-wider text-white">Active Promo Coupons</h4>
                </div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin">
                  {coupons.map((c) => (
                    <div key={c.id} className="bg-tastyc-dark/20 p-4 border border-dashed border-tastyc-copper/20 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white text-xs tracking-widest uppercase">{c.code}</p>
                        <p className="text-[9px] text-[#a9b8c3] mt-1">Min Order: ${parseFloat(c.minOrderAmount).toFixed(2)}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-tastyc-copper font-bold font-title text-lg">
                          {c.discountType === 'PERCENTAGE' ? `${parseFloat(c.value).toFixed(0)}%` : `$${parseFloat(c.value).toFixed(2)}`}
                        </span>
                        <p className="text-[8px] uppercase font-bold text-[#a9b8c3] tracking-wider">Discount</p>
                      </div>
                    </div>
                  ))}
                  {coupons.length === 0 && (
                    <p className="text-xs text-[#a9b8c3]/40 uppercase tracking-widest py-8">No coupon campaigns active.</p>
                  )}
                </div>
              </div>

              {/* Gift Cards list */}
              <div className="bg-[#121e22] border border-tastyc-copper/10 p-6 space-y-4">
                <div className="flex items-center space-x-2 text-tastyc-copper border-b border-tastyc-copper/10 pb-2">
                  <Gift className="h-5 w-5" />
                  <h4 className="font-title text-xl uppercase tracking-wider text-white">Issued Gift Cards</h4>
                </div>
                <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin">
                  {giftCards.map((g) => (
                    <div key={g.id} className="bg-tastyc-dark/20 p-4 border border-dashed border-tastyc-copper/20 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white text-xs tracking-widest uppercase">{g.code}</p>
                        <p className="text-[9px] text-[#a9b8c3] mt-1">Digital Gift Card</p>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-bold font-title text-lg">
                          ${parseFloat(g.balance).toFixed(2)}
                        </span>
                        <p className="text-[8px] uppercase font-bold text-[#a9b8c3] tracking-wider">Credit</p>
                      </div>
                    </div>
                  ))}
                  {giftCards.length === 0 && (
                    <p className="text-xs text-[#a9b8c3]/40 uppercase tracking-widest py-8">No gift cards issued.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Waitlist Modal Form */}
      {showWaitlistForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-[#121e22] border border-tastyc-copper/35 p-6 w-full max-w-sm space-y-4">
            <div className="flex justify-between items-center border-b border-tastyc-copper/10 pb-3">
              <h4 className="font-title text-xl uppercase tracking-wider text-white">Add Customer</h4>
              <button onClick={() => setShowWaitlistForm(false)} className="text-[#a9b8c3] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleAddWaitlist} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Customer Name</label>
                <input
                  type="text"
                  required
                  value={waitName}
                  onChange={(e) => setWaitName(e.target.value)}
                  className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-sm text-white outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={waitPhone}
                  onChange={(e) => setWaitPhone(e.target.value)}
                  className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-sm text-white outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Party Size</label>
                <select
                  value={waitParty}
                  onChange={(e) => setWaitParty(e.target.value)}
                  className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-sm text-white outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 10].map((num) => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-tastyc-copper hover:bg-tastyc-copperLight text-white text-xs uppercase tracking-widest font-bold"
              >
                Add to Waitlist
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Campaigns Modal Form */}
      {showCampaignForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-[#121e22] border border-tastyc-copper/35 p-6 w-full max-w-sm space-y-4">
            <div className="flex justify-between items-center border-b border-tastyc-copper/10 pb-3">
              <h4 className="font-title text-xl uppercase tracking-wider text-white">New Campaign Code</h4>
              <button onClick={() => setShowCampaignForm(false)} className="text-[#a9b8c3] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-tastyc-dark/25 p-1 border border-tastyc-copper/10">
              <button
                onClick={() => setCampaignType('COUPON')}
                className={`py-1.5 text-[10px] uppercase font-bold tracking-widest transition-all ${
                  campaignType === 'COUPON' ? 'bg-tastyc-copper text-white' : 'text-[#a9b8c3] hover:text-white'
                }`}
              >
                Promo Coupon
              </button>
              <button
                onClick={() => setCampaignType('GIFT_CARD')}
                className={`py-1.5 text-[10px] uppercase font-bold tracking-widest transition-all ${
                  campaignType === 'GIFT_CARD' ? 'bg-tastyc-copper text-white' : 'text-[#a9b8c3] hover:text-white'
                }`}
              >
                Gift Card
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Code (Uppercase)</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-sm text-white outline-none uppercase"
                  placeholder="e.g. COFFEE10"
                />
              </div>

              {campaignType === 'COUPON' ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Discount Type</label>
                      <select
                        value={discountType}
                        onChange={(e) => setDiscountType(e.target.value)}
                        className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-xs text-white outline-none"
                      >
                        <option value="PERCENTAGE">Percentage (%)</option>
                        <option value="FIXED">Fixed Cash ($)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Discount Value</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-xs text-white outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Min Order Amount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={minOrder}
                      onChange={(e) => setMinOrder(e.target.value)}
                      className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-xs text-white outline-none"
                      placeholder="e.g. 15.00"
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Starting Balance ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-sm text-white outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 bg-tastyc-copper hover:bg-tastyc-copperLight text-white text-xs uppercase tracking-widest font-bold"
              >
                Create Campaign
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
