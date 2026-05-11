import React, { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { useI18n } from '../../contexts/I18nContext';
import enTranslations from '../../locales/en.json';
import arTranslations from '../../locales/ar.json';
import frTranslations from '../../locales/fr.json';
import trTranslations from '../../locales/tr.json';

const translations: Record<string, { language_choice?: { confirm?: string } }> = {
  en: enTranslations,
  ar: arTranslations,
  fr: frTranslations,
  tr: trTranslations,
};

const getConfirmLabel = (lang: string): string =>
  translations[lang]?.language_choice?.confirm ?? translations.en?.language_choice?.confirm ?? 'Confirm';

const LANGUAGES = [
  { code: 'en', name: 'English', initials: 'EN' },
  { code: 'ar', name: 'العربية', initials: 'AR' },
  { code: 'fr', name: 'Français', initials: 'FR' },
  { code: 'tr', name: 'Türkçe', initials: 'TR' },
];

interface LanguageChoicePageProps {
  onComplete: () => void;
}

export const LanguageChoicePage: React.FC<LanguageChoicePageProps> = ({ onComplete }) => {
  const { language, setLanguage, t } = useI18n();
  const [selectedLang, setSelectedLang] = useState<string>(() => language || 'en');

  const handleContinue = () => {
    setLanguage(selectedLang, { skipRefreshPrompt: true });
    localStorage.setItem('meshfahem_language_chosen', 'true');
    onComplete();
    window.location.reload();
  };

  return (
    <div className="min-h-screen w-full flex flex-col p-6 bg-card-light dark:bg-card-dark">
      <div className="w-full max-w-md mx-auto flex flex-col gap-6">
        <div className="text-center space-y-2 pt-8">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-accent-gold">
              <Globe className="h-10 w-10 text-ink-on-dark" />
            </div>
          </div>
          <h1 className="s4-h2 text-ink dark:text-ink-on-dark">
            {t('language_choice.title')}
          </h1>
          <p className="text-sm text-secondary-ink dark:text-muted-ink-on-dark">
            {t('language_choice.subtitle')}
          </p>
        </div>

        <div className="rounded-[var(--s4-radius-card)] border border-divider dark:border-divider-on-dark overflow-hidden divide-y divide-divider dark:divide-divider-on-dark">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setSelectedLang(lang.code)}
              className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors ${
                selectedLang === lang.code
                  ? 'bg-accent-gold-soft/20 text-ink dark:text-ink-on-dark'
                  : 'hover:bg-accent-gold-soft/10 text-secondary-ink dark:text-muted-ink-on-dark'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-semibold text-xs bg-accent-gold-soft/30 px-2 py-1 rounded">
                  {lang.initials}
                </span>
                <span className="text-sm font-medium">{lang.name}</span>
              </div>
              {selectedLang === lang.code && (
                <Check className="h-5 w-5 text-accent-gold" />
              )}
            </button>
          ))}
        </div>

        {/* Confirm button - inline under language selection */}
        <button
          type="button"
          onClick={handleContinue}
          className="w-full py-2.5 rounded-[var(--s4-radius-card)] text-sm font-medium text-ink dark:text-ink-on-dark bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark hover:bg-accent-gold-soft/10 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-gold"
        >
          {getConfirmLabel(selectedLang)}
        </button>
      </div>
    </div>
  );
};
