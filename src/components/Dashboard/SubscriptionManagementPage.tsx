import React, { useState } from 'react';
import { useSubscription } from '../../hooks/useSubscription';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import {
  Crown, Calendar, CreditCard, AlertCircle, Clock, Shield, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getTierDisplayInfo, getStatusDisplayInfo, getToolsCreditsPlanCap } from '../../utils/subscriptionHelpers';
import { useToast } from '../Toast/Toast';
import { handleApiError, handleSupabaseError, isOffline, handleOfflineError } from '../../utils/errorHandler';
import { ErrorLogger } from '../../utils/errorLogger';
import { useCredits } from '../../contexts/CreditContext';
import { useI18n } from '../../contexts/I18nContext';

export const SubscriptionManagementPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();
  const { error: showErrorToast, success: showSuccessToast } = useToast();
  const { balance: creditBalance } = useCredits();
  const {
    subscription,
    loading,
    hasActiveSubscription,
    isPaidUser,
    getDaysRemaining,
    getTrialDaysRemaining,
    getDaysRemainingInCycle,
    refresh
  } = useSubscription();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const handleCancelSubscription = async () => {
    if (!subscription || canceling) return;
    if (isOffline()) { handleOfflineError(showErrorToast); return; }
    setCanceling(true);
    setCancelError(null);
    try {
      const { error } = await supabase.from('subscriptions').update({ auto_renew: false, canceled_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', subscription.id);
      if (error) {
        const message = handleSupabaseError(error, { component: 'SubscriptionManagementPage', action: 'handleCancelSubscription', userId: user?.id, metadata: { subscriptionId: subscription.id } });
        setCancelError(message);
        showErrorToast(message);
        ErrorLogger.error(error, { component: 'SubscriptionManagementPage', action: 'handleCancelSubscription', userId: user?.id, metadata: { subscriptionId: subscription.id } });
        return;
      }
      const endDateStr = new Date(subscription.end_date).toLocaleDateString();
      const { error: notificationError } = await supabase.from('notifications').insert({ user_id: user!.id, notification_type: 'subscription_canceled', message: t('subscription_management.notification_canceled', { date: endDateStr }), action_url: '/pricing' });
      if (notificationError) { ErrorLogger.error(notificationError, { component: 'SubscriptionManagementPage', action: 'handleCancelSubscription', userId: user?.id, metadata: { step: 'insertNotification', subscriptionId: subscription.id } }); }
      await refresh();
      setShowCancelModal(false);
      showSuccessToast(t('subscription_management.toast_cancel_success'));
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      const message = handleApiError(err, { component: 'SubscriptionManagementPage', action: 'handleCancelSubscription', userId: user?.id, metadata: { subscriptionId: subscription.id } });
      setCancelError(message);
      showErrorToast(message);
      ErrorLogger.error(error, { component: 'SubscriptionManagementPage', action: 'handleCancelSubscription', userId: user?.id, metadata: { subscriptionId: subscription.id } });
    } finally { setCanceling(false); }
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-page-light dark:bg-page-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-gold mx-auto" />
          <p className="mt-4 text-secondary-ink dark:text-muted-ink-on-dark">{t('subscription_management.loading')}</p>
        </div>
      </div>
    );
  }

  if (!subscription || !hasActiveSubscription()) {
    return (
      <div className="min-h-screen w-full bg-page-light dark:bg-page-dark p-6">
        <div className="max-w-4xl mx-auto">
          <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-2 text-secondary-ink dark:text-muted-ink-on-dark hover:opacity-80 transition mb-6">
            <ArrowLeft className="h-5 w-5" />
            <span>{t('subscription_management.go_back')}</span>
          </button>
          <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark p-8">
            <div className="text-center">
              <div className="bg-subtle dark:bg-subtle-on-dark p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Crown className="h-12 w-12 text-secondary-ink dark:text-muted-ink-on-dark" />
              </div>
              <h2 className="font-display text-[22px] font-semibold text-ink dark:text-ink-on-dark mb-4">{t('subscription_management.no_active_title')}</h2>
              <p className="text-secondary-ink dark:text-muted-ink-on-dark mb-8">{t('subscription_management.no_active_desc')}</p>
              <button type="button" onClick={() => navigate('/pricing')} className="bg-accent-gold hover:opacity-90 text-ink-on-dark font-bold py-3 px-8 transition">
                {t('subscription_management.view_plans')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tierInfo = getTierDisplayInfo(subscription.subscription_tier);
  const statusInfo = getStatusDisplayInfo(subscription.status);
  const daysRemaining = getDaysRemaining();
  const trialDaysRemaining = subscription.trial_end_date ? getTrialDaysRemaining() : null;
  const daysRemainingInCycle = getDaysRemainingInCycle();
  const hasZego = (subscription.zego_hours_per_cycle ?? 0) > 0 || (creditBalance?.zego_credits_total ?? 0) > 0;
  const hasAiAddon = (subscription.chat_blocks_per_cycle ?? 0) > 0 || (subscription.token_limit ?? 0) > 520000;
  const toolCreditsRemaining = creditBalance?.credits_remaining ?? 0;
  const toolPlanCap = getToolsCreditsPlanCap(subscription);
  const toolProgressPct = toolPlanCap > 0 ? Math.min(100, (toolCreditsRemaining / toolPlanCap) * 100) : 0;
  const zegoCreditsRemaining = creditBalance?.zego_credits_remaining ?? 0;
  const zegoCreditsTotal = creditBalance?.zego_credits_total ?? 0;
  const aiChatCreditsTotal = hasAiAddon ? (subscription.token_limit && subscription.token_limit > 520000 ? Math.round((subscription.token_limit - 520000) / 1000) : (subscription.chat_blocks_per_cycle ?? 0) * 100) : 0;
  const aiChatCreditsUsed = hasAiAddon ? Math.round((subscription.tokens_used_current_cycle ?? 0) / 1000) : 0;

  return (
    <div className="min-h-screen w-full bg-page-light dark:bg-page-dark p-6">
      <div className="max-w-4xl mx-auto space-y-0">

        {/* Back link */}
        <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-2 text-secondary-ink dark:text-muted-ink-on-dark hover:opacity-80 transition mb-4 text-sm">
          <ArrowLeft className="h-4 w-4" />
          <span>{t('subscription_management.go_back')}</span>
        </button>

        {/* ── v4 Header ─────────────────────────────────────────────── */}
        <div className="bg-sidebar px-7 py-5 mb-5">
          <div className="text-[9px] tracking-[2.5px] text-accent-gold font-bold uppercase mb-1.5">{t('subscription_management.eyebrow')}</div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display text-[28px] font-semibold text-ink-on-dark tracking-[-0.4px]">{tierInfo.name}</div>
              <div className="text-[12px] text-muted-ink-on-dark mt-1">{tierInfo.description}</div>
            </div>
            <span className={`text-[10px] font-bold tracking-[1px] uppercase px-2.5 py-1 bg-accent-gold-soft ${
              subscription.status === 'canceled' || subscription.status === 'payment_failed'
                ? 'text-muted-ink dark:text-muted-ink-on-dark'
                : 'text-accent-gold'
            }`}>{statusInfo.name}</span>
          </div>
        </div>

        {/* ── Status banners ─────────────────────────────────────────── */}
        {trialDaysRemaining !== null && trialDaysRemaining > 0 && (
          <div className="bg-accent-gold-soft border border-accent-gold border-l-[3px] px-4 py-3.5 flex items-start gap-3 mb-4">
            <Clock className="h-5 w-5 text-accent-gold shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[12.5px] text-ink dark:text-ink-on-dark">{t('subscription_management.trial_title')}</p>
              <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark mt-0.5">{t('subscription_management.trial_desc', { count: trialDaysRemaining, date: new Date(subscription.trial_end_date!).toLocaleDateString() })}</p>
            </div>
          </div>
        )}

        {subscription.status === 'payment_failed' && (
          <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark border-l-[3px] border-l-red-600 px-[18px] py-3.5 flex items-start gap-3 mb-4">
            <AlertCircle className="h-5 w-5 text-muted-ink dark:text-muted-ink-on-dark shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-[12.5px] text-ink dark:text-ink-on-dark">{t('subscription_management.payment_failed_title')}</p>
              <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark mt-0.5">{t('subscription_management.payment_failed_desc')}</p>
              <button type="button" className="text-sm font-semibold text-muted-ink dark:text-muted-ink-on-dark hover:underline mt-1.5">{t('subscription_management.update_payment')} →</button>
            </div>
          </div>
        )}

        {subscription.status === 'canceled' && (
          <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark border-l-[3px] border-l-muted-ink px-[18px] py-3.5 flex items-start gap-3 mb-4">
            <AlertCircle className="h-5 w-5 text-muted-ink dark:text-muted-ink-on-dark shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-[12.5px] text-ink dark:text-ink-on-dark">{t('subscription_management.canceled_banner_title')}</p>
              <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark mt-0.5">{t('subscription_management.canceled_banner_desc', { date: new Date(subscription.end_date).toLocaleDateString() })}</p>
            </div>
            <button className="ml-auto shrink-0 px-[14px] py-1.5 bg-accent-gold text-sidebar text-xs font-bold hover:opacity-90 transition">Reactivate →</button>
          </div>
        )}

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-5">
          {/* Left: credits + details */}
          <div className="space-y-4">

            {/* Credits section (dark bg) */}
            <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark px-5 py-4">
              <div className="text-[9px] tracking-[2px] text-muted-ink dark:text-muted-ink-on-dark font-bold uppercase mb-4">Credits — Current Cycle</div>

              {/* Tools & Services */}
              <div className="mb-4 pb-4 border-b border-divider dark:border-divider-on-dark">
                <div className="flex justify-between mb-1.5">
                  <span className="text-[13px] font-semibold text-ink dark:text-ink-on-dark">{t('subscription_management.tools_services')}</span>
                  <div className="text-right">
                    <span className="font-display text-[18px] font-bold text-ink dark:text-ink-on-dark">{toolCreditsRemaining.toLocaleString()}</span>
                    <span className="text-[12px] text-muted-ink dark:text-muted-ink-on-dark"> / {toolPlanCap.toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-[12px] text-secondary-ink dark:text-muted-ink-on-dark mb-2">{t('subscription_management.current_billing_cycle')}</div>
                <div className="h-[5px] bg-subtle dark:bg-subtle-on-dark">
                  <div className="h-full bg-accent-gold transition-all" style={{ width: `${toolProgressPct}%` }} />
                </div>
              </div>

              {hasZego && (
                <div className="mb-4 pb-4 border-b border-divider dark:border-divider-on-dark">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[13px] font-semibold text-ink dark:text-ink-on-dark">{t('subscription_management.study_room')}</span>
                    <div className="text-right">
                      <span className="font-display text-[18px] font-bold text-ink dark:text-ink-on-dark">{zegoCreditsRemaining}</span>
                      <span className="text-[12px] text-muted-ink dark:text-muted-ink-on-dark"> / {zegoCreditsTotal}</span>
                    </div>
                  </div>
                  <div className="text-[12px] text-secondary-ink dark:text-muted-ink-on-dark mb-2">{t('subscription_management.zego_subtitle')}</div>
                  <div className="h-1 bg-subtle dark:bg-subtle-on-dark">
                    <div className="h-full bg-accent-gold transition-all" style={{ width: `${zegoCreditsTotal > 0 ? Math.min(100, ((zegoCreditsTotal - zegoCreditsRemaining) / zegoCreditsTotal) * 100) : 0}%` }} />
                  </div>
                </div>
              )}

              {hasAiAddon && (
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[13px] font-semibold text-ink dark:text-ink-on-dark">{t('subscription_management.ai_chat')}</span>
                    <div className="text-right">
                      <span className="font-display text-[18px] font-bold text-ink dark:text-ink-on-dark">{aiChatCreditsUsed}</span>
                      <span className="text-[12px] text-muted-ink dark:text-muted-ink-on-dark"> / {aiChatCreditsTotal}</span>
                    </div>
                  </div>
                  <div className="text-[12px] text-secondary-ink dark:text-muted-ink-on-dark mb-2">{t('subscription_management.ai_chat_subtitle')}</div>
                  <div className="h-1 bg-subtle dark:bg-subtle-on-dark">
                    <div className="h-full bg-accent-gold transition-all" style={{ width: `${aiChatCreditsTotal > 0 ? Math.min(100, (aiChatCreditsUsed / aiChatCreditsTotal) * 100) : 0}%` }} />
                  </div>
                </div>
              )}

              {subscription.billing_cycle_end && (
                <div className="mt-4 pt-4 border-t border-divider dark:border-divider-on-dark flex items-center justify-between text-sm">
                  <span className="text-secondary-ink dark:text-muted-ink-on-dark">{t('subscription_management.billing_resets_in')}</span>
                  <span className="font-semibold text-ink dark:text-ink-on-dark">
                    {t('subscription_management.days_left', { count: daysRemainingInCycle })}
                    <span className="font-normal text-muted-ink dark:text-muted-ink-on-dark text-xs ml-1">({t('subscription_management.resets_on', { date: new Date(subscription.billing_cycle_end).toLocaleDateString() })})</span>
                  </span>
                </div>
              )}
            </div>

            {/* Subscription Details */}
            <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark px-5 py-4">
              <div className="text-[9px] tracking-[2px] text-muted-ink dark:text-muted-ink-on-dark font-bold uppercase mb-4">Plan Details</div>
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <div className="flex items-center gap-1.5 text-secondary-ink dark:text-muted-ink-on-dark mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{t('subscription_management.start_date')}</span>
                  </div>
                  <p className="text-lg font-semibold text-ink dark:text-ink-on-dark">{new Date(subscription.start_date).toLocaleDateString()}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-secondary-ink dark:text-muted-ink-on-dark mb-1">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{subscription.auto_renew ? t('subscription_management.next_billing') : t('subscription_management.expires_on')}</span>
                  </div>
                  <p className="text-lg font-semibold text-ink dark:text-ink-on-dark">
                    {subscription.next_billing_date ? new Date(subscription.next_billing_date).toLocaleDateString() : new Date(subscription.end_date).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-secondary-ink dark:text-muted-ink-on-dark">{t('subscription_management.paren_days_left', { count: daysRemaining })}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-secondary-ink dark:text-muted-ink-on-dark mb-1">
                    <CreditCard className="h-4 w-4" />
                    <span className="text-sm">{t('subscription_management.payment_method')}</span>
                  </div>
                  <p className="text-ink dark:text-ink-on-dark font-medium">{subscription.payment_method_saved ? t('subscription_management.card_on_file') : t('subscription_management.no_card_saved')}</p>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-secondary-ink dark:text-muted-ink-on-dark mb-1">
                    <Shield className="h-4 w-4" />
                    <span className="text-sm">{t('subscription_management.auto_renew')}</span>
                  </div>
                  <p className={`font-medium ${subscription.auto_renew ? 'text-accent-gold' : 'text-muted-ink dark:text-muted-ink-on-dark'}`}>
                    {subscription.auto_renew ? t('subscription_management.enabled') : t('subscription_management.disabled')}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            {isPaidUser() && subscription.status !== 'canceled' && (
              <div className="flex gap-3">
                <button type="button" onClick={() => navigate('/profile/billing')} className="px-4 py-2.5 border border-divider dark:border-divider-on-dark text-secondary-ink dark:text-muted-ink-on-dark text-sm hover:border-ink dark:hover:border-ink-on-dark transition">
                  {t('subscription_management.view_billing')}
                </button>
                <button type="button" onClick={() => setShowCancelModal(true)} className="px-4 py-2.5 border border-divider dark:border-divider-on-dark text-muted-ink dark:text-muted-ink-on-dark text-sm hover:border-ink dark:hover:border-ink-on-dark transition">
                  {t('subscription_management.cancel_subscription')}
                </button>
              </div>
            )}
          </div>

          {/* Right rail */}
          <div className="flex flex-col gap-4">
            {/* Current Usage dark tile */}
            <div className="bg-sidebar px-[18px] py-4">
              <div className="text-[9px] tracking-[2px] text-accent-gold font-bold uppercase mb-3">Current Usage</div>
              {[
                [t('subscription_management.tools_services'), `${toolCreditsRemaining.toLocaleString()} / ${toolPlanCap.toLocaleString()}`],
                ...(hasZego ? [[t('subscription_management.study_room'), `${zegoCreditsRemaining} / ${zegoCreditsTotal}`]] : []),
                ...(hasAiAddon ? [[t('subscription_management.ai_chat'), `${aiChatCreditsUsed} / ${aiChatCreditsTotal}`]] : []),
                [t('subscription_management.days_in_cycle'), `${daysRemainingInCycle}d left`],
              ].map(([k, v], i, arr) => (
                <div key={i} className={`flex justify-between py-1.5 ${i < arr.length - 1 ? 'border-b border-white/10 dark:border-white/5' : ''}`}>
                  <span className="text-[12px] text-muted-ink-on-dark dark:text-muted-ink">{k}</span>
                  <span className="font-display text-[13px] font-semibold text-ink-on-dark">{v}</span>
                </div>
              ))}
            </div>

            {/* Billing details */}
            <div className="bg-subtle dark:bg-subtle-on-dark border border-divider dark:border-divider-on-dark border-t-[3px] border-t-accent-gold px-4 py-4">
              <div className="text-[9px] tracking-[2px] text-muted-ink dark:text-muted-ink-on-dark font-bold uppercase mb-3">Billing</div>
              {[
                [subscription.auto_renew ? t('subscription_management.next_billing') : t('subscription_management.expires_on'), subscription.next_billing_date ? new Date(subscription.next_billing_date).toLocaleDateString() : new Date(subscription.end_date).toLocaleDateString()],
                [t('subscription_management.status_label'), statusInfo.name],
              ].map(([k, v], i, arr) => (
                <div key={i} className={`flex justify-between py-1.5 ${i < arr.length - 1 ? 'border-b border-divider dark:border-divider-on-dark' : ''}`}>
                  <span className="text-[11.5px] text-muted-ink dark:text-muted-ink-on-dark">{k}</span>
                  <span className="font-display text-[12px] font-semibold text-ink dark:text-ink-on-dark">{v}</span>
                </div>
              ))}
              <button type="button" onClick={() => navigate('/profile/billing')} className="mt-3 w-full py-2 bg-transparent border border-divider dark:border-divider-on-dark text-secondary-ink dark:text-muted-ink-on-dark text-[11.5px] hover:border-ink dark:hover:border-ink-on-dark transition">
                {t('subscription_management.view_billing')} →
              </button>
            </div>

            {/* Info note */}
            <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark px-3.5 py-3 text-[11px] text-muted-ink dark:text-muted-ink-on-dark leading-relaxed">
              Cancel or change your plan at any time. No lock-in. Credits reset on your renewal date.
            </div>
          </div>
        </div>
      </div>

      {/* ── Cancel Modal ────────────────────────────────────────────── */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/[0.62] backdrop-blur-[5px] flex items-center justify-center z-50 p-4">
          <div className="bg-card-light dark:bg-card-dark max-w-md w-full">
            <div className="bg-sidebar px-6 py-5">
              <div className="text-[9px] tracking-[2.5px] text-accent-gold font-bold uppercase mb-2">Account · Plan</div>
              <div className="flex justify-between items-center">
                <div className="font-display text-[20px] font-semibold text-ink-on-dark">{t('subscription_management.cancel_confirm_title')}</div>
                <button onClick={() => setShowCancelModal(false)} className="w-6 h-6 grid place-items-center border border-ink-on-dark/[.20] text-ink-on-dark/50 hover:text-ink-on-dark/80 transition text-sm cursor-pointer">✕</button>
              </div>
            </div>
            <div className="p-6">
              <p className="text-[13px] text-secondary-ink dark:text-muted-ink-on-dark leading-relaxed mb-4">
                {t('subscription_management.cancel_confirm_desc', { date: new Date(subscription.end_date).toLocaleDateString() })}
              </p>
              {cancelError && (
                <div className="border border-red-500/40 bg-red-500/10 px-3 py-2.5 mb-4 text-sm text-red-600 dark:text-red-400">{cancelError}</div>
              )}
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCancelModal(false)} className="flex-1 py-2.5 border border-divider dark:border-divider-on-dark text-secondary-ink dark:text-muted-ink-on-dark text-sm hover:bg-subtle dark:hover:bg-subtle-on-dark transition">
                  {t('subscription_management.keep_plan')}
                </button>
                <button type="button" onClick={handleCancelSubscription} disabled={canceling} className="flex-1 py-2.5 bg-sidebar text-ink-on-dark text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition">
                  {canceling ? t('subscription_management.canceling') : t('subscription_management.confirm_cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
