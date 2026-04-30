import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ErrorLogger } from '../utils/errorLogger';

/**
 * Scholar Redesign — 6 palettes, light + dark each.
 * Slugs:
 *   navy-gold        — Navy & Gold (default)
 *   oxblood-cream    — Oxblood & Cream
 *   forest-parchment — Forest & Parchment
 *   ink-blush        — Ink & Blush
 *   copper-charcoal  — Copper & Charcoal
 *   monochrome       — Monochrome (greyscale, no gold)
 *
 * Legacy theme slugs ('warm-neutrals', 'sky-blue', 'rose-pink',
 * 'slate-mist', 'plum-sand') are kept in LEGACY_COLOR_THEME_MAP for
 * backwards-compat only and are migrated to a Scholar palette on load.
 */
export type ColorTheme =
  | 'navy-gold'
  | 'oxblood-cream'
  | 'forest-parchment'
  | 'ink-blush'
  | 'copper-charcoal'
  | 'monochrome';

interface BackgroundColors {
  light: { gradient: string; from: string; to: string };
  dark:  { gradient: string; from: string; to: string };
}

interface UIColors {
  light: {
    gradient: string;
    from: string;
    to: string;
    accent: string;
    accentHover: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    cardBg: string;
    cardBorder: string;
    subtleBg: string;
    tutorialBg: string;
  };
  dark: {
    gradient: string;
    from: string;
    to: string;
    accent: string;
    accentHover: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    cardBg: string;
    cardBorder: string;
    subtleBg: string;
    tutorialBg: string;
  };
}

interface ThemeColors {
  background: BackgroundColors;
  ui: UIColors;
}

