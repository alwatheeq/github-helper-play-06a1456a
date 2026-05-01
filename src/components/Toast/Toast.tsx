import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { toErrorMessage } from '../../utils/errorHandler';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (type: ToastType, message: string, duration?: number) => void;
  hideToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((type: ToastType, message: string, duration: number = 5000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { id, type, message: toErrorMessage(message as unknown), duration };

    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        hideToast(id);
      }, duration);
    }
  }, []);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const success = useCallback((message: string, duration?: number) => {
    showToast('success', message, duration);
  }, [showToast]);

  const error = useCallback((message: string, duration?: number) => {
    showToast('error', message, duration);
  }, [showToast]);

  const warning = useCallback((message: string, duration?: number) => {
    showToast('warning', message, duration);
  }, [showToast]);

  const info = useCallback((message: string, duration?: number) => {
    showToast('info', message, duration);
  }, [showToast]);

  const contextValue = useMemo(() => ({
    toasts,
    showToast,
    hideToast,
    success,
    error,
    warning,
    info
  }), [toasts, showToast, hideToast, success, error, warning, info]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onClose={hideToast} />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-md">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const barColor = (() => {
    switch (toast.type) {
      case 'success': return 'bg-green-500';
      case 'error':   return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'info':
      default:        return 'bg-accent-gold';
    }
  })();

  const iconClasses = 'h-5 w-5 flex-shrink-0';
  const icon = (() => {
    switch (toast.type) {
      case 'success': return <CheckCircle className={`${iconClasses} text-green-600 dark:text-green-400`} />;
      case 'error':   return <XCircle className={`${iconClasses} text-red-600 dark:text-red-400`} />;
      case 'warning': return <AlertCircle className={`${iconClasses} text-yellow-600 dark:text-yellow-400`} />;
      case 'info':
      default:        return <Info className={`${iconClasses} text-accent-gold`} />;
    }
  })();

  return (
    <div
      role="status"
      className={
        'relative flex items-start gap-3 pl-4 pr-3 py-3 ' +
        'bg-card-light dark:bg-card-dark ' +
        'border border-divider dark:border-divider-on-dark ' +
        'rounded-[6px] shadow-[var(--scholar-shadow-md)] ' +
        'overflow-hidden animate-fadeIn'
      }
    >
      <span className={`absolute left-0 top-0 bottom-0 w-1 ${barColor}`} aria-hidden="true" />
      {icon}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink dark:text-ink-on-dark">
          {toast.message}
        </p>
      </div>
      <button
        type="button"
        onClick={() => onClose(toast.id)}
        aria-label="Dismiss"
        className="flex-shrink-0 p-1 rounded text-muted-ink dark:text-muted-ink-on-dark hover:opacity-70 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};
