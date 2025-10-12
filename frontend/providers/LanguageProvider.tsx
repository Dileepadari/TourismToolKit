'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Language {
  code: string;
  name: string;
}

interface LanguageContextType {
  selectedLanguage: string;
  supportedLanguages: Language[];
  setSelectedLanguage: (language: string) => void;
  currentLanguage: Language;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const DEFAULT_LANGUAGES: Language[] = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi' },
  { code: 'te', name: 'Telugu' },
  { code: 'ta', name: 'Tamil' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'bn', name: 'Bengali' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'mr', name: 'Marathi' },
  { code: 'pa', name: 'Punjabi' },
  { code: 'ur', name: 'Urdu' },
  { code: 'as', name: 'Assamese' },
  { code: 'or', name: 'Odia' },
];

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [selectedLanguage, setSelectedLanguageState] = useState<string>('en');
  const [supportedLanguages] = useState<Language[]>(DEFAULT_LANGUAGES);

  // Load language from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('selected-language');
    if (savedLanguage && supportedLanguages.some(lang => lang.code === savedLanguage)) {
      setSelectedLanguageState(savedLanguage);
    }
  }, [supportedLanguages]);

  const setSelectedLanguage = (language: string) => {
    setSelectedLanguageState(language);
    localStorage.setItem('selected-language', language);
  };

  const currentLanguage = supportedLanguages.find(lang => lang.code === selectedLanguage) || supportedLanguages[0];

  const value: LanguageContextType = {
    selectedLanguage,
    supportedLanguages,
    setSelectedLanguage,
    currentLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};