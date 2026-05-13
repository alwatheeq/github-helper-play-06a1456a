import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'destructive';
  isLoading?: boolean;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    onConfirm();
  };

  const isDestructive = variant === 'destructive';

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 bg-page bg-opacity-50 backdrop-blur-sm"></div>

      <div className="relative bg-card-light dark:bg-card-dark rounded-[12px] shadow-[0_1px_3px_0_rgba(0,0,0,0.08),0_1px_2px_0_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.18)] max-w-md w-full overflow-hidden animate-scaleIn border border-divider dark:border-divider-on-dark">
        <div className="p-6">
          <div className="flex items-start space-x-4 mb-4">
            {isDestructive && (
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-red-100 shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:bg-red-900/30 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                </div>
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-ink dark:text-ink-on-dark">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-subtle dark:bg-card-dark shadow-[0_2px_8px_rgba(0,0,0,0.08)] dark:hover:bg-card-dark rounded-md transition-colors"
                  aria-label="Close"
                  disabled={isLoading}
                >
                  <X className="h-5 w-5 text-muted-ink dark:text-muted-ink" />
                </button>
              </div>
              <p className="text-sm text-secondary-ink dark:text-muted-ink-on-dark">
                {message}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2.5 text-sm font-medium text-secondary-ink dark:text-muted-ink-on-dark bg-card-light dark:bg-card-dark shadow-[0_2px_8px_rgba(0,0,0,0.08)] border border-divider dark:border-divider-on-dark rounded-md hover:bg-subtle dark:hover:bg-card-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`px-5 py-2.5 text-sm font-medium text-ink-on-dark rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isDestructive
                  ? 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700'
                  : 'bg-card-dark hover:bg-card-dark dark:bg-subtle dark:text-ink dark:hover:bg-subtle'
              }`}
            >
              {isLoading ? 'Processing...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

