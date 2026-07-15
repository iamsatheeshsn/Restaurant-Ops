import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Users, Clock, FileText, CheckCircle, Armchair } from 'lucide-react';

interface DiningTable {
  id: string;
  number: string;
  seating?: number;
  seatingCapacity?: number;
  floor?: { name?: string };
}

export const Reservations: React.FC = () => {
  const { showNotification } = useNotification();
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [tables, setTables] = useState<DiningTable[]>([]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [partySize, setPartySize] = useState('2');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('18:00');
  const [tableId, setTableId] = useState('');
  const [notes, setNotes] = useState('');

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    if (isAuthenticated && user) {
      setName((prev) => prev || user.name || '');
      setEmail((prev) => prev || user.email || '');
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    api.orders
      .getTablesList({ limit: 100 })
      .then((result) => setTables(result.data || []))
      .catch(() => setTables([]));
  }, []);

  const suitableTables = useMemo(() => {
    const size = parseInt(partySize, 10) || 2;
    return tables.filter((t) => (t.seatingCapacity ?? t.seating ?? 0) >= size);
  }, [tables, partySize]);

  useEffect(() => {
    if (tableId && !suitableTables.some((t) => t.id === tableId)) {
      setTableId('');
    }
  }, [suitableTables, tableId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const reservationTime = new Date(`${date}T${time}:00`);
      if (Number.isNaN(reservationTime.getTime())) {
        throw new Error('Please choose a valid date and time.');
      }
      if (reservationTime.getTime() < Date.now()) {
        throw new Error('Reservation time must be in the future.');
      }

      await api.crm.bookReservation({
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
        partySize: parseInt(partySize, 10),
        reservationTime: reservationTime.toISOString(),
        tableId: tableId || null,
        notes,
      });

      setSuccess(true);
      showNotification({
        title: 'Booking Submitted',
        message: tableId
          ? `Preferred table reserved for ${partySize} guests — awaiting confirmation.`
          : `Reservation for ${partySize} guests submitted. Staff will assign a table.`,
        type: 'success',
      });
    } catch (error: any) {
      showNotification({
        title: 'Booking Failed',
        message: error.message || 'Could not register reservation.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSuccess(false);
    setNotes('');
    setTableId('');
    if (!isAuthenticated) {
      setName('');
      setEmail('');
      setPhone('');
    }
  };

  return (
    <div className="bg-[#0a1316] min-h-[90vh] py-16 px-4 sm:px-6 lg:px-8 selection:bg-tastyc-copper selection:text-white flex items-center justify-center text-left">
      <div className="max-w-xl w-full bg-[#121e22] border border-tastyc-copper/20 p-8 shadow-2xl space-y-8 relative">
        <div className="text-center space-y-2">
          <h2 className="font-title text-4xl uppercase tracking-wider text-white">Book a Table</h2>
          <p className="text-xs text-[#a9b8c3] tracking-widest uppercase">
            Reserve online — guests &amp; staff managed under CRM
          </p>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-4">
            <div className="h-16 w-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 mx-auto">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h4 className="font-title text-2xl uppercase text-white">Request Received</h4>
            <p className="text-xs text-[#a9b8c3] leading-relaxed max-w-sm mx-auto">
              Thank you, {name}! Your booking for {partySize} guest{partySize === '1' ? '' : 's'} is pending
              confirmation. We&apos;ll reach you at {phone}
              {tableId ? ' about your preferred table.' : ' once a table is assigned.'}
            </p>
            <button
              onClick={resetForm}
              className="mt-6 px-6 py-2.5 bg-tastyc-copper hover:bg-tastyc-copperLight text-white text-xs uppercase tracking-widest font-bold transition-all"
            >
              Book Another Table
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#a9b8c3] tracking-wider">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white outline-none focus:border-tastyc-copper"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#a9b8c3] tracking-wider">Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white outline-none focus:border-tastyc-copper"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[#a9b8c3] tracking-wider">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white outline-none focus:border-tastyc-copper"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#a9b8c3] tracking-wider flex items-center space-x-1.5">
                  <Users className="h-3.5 w-3.5 text-tastyc-copper" />
                  <span>Guests</span>
                </label>
                <select
                  value={partySize}
                  onChange={(e) => setPartySize(e.target.value)}
                  className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white outline-none"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 10].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#a9b8c3] tracking-wider flex items-center space-x-1.5">
                  <Calendar className="h-3.5 w-3.5 text-tastyc-copper" />
                  <span>Date</span>
                </label>
                <input
                  type="date"
                  required
                  min={today}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white outline-none focus:border-tastyc-copper"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#a9b8c3] tracking-wider flex items-center space-x-1.5">
                  <Clock className="h-3.5 w-3.5 text-tastyc-copper" />
                  <span>Time</span>
                </label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white outline-none"
                >
                  {['11:00', '12:00', '13:00', '14:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[#a9b8c3] tracking-wider flex items-center space-x-1.5">
                <Armchair className="h-3.5 w-3.5 text-tastyc-copper" />
                <span>Preferred Table (optional)</span>
              </label>
              <select
                value={tableId}
                onChange={(e) => setTableId(e.target.value)}
                className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white outline-none"
              >
                <option value="">No preference — staff will assign</option>
                {suitableTables.map((t) => (
                    <option key={t.id} value={t.id}>
                      Table {t.number}
                      {t.floor?.name ? ` · ${t.floor.name}` : ''} · seats{' '}
                      {t.seatingCapacity ?? t.seating}
                    </option>
                  ))}
              </select>
              {suitableTables.length === 0 && (
                <p className="text-[10px] text-amber-400/90 mt-1">
                  No tables currently match this party size. You can still submit — staff will arrange seating.
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-[#a9b8c3] tracking-wider flex items-center space-x-1.5">
                <FileText className="h-3.5 w-3.5 text-tastyc-copper" />
                <span>Special Instructions / Requests</span>
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white outline-none focus:border-tastyc-copper resize-none"
                placeholder="Allergies, birthday celebrations, preferred seating..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-tastyc-copper hover:bg-tastyc-copperLight text-white font-bold uppercase tracking-widest text-xs transition-all disabled:opacity-50"
            >
              {loading ? 'Submitting Reservation...' : 'Confirm Booking Request'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
