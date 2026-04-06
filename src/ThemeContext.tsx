import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { restoreBrandTheme } from './components/BrandColorPopup';

export type ThemeName = 'dark' | 'light' | 'bold';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'dark', setTheme: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>(() => {
    const saved = localStorage.getItem('theme') as ThemeName | null;
    return saved && ['dark', 'light', 'bold'].includes(saved) ? saved : 'dark';
  });

  const handleSetTheme = (t: ThemeName) => {
    setTheme(t);
    localStorage.setItem('theme', t);
    document.documentElement.setAttribute('data-theme', t);
    restoreBrandTheme(t);
  };

  // Always sync the data-theme attribute with state on mount, and restore brand theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    restoreBrandTheme(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
