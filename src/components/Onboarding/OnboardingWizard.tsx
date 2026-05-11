import React, { useState } from 'react';
import { Globe, Palette, Check, ChevronRight, ChevronLeft } from 'lucide-react';
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
  swatch: string;
  desc: string;
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'navy-gold',
    name: 'Navy & Gold',
    swatch: 'linear-gradient(135deg, #f5f5f4, #b45309)',
    desc: 'Classic & scholarly',
  },
  {
    id: 'oxblood-cream',
    name: 'Oxblood & Cream',
    swatch: 'linear-gradient(135deg, #fafaf9, #991b1b)',
    desc: 'Warm & literary',
  },
  {
    id: 'forest-parchment',
    name: 'Forest & Parchment',
    swatch: 'linear-gradient(135deg, #ecfdf5, #065f46)',
    desc: 'Calm & studious',
  },
  {
    id: 'ink-blush',
    name: 'Ink & Blush',
    swatch: 'linear-gradient(135deg, #fff1f2, #be123c)',
    desc: 'Soft & considered',
  },
  {
    id: 'copper-charcoal',
    name: 'Copper & Charcoal',
    swatch: 'linear-gradient(135deg, #fff7ed, #c2410c)',
    desc: 'Earthy & refined',
  },
  {
    id: 'monochrome',
    name: 'Monochrome',
    swatch: 'linear-gradient(135deg, #9ca3af, #1f2937)',
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
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-card-light dark:bg-card-dark"
    >
      {/* Progress indicator */}
      <div className="w-full max-w-md mb-8 flex items-center justify-center gap-2">
        {[1, 2].map((s) => (
          <div
            key={s}
            className={`h-2 rounded-full transition-all duration-300 ${
              s === step
                ? 'w-8 bg-accent-gold'
                : s < step
                  ? 'w-8 bg-accent-gold-soft'
                  : 'w-4 bg-divider dark:bg-divider-on-dark'
            }`}
          />
        ))}
        <span className="ml-2 text-xs text-secondary-ink dark:text-muted-ink-on-dark">{stepLabel}</span>
      </div>

      <div className="w-full max-w-md">
        {step === 1 ? (
          /* ── STEP 1: Language ────────────────────────────────────────── */
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="p-3 rounded-full bg-accent-gold">
                  <Globe className="h-10 w-10 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-ink dark:text-ink-on-dark">
                {t('onboarding.step_language')}
              </h1>
              <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark">
                {t('onboarding.step_language_sub')}
              </p>
            </div>

            <div
              className="rounded-[var(--s4-radius-card)] border border-divider dark:border-divider-on-dark overflow-hidden divide-y divide-divider dark:divide-divider-on-dark"
            >
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleLangSelect(lang.code)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                    selectedLang === lang.code
                      ? 'bg-accent-gold-soft/20 text-ink dark:text-ink-on-dark'
                      : 'hover:bg-accent-gold-soft/10 text-secondary-ink dark:text-muted-ink-on-dark'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl leading-none" aria-hidden>
                      {lang.flag}
                    </span>
                    <span className="font-semibold text-xs bg-accent-gold-soft/30 px-2 py-1 rounded">
                      {lang.initials}
                    </span>
                    <span className="text-sm font-medium">{lang.name}</span>
                  </div>
                  {selectedLang === lang.code && (
                    <Check className="h-5 w-5 text-accent-gold shrink-0" />
                  )}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-[var(--s4-radius-card)] text-sm font-semibold text-white bg-accent-gold hover:opacity-90 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-gold"
            >
              {t('onboarding.next')}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          /* ── STEP 2: Color Theme ─────────────────────────────────────── */
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="flex justify-center">
                <div className="p-3 rounded-full bg-accent-gold">
                  <Palette className="h-10 w-10 text-white" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-ink dark:text-ink-on-dark">
                {t('onboarding.step_theme')}
              </h1>
              <p className="text-sm text-muted-ink dark:text-muted-ink-on-dark">
                {t('onboarding.step_theme_sub')}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {THEME_OPTIONS.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleThemeSelect(theme.id)}
                  className={`relative flex flex-col items-center gap-2 p-3 rounded-[var(--s4-radius-card)] border-2 transition-all ${
                    selectedTheme === theme.id
                      ? 'border-accent-gold shadow-md'
                      : 'border-divider dark:border-divider-on-dark hover:border-accent-gold-soft'
                  }`}
                >
                  {/* Color swatch */}
                  <div
                    className="w-full h-10 rounded-md"
                    style={{ background: theme.swatch }}
                  />
                  <span className="text-xs font-semibold text-ink dark:text-ink-on-dark">
                    {theme.name}
                  </span>
                  <span className="text-xs text-muted-ink dark:text-muted-ink-on-dark">{theme.desc}</span>
                  {selectedTheme === theme.id && (
                    <div className="absolute top-2 right-2 bg-accent-gold rounded-full p-0.5">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center justify-center gap-1 px-4 py-3 rounded-[var(--s4-radius-card)] text-sm font-medium border border-divider dark:border-divider-on-dark bg-transparent hover:bg-accent-gold-soft/10 text-secondary-ink dark:text-muted-ink-on-dark transition"
              >
                <ChevronLeft className="h-4 w-4" />
                {t('onboarding.back')}
              </button>
              <button
                type="button"
                onClick={handleComplete}
                disabled={completing}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[var(--s4-radius-card)] text-sm font-semibold text-white bg-accent-gold hover:opacity-90 transition disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-gold"
              >
                {completing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  t('onboarding.get_started')
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
