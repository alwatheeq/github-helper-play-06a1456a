import React, { useState } from 'react';
import { Check, ChevronRight, ChevronLeft } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useUserPreferences } from '../../contexts/UserPreferencesContext';
import { useAuth } from '../../hooks/useAuth';
import type { ColorTheme } from '../../contexts/ThemeContext';

const LANGUAGES = [
  { code: 'en', name: 'English', initials: 'EN', flag: '🇺🇸' },
  { code: 'ar', name: 'العربية', initials: 'AR', flag: '🇸🇦' },
  { code: 'fr', name: 'Français', initials: 'FR', flag: '🇫🇷' },
  { code: 'tr', name: 'Türkçe', initials: 'TR', flag: '🇹🇷' },
] as const;

interface ThemeOption {
  id: ColorTheme;
  name: string;
  stripes: string[];
  desc: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'navy-gold',
    name: 'Navy & Gold',
    stripes: ['#0E1F3A', '#B8893A', '#FAF7EE', '#FFFFFF'],
    desc: 'Classic & scholarly',
  },
  {
    id: 'oxblood-cream',
    name: 'Oxblood & Cream',
    stripes: ['#3E1414', '#9C2B2B', '#F6EFE5', '#FFFFFF'],
    desc: 'Warm & literary',
  },
  {
    id: 'forest-parchment',
    name: 'Forest & Parchment',
    stripes: ['#1A2E1F', '#5B7A3A', '#A8C880', '#F1EEDE'],
    desc: 'Calm & studious',
  },
  {
    id: 'ink-blush',
    name: 'Ink & Blush',
    stripes: ['#1B1B1F', '#C5708A', '#F4DDE3', '#F7F2EC'],
    desc: 'Soft & considered',
  },
  {
    id: 'copper-charcoal',
    name: 'Copper & Charcoal',
    stripes: ['#3A2A1E', '#B8723A', '#F0DCC0', '#F4EFE5'],
    desc: 'Earthy & refined',
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    stripes: ['#111827', '#374151', '#9CA3AF', '#FAFAFA'],
    desc: 'Quiet & clinical',
  },
];

