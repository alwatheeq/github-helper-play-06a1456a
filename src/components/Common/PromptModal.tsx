import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  message?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
  validate?: (value: string) => string | null;
  isLoading?: boolean;
}

export const PromptModal: React.FC<PromptModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  placeholder = 'Enter value',
  defaultValue = '',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  validate,
  isLoading = false,
}) => {
  const [value, setValue] = useState(defaultValue);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
      setError(null);
      // Focus input when modal opens
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isOpen, defaultValue]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleConfirm = () => {
    const trimmedValue = value.trim();
    
    if (!trimmedValue) {
      setError('This field is required');
      return;
    }

    if (validate) {
      const validationError = validate(trimmedValue);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    onConfirm(trimmedValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 bg-page bg-opacity-50 backdrop-blur-sm"></div>

      <div className="relative bg-card-light dark:bg-card-dark rounded-[var(--s4-radius-card)] shadow-[0_1px_3px_0_rgba(0,0,0,0.08),0_1px_2px_0_rgba(0,0,0,0.06)] dark:shadow-[var(--s4-shadow-modal)] max-w-md w-full overflow-hidden animate-scaleIn border border-divider dark:border-divider-on-dark">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
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

          {message && (
            <p className="text-sm text-secondary-ink dark:text-muted-ink-on-dark mb-4">
              {message}
            </p>
          )}

          <div className="mb-4">
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError(null);
              }}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              className={`w-full px-5 py-2.5 border rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 dark:bg-card-dark dark:border-divider-on-dark dark:text-ink-on-dark disabled:opacity-50 disabled:cursor-not-allowed ${
                error
                  ? 'border-red-500 focus-visible:ring-red-500'
                  : 'border-divider dark:border-divider-on-dark'
              }`}
            />
            {error && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3">
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
              className="px-5 py-2.5 text-sm font-medium text-ink-on-dark bg-card-dark shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:bg-card-dark dark:bg-subtle dark:text-ink dark:hover:bg-subtle rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

