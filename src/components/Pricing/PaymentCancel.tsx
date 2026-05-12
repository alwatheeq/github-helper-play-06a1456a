import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, ArrowLeft } from 'lucide-react';

export const PaymentCancel: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-page-light dark:bg-page-dark flex items-center justify-center p-6">
      <div className="w-[500px] max-w-full bg-card-light dark:bg-card-dark rounded-[var(--s4-radius-card)] shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-divider dark:border-divider-on-dark overflow-hidden">

        {/* Orange header section */}
        <div className="bg-orange-50 dark:bg-orange-900/20 border-b border-orange-200 dark:border-orange-800/60 px-9 py-7 text-center">
          <div className="w-[60px] h-[60px] rounded-full bg-orange-100 dark:bg-orange-900/40 border-2 border-orange-300 dark:border-orange-700 flex items-center justify-center mx-auto mb-3.5 shadow-[0_4px_14px_rgba(251,146,60,0.2)]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h1 className="font-display text-[26px] font-bold text-orange-900 dark:text-orange-200" style={{ letterSpacing: '-0.01em' }}>
            Payment Cancelled
          </h1>
          <p className="text-sm text-orange-700 dark:text-orange-300 mt-1.5 leading-snug">
            No charges have been made to your account.
          </p>
        </div>

        {/* Content */}
        <div className="px-8 py-7">
          {/* Two-col info */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              {
                title: 'Common Issues',
                items: ['Card declined', 'Session timed out', 'Browser back button'],
                dotColor: '#ea580c',
              },
              {
                title: 'What You Can Do',
                items: ['Review payment info', 'Try a different card', 'Contact your bank'],
                dotColor: 'var(--color-accent-gold, #d97706)',
              },
            ].map((col, ci) => (
              <div
                key={ci}
                className="bg-subtle dark:bg-subtle-on-dark border border-divider dark:border-divider-on-dark rounded-[var(--s4-radius-card)] p-3.5"
              >
                <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-muted-ink dark:text-muted-ink-on-dark mb-2.5">
                  {col.title}
                </p>
                {col.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-1.5 mb-1.5 last:mb-0">
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: col.dotColor }}
                    />
                    <span className="text-xs text-secondary-ink dark:text-muted-ink-on-dark">{item}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Support banner */}
          <div className="flex items-center gap-2.5 bg-accent-gold-soft/20 border border-accent-gold/30 rounded-[var(--s4-radius-card)] px-4 py-3 mb-5">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent-gold flex-shrink-0">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-sm text-secondary-ink dark:text-muted-ink-on-dark leading-snug">
              Our support team is ready to help you complete your purchase.
            </p>
          </div>

          {/* Buttons */}
          <div className="space-y-2.5">
            <button
              onClick={() => navigate('/pricing')}
              className="w-full bg-ink dark:bg-ink text-ink-on-dark dark:text-ink font-bold py-3.5 px-6 rounded-[var(--s4-radius-card)] transition duration-[var(--s4-dur-base)] flex items-center justify-center gap-2 hover:opacity-85"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Try Again</span>
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full border border-divider dark:border-divider-on-dark text-secondary-ink dark:text-muted-ink-on-dark font-medium py-3 px-6 rounded-[var(--s4-radius-card)] transition duration-[var(--s4-dur-base)] flex items-center justify-center gap-2 hover:opacity-70"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Return to Dashboard</span>
            </button>
          </div>

          <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark text-center mt-5">
            Questions?{' '}
            <a href="mailto:support@meshfahem.com" className="text-accent-gold hover:underline">
              support@meshfahem.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
