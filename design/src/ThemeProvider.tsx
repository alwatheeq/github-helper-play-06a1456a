import React, { createContext, useContext } from 'react';
import { themes, Theme } from './theme';

interface ThemeContextValue {
  theme: Theme;
  themeKey: string;
  setThemeKey: (key: string) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: themes.navy_light,
  themeKey: 'navy_light',
  setThemeKey: () => {},
});

export function ThemeProvider({
  defaultTheme = 'navy_light',
  children,
}: {
  defaultTheme?: string;
  children: React.ReactNode;
}) {
  const [themeKey, setThemeKey] = React.useState(defaultTheme);
  const theme = themes[themeKey] ?? themes.navy_light;
  return (
    <ThemeContext.Provider value={{ theme, themeKey, setThemeKey }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
