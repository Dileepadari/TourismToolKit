'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '@/providers/LanguageProvider';
import { cn } from '@/utils/cn';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'button' | 'dropdown' | 'compact';
  showCode?: boolean;
  showNativeName?: boolean;
}

// A short code per language, not a flag.
//
// The flags this replaced were wrong in three ways at once. Eleven of the
// thirteen languages carried the identical Indian flag, so the flag
// distinguished nothing and the user still had to read the name. English was
// given the flag of the United States, in an app about travelling in India.
// And Urdu was given the flag of Pakistan, though it is one of India's
// twenty-two scheduled languages with tens of millions of speakers here - a
// language is not a country, and saying otherwise about this one in this app
// is worse than merely inaccurate.
//
// The code distinguishes all thirteen, claims no nationality, and reads the
// same to a screen reader as it does on screen.
const languageCodes: Record<string, string> = {
  en: 'EN',
  hi: 'HI',
  te: 'TE',
  ta: 'TA',
  kn: 'KN',
  ml: 'ML',
  bn: 'BN',
  gu: 'GU',
  mr: 'MR',
  pa: 'PA',
  ur: 'UR',
  as: 'AS',
  or: 'OR',
};

// Native names for languages
const nativeNames: Record<string, string> = {
  en: 'English',
  hi: 'हिन्दी',
  te: 'తెలుగు',
  ta: 'தமிழ்',
  kn: 'ಕನ್ನಡ',
  ml: 'മലയാളം',
  bn: 'বাংলা',
  gu: 'ગુજરાતી',
  mr: 'मराठी',
  pa: 'ਪੰਜਾਬੀ',
  ur: 'اردو',
  as: 'অসমীয়া',
  or: 'ଓଡ଼ିଆ',
};

export default function LanguageSelector({ 
  className, 
  variant = 'dropdown', 
  showCode = true,
  showNativeName = false 
}: LanguageSelectorProps) {
  const { selectedLanguage, supportedLanguages, setSelectedLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage = supportedLanguages.find(lang => lang.code === selectedLanguage);
  
  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    setIsOpen(false);
  };

  if (variant === 'compact') {
    return (
      <div className={cn('relative inline-block', className)}>
        <button
          type="button"onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors">
          {showCode && (
            <span className="text-xs font-semibold tracking-wide opacity-70">
              {languageCodes[selectedLanguage] ?? selectedLanguage.toUpperCase()}
            </span>
          )}
          <span>{selectedLanguage.toUpperCase()}</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 mt-1 bg-muted/50 backdrop-blur-sm border border-border rounded-lg shadow-medium z-50 min-w-[120px]">
              {supportedLanguages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={cn(
                    'w-full flex items-center space-x-2 px-3 py-2 text-sm first:rounded-t-lg last:rounded-b-lg transition-colors',
                    'text-foreground hover:bg-muted',
                    language.code === selectedLanguage && 'bg-primary/10 text-primary'
                  )}
                >
                  {showCode && (
                    <span className="text-xs font-semibold tracking-wide opacity-70">
                      {languageCodes[language.code] ?? language.code.toUpperCase()}
                    </span>
                  )}
                  <span>{language.code.toUpperCase()}</span>
                  {language.code === selectedLanguage && (
                    <Check className="w-4 h-4 ml-auto" />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={cn('relative inline-block', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center justify-between w-full px-4 py-2 text-left bg-background border border-input rounded-lg shadow-sm hover:border-primary focus:border-primary focus:ring-2 focus:ring-ring transition-all',
          variant === 'button' ? 'bg-primary border-transparent hover:opacity-90' : ''
        )}
      >
        <div className="flex items-center space-x-3">
          {showCode && (
            <span className="text-xl">
              {languageCodes[selectedLanguage] ?? selectedLanguage.toUpperCase()}
            </span>
          )}
          <div>
            <div className={cn(
              'font-medium',
              variant === 'button' ? 'text-primary-foreground' : 'text-foreground'
            )}>
              {currentLanguage?.name || 'Select Language'}
            </div>
            {showNativeName && currentLanguage && (
              <div className={cn(
                'text-sm',
                variant === 'button' ? 'text-primary-foreground/80' : 'text-muted-foreground'
              )}>
                {nativeNames[selectedLanguage]}
              </div>
            )}
          </div>
        </div>
        <ChevronDown className={cn(
          'w-5 h-5 transition-transform',
          isOpen && 'transform rotate-180',
          variant === 'button' ? 'text-primary-foreground' : 'text-muted-foreground'
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40"onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-muted/50 backdrop-blur-sm border border-border rounded-lg shadow-hard z-50 max-h-80 overflow-y-auto">
              <div className="p-2">
                {supportedLanguages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className={cn(
                      'w-full flex items-center space-x-3 px-3 py-3 text-left rounded-lg transition-all hover:bg-muted',
                      language.code === selectedLanguage && 'bg-primary/10 text-primary'
                    )}
                  >
                    {showCode && (
                      <span className="text-xl">
                        {languageCodes[language.code] ?? language.code.toUpperCase()}
                      </span>
                    )}
                    <div className="flex-1">
                      <div className={cn("font-medium",
                        language.code === selectedLanguage ? 'text-primary' : 'text-foreground'
                      )}>
                        {language.name}
                      </div>
                      {showNativeName && nativeNames[language.code] && (
                        <div className="text-sm text-muted-foreground">
                          {nativeNames[language.code]}
                        </div>
                      )}
                    </div>
                    {language.code === selectedLanguage && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}