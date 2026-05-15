import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Home, ArrowRight } from 'lucide-react';
import { useSubscription } from '../../hooks/useSubscription';
import { useAuth } from '../../hooks/useAuth';
import { useCredits } from '../../contexts/CreditContext';
import { SUBSCRIPTION_PROCESSING_PAYWALL_SESSION_KEY } from '../../contexts/PersistentModalContext';
import { verifySubscriptionCreditsAfterCheckout } from '../../utils/postSubscribeCredits';
import { ErrorLogger } from '../../utils/errorLogger';

export const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { refresh } = useSubscription();
  const { refreshBalance } = useCredits();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    void (async () => {
      if (user?.id) {
        const v = await verifySubscriptionCreditsAfterCheckout(user.id);
        if (!v.ok) {
          ErrorLogger.warn('Credits verification after payment success', {
            component: 'PaymentSuccess',
            action: 'verifySubscriptionCreditsAfterCheckout',
            metadata: { message: v.userMessage },
          });
        }
      }
      await Promise.all([refresh(), refreshBalance()]);
      window.dispatchEvent(new CustomEvent('creditUpdated'));
    })();
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(SUBSCRIPTION_PROCESSING_PAYWALL_SESSION_KEY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot after checkout
  }, [user?.id]);

  const whatNext = [
    { label: 'Generate summaries & flashcards from any document', bg: '#dcfce7', col: '#16a34a' },
    { label: 'Save your work to library for future reference',       bg: '#dbeafe', col: '#2563eb' },
    { label: 'Join study rooms and collaborate with peers',          bg: '#fce7f3', col: '#db2777' },
    { label: 'Track your progress and earn achievements',            bg: '#fef3c7', col: '#d97706' },
  ];

  return (
    <div className="min-h-screen bg-page-light dark:bg-page-dark flex items-center justify-center p-6">
      <div className="w-[520px] max-w-full bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark rounded-[22px] overflow-hidden">

        {/* Dark top band */}
        <div className="bg-sidebar px-[40px] pt-[30px] pb-12 relative text-center overflow-hidden">
          {/* Decorative dots */}
          {[
            { l: 32,  t: 18, s: 7, o: 0.35 },
            { l: 460, t: 12, s: 5, o: 0.25 },
            { l: 80,  t: 52, s: 4, o: 0.20 },
            { l: 400, t: 48, s: 6, o: 0.30 },
            { l: 220, t: 8,  s: 3, o: 0.15 },
          ].map((d, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-accent-gold"
              style={{ left: d.l, top: d.t, width: d.s, height: d.s, opacity: d.o }}
            />
          ))}
          <h1 className="font-display text-[30px] font-bold text-ink-on-dark relative" style={{ letterSpacing: '-0.02em' }}>
            Welcome Aboard!
          </h1>
          <p className="text-sm text-ink-on-dark/60 mt-1.5 relative">
            Your subscription is now active
          </p>
        </div>

        {/* Floating green checkmark badge */}
        <div className="flex justify-center -mt-7">
          <div className="w-14 h-14 rounded-full bg-green-600 border-[3px] border-card-light dark:border-card-dark flex items-center justify-center shadow-[0_4px_16px_rgba(22,163,74,0.3)]">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="px-9 pb-8 pt-5">
          <p className="text-sm text-secondary-ink dark:text-muted-ink-on-dark text-center leading-relaxed mb-6">
            You now have full access to all premium features. Start exploring what MeshFahem has to offer.
          </p>

          {/* What's next */}
          <div className="bg-subtle dark:bg-subtle-on-dark border border-divider dark:border-divider-on-dark rounded-[14px] p-5 mb-6">
            <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-muted-ink dark:text-muted-ink-on-dark mb-4">
              What's Next?
            </p>
            <div className="space-y-2.5">
              {whatNext.map(({ label, bg, col }, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <div
                    className="w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: bg }}
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <span className="text-sm text-secondary-ink dark:text-muted-ink-on-dark leading-snug">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-2.5">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-accent-gold hover:opacity-90 text-ink-on-dark font-bold py-[13px] px-6 rounded-[11px] transition flex items-center justify-center gap-2"
            >
              <Home className="h-5 w-5" />
              <span>Start Using the App</span>
              <ArrowRight className="h-5 w-5" />
            </button>

            <button
              onClick={() => navigate('/profile/subscription')}
              className="w-full border border-divider dark:border-divider-on-dark hover:opacity-70 text-secondary-ink dark:text-muted-ink-on-dark font-medium py-[11px] px-6 rounded-[11px] transition"
            >
              View Subscription Details
            </button>
          </div>

          {sessionId && (
            <p className="text-xs text-muted-ink dark:text-muted-ink-on-dark text-center mt-5">
              Session ID: {sessionId}
            </p>
          )}

          <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark text-center mt-4">
            Need help?{' '}
            <a href="mailto:support@meshfahem.com" className="text-accent-gold hover:underline">
              support@meshfahem.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
