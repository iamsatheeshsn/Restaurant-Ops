import React, { createContext, useContext, useState } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

interface NotificationOptions {
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
}

interface NotificationContextType {
  showNotification: (options: NotificationOptions) => void;
  showConfirm: (message: string, onConfirm: () => void, title?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [popup, setPopup] = useState<NotificationOptions | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMsg, setConfirmMsg] = useState('');
  const [confirmTitle, setConfirmTitle] = useState('Confirmation');
  const [confirmCallback, setConfirmCallback] = useState<(() => void) | null>(null);

  const showNotification = (options: NotificationOptions) => {
    setPopup({
      title: options.title,
      message: options.message,
      type: options.type || 'info',
    });
  };

  const showConfirm = (message: string, onConfirm: () => void, title = 'Confirmation') => {
    setConfirmMsg(message);
    setConfirmTitle(title);
    setConfirmCallback(() => onConfirm);
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (confirmCallback) confirmCallback();
    setConfirmOpen(false);
  };

  return (
    <NotificationContext.Provider value={{ showNotification, showConfirm }}>
      {children}

      {/* Global Glassy Overlay Popup Modal */}
      {popup && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#121e22] border border-tastyc-copper/35 p-6 w-full max-w-sm space-y-4 shadow-2xl text-center font-body selection:bg-tastyc-copper selection:text-white">
            <div className="flex flex-col items-center space-y-3">
              {popup.type === 'success' ? (
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <CheckCircle className="h-6 w-6" />
                </div>
              ) : popup.type === 'error' ? (
                <div className="h-12 w-12 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
                  <XCircle className="h-6 w-6" />
                </div>
              ) : (
                <div className="h-12 w-12 rounded-full bg-tastyc-copper/10 border border-tastyc-copper/30 flex items-center justify-center text-tastyc-copper">
                  <Info className="h-6 w-6" />
                </div>
              )}
              <h4 className="font-title text-xl uppercase tracking-wider text-white">{popup.title}</h4>
              <p className="text-xs text-[#a9b8c3] leading-relaxed">{popup.message}</p>
            </div>
            <button
              onClick={() => setPopup(null)}
              className="w-full py-2.5 bg-tastyc-copper hover:bg-tastyc-copperLight text-white text-xs uppercase tracking-widest font-bold transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Global Glassy Confirm Dialog Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-[#121e22] border border-tastyc-copper/35 p-6 w-full max-w-sm space-y-4 shadow-2xl text-center font-body selection:bg-tastyc-copper selection:text-white">
            <div className="flex flex-col items-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Info className="h-6 w-6" />
              </div>
              <h4 className="font-title text-xl uppercase tracking-wider text-white">{confirmTitle}</h4>
              <p className="text-xs text-[#a9b8c3] leading-relaxed">{confirmMsg}</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 py-2.5 border border-tastyc-copper/30 hover:border-tastyc-copper text-[#a9b8c3] hover:text-white text-xs uppercase tracking-widest font-bold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-2.5 bg-tastyc-copper hover:bg-tastyc-copperLight text-white text-xs uppercase tracking-widest font-bold transition-all"
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within a NotificationProvider');
  return context;
};
