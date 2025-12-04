import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// Toast types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
  title?: string;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, options?: { title?: string; duration?: number }) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((
    message: string, 
    type: ToastType = 'info', 
    options?: { title?: string; duration?: number }
  ) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const duration = options?.duration ?? (type === 'error' ? 5000 : 3000);
    
    const newToast: Toast = {
      id,
      message,
      type,
      title: options?.title,
      duration,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((message: string, title?: string) => {
    showToast(message, 'success', { title });
  }, [showToast]);

  const error = useCallback((message: string, title?: string) => {
    showToast(message, 'error', { title, duration: 5000 });
  }, [showToast]);

  const warning = useCallback((message: string, title?: string) => {
    showToast(message, 'warning', { title, duration: 4000 });
  }, [showToast]);

  const info = useCallback((message: string, title?: string) => {
    showToast(message, 'info', { title });
  }, [showToast]);

  const clearAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, showToast, success, error, warning, info, removeToast, clearAll }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// Toast Container Component
function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none lg:top-6 lg:right-6">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

// Individual Toast Item
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const getStyles = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-[#ECFDF5] dark:bg-[#064E3B]/90',
          border: 'border-[#00A63E] dark:border-[#4ADE80]',
          icon: <CheckCircle className="w-5 h-5 text-[#00A63E] dark:text-[#4ADE80]" />,
          titleColor: 'text-[#065F46] dark:text-[#4ADE80]',
          messageColor: 'text-[#047857] dark:text-[#6EE7B7]',
        };
      case 'error':
        return {
          bg: 'bg-[#FEF2F2] dark:bg-[#7F1D1D]/90',
          border: 'border-[#D4183D] dark:border-[#F87171]',
          icon: <AlertCircle className="w-5 h-5 text-[#D4183D] dark:text-[#F87171]" />,
          titleColor: 'text-[#991B1B] dark:text-[#F87171]',
          messageColor: 'text-[#B91C1C] dark:text-[#FCA5A5]',
        };
      case 'warning':
        return {
          bg: 'bg-[#FFFBEB] dark:bg-[#78350F]/90',
          border: 'border-[#F59E0B] dark:border-[#FCD34D]',
          icon: <AlertTriangle className="w-5 h-5 text-[#F59E0B] dark:text-[#FCD34D]" />,
          titleColor: 'text-[#92400E] dark:text-[#FCD34D]',
          messageColor: 'text-[#B45309] dark:text-[#FDE68A]',
        };
      case 'info':
      default:
        return {
          bg: 'bg-[#EEF2FF] dark:bg-[#312E81]/90',
          border: 'border-[#6366F1] dark:border-[#A78BFA]',
          icon: <Info className="w-5 h-5 text-[#6366F1] dark:text-[#A78BFA]" />,
          titleColor: 'text-[#3730A3] dark:text-[#A78BFA]',
          messageColor: 'text-[#4338CA] dark:text-[#C4B5FD]',
        };
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`
        pointer-events-auto flex items-start gap-3 p-4 rounded-xl border-l-4 shadow-lg
        ${styles.bg} ${styles.border}
        animate-in slide-in-from-right-5 fade-in duration-300
        backdrop-blur-sm
      `}
    >
      <div className="flex-shrink-0 mt-0.5">
        {styles.icon}
      </div>
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className={`font-semibold text-sm ${styles.titleColor}`}>
            {toast.title}
          </p>
        )}
        <p className={`text-sm ${styles.messageColor} ${toast.title ? 'mt-0.5' : ''}`}>
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
      >
        <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </button>
    </div>
  );
}

// Hook to use toast
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
