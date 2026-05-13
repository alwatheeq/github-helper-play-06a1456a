import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useCredits } from '../../contexts/CreditContext';
import { ErrorLogger } from '../../utils/errorLogger';

const AlertIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

interface BannerConfig {
  wrapperClass: string;
  iconClass: string;
  textClass: string;
  badgeClass: string;
  btnClass: string;
  title: string;
  message: string;
}

export const LowCreditBanner: React.FC = () => {
  const { balance } = useCredits();
  const [showBanner, setShowBanner] = useState(false);
  const [warningLevel, setWarningLevel] = useState<1000 | 500 | 250 | null>(null);

  useEffect(() => {
    if (!balance) return;

    const { credits_remaining } = balance;

    if (credits_remaining <= 250 && warningLevel !== 250) {
      setWarningLevel(250);
      setShowBanner(true);
    } else if (credits_remaining <= 500 && credits_remaining > 250 && warningLevel !== 500) {
      setWarningLevel(500);
      setShowBanner(true);
    } else if (credits_remaining <= 1000 && credits_remaining > 500 && warningLevel !== 1000) {
      setWarningLevel(1000);
      setShowBanner(true);
    } else if (credits_remaining > 1000) {
      setShowBanner(false);
      setWarningLevel(null);
    }
  }, [balance, warningLevel]);

  useEffect(() => {
    const handleLowCreditWarning = (event: CustomEvent) => {
      const { level, creditsRemaining } = event.detail;
      ErrorLogger.debug('Warning triggered', { component: 'LowCreditBanner', action: 'handleLowCreditWarning', level, creditsRemaining });
      setWarningLevel(level);
      setShowBanner(true);
    };

    window.addEventListener('lowCreditWarning', handleLowCreditWarning as EventListener);

    return () => {
      window.removeEventListener('lowCreditWarning', handleLowCreditWarning as EventListener);
    };
  }, []);

  if (!showBanner || !balance || !warningLevel) {
    return null;
  }

  const { credits_remaining, cycle_end } = balance;
  const cycleEndDate = cycle_end ? new Date(cycle_end).toLocaleDateString() : 'unknown date';

  const getConfig = (): BannerConfig | null => {
    switch (warningLevel) {
      case 250:
        return {
          wrapperClass: 'bg-red-50 dark:bg-red-900/20 border-[1.5px] border-red-200 dark:border-red-800/60',
          iconClass: 'text-red-600 dark:text-red-400',
          textClass: 'text-red-800 dark:text-red-200',
          badgeClass: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700',
          btnClass: 'bg-red-600 hover:bg-red-700 text-white shadow-[0_2px_8px_rgba(220,38,38,0.35)]',
          title: 'Credits Critically Low',
          message: `You have only ${credits_remaining.toLocaleString()} credits left. Upgrade now to avoid interruptions. Credits refresh on ${cycleEndDate}.`,
        };
      case 500:
        return {
          wrapperClass: 'bg-amber-50 dark:bg-amber-900/20 border-[1.5px] border-amber-200 dark:border-amber-800/60',
          iconClass: 'text-amber-600 dark:text-amber-400',
          textClass: 'text-amber-900 dark:text-amber-200',
          badgeClass: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700',
          btnClass: 'bg-amber-600 hover:bg-amber-700 text-white shadow-[0_2px_8px_rgba(217,119,6,0.35)]',
          title: 'Running Low on Credits',
          message: `You have ${credits_remaining.toLocaleString()} credits remaining. Consider topping up soon to keep your momentum going. Refreshes on ${cycleEndDate}.`,
        };
      case 1000:
        return {
          wrapperClass: 'bg-yellow-50 dark:bg-yellow-900/20 border-[1.5px] border-yellow-200 dark:border-yellow-800/60',
          iconClass: 'text-yellow-600 dark:text-yellow-400',
          textClass: 'text-yellow-900 dark:text-yellow-200',
          badgeClass: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700',
          btnClass: 'bg-yellow-600 hover:bg-yellow-700 text-white shadow-[0_2px_8px_rgba(202,138,4,0.35)]',
          title: 'Credit Balance Notice',
          message: `Your credit balance is at ${credits_remaining.toLocaleString()}. You're doing great — just a heads up to plan ahead. Refreshes on ${cycleEndDate}.`,
        };
      default:
        return null;
    }
  };

  const config = getConfig();
  if (!config) return null;

  return (
    <div className={`${config.wrapperClass} rounded-[12px] px-[18px] py-[14px] mb-5 animate-in fade-in slide-in-from-top-2 duration-200`}>
      <div className="flex items-start gap-3.5">
        {/* Alert icon */}
        <div className={`flex-shrink-0 mt-[1px] ${config.iconClass}`}>
          <AlertIcon />
        </div>

        {/* Text content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[13px] font-bold ${config.textClass}`}>{config.title}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[10px] ${config.badgeClass}`}>
              {credits_remaining.toLocaleString()} credits
            </span>
          </div>
          <p className={`text-[12px] leading-relaxed ${config.textClass} opacity-85`}>
            {config.message}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href="/pricing"
            className={`px-3.5 py-[7px] text-[12px] font-bold rounded-[8px] whitespace-nowrap transition-opacity ${config.btnClass}`}
          >
            Top Up
          </a>
          <button
            onClick={() => setShowBanner(false)}
            className={`w-[26px] h-[26px] flex items-center justify-center rounded-[7px] border ${config.badgeClass} hover:opacity-70 transition-opacity`}
            aria-label="Dismiss warning"
          >
            <X className="h-[11px] w-[11px]" />
          </button>
        </div>
      </div>
    </div>
  );
};
