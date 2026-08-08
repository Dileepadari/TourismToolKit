import { useLanguage } from '@/providers/LanguageProvider';
import { en } from '@/locales';

type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TranslationKey = NestedKeyOf<typeof en>;

/** Walk a dotted path through a translation tree, returning a string or null. */
function lookup(tree: unknown, path: string[]): string | null {
  let node: unknown = tree;
  for (const segment of path) {
    if (typeof node !== 'object' || node === null || !(segment in node)) {
      return null;
    }
    node = (node as Record<string, unknown>)[segment];
  }
  return typeof node === 'string' ? node : null;
}

export function useTranslation() {
  const { messages, selectedLanguage } = useLanguage();

  const t = (key: TranslationKey): string => {
    const path = key.split('.');

    // Selected locale, then English, then the key itself. All 13 locales are at
    // full key parity, so the English fallback covers only the window before a
    // lazily-loaded locale chunk arrives.
    return lookup(messages, path) ?? lookup(en, path) ?? key;
  };

  return { t, locale: selectedLanguage };
}
