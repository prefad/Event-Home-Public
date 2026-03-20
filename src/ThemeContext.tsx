import { createContext, useContext, useState, type ReactNode } from 'react';

export type ThemeName = 'dark' | 'light' | 'bold';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (t: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: 'dark', setTheme: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeName>('dark');

  const handleSetTheme = (t: ThemeName) => {
    setTheme(t);
    document.documentElement.setAttribute('data-theme', t);
  };

  // Set initial theme attribute
  if (!document.documentElement.getAttribute('data-theme')) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme: handleSetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
