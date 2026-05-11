import React from 'react';
import { useNavigate } from 'react-router-dom';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

export const PaymentCancel: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-page-light dark:bg-page-dark flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-card-light dark:bg-card-dark rounded-[var(--s4-radius-card)] shadow-[0_1px_3px_0_rgba(0,0,0,0.08),0_1px_2px_0_rgba(0,0,0,0.06)] border border-divider dark:border-divider-on-dark dark:shadow-[0_1px_3px_0_rgba(0,0,0,0.08),0_1px_2px_0_rgba(0,0,0,0.06)] dark:shadow-sm p-8">
        <div className="flex items-center justify-center mb-6">
          <div className="bg-orange-100 dark:bg-orange-900/30 p-6 rounded-full">
            <XCircle className="h-16 w-16 text-orange-600 dark:text-orange-400" />
          </div>
        </div>

        <h1 className="s4-h1 text-ink dark:text-ink-on-dark text-center mb-4">
          Payment Canceled
        </h1>

        <p className="text-lg text-secondary-ink dark:text-secondary-ink-on-dark text-center mb-8">
          Your payment was canceled. No charges have been made to your account.
        </p>

        <div className="bg-subtle dark:bg-subtle-on-dark rounded-[var(--s4-radius-card)] p-6 mb-8">
          <h2 className="font-semibold text-ink dark:text-ink-on-dark mb-3">Need assistance?</h2>
          <p className="text-sm text-secondary-ink dark:text-secondary-ink-on-dark mb-3">
            If you encountered any issues during checkout or have questions about our plans, we're here to help!
          </p>
          <ul className="space-y-2 text-sm text-muted-ink dark:text-muted-ink-on-dark">
            <li>• Review our pricing and features</li>
            <li>• Contact support if you need help</li>
            <li>• Try again when you're ready</li>
          </ul>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => navigate('/pricing')}
            className="w-full bg-accent-gold hover:opacity-90 text-ink-on-dark font-bold py-4 px-6 rounded-[var(--s4-radius-card)] transition duration-200 flex items-center justify-center space-x-2"
          >
            <RefreshCw className="h-5 w-5" />
            <span>Try Again</span>
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full bg-subtle dark:bg-subtle-on-dark hover:opacity-80 text-secondary-ink dark:text-secondary-ink-on-dark font-semibold py-3 px-6 rounded-[var(--s4-radius-card)] transition duration-200 flex items-center justify-center space-x-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Return to Dashboard</span>
          </button>
        </div>

        <div className="mt-6">
          <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark text-center">
            Questions? Contact us at <a href="mailto:support@example.com" className="text-accent-gold hover:underline">support@example.com</a>
          </p>
        </div>
      </div>
    </div>
  );
};
