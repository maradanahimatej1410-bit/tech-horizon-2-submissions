/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Floating container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => {
          let Icon = Info;
          let bgColor = 'border-blue-500/20 bg-slate-900/90 text-blue-400';
          
          if (toast.type === 'success') {
            Icon = CheckCircle;
            bgColor = 'border-emerald-500/20 bg-slate-900/90 text-emerald-400';
          } else if (toast.type === 'error') {
            Icon = AlertCircle;
            bgColor = 'border-rose-500/20 bg-slate-900/90 text-rose-400';
          } else if (toast.type === 'warning') {
            Icon = AlertTriangle;
            bgColor = 'border-amber-500/20 bg-slate-900/90 text-amber-400';
          }

          return (
            <div
              key={toast.id}
              className={`flex items-start space-x-3 p-4 rounded-xl border glass shadow-lg pointer-events-auto transition-all duration-300 animate-slideIn ${bgColor}`}
            >
              <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div className="flex-1 text-sm font-medium text-gray-200">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-white transition-colors focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