const themeDefinitions: Record<ColorTheme, ThemeColors> = {
  /* 1. Navy & Gold — parchment cream / deep navy, warm gold accent */
  'navy-gold': {
    background: {
      light: { gradient: 'from-stone-50 to-amber-50', from: 'stone-50', to: 'amber-50' },
      dark:  { gradient: 'from-slate-950 to-slate-900', from: 'slate-950', to: 'slate-900' },
    },
    ui: {
      light: {
        gradient: 'from-amber-600 to-yellow-700',
        from: 'amber-600', to: 'yellow-700',
        accent: 'amber-700', accentHover: 'amber-800',
        textPrimary: 'text-slate-900',
        textSecondary: 'text-slate-700',
        textMuted: 'text-slate-500',
        cardBg: 'bg-stone-50',
        cardBorder: 'border-amber-200/70',
        subtleBg: 'bg-amber-50/60',
        tutorialBg: 'bg-amber-100/70',
      },
      dark: {
        gradient: 'from-amber-500 to-yellow-600',
        from: 'amber-500', to: 'yellow-600',
        accent: 'amber-500', accentHover: 'amber-400',
        textPrimary: 'text-stone-100',
        textSecondary: 'text-stone-300',
        textMuted: 'text-stone-400',
        cardBg: 'bg-slate-900',
        cardBorder: 'border-amber-900/40',
        subtleBg: 'bg-slate-950',
        tutorialBg: 'bg-amber-950/30',
      },
    },
  },

  /* 2. Oxblood & Cream — cream / charcoal, oxblood red accent */
  'oxblood-cream': {
    background: {
      light: { gradient: 'from-stone-50 to-stone-100', from: 'stone-50', to: 'stone-100' },
      dark:  { gradient: 'from-zinc-950 to-stone-950', from: 'zinc-950', to: 'stone-950' },
    },
    ui: {
      light: {
        gradient: 'from-red-800 to-red-900',
        from: 'red-800', to: 'red-900',
        accent: 'red-800', accentHover: 'red-900',
        textPrimary: 'text-stone-900',
        textSecondary: 'text-stone-700',
        textMuted: 'text-stone-500',
        cardBg: 'bg-stone-50',
        cardBorder: 'border-stone-300/70',
        subtleBg: 'bg-stone-100/70',
        tutorialBg: 'bg-red-50',
      },
      dark: {
        gradient: 'from-red-700 to-red-800',
        from: 'red-700', to: 'red-800',
        accent: 'red-600', accentHover: 'red-500',
        textPrimary: 'text-stone-100',
        textSecondary: 'text-stone-300',
        textMuted: 'text-stone-400',
        cardBg: 'bg-zinc-900',
        cardBorder: 'border-red-900/40',
        subtleBg: 'bg-zinc-950',
        tutorialBg: 'bg-red-950/30',
      },
    },
  },

  /* 3. Forest & Parchment — parchment / dark forest, forest green + gold accent */
  'forest-parchment': {
    background: {
      light: { gradient: 'from-stone-50 to-emerald-50', from: 'stone-50', to: 'emerald-50' },
      dark:  { gradient: 'from-emerald-950 to-stone-950', from: 'emerald-950', to: 'stone-950' },
    },
    ui: {
      light: {
        gradient: 'from-emerald-800 to-amber-700',
        from: 'emerald-800', to: 'amber-700',
        accent: 'emerald-800', accentHover: 'emerald-900',
        textPrimary: 'text-stone-900',
        textSecondary: 'text-emerald-900',
        textMuted: 'text-stone-500',
        cardBg: 'bg-stone-50',
        cardBorder: 'border-emerald-200/70',
        subtleBg: 'bg-emerald-50/60',
        tutorialBg: 'bg-emerald-100/60',
      },
      dark: {
        gradient: 'from-emerald-600 to-amber-600',
        from: 'emerald-600', to: 'amber-600',
        accent: 'emerald-500', accentHover: 'emerald-400',
        textPrimary: 'text-stone-100',
        textSecondary: 'text-emerald-200',
        textMuted: 'text-stone-400',
        cardBg: 'bg-stone-900',
        cardBorder: 'border-emerald-900/40',
        subtleBg: 'bg-stone-950',
        tutorialBg: 'bg-emerald-950/30',
      },
    },
  },

  /* 4. Ink & Blush — blush ivory / ink black, dusty rose accent */
  'ink-blush': {
    background: {
      light: { gradient: 'from-rose-50 to-stone-50', from: 'rose-50', to: 'stone-50' },
      dark:  { gradient: 'from-zinc-950 to-neutral-950', from: 'zinc-950', to: 'neutral-950' },
    },
    ui: {
      light: {
        gradient: 'from-rose-600 to-rose-700',
        from: 'rose-600', to: 'rose-700',
        accent: 'rose-700', accentHover: 'rose-800',
        textPrimary: 'text-neutral-900',
        textSecondary: 'text-neutral-700',
        textMuted: 'text-neutral-500',
        cardBg: 'bg-rose-50/40',
        cardBorder: 'border-rose-200/70',
        subtleBg: 'bg-rose-50/70',
        tutorialBg: 'bg-rose-100/70',
      },
      dark: {
        gradient: 'from-rose-500 to-rose-600',
        from: 'rose-500', to: 'rose-600',
        accent: 'rose-400', accentHover: 'rose-300',
        textPrimary: 'text-stone-100',
        textSecondary: 'text-rose-200',
        textMuted: 'text-stone-400',
        cardBg: 'bg-neutral-900',
        cardBorder: 'border-rose-900/40',
        subtleBg: 'bg-neutral-950',
        tutorialBg: 'bg-rose-950/30',
      },
    },
  },

  /* 5. Copper & Charcoal — warm beige / charcoal, copper accent */
  'copper-charcoal': {
    background: {
      light: { gradient: 'from-orange-50 to-stone-100', from: 'orange-50', to: 'stone-100' },
      dark:  { gradient: 'from-stone-950 to-zinc-900', from: 'stone-950', to: 'zinc-900' },
    },
    ui: {
      light: {
        gradient: 'from-orange-700 to-amber-800',
        from: 'orange-700', to: 'amber-800',
        accent: 'orange-700', accentHover: 'orange-800',
        textPrimary: 'text-stone-900',
        textSecondary: 'text-stone-700',
        textMuted: 'text-stone-500',
        cardBg: 'bg-stone-50',
        cardBorder: 'border-orange-200/70',
        subtleBg: 'bg-orange-50/60',
        tutorialBg: 'bg-orange-100/60',
      },
      dark: {
        gradient: 'from-orange-500 to-amber-600',
        from: 'orange-500', to: 'amber-600',
        accent: 'orange-400', accentHover: 'orange-300',
        textPrimary: 'text-stone-100',
        textSecondary: 'text-stone-300',
        textMuted: 'text-stone-400',
        cardBg: 'bg-zinc-900',
        cardBorder: 'border-orange-900/40',
        subtleBg: 'bg-stone-950',
        tutorialBg: 'bg-orange-950/30',
      },
    },
  },

  /* 6. Monochrome — gray-50→white / gray-900→black, grey accent (no gold) */
  'monochrome': {
    background: {
      light: { gradient: 'from-gray-50 to-white', from: 'gray-50', to: 'white' },
      dark:  { gradient: 'from-gray-900 to-black', from: 'gray-900', to: 'black' },
    },
    ui: {
      light: {
        gradient: 'from-gray-600 to-gray-800',
        from: 'gray-600', to: 'gray-800',
        accent: 'gray-800', accentHover: 'gray-900',
        textPrimary: 'text-gray-900',
        textSecondary: 'text-gray-700',
        textMuted: 'text-gray-500',
        cardBg: 'bg-white',
        cardBorder: 'border-gray-200',
        subtleBg: 'bg-gray-50',
        tutorialBg: 'bg-gray-100',
      },
      dark: {
        gradient: 'from-gray-300 to-gray-500',
        from: 'gray-300', to: 'gray-500',
        accent: 'gray-300', accentHover: 'gray-200',
        textPrimary: 'text-gray-100',
        textSecondary: 'text-gray-300',
        textMuted: 'text-gray-500',
        cardBg: 'bg-gray-900',
        cardBorder: 'border-gray-800',
        subtleBg: 'bg-black',
        tutorialBg: 'bg-gray-900',
      },
    },
  },

  /* ---------------------------------------------------------------
   * LEGACY THEMES — commented out, retained here as reference only.
   * Slugs are migrated via LEGACY_COLOR_THEME_MAP below.
   *
   * 'warm-neutrals': { ... amber/stone ... },
   * 'sky-blue':      { ... sky/blue ... },
   * 'rose-pink':     { ... rose/pink ... },
   * 'slate-mist':    { ... teal/slate ... },
   * 'plum-sand':     { ... violet/rose ... },
   * --------------------------------------------------------------- */
};