export const OnboardingWizard: React.FC = () => {
  const { user } = useAuth();
  const { language, setLanguage, t } = useI18n();
  const { currentTheme, setTheme } = useTheme();
  const { updateColorTheme } = useUserPreferences();

  const [step, setStep] = useState(1);
  const [selectedLang, setSelectedLang] = useState<string>(language || 'en');
  const [selectedTheme, setSelectedTheme] = useState<ColorTheme>(currentTheme || 'navy-gold');
  const [completing, setCompleting] = useState(false);

  const handleLangSelect = (code: string) => {
    setSelectedLang(code);
    setLanguage(code, { skipRefreshPrompt: true });
  };

  const handleThemeSelect = (themeId: ColorTheme) => {
    setSelectedTheme(themeId);
    void setTheme(themeId);
  };

  const handleComplete = async () => {
    setCompleting(true);
    try {
      // Per-user key — the primary gate checked by App.tsx on every load
      if (user?.id) {
        localStorage.setItem(`meshfahem_onboarding_completed_${user.id}`, 'true');
      }
      // Keep global key for backwards compat with LanguageChoicePage
      localStorage.setItem('meshfahem_language_chosen', 'true');
      await updateColorTheme(selectedTheme);
    } catch {
      // non-critical: preferences are already set in localStorage; DB sync will retry later
    }
    window.location.reload();
  };

  const stepLabel = t('onboarding.step_of')
    .replace('{current}', String(step))
    .replace('{total}', '2');

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-page-light dark:bg-page-dark">

      {/* ── Step indicator ──────────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-2 mb-8">
        <div className={`h-[6px] rounded-full transition-all ${step >= 1 ? 'w-8 bg-accent-gold' : 'w-8 bg-divider dark:bg-divider-on-dark'}`} />
        <div className={`h-[6px] rounded-full transition-all ${step >= 2 ? 'w-8 bg-accent-gold' : 'w-4 bg-divider dark:bg-divider-on-dark'}`} />
        <span className="ml-1 text-[11px] text-muted-ink dark:text-muted-ink-on-dark">{stepLabel}</span>
      </div>

      {step === 1 ? (
        /* ── STEP 1: Language ───────────────────────────────────────── */
        <div className="w-[440px] max-w-full">
          {/* Icon + heading */}
          <div className="text-center mb-7">
            <div className="w-14 h-14 rounded-full bg-accent-gold flex items-center justify-center mx-auto mb-4">
              <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
              </svg>
            </div>
            <div className="font-display text-[26px] font-bold text-ink dark:text-ink-on-dark mb-1.5">{t('onboarding.step_language')}</div>
            <div className="text-[13px] text-muted-ink dark:text-muted-ink-on-dark">{t('onboarding.step_language_sub')}</div>
          </div>

          {/* Language list */}
          <div className="border border-divider dark:border-divider-on-dark rounded-[10px] overflow-hidden mb-5">
            {LANGUAGES.map((lang, i) => {
              const selected = selectedLang === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLangSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors ${
                    i < LANGUAGES.length - 1 ? 'border-b border-divider dark:border-divider-on-dark' : ''
                  } ${selected ? 'bg-accent-gold/[0.12] dark:bg-accent-gold/10' : 'bg-card-light dark:bg-card-dark hover:bg-subtle dark:hover:bg-subtle-on-dark'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl leading-none" aria-hidden>{lang.flag}</span>
                    <span className="text-[10px] font-bold bg-accent-gold/[0.18] text-accent-gold px-1.5 py-0.5 rounded">{lang.initials}</span>
                    <span className={`text-[14px] ${selected ? 'font-semibold text-ink dark:text-ink-on-dark' : 'font-normal text-secondary-ink dark:text-muted-ink-on-dark'}`}>{lang.name}</span>
                  </div>
                  {selected && (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-gold)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  )}
                </button>
              );
            })}
          </div>

          {/* Next button */}
          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-[8px] bg-ink dark:bg-card-dark text-card-light dark:text-ink-on-dark text-[14px] font-semibold hover:opacity-85 transition"
          >
            {t('onboarding.next')}
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        /* ── STEP 2: Color Theme ──────────────────────────────────────── */
        <div className="w-[520px] max-w-full">
          {/* Icon + heading */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-accent-gold flex items-center justify-center mx-auto mb-3.5">
              <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/>
                <circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/>
                <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
              </svg>
            </div>
            <div className="font-display text-[26px] font-bold text-ink dark:text-ink-on-dark mb-1.5">{t('onboarding.step_theme')}</div>
            <div className="text-[13px] text-muted-ink dark:text-muted-ink-on-dark">{t('onboarding.step_theme_sub')}</div>
          </div>

          {/* Theme grid */}
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            {THEME_OPTIONS.map((theme) => {
              const selected = selectedTheme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleThemeSelect(theme.id)}
                  className={`relative text-left border-2 rounded-[14px] px-3.5 pt-3.5 pb-3 bg-card-light dark:bg-card-dark transition-colors ${
                    selected ? 'border-accent-gold' : 'border-divider dark:border-divider-on-dark hover:border-accent-gold/40'
                  }`}
                >
                  {/* Multi-stripe swatch */}
                  <div className="flex rounded-[8px] overflow-hidden h-8 mb-2.5">
                    {theme.stripes.map((color, j) => (
                      <div key={j} className="flex-1" style={{ background: color }} />
                    ))}
                  </div>
                  <div className="text-[12px] font-bold text-ink dark:text-ink-on-dark mb-0.5">{theme.name}</div>
                  <div className="text-[10px] text-muted-ink dark:text-muted-ink-on-dark">{theme.desc}</div>
                  {selected && (
                    <div className="absolute top-2 right-2 w-[18px] h-[18px] rounded-full bg-accent-gold flex items-center justify-center">
                      <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Back + Get Started */}
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1.5 px-4 py-2.5 border border-divider dark:border-divider-on-dark rounded-[8px] text-[13px] text-secondary-ink dark:text-muted-ink-on-dark bg-card-light dark:bg-card-dark hover:opacity-75 transition"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              {t('onboarding.back')}
            </button>
            <button
              type="button"
              onClick={handleComplete}
              disabled={completing}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-[8px] bg-ink dark:bg-card-dark text-card-light dark:text-ink-on-dark text-[14px] font-semibold hover:opacity-85 transition disabled:opacity-50"
            >
              {completing ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              ) : (
                `${t('onboarding.get_started')} →`
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
