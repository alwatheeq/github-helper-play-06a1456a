import React, { ReactNode } from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import { useFeatureAccess, FeatureName } from '../../hooks/useFeatureAccess';
import { useAuth } from '../../hooks/useAuth';
import { Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ScholarCard, ScholarButton } from '../Scholar';

interface SubscriptionGuardProps {
  children: ReactNode;
  feature?: FeatureName;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
}

export const SubscriptionGuard: React.FC<SubscriptionGuardProps> = ({
  children,
  feature,
  fallback,
  showUpgradePrompt = true
}) => {
  const navigate = useNavigate();
  const { hasActiveSubscription, subscription, getTierDisplayName, getDaysRemaining: _getDaysRemaining } = useSubscription();
  const { canAccessFeature, getAccessMessage } = useFeatureAccess();
  const { user } = useAuth();

  if (user?.role === 'admin') {
    return <>{children}</>;
  }

  const hasAccess = feature ? canAccessFeature(feature) : hasActiveSubscription();

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showUpgradePrompt) {
    return null;
  }

  const hasExpired = subscription && new Date(subscription.end_date) <= new Date();

  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <ScholarCard variant="elevated" className="max-w-md w-full text-center">
        <div className="mb-6">
          <div className="bg-accent-gold p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
            <Crown className="h-10 w-10 text-ink-on-dark" />
          </div>
        </div>

        <h2 className="s4-h2 text-ink dark:text-ink-on-dark mb-3">
          {hasExpired ? 'Subscription Expired' : 'Upgrade Required'}
        </h2>

        <p className="text-secondary-ink dark:text-secondary-ink-on-dark mb-2">
          {feature ? getAccessMessage(feature) : 'You need an active subscription to access this feature'}
        </p>

        {hasExpired && (
          <div className="bg-orange-50 dark:bg-orange-900/30 rounded-[var(--s4-radius-card)] p-4 mb-6">
            <p className="text-sm text-orange-800 dark:text-orange-300">
              Your {getTierDisplayName()} subscription expired. Renew now to continue using all features.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <ScholarButton
            variant="primary"
            onClick={() => navigate('/pricing')}
            className="w-full"
            icon={<Crown className="h-5 w-5" />}
          >
            {hasExpired ? 'Renew Subscription' : 'View Plans & Pricing'}
          </ScholarButton>

          {!hasExpired && (
            <ScholarButton
              variant="secondary"
              onClick={() => window.history.back()}
              className="w-full"
            >
              Go Back
            </ScholarButton>
          )}
        </div>

        <div className="mt-6 pt-6 border-t border-divider dark:border-divider-on-dark">
          <p className="text-xs text-muted-ink dark:text-muted-ink-on-dark">
            Choose a Standard plan with flexible billing periods on the pricing page
          </p>
        </div>
      </ScholarCard>
    </div>
  );
};
