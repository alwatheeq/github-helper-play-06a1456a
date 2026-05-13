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
    <div className="min-h-screen w-full flex flex-col p-6 bg-page-light dark:bg-page-dark">
      <div className="w-full max-w-[440px] mx-auto flex flex-col">
        <div className="text-center pt-8 mb-7">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-full bg-accent-gold flex items-center justify-center">
              <Globe className="h-[27px] w-[27px] text-card-light" />
            </div>
          </div>
          <h1 className="font-display text-[24px] font-bold text-ink dark:text-ink-on-dark mb-1.5">
            {t('language_choice.title')}
          </h1>
          <p className="text-[13px] text-muted-ink dark:text-muted-ink-on-dark">
            {t('language_choice.subtitle')}
          </p>
        </div>

        <div className="rounded-[10px] border border-divider dark:border-divider-on-dark overflow-hidden divide-y divide-divider dark:divide-divider-on-dark mb-5">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => setSelectedLang(lang.code)}
              className={`w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors ${
                selectedLang === lang.code
                  ? 'bg-accent-gold/[0.09]'
                  : 'bg-card-light dark:bg-card-dark hover:bg-accent-gold/[0.05]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold bg-accent-gold/[0.13] text-accent-gold px-[7px] py-0.5 rounded">
                  {lang.initials}
                </span>
                <span className={`text-[14px] ${selectedLang === lang.code ? 'font-semibold text-ink dark:text-ink-on-dark' : 'font-normal text-secondary-ink dark:text-muted-ink-on-dark'}`}>
                  {lang.name}
                </span>
              </div>
              {selectedLang === lang.code && (
                <Check className="h-[17px] w-[17px] text-accent-gold" />
              )}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={handleContinue}
          className="w-full py-3 rounded-[8px] text-[14px] font-semibold text-card-light bg-sidebar hover:opacity-85 transition flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-gold"
        >
          {getConfirmLabel(selectedLang)}
        </button>
      </div>
    </div>
  );
};
