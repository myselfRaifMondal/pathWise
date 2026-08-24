import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import { plain } from '@/lib/storage';
import { THEMES, type Theme, type ThemeName } from '@/theme/tokens';

const STORAGE_KEY = 'pathwise.theme';

type ThemeContextValue = {
  theme: Theme;
  /** null means "follow the device" */
  override: ThemeName | null;
  setOverride: (name: ThemeName | null) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [override, setOverrideState] = useState<ThemeName | null>(null);

  useEffect(() => {
    plain.get(STORAGE_KEY).then((stored) => {
      if (stored === 'dark' || stored === 'light') setOverrideState(stored);
    });
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    // The design defaults to dark, so an unknown system scheme lands on dark too.
    const name: ThemeName = override ?? (system === 'light' ? 'light' : 'dark');
    return {
      theme: THEMES[name],
      override,
      setOverride: (next) => {
        setOverrideState(next);
        if (next) plain.set(STORAGE_KEY, next);
        else plain.remove(STORAGE_KEY);
      },
    };
  }, [override, system]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context.theme;
}

export function useThemeControls() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useThemeControls must be used inside ThemeProvider');
  return context;
}
