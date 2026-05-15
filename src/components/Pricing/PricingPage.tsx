import React, { useState } from 'react';
import { Check, ArrowRight, X, ArrowLeft, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../contexts/I18nContext';
import {
  PRICING,
  formatCurrency,
  isStripeEnabled,
  STANDARD_BASE_USD_BY_MONTHS,
} from '../../utils/subscriptionHelpers';

const STANDARD_FEATURES = [
  '1,500 credits for tools & services (1.5M tokens)',
  '500 credits for AI Chat included (500k tokens)',
  '600 credits for Study Room included (10 hours)',
  'Summaries, flashcards & quiz generation',
  'Save to library with goal tracking',
  'Multi-language support',
];

const MAX_ZEGO_HOURS = 100;
const MAX_CHAT_BLOCKS = 100;
const MIN_AI_BLOCKS = 5; // minimum extra block when adding more AI chat (5 × 100k = 500k tokens)

export const PricingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();
  const [promoCode, setPromoCode] = useState('');
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [zegoHours, setZegoHours] = useState(0);
  const [chatBlocks, setChatBlocks] = useState(0);
  const [billingMonths, setBillingMonths] = useState<1 | 3 | 6>(1);

  const basePrice = STANDARD_BASE_USD_BY_MONTHS[billingMonths];
  const zegoTotal = zegoHours * PRICING.zegoPerHour;
  const chatTotal = chatBlocks * PRICING.chatPer100kTokens;
  const addonsTotal = zegoTotal + chatTotal;
  const totalPrice = basePrice + addonsTotal;

  const handleSubscribe = () => {
    if (!user) {
      navigate('/');
      return;
    }
    const params = new URLSearchParams({
      plan: 'standard',
      zego_hours: String(zegoHours),
      chat_blocks: String(chatBlocks),
      billing_months: String(billingMonths),
    });
    if (promoCode) params.set('promo', promoCode);
    navigate(`/checkout?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-page-light dark:bg-page-dark flex flex-col">
      {/* Navigation bar */}
      <div className="flex justify-between items-center px-8 py-3.5 border-b border-divider dark:border-divider-on-dark bg-page-light dark:bg-page-dark flex-shrink-0">
        {user ? (
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-[7px] px-[14px] py-[7px] bg-accent-gold-soft border border-accent-gold/30 text-[13px] font-medium text-accent-gold hover:opacity-90 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t('pricing.back_to_dashboard')}
          </button>
        ) : <div />}
        <button
          onClick={() => navigate('/')}
          className="w-8 h-8 bg-sidebar flex items-center justify-center hover:opacity-90 transition"
          aria-label="Close"
        >
          <X className="h-3.5 w-3.5 text-ink-on-dark" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
      <div className="max-w-[560px] mx-auto px-6 py-7 pb-10">
        {/* Hero */}
        <div className="text-center mb-7">
          <h1 className="font-display text-[34px] font-bold text-ink dark:text-ink-on-dark mb-2">
            Standard Plan
          </h1>
          <p className="text-[14px] text-muted-ink dark:text-muted-ink-on-dark mb-2.5">
            {t('pricing.standard_description')}
            {!isStripeEnabled() && (
              <span className="block mt-1 text-[14px]"> {t('pricing.no_payment_required')}</span>
            )}
          </p>
          {showPromoInput ? (
            <div className="mt-3 max-w-sm mx-auto flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder={t('pricing.promo_placeholder')}
                className="flex-1 px-4 py-2 border border-divider dark:border-divider-on-dark bg-card-light dark:bg-card-dark text-ink dark:text-ink-on-dark text-[13px]"
              />
              <button
                onClick={() => setShowPromoInput(false)}
                className="px-4 py-2 bg-accent-gold text-ink-on-dark text-[13px] font-medium"
              >
                {t('pricing.apply')}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowPromoInput(true)}
              className="text-[12px] font-medium text-accent-gold border-b border-dashed border-accent-gold hover:opacity-80 transition"
            >
              {t('pricing.have_promo')}
            </button>
          )}
        </div>

        {/* Standard plan card */}
        <div className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark overflow-hidden mb-4">
          <div className="px-6 py-5 bg-subtle dark:bg-subtle-on-dark border-b border-divider dark:border-divider-on-dark">
            <div className="text-[11px] font-semibold text-muted-ink dark:text-muted-ink-on-dark uppercase tracking-[0.05em] mb-2.5">
              {t('pricing.billing_term_label')}
            </div>
            <div className="flex gap-2 mb-4">
              {([1, 3, 6] as const).map((months) => (
                <button
                  key={months}
                  type="button"
                  onClick={() => setBillingMonths(months)}
                  className={`px-3.5 py-1.5 border text-[12px] transition ${
                    billingMonths === months
                      ? 'border-accent-gold bg-accent-gold/[0.09] font-semibold text-accent-gold'
                      : 'border-divider dark:border-divider-on-dark bg-card-light dark:bg-card-dark font-normal text-muted-ink dark:text-muted-ink-on-dark'
                  }`}
                >
                  {months === 1 ? '1 month' : months === 3 ? '3 months' : '6 months'}
                </button>
              ))}
            </div>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="font-display text-[38px] font-bold text-ink dark:text-ink-on-dark">
                {formatCurrency(basePrice)}
              </span>
              <span className="text-[14px] text-muted-ink dark:text-muted-ink-on-dark">
                {billingMonths === 1 ? t('pricing.per_month') : t('pricing.per_billing_period')}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-ink dark:text-muted-ink-on-dark">
              {t('pricing.core_features_hint')}
            </p>
          </div>
          <div className="px-6 py-5">
            <ul className="space-y-2.5">
              {STANDARD_FEATURES.map((feature, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <Check className="h-[15px] w-[15px] text-green-500 flex-shrink-0" />
                  <span className="text-[13px] text-secondary-ink dark:text-muted-ink-on-dark">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Add-ons */}
        <div className="mb-4">
          <div className="text-[14px] font-semibold text-ink dark:text-ink-on-dark mb-2.5">
            {t('pricing.optional_addons')}
          </div>

          {[
            {
              label: t('pricing.zegocloud_addon_label'),
              desc: t('pricing.zegocloud_addon_description'),
              hint: null,
              count: zegoHours,
              unit: t('pricing.hours_unit'),
              total: zegoTotal,
              onDec: () => setZegoHours((h) => Math.max(0, h - 1)),
              onInc: () => setZegoHours((h) => Math.min(MAX_ZEGO_HOURS, h + 1)),
              disableDec: zegoHours === 0,
              disableInc: zegoHours >= MAX_ZEGO_HOURS,
            },
            {
              label: t('pricing.ai_chat_addon_label'),
              desc: t('pricing.ai_chat_addon_description'),
              hint: t('pricing.ai_min_hint'),
              count: chatBlocks,
              unit: t('pricing.tokens_unit'),
              total: chatTotal,
              onDec: () => setChatBlocks((b) => (b === MIN_AI_BLOCKS ? 0 : Math.max(MIN_AI_BLOCKS, b - 1))),
              onInc: () => setChatBlocks((b) => (b === 0 ? MIN_AI_BLOCKS : Math.min(MAX_CHAT_BLOCKS, b + 1))),
              disableDec: chatBlocks === 0,
              disableInc: chatBlocks >= MAX_CHAT_BLOCKS,
            },
          ].map((addon, i) => (
            <div key={i} className="bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark px-[18px] py-3.5 mb-2.5 flex items-center justify-between">
              <div>
                <div className="text-[13px] font-semibold text-ink dark:text-ink-on-dark mb-0.5">{addon.label}</div>
                <div className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark">{addon.desc}</div>
                {addon.hint && <div className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark mt-0.5">{addon.hint}</div>}
                {addon.count > 0 && <div className="text-[11px] text-muted-ink dark:text-muted-ink-on-dark mt-1">+{formatCurrency(addon.total)} / mo</div>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button type="button" onClick={addon.onDec} disabled={addon.disableDec}
                  className="w-7 h-7 border border-divider dark:border-divider-on-dark bg-subtle dark:bg-subtle-on-dark flex items-center justify-center hover:opacity-80 transition disabled:opacity-40"
                  aria-label="Decrease">
                  <Minus className="h-3 w-3 text-muted-ink dark:text-muted-ink-on-dark" />
                </button>
                <span className="text-[13px] font-semibold text-ink dark:text-ink-on-dark min-w-[28px] text-center">
                  {addon.count}
                </span>
                <button type="button" onClick={addon.onInc} disabled={addon.disableInc}
                  className="w-7 h-7 border border-divider dark:border-divider-on-dark bg-subtle dark:bg-subtle-on-dark flex items-center justify-center hover:opacity-80 transition disabled:opacity-40"
                  aria-label="Increase">
                  <Plus className="h-3 w-3 text-muted-ink dark:text-muted-ink-on-dark" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary + CTA */}
        <div className="rounded-[12px] bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark px-5 py-[18px] mt-4">
          <div className="flex justify-between text-[13px] text-muted-ink dark:text-muted-ink-on-dark mb-2">
            <span>{t('pricing.base_price_label')}</span>
            <span className="text-ink dark:text-ink-on-dark">{formatCurrency(basePrice)}</span>
          </div>
          {addonsTotal > 0 && (
            <div className="flex justify-between text-[13px] text-muted-ink dark:text-muted-ink-on-dark mb-2">
              <span>{t('pricing.addons_label')}</span>
              <span className="text-ink dark:text-ink-on-dark">{formatCurrency(addonsTotal)}</span>
            </div>
          )}
          <div className="flex justify-between text-[15px] font-bold text-ink dark:text-ink-on-dark pt-2.5 border-t border-divider dark:border-divider-on-dark mb-4">
            <span>{t('pricing.total_per_billing_period')}</span>
            <span>
              {formatCurrency(totalPrice)}
              {!isStripeEnabled() && (
                <span className="ml-1 text-[13px] font-normal"> ({t('pricing.no_payment_required')})</span>
              )}
            </span>
          </div>
          <button
            onClick={handleSubscribe}
            className="w-full bg-sidebar text-ink-on-dark font-bold py-3 flex items-center justify-center gap-2 hover:opacity-85 transition"
          >
            <span>{isStripeEnabled() ? t('pricing.subscribe') : t('pricing.continue')}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default PricingPage;
