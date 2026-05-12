import React from 'react';
import { X, Crown, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../../contexts/I18nContext';
import { ScholarCard, ScholarButton } from '../Scholar';

interface PersistentSubscriptionModalProps {
  isOpen: boolean;
  onDismiss: () => void;
  featureName: string;
  featureTitle: string;
  benefits: string[];
}

export const PersistentSubscriptionModal: React.FC<PersistentSubscriptionModalProps> = ({
  isOpen,
  onDismiss,
  featureName: _featureName,
  featureTitle,
  benefits
}) => {
  const navigate = useNavigate();
  const { t: _t } = useI18n();

  if (!isOpen) return null;

  const handleViewPlans = () => {
    onDismiss();
    navigate('/pricing');
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      <div className="absolute inset-0 bg-page bg-opacity-70 backdrop-blur-md"></div>

      <ScholarCard variant="elevated" padding="none" className="relative max-w-lg w-full overflow-hidden animate-scaleIn">
        <div className="bg-accent-gold p-6 text-white relative">
          <button
            onClick={onDismiss}
            className="absolute top-4 right-4 p-2 hover:bg-card-light dark:bg-card-dark hover:bg-opacity-20 rounded-[var(--s4-radius-card)] transition-colors duration-[var(--s4-dur-fast)] group"
            aria-label="Close"
          >
            <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-[var(--s4-dur-base)]" />
          </button>

          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-card-light dark:bg-card-dark bg-opacity-20 p-3 rounded-md backdrop-blur-sm">
              <Crown className="h-8 w-8" />
            </div>
            <div>
              <h2 className="s4-h2">Upgrade to Premium</h2>
              <p className="text-ink-on-dark text-opacity-90 text-sm">Unlock unlimited access</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles className="h-5 w-5 text-accent-gold" />
              <h3 className="font-semibold text-ink dark:text-ink-on-dark text-lg">
                {featureTitle}
              </h3>
            </div>
            <p className="text-secondary-ink dark:text-secondary-ink-on-dark text-sm">
              This feature requires a premium subscription. Upgrade now to unlock this and many other powerful features.
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <p className="text-sm font-semibold text-secondary-ink dark:text-secondary-ink-on-dark">
              Premium includes:
            </p>
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-secondary-ink dark:text-secondary-ink-on-dark">{benefit}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col space-y-3">
            <ScholarButton
              variant="primary"
              onClick={handleViewPlans}
              className="w-full"
              icon={<ArrowRight className="h-5 w-5" />}
              iconPosition="right"
            >
              View Plans &amp; Pricing
            </ScholarButton>
            <button
              onClick={onDismiss}
              className="w-full py-2 px-4 text-secondary-ink dark:text-secondary-ink-on-dark hover:text-ink dark:hover:text-ink-on-dark transition text-sm font-medium"
            >
              Maybe Later
            </button>
          </div>
        </div>

        <div className="bg-subtle dark:bg-subtle-on-dark px-6 py-3 text-center border-t border-divider dark:border-divider-on-dark">
          <p className="text-xs text-muted-ink dark:text-muted-ink-on-dark">
            Cancel anytime • Secure payment • 24/7 support
          </p>
        </div>
      </ScholarCard>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-[var(--s4-ease-out)];
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-[var(--s4-ease-out)];
        }
      `}</style>
    </div>
  );
};
