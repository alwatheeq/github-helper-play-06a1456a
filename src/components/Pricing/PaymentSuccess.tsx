import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';
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
      await refresh();
      await refreshBalance();
      window.dispatchEvent(new CustomEvent('creditUpdated'));
    })();
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(SUBSCRIPTION_PROCESSING_PAYWALL_SESSION_KEY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot after checkout
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-page-light dark:bg-page-dark flex items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-card-light dark:bg-card-dark rounded-[var(--s4-radius-card)] shadow-[0_1px_3px_0_rgba(0,0,0,0.08),0_1px_2px_0_rgba(0,0,0,0.06)] border border-divider dark:border-divider-on-dark dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.08),0_1px_2px_0_rgba(0,0,0,0.06)] dark:shadow-sm p-8">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-green-100 dark:bg-green-900/30 p-6 rounded-full">
            <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <h1 className="s4-h1 text-ink dark:text-ink-on-dark text-center mb-4">
          Welcome Aboard!
        </h1>

        <p className="text-lg text-secondary-ink dark:text-secondary-ink-on-dark text-center mb-8">
          Your subscription has been activated successfully. You now have full access to all premium features!
        </p>

        <div className="bg-subtle dark:bg-subtle-on-dark rounded-[var(--s4-radius-card)] p-6 mb-8">
          <h2 className="font-semibold text-ink dark:text-ink-on-dark mb-4">What's Next?</h2>
          <ul className="space-y-3">
            <li className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-secondary-ink dark:text-secondary-ink-on-dark">
                Generate unlimited summaries, flashcards, and quizzes
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-secondary-ink dark:text-secondary-ink-on-dark">
                Save your work to your library for future reference
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-secondary-ink dark:text-secondary-ink-on-dark">
                Join study rooms and collaborate with others
              </span>
            </li>
            <li className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-secondary-ink dark:text-secondary-ink-on-dark">
                Track your progress and earn achievements
              </span>
            </li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/')}
            className="w-full bg-accent-gold hover:opacity-90 text-ink-on-dark font-bold py-4 px-6 rounded-[var(--s4-radius-card)] transition duration-200 flex items-center justify-center space-x-2"
          >
            <Home className="h-5 w-5" />
            <span>Start Using the App</span>
            <ArrowRight className="h-5 w-5" />
          </button>

          <button
            onClick={() => navigate('/profile/subscription')}
            className="w-full bg-subtle dark:bg-subtle-on-dark hover:opacity-80 text-secondary-ink dark:text-secondary-ink-on-dark font-semibold py-3 px-6 rounded-[var(--s4-radius-card)] transition duration-200"
          >
            View Subscription Details
          </button>
        </div>

        {sessionId && (
          <div className="mt-6 pt-6 border-t border-divider dark:border-divider-on-dark">
            <p className="text-xs text-muted-ink dark:text-muted-ink-on-dark text-center">
              Session ID: {sessionId}
            </p>
          </div>
        )}

        <div className="mt-6">
          <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark text-center">
            Need help? Contact us at <a href="mailto:support@example.com" className="text-accent-gold hover:underline">support@example.com</a>
          </p>
        </div>
      </div>
    </div>
  );
};
