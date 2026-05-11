import React from 'react';
import { X, AlertCircle } from 'lucide-react';
import { ScholarCard, ScholarButton } from '../Scholar';

interface InsufficientCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  creditsRemaining?: number;
  cycleEnd?: string;
}

export const InsufficientCreditsModal: React.FC<InsufficientCreditsModalProps> = ({
  isOpen,
  onClose,
  creditsRemaining = 0,
  cycleEnd
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'soon';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'soon';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <ScholarCard variant="elevated" padding="md" className="max-w-md w-full relative">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-muted-ink dark:text-muted-ink-on-dark hover:opacity-80 transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Icon */}
          <div className="flex items-center justify-center mb-4">
            <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-3">
              <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
          </div>

          {/* Title */}
          <h2 className="s4-h2 text-center text-ink dark:text-ink-on-dark mb-2">
            Insufficient Credits
          </h2>

          {/* Message */}
          <div className="text-center space-y-4 mb-6">
            <p className="text-secondary-ink dark:text-secondary-ink-on-dark">
              You don't have enough credits to complete this action.
            </p>

            <div className="bg-subtle dark:bg-subtle-on-dark rounded-[var(--s4-radius-card)] p-4">
              <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark mb-1">
                Current Balance
              </p>
              <p className="s4-h1 text-ink dark:text-ink-on-dark">
                {creditsRemaining.toLocaleString()} credits
              </p>
            </div>

            <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark">
              Your credits will refresh on{' '}
              <span className="font-semibold text-ink dark:text-ink-on-dark">
                {formatDate(cycleEnd)}
              </span>
            </p>
          </div>

          <ScholarButton
            type="button"
            variant="primary"
            onClick={onClose}
            className="w-full"
          >
            Close
          </ScholarButton>
        </ScholarCard>
      </div>
    </>
  );
};
