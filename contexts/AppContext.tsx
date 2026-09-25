import React, { createContext, useState, ReactNode, useCallback } from 'react';
import { I18nManager } from 'react-native';
import type { Language } from '@/constants/i18n';
import { translations } from '@/constants/i18n';
import type { AgentMode } from '@/constants/config';

interface AppContextType {
  language: Language;
  isDarkMode: boolean;
  activeMode: AgentMode;
  setLanguage: (lang: Language) => void;
  setDarkMode: (dark: boolean) => void;
  setActiveMode: (mode: AgentMode) => void;
  t: (key: keyof typeof translations.en) => string;
  isRTL: boolean;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [isDarkMode, setDarkModeState] = useState(true);
  const [activeMode, setActiveMode] = useState<AgentMode>('chat');

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    const isRTL = lang === 'ar';
    I18nManager.forceRTL(isRTL);
  }, []);

  const setDarkMode = useCallback((dark: boolean) => {
    setDarkModeState(dark);
  }, []);

  const t = useCallback((key: keyof typeof translations.en): string => {
    return (translations[language] as Record<string, string>)[key] || (translations.en as Record<string, string>)[key] || key;
  }, [language]);

  const isRTL = language === 'ar';

  return (
    <AppContext.Provider
      value={{
        language,
        isDarkMode,
        activeMode,
        setLanguage,
        setDarkMode,
        setActiveMode,
        t,
        isRTL,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
