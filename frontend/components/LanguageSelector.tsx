'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '@/providers/LanguageProvider';
import { cn } from '@/utils/cn';

interface LanguageSelectorProps {
  className?: string;
  variant?: 'button' | 'dropdown' | 'compact';
  showFlag?: boolean;
  showNativeName?: boolean;
}

// Language flags (using emoji flags for simplicity)
const languageFlags: Record<string, string> = {
  en: '🇺🇸',
  hi: '🇮🇳',
  te: '🇮🇳',
  ta: '🇮🇳',
  kn: '🇮🇳',
  ml: '🇮🇳',
  bn: '🇮🇳',
  gu: '🇮🇳',
  mr: '🇮🇳',
  pa: '🇮🇳',
  ur: '🇵🇰',
  as: '🇮🇳',
  or: '🇮🇳',
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
  showFlag = true,
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
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-saffron-600 dark:hover:text-saffron-400 transition-colors"
        >
          {showFlag && (
            <span className="text-lg">{languageFlags[selectedLanguage] || '🌐'}</span>
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
              className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-medium z-50 min-w-[120px]"
            >
              {supportedLanguages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={cn(
                    'w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-lg last:rounded-b-lg transition-colors',
                    language.code === selectedLanguage && 'bg-saffron-50 dark:bg-saffron-900/20 text-saffron-700 dark:text-saffron-300'
                  )}
                >
                  {showFlag && (
                    <span className="text-lg">{languageFlags[language.code] || '🌐'}</span>
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
          'flex items-center justify-between w-full px-4 py-2 text-left bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:border-saffron-500 focus:border-saffron-500 focus:ring-2 focus:ring-saffron-500/20 transition-all',
          variant === 'button' && 'bg-gradient-to-r from-saffron-500 to-golden-500 text-white border-transparent hover:from-saffron-600 hover:to-golden-600'
        )}
      >
        <div className="flex items-center space-x-3">
          {showFlag && (
            <span className="text-xl">
              {languageFlags[selectedLanguage] || '🌐'}
            </span>
          )}
          <div>
            <div className={cn(
              'font-medium',
              variant === 'button' ? 'text-white' : 'text-gray-900 dark:text-white'
            )}>
              {currentLanguage?.name || 'Select Language'}
            </div>
            {showNativeName && currentLanguage && (
              <div className={cn(
                'text-sm',
                variant === 'button' ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
              )}>
                {nativeNames[selectedLanguage]}
              </div>
            )}
          </div>
        </div>
        <ChevronDown className={cn(
          'w-5 h-5 transition-transform',
          isOpen && 'transform rotate-180',
          variant === 'button' ? 'text-white' : 'text-gray-400'
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-hard z-50 max-h-80 overflow-y-auto"
            >
              <div className="p-2">
                {supportedLanguages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className={cn(
                      'w-full flex items-center space-x-3 px-3 py-3 text-left rounded-lg transition-all hover:bg-gray-50 dark:hover:bg-gray-700',
                      language.code === selectedLanguage && 'bg-saffron-50 dark:bg-saffron-900/20 text-saffron-700 dark:text-saffron-300'
                    )}
                  >
                    {showFlag && (
                      <span className="text-xl">
                        {languageFlags[language.code] || '🌐'}
                      </span>
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {language.name}
                      </div>
                      {showNativeName && nativeNames[language.code] && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {nativeNames[language.code]}
                        </div>
                      )}
                    </div>
                    {language.code === selectedLanguage && (
                      <Check className="w-5 h-5 text-saffron-600" />
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