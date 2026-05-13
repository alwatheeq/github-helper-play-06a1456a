import React from 'react';

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
  cycleEnd,
}) => {
  if (!isOpen) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'soon';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return 'soon';
    }
  };

  const cycleEndDate = formatDate(cycleEnd);

  // Days until refresh
  const daysUntilRefresh = cycleEnd
    ? Math.max(0, Math.ceil((new Date(cycleEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[5px] z-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-[540px] max-w-full bg-card-light dark:bg-card-dark rounded-[var(--s4-radius-card)] shadow-[0_24px_70px_rgba(0,0,0,0.4)] border border-divider dark:border-divider-on-dark overflow-hidden">

          {/* Red top band */}
          <div className="bg-gradient-to-br from-red-500 to-red-700 px-7 py-6 relative">
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-3.5 right-3.5 w-6 h-6 flex items-center justify-center rounded bg-white/15 hover:bg-white/25 transition-colors"
              aria-label="Close"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            <p className="text-[10px] font-bold tracking-[0.14em] uppercase text-white/65 mb-1.5">
              Credits Exhausted
            </p>
            <h2 className="font-display text-[22px] font-bold text-white mb-4" style={{ letterSpacing: '-0.01em' }}>
              Insufficient Credits
            </h2>

            {/* Credit meter */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] font-semibold text-white/70">
                  {creditsRemaining.toLocaleString()} of 10 credits remaining
                </span>
                <span className="text-[11px] text-white/70">Free plan</span>
              </div>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{ width: `${Math.min(100, (creditsRemaining / 10) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-7 py-6">
            <p className="text-sm text-secondary-ink dark:text-muted-ink-on-dark leading-relaxed mb-5">
              You've used all your credits for this cycle. Upgrade to continue processing
              documents and generating study materials without interruption.
            </p>

            {/* Two info chips */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {daysUntilRefresh !== null && (
                <div className="bg-subtle dark:bg-subtle-on-dark border border-divider dark:border-divider-on-dark rounded-[var(--s4-radius-card)] p-3.5">
                  <p className="text-[10px] font-bold tracking-[0.08em] uppercase text-muted-ink dark:text-muted-ink-on-dark mb-1">
                    Refreshes in
                  </p>
                  <p className="text-[15px] font-bold text-ink dark:text-ink-on-dark leading-none">
                    {daysUntilRefresh} day{daysUntilRefresh !== 1 ? 's' : ''}
                  </p>
                  <p className="text-[10px] text-muted-ink dark:text-muted-ink-on-dark mt-0.5">
                    {cycleEndDate}
                  </p>
                </div>
              )}
              <div className="bg-subtle dark:bg-subtle-on-dark border border-divider dark:border-divider-on-dark rounded-[var(--s4-radius-card)] p-3.5">
                <p className="text-[10px] font-bold tracking-[0.08em] uppercase text-muted-ink dark:text-muted-ink-on-dark mb-1">
                  Pro plan gives
                </p>
                <p className="text-[15px] font-bold text-accent-gold leading-none">
                  200 credits
                </p>
                <p className="text-[10px] text-muted-ink dark:text-muted-ink-on-dark mt-0.5">
                  per month
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2.5">
              <a
                href="/pricing"
                className="flex-[2] h-11 flex items-center justify-center text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-[var(--s4-radius-card)] transition-colors"
              >
                Upgrade Plan
              </a>
              <button
                onClick={onClose}
                className="flex-1 h-11 flex items-center justify-center text-sm font-medium text-muted-ink dark:text-muted-ink-on-dark border-[1.5px] border-divider dark:border-divider-on-dark rounded-[var(--s4-radius-card)] hover:opacity-70 transition-opacity"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
