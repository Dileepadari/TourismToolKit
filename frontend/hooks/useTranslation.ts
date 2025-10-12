import { useLanguage } from '@/providers/LanguageProvider';
import { translations, SupportedLocale } from '@/locales';

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

type TranslationKey = NestedKeyOf<typeof translations.en>;

export function useTranslation() {
  const { selectedLanguage } = useLanguage();
  
  const t = (key: TranslationKey): string => {
    const locale = selectedLanguage as SupportedLocale;
    const keys = key.split('.');
    
    // Try to get translation in selected language
    let translation: any = translations[locale];
    
    // If the selected language doesn't exist, use English
    if (!translation) {
      translation = translations.en;
    }
    
    // Navigate through the nested keys
    for (const k of keys) {
      if (translation && typeof translation === 'object' && k in translation) {
        translation = translation[k];
      } else {
        // If key not found in selected language, fallback to English
        let fallback: any = translations.en;
        for (const fk of keys) {
          if (fallback && typeof fallback === 'object' && fk in fallback) {
            fallback = fallback[fk];
          } else {
            // If even English doesn't have it, return the key itself
            return key;
          }
        }
        return typeof fallback === 'string' ? fallback : key;
      }
    }
    
    // Final check: if translation is not a string, fallback to English
    if (typeof translation !== 'string') {
      let fallback: any = translations.en;
      for (const fk of keys) {
        if (fallback && typeof fallback === 'object' && fk in fallback) {
          fallback = fallback[fk];
        } else {
          return key;
        }
      }
      return typeof fallback === 'string' ? fallback : key;
    }
    
    return translation;
  };
  
  return { t, locale: selectedLanguage };
}
