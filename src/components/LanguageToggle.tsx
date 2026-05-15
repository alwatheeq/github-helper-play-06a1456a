import React, { useState, useRef, useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useI18n } from '../contexts/I18nContext';

const LANGUAGES = [
  { code: 'en', name: 'English', initials: 'EN' },
  { code: 'ar', name: 'العربية', initials: 'AR' },
  { code: 'fr', name: 'Français', initials: 'FR' },
  { code: 'tr', name: 'Türkçe', initials: 'TR' },
];

export const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = LANGUAGES.find(lang => lang.code === language) || LANGUAGES[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark hover:bg-accent-gold-soft/10 transition-colors duration-150  hover:shadow-sm"
        aria-label="Select language"
      >
        <Globe className="h-4 w-4 text-secondary-ink dark:text-muted-ink-on-dark" />
        <span className="font-semibold text-sm text-ink dark:text-ink-on-dark">
          {currentLanguage.initials}
        </span>
        <svg
          className={`h-4 w-4 text-secondary-ink dark:text-muted-ink-on-dark transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-card-light dark:bg-card-dark border border-divider dark:border-divider-on-dark overflow-hidden z-50 animate-fadeIn">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors duration-150 ${
                language === lang.code
                  ? 'bg-accent-gold-soft/20 text-ink dark:text-ink-on-dark'
                  : 'hover:bg-accent-gold-soft/10 text-secondary-ink dark:text-muted-ink-on-dark'
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="font-semibold text-xs bg-accent-gold-soft/30 px-2 py-1 rounded">
                  {lang.initials}
                </span>
                <span className="text-sm font-medium">{lang.name}</span>
              </div>
              {language === lang.code && (
                <svg
                  className="h-4 w-4 text-accent-gold"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
