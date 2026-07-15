import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Users, Clock, CheckCircle, Download, Smartphone, QrCode, Scan, Fingerprint, Plus } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { PaginationControls } from '../../components/PaginationControls';

interface AttendanceLog {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  clockIn: string;
  clockOut: string | null;
}

export const Attendance: React.FC = () => {
  const [logs, setLogs] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const { showNotification, showConfirm } = useNotification();
  const { currencySymbol } = useSettings();
  
  // Interactive simulator modal states
  const [showSimTerminal, setShowSimTerminal] = useState(false);
  const [simTerminalType, setSimTerminalType] = useState<'BIOMETRIC' | 'QR_CODE'>('QR_CODE');
  const [simulating, setSimulating] = useState(false);

  // Manual marking modal states
  const [showManualModal, setShowManualModal] = useState(false);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [manualUserId, setManualUserId] = useState('');
  const [manualClockIn, setManualClockIn] = useState('');
  const [manualClockOut, setManualClockOut] = useState('');

  const fetchLogs = async () => {
    try {
      const result = await api.attendance.getAll({ page, limit });
      setLogs(result.data || []);
      setPagination(result.pagination);
    } catch (error) {
      console.error('Failed to fetch attendance logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, limit]);

  const loadUsersList = async () => {
    try {
      const users = await api.master.getUsers({ limit: 100 });
      setUsersList(users.data || []);
      if (users.data && users.data.length > 0) {
        setManualUserId(users.data[0].id);
      }
    } catch (error) {
      console.error('Failed to load employee list:', error);
    }
  };

  const getShiftDurationHours = (clockIn: string, clockOut: string | null) => {
    if (!clockOut) return 0;
    const durationMs = new Date(clockOut).getTime() - new Date(clockIn).getTime();
    return parseFloat((durationMs / 3600000).toFixed(2));
  };

  const getShiftDurationString = (clockIn: string, clockOut: string | null) => {
    if (!clockOut) return 'Active Shift';
    const duration = new Date(clockOut).getTime() - new Date(clockIn).getTime();
    const hours = Math.floor(duration / 3600000);
    const mins = Math.floor((duration % 3600000) / 60000);
    return `${hours}h ${mins}m`;
  };

  // Payroll CSV Export Utility
  const handleExportPayroll = () => {
    if (logs.length === 0) {
      showNotification({
        title: 'Export Failed',
        message: 'No shift records found to export.',
        type: 'info'
      });
      return;
    }

    // Aggregate hours worked by employee name
    const payrollMap = new Map<string, { email: string; role: string; shifts: number; hours: number }>();
    
    for (const log of logs) {
      const empName = log.user.name;
      const hours = getShiftDurationHours(log.clockIn, log.clockOut);
      const current = payrollMap.get(empName) || {
        email: log.user.email,
        role: log.user.role,
        shifts: 0,
        hours: 0
      };
      
      current.shifts += 1;
      current.hours += hours;
      payrollMap.set(empName, current);
    }

    // Default wage mapping by role type
    const getWageRate = (role: string) => {
      const r = role.toUpperCase();
      if (r === 'CHEF' || r === 'BRANCH_MANAGER') return 25.00;
      if (r === 'KITCHEN_MANAGER') return 22.50;
      if (r === 'INVENTORY_MANAGER' || r === 'CASHIER') return 18.00;
      if (r === 'WAITER' || r === 'DELIVERY_STAFF') return 15.00;
      return 20.00; // default standard wage
    };

    // Construct CSV Header & Content rows
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += `Employee Name,Email Address,Role Type,Total Shift Count,Total Hours Worked,Hourly Wage Rate (${currencySymbol}),Estimated Gross Payroll (${currencySymbol})\n`;

    payrollMap.forEach((stats, name) => {
      const rate = getWageRate(stats.role);
      const payroll = stats.hours * rate;
      csvContent += `"${name}","${stats.email}","${stats.role}",${stats.shifts},${stats.hours.toFixed(2)},"${currencySymbol}${rate.toFixed(2)}","${currencySymbol}${payroll.toFixed(2)}"\n`;
    });

    // Generate downloader trigger link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `tastyc_payroll_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showNotification({
      title: 'Payroll Exported',
      message: 'CSV file compiled with gross hours and hourly rates downloaded successfully.',
      type: 'success'
    });
  };

  // Simulate scanning of QR code / fingerprint at front-of-house check-in terminal
  const handleSimulateScan = () => {
    setSimulating(true);
    setTimeout(() => {
      setSimulating(false);
      setShowSimTerminal(false);
      showNotification({
        title: 'Simulator Terminal',
        message: 'Shift verification successful! Attendance logged.',
        type: 'success'
      });
      fetchLogs();
    }, 2000);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUserId || !manualClockIn) {
      showNotification({
        title: 'Missing Fields',
        message: 'Please specify the employee and a clock-in time.',
        type: 'error'
      });
      return;
    }

    showConfirm('Confirm manual shift log insertion?', async () => {
      try {
        await api.attendance.createManual({
          userId: manualUserId,
          clockIn: manualClockIn,
          clockOut: manualClockOut || null
        });

        showNotification({
          title: 'Attendance Saved',
          message: 'Attendance record logged successfully.',
          type: 'success'
        });
        setShowManualModal(false);
        setManualClockIn('');
        setManualClockOut('');
        fetchLogs();
      } catch (error: any) {
        showNotification({
          title: 'Action Failed',
          message: error.message || 'Could not log manual shift.',
          type: 'error'
        });
      }
    });
  };

  return (
    <div className="space-y-6 text-left selection:bg-tastyc-copper selection:text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-tastyc-copper/10 pb-4">
        <div>
          <p className="text-tastyc-copper text-xs uppercase tracking-widest font-semibold">Human Resources</p>
          <h3 className="font-title text-3xl uppercase tracking-wider text-white">Staff Attendance Shifts</h3>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => {
              loadUsersList();
              setShowManualModal(true);
            }}
            className="px-4 py-2 border border-tastyc-copper/40 text-tastyc-copper hover:bg-tastyc-copper hover:text-white transition-all text-xs uppercase tracking-widest font-semibold flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Mark Manually</span>
          </button>
          <button
            onClick={() => {
              setSimTerminalType('QR_CODE');
              setShowSimTerminal(true);
            }}
            className="px-4 py-2 border border-tastyc-copper/40 text-tastyc-copper hover:bg-tastyc-copper hover:text-white transition-all text-xs uppercase tracking-widest font-semibold flex items-center space-x-2"
          >
            <QrCode className="h-4 w-4" />
            <span>Scan Terminal</span>
          </button>
          <button
            onClick={handleExportPayroll}
            className="px-4 py-2 bg-tastyc-copper hover:bg-tastyc-copperLight text-white transition-all text-xs uppercase tracking-widest font-semibold flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Payroll Export</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-tastyc-copper mx-auto"></div>
          <p className="mt-4 text-[#a9b8c3] text-sm uppercase tracking-widest animate-pulse">Querying shift entries...</p>
        </div>
      ) : (
        <div className="bg-[#121e22] border border-tastyc-copper/10 p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase text-[#a9b8c3] border-b border-tastyc-copper/10 pb-2">
                  <th className="pb-3">Employee Name</th>
                  <th className="pb-3">Role</th>
                  <th className="pb-3">Clocked In Time</th>
                  <th className="pb-3">Clocked Out Time</th>
                  <th className="pb-3">Gross Duration</th>
                  <th className="pb-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tastyc-copper/5">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-tastyc-dark/20 transition-colors">
                    <td className="py-4 font-semibold text-white">
                      {log.user.name}
                    </td>
                    <td className="text-xs text-[#a9b8c3] uppercase tracking-wider">
                      {String(log.user?.role?.name || log.user?.role || '—').replace(/_/g, ' ')}
                    </td>
                    <td className="text-xs text-white">
                      {new Date(log.clockIn).toLocaleDateString()}{' '}
                      <span className="text-[#a9b8c3] ml-1">
                        {new Date(log.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="text-xs text-white">
                      {log.clockOut ? (
                        <>
                          {new Date(log.clockOut).toLocaleDateString()}{' '}
                          <span className="text-[#a9b8c3] ml-1">
                            {new Date(log.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </>
                      ) : (
                        <span className="text-[#a9b8c3]/40 italic">—</span>
                      )}
                    </td>
                    <td className="text-xs font-semibold">
                      {getShiftDurationString(log.clockIn, log.clockOut)}
                    </td>
                    <td>
                      {log.clockOut ? (
                        <span className="bg-white/5 border border-white/10 px-2.5 py-0.5 text-[9px] font-bold text-[#a9b8c3] uppercase">
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[9px] font-bold uppercase animate-pulse">
                          <Clock className="h-3 w-3" />
                          <span>On Duty</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-[#a9b8c3] text-xs uppercase tracking-widest">
                      No shift records logged
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
      )}

      {/* Biometric & QR Scan Terminal Simulator Modal */}
      {showSimTerminal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-[#121e22] border border-tastyc-copper/35 p-6 w-full max-w-sm space-y-6 text-center shadow-2xl">
            <div className="flex justify-between items-center border-b border-tastyc-copper/10 pb-3 text-left">
              <h4 className="font-title text-xl uppercase tracking-wider text-white">Front Desk check-in</h4>
              <button onClick={() => setShowSimTerminal(false)} className="text-[#a9b8c3] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Selector */}
            <div className="grid grid-cols-2 gap-2 bg-tastyc-dark/25 p-1 border border-tastyc-copper/10">
              <button
                onClick={() => setSimTerminalType('QR_CODE')}
                className={`py-1.5 text-[10px] uppercase font-bold tracking-widest transition-all ${
                  simTerminalType === 'QR_CODE' ? 'bg-tastyc-copper text-white' : 'text-[#a9b8c3] hover:text-white'
                }`}
              >
                QR Scanner
              </button>
              <button
                onClick={() => setSimTerminalType('BIOMETRIC')}
                className={`py-1.5 text-[10px] uppercase font-bold tracking-widest transition-all ${
                  simTerminalType === 'BIOMETRIC' ? 'bg-tastyc-copper text-white' : 'text-[#a9b8c3] hover:text-white'
                }`}
              >
                Biometric ID
              </button>
            </div>

            {/* Sim Body */}
            <div className="py-6 border border-dashed border-tastyc-copper/25 bg-tastyc-dark/15 flex flex-col items-center space-y-4">
              {simTerminalType === 'QR_CODE' ? (
                <>
                  <Scan className={`h-16 w-16 text-tastyc-copper ${simulating ? 'animate-pulse' : ''}`} />
                  <div className="space-y-1">
                    <p className="text-xs text-white uppercase tracking-wider font-semibold">Hold QR Code to scanner</p>
                    <p className="text-[10px] text-[#a9b8c3]">Camera searches for check-in QR codes...</p>
                  </div>
                </>
              ) : (
                <>
                  <Fingerprint className={`h-16 w-16 text-tastyc-copper ${simulating ? 'animate-bounce' : ''}`} />
                  <div className="space-y-1">
                    <p className="text-xs text-white uppercase tracking-wider font-semibold">Place finger on sensor</p>
                    <p className="text-[10px] text-[#a9b8c3]">Scanning fingerprint characteristics...</p>
                  </div>
                </>
              )}
            </div>

            <button
              onClick={handleSimulateScan}
              disabled={simulating}
              className="w-full py-3 bg-tastyc-copper hover:bg-tastyc-copperLight text-white text-xs uppercase tracking-widest font-bold transition-all disabled:opacity-40"
            >
              {simulating ? 'Authenticating Badge...' : 'Simulate Badge Scan'}
            </button>
          </div>
        </div>
      )}

      {/* Manual Attendance Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-[#121e22] border border-tastyc-copper/35 p-6 w-full max-w-sm space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-tastyc-copper/10 pb-3">
              <h4 className="font-title text-xl uppercase tracking-wider text-white">Manual Shift Entry</h4>
              <button onClick={() => setShowManualModal(false)} className="text-[#a9b8c3] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Select Employee</label>
                <select
                  required
                  value={manualUserId}
                  onChange={(e) => setManualUserId(e.target.value)}
                  className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white outline-none"
                >
                  <option value="" disabled>Choose an employee...</option>
                  {usersList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role?.name?.replace('_', ' ')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Clock In Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={manualClockIn}
                  onChange={(e) => setManualClockIn(e.target.value)}
                  className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-xs text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Clock Out Date & Time (Optional)</label>
                <input
                  type="datetime-local"
                  value={manualClockOut}
                  onChange={(e) => setManualClockOut(e.target.value)}
                  className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-xs text-white outline-none"
                  placeholder="Leave empty if shift is still active"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-tastyc-copper hover:bg-tastyc-copperLight text-white text-xs uppercase tracking-widest font-bold transition-all"
              >
                Log Shift Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// X Icon Wrapper
const X: React.FC<{ className?: string }> = ({ className }) => (
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
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