interface ThemeContextType {
  currentTheme: ColorTheme;
  themeColors: ThemeColors;
  setTheme: (theme: ColorTheme, updateDatabase?: () => Promise<void>) => Promise<void>;
  getThemeGradient: (type?: 'bg' | 'ui' | 'card') => string;
  getUIGradient: () => string;
  getBackgroundGradient: () => string;
  getThemeAccent: () => string;
  getThemeAccentHover: () => string;
  getThemeBorder: () => string;
  getThemeText: () => string;
  getThemeFocusRing: () => string;
  getThemeSolid: (type?: 'bg' | 'ui' | 'card') => string;
  getThemeSubtle: (type?: 'bg' | 'ui' | 'card') => string;
  getThemeTextPrimary: () => string;
  getThemeTextSecondary: () => string;
  getThemeTextMuted: () => string;
  getThemeCardBg: () => string;
  getThemeCardBorder: () => string;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'meshfahem_color_theme';

/** Valid slugs for color_theme (Scholar palettes). */
export const VALID_COLOR_THEMES: ColorTheme[] = [
  'navy-gold',
  'oxblood-cream',
  'forest-parchment',
  'ink-blush',
  'copper-charcoal',
  'monochrome',
];

/** Migrate any legacy slug (incl. previous theme set) to a Scholar palette. */
const LEGACY_COLOR_THEME_MAP: Record<string, ColorTheme> = {
  // Previous theme set
  'warm-neutrals': 'copper-charcoal',
  'sky-blue':      'navy-gold',
  'rose-pink':     'ink-blush',
  'slate-mist':    'forest-parchment',
  'plum-sand':     'ink-blush',
  // Even older slugs
  'cool-neutrals': 'navy-gold',
  'soft-minimal':  'monochrome',
  'earth-tones':   'copper-charcoal',
};

/** Coerce API / legacy DB values to a valid ColorTheme. */
export function normalizeColorTheme(raw: string | null | undefined): ColorTheme {
  if (!raw) return 'navy-gold';
  const mapped = LEGACY_COLOR_THEME_MAP[raw] ?? raw;
  if (VALID_COLOR_THEMES.includes(mapped as ColorTheme)) {
    return mapped as ColorTheme;
  }
  return 'navy-gold';
}

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<ColorTheme>(() => {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    return normalizeColorTheme(raw);
  });
  const [isDark, setIsDark] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('meshfahem_theme');
    if (savedTheme === 'dark') return true;
    if (savedTheme === 'light') return false;
    if (document.documentElement.classList.contains('dark')) return true;
    return false;
  });

  useEffect(() => {
    const checkTheme = () => {
      const savedTheme = localStorage.getItem('meshfahem_theme');
      if (savedTheme === 'dark') setIsDark(true);
      else if (savedTheme === 'light') setIsDark(false);
    };
    checkTheme();
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'meshfahem_theme') checkTheme();
    };
    window.addEventListener('storage', handleStorageChange);
    const handleThemeChange = () => checkTheme();
    window.addEventListener('themeChanged', handleThemeChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('themeChanged', handleThemeChange);
    };
  }, []);

  const themeColors = themeDefinitions[currentTheme];
  const activeBackground = isDark ? themeColors.background.dark : themeColors.background.light;
  const activeUI = isDark ? themeColors.ui.dark : themeColors.ui.light;

  // Sync data-theme attribute + CSS variables for global consumers
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', currentTheme);
    root.style.setProperty('--theme-bg-from', activeBackground.from);
    root.style.setProperty('--theme-bg-to', activeBackground.to);
    root.style.setProperty('--theme-ui-from', activeUI.from);
    root.style.setProperty('--theme-ui-to', activeUI.to);
    root.style.setProperty('--theme-accent', activeUI.accent);
    ErrorLogger.debug('CSS variables updated', {
      component: 'ThemeContext',
      action: 'updateCSSVars',
      theme: currentTheme,
      darkMode: isDark,
    });
  }, [currentTheme, isDark, activeBackground, activeUI]);

  const setTheme = async (theme: ColorTheme, updateDatabase?: () => Promise<void>) => {
    ErrorLogger.debug('Setting theme', { component: 'ThemeContext', action: 'setTheme', theme });
    setCurrentTheme(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    if (updateDatabase) {
      try {
        await updateDatabase();
      } catch (error) {
        ErrorLogger.warn('Failed to update theme in database, but localStorage updated', {
          component: 'ThemeContext',
          action: 'setTheme',
          theme,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
    ErrorLogger.info('Theme updated successfully', { component: 'ThemeContext', action: 'setTheme', theme });
  };

  const getThemeGradient = (type: 'bg' | 'ui' | 'card' = 'bg'): string => getThemeSolid(type);

  const getThemeSolid = (type: 'bg' | 'ui' | 'card' = 'bg'): string => {
    if (type === 'bg') {
      const bgColor = isDark ? activeBackground.from : activeBackground.to;
      return `bg-${bgColor}`;
    } else if (type === 'ui') {
      return `bg-${activeUI.accent}`;
    }
    return activeUI.cardBg;
  };

  const getThemeSubtle = (type: 'bg' | 'ui' | 'card' = 'bg'): string => {
    if (type === 'bg') return activeUI.subtleBg;
    if (type === 'ui') {
      const subtleUIMap: Record<ColorTheme, { light: string; dark: string }> = {
        'navy-gold':        { light: 'bg-amber-100',   dark: 'bg-amber-900/40' },
        'oxblood-cream':    { light: 'bg-red-50',      dark: 'bg-red-900/40'   },
        'forest-parchment': { light: 'bg-emerald-100', dark: 'bg-emerald-900/40' },
        'ink-blush':        { light: 'bg-rose-100',    dark: 'bg-rose-900/40'  },
        'copper-charcoal':  { light: 'bg-orange-100',  dark: 'bg-orange-900/40' },
        'monochrome':       { light: 'bg-gray-100',    dark: 'bg-gray-800'     },
      };
      return isDark ? subtleUIMap[currentTheme].dark : subtleUIMap[currentTheme].light;
    }
    return activeUI.cardBg;
  };

  const getUIGradient = (): string => `bg-gradient-to-r ${activeUI.gradient}`;
  const getBackgroundGradient = (): string => `bg-gradient-to-br ${activeBackground.gradient}`;
  const getThemeAccent = (): string => `bg-${activeUI.accent}`;
  const getThemeAccentHover = (): string => `hover:bg-${activeUI.accentHover}`;
  const getThemeBorder = (): string => activeUI.cardBorder;
  const getThemeText = (): string => activeUI.textPrimary;
  const getThemeFocusRing = (): string => {
    const focusColor = isDark ? activeUI.accentHover : activeUI.accent;
    return `focus:ring-${focusColor}`;
  };
  const getThemeTextPrimary = (): string => activeUI.textPrimary;
  const getThemeTextSecondary = (): string => activeUI.textSecondary;
  const getThemeTextMuted = (): string => activeUI.textMuted;
  const getThemeCardBg = (): string => activeUI.cardBg;
  const getThemeCardBorder = (): string => activeUI.cardBorder;

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        themeColors,
        setTheme,
        getThemeGradient,
        getUIGradient,
        getBackgroundGradient,
        getThemeAccent,
        getThemeAccentHover,
        getThemeBorder,
        getThemeText,
        getThemeFocusRing,
        getThemeSolid,
        getThemeSubtle,
        getThemeTextPrimary,
        getThemeTextSecondary,
        getThemeTextMuted,
        getThemeCardBg,
        getThemeCardBorder,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export { themeDefinitions };

/** Helper for non-React consumers. */
export const getThemeGradientClasses = (
  theme: ColorTheme,
  isDark: boolean,
  type: 'bg' | 'ui' = 'bg'
): string => {
  const colors = themeDefinitions[theme];
  const activeBackground = isDark ? colors.background.dark : colors.background.light;
  const activeUI = isDark ? colors.ui.dark : colors.ui.light;
  if (type === 'bg') return `bg-gradient-to-br ${activeBackground.gradient}`;
  return `bg-gradient-to-r ${activeUI.gradient}`;
};
