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

  const isDestructive = variant === 'destructive';

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      <div className="relative bg-card-light dark:bg-card-dark rounded-[12px] max-w-md w-full overflow-hidden animate-scaleIn border border-divider dark:border-divider-on-dark">
        <div className="p-6">
          <div className="flex items-start space-x-4 mb-4">
            {isDestructive && (
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
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
                  className="p-1 hover:bg-subtle dark:hover:bg-subtle-on-dark transition"
                  aria-label="Close"
                  disabled={isLoading}
                >
                  <X className="h-5 w-5 text-muted-ink dark:text-muted-ink-on-dark" />
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
              className="px-5 py-2.5 text-sm font-medium bg-subtle dark:bg-subtle-on-dark border border-divider dark:border-divider-on-dark text-secondary-ink dark:text-muted-ink-on-dark hover:opacity-80 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-5 py-2.5 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${
                isDestructive
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-accent-gold text-ink-on-dark hover:opacity-90'
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
