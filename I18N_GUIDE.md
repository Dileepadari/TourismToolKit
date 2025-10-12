# 🌍 Internationalization (i18n) System

## Overview

The TourismToolKit now has a complete internationalization system that allows the entire website UI to change languages when the user selects a different language from the language selector.

---

## 📁 File Structure

```
frontend/
├── locales/
│   ├── en.ts          # English translations
│   ├── hi.ts          # Hindi translations
│   └── index.ts       # Export all translations
├── hooks/
│   └── useTranslation.ts  # Translation hook
└── providers/
    └── LanguageProvider.tsx  # Language context (already exists)
```

---

## 🚀 How It Works

### 1. Language Files (`locales/`)

Each language has its own file with translations organized by section:

**`locales/en.ts`** - English translations
**`locales/hi.ts`** - Hindi translations

Structure:
```typescript
export const en = {
  nav: {
    home: 'Home',
    dashboard: 'Dashboard',
    // ...
  },
  common: {
    welcome: 'Welcome',
    search: 'Search',
    // ...
  },
  // More sections...
};
```

### 2. Translation Hook (`hooks/useTranslation.ts`)

Provides the `t` function to get translated strings:

```typescript
import { useTranslation } from '@/hooks/useTranslation';

const { t, locale } = useTranslation();

// Usage:
const homeText = t('nav.home');  // Returns 'Home' in English or 'होम' in Hindi
```

### 3. Language Selector

The existing `LanguageSelector` component already updates the language context. When a user selects a new language, all components using `useTranslation()` will automatically re-render with new translations.

---

## 💻 Usage Examples

### Example 1: Navigation Component

```typescript
'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { Home, Languages, BookOpen, MapPin } from 'lucide-react';

export default function Navigation() {
  const { t } = useTranslation();

  const navigationItems = [
    { name: t('nav.dashboard'), href: '/dashboard', icon: Home },
    { name: t('nav.translator'), href: '/translator', icon: Languages },
    { name: t('nav.dictionary'), href: '/dictionary', icon: BookOpen },
    { name: t('nav.places'), href: '/places', icon: MapPin },
  ];

  return (
    <nav>
      {navigationItems.map((item) => (
        <Link key={item.href} href={item.href}>
          {item.name}
        </Link>
      ))}
    </nav>
  );
}
```

### Example 2: Login Page

```typescript
'use client';

import { useTranslation } from '@/hooks/useTranslation';

export default function LoginPage() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('auth.login.title')}</h1>
      <p>{t('auth.login.subtitle')}</p>
      
      <form>
        <label>{t('auth.login.email')}</label>
        <input placeholder={t('auth.login.email')} />
        
        <label>{t('auth.login.password')}</label>
        <input type="password" placeholder={t('auth.login.password')} />
        
        <button>{t('auth.login.signIn')}</button>
      </form>
      
      <p>
        {t('auth.login.noAccount')}{' '}
        <Link href="/auth/register">{t('auth.login.signUp')}</Link>
      </p>
    </div>
  );
}
```

### Example 3: Dashboard Page

```typescript
'use client';

import { useTranslation } from '@/hooks/useTranslation';

export default function Dashboard() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('dashboard.title')}</h1>
      <p>{t('dashboard.subtitle')}</p>
      
      <div>
        <h2>{t('dashboard.quickActions.title')}</h2>
        <button>{t('dashboard.quickActions.translate')}</button>
        <button>{t('dashboard.quickActions.findPlaces')}</button>
        <button>{t('dashboard.quickActions.learnWords')}</button>
      </div>
      
      <div>
        <h3>{t('dashboard.stats.translations')}</h3>
        <h3>{t('dashboard.stats.placesVisited')}</h3>
        <h3>{t('dashboard.stats.wordsLearned')}</h3>
      </div>
    </div>
  );
}
```

### Example 4: Loading States

```typescript
'use client';

import { useTranslation } from '@/hooks/useTranslation';

export default function LoadingSpinner() {
  const { t } = useTranslation();

  return (
    <div>
      <Spinner />
      <p>{t('common.loading')}</p>
    </div>
  );
}
```

---

## 🎯 Available Translation Keys

### Navigation (`nav.*`)
- `nav.home`
- `nav.dashboard`
- `nav.translator`
- `nav.dictionary`
- `nav.places`
- `nav.settings`
- `nav.login`
- `nav.register`
- `nav.logout`

### Common (`common.*`)
- `common.welcome`
- `common.search`
- `common.save`
- `common.cancel`
- `common.loading`
- `common.selectLanguage`
- And many more...

### Home Page (`home.*`)
- `home.title`
- `home.subtitle`
- `home.getStarted`
- `home.features.translation.title`
- `home.stats.languages`
- And more...

### Authentication (`auth.*`)
- `auth.login.title`
- `auth.login.email`
- `auth.register.title`
- `auth.register.createAccount`
- And more...

### Dashboard (`dashboard.*`)
- `dashboard.title`
- `dashboard.quickActions.translate`
- `dashboard.stats.translations`
- And more...

### Translator (`translator.*`)
- `translator.title`
- `translator.tabs.text`
- `translator.textTranslation.translate`
- And more...

### Places (`places.*`)
- `places.title`
- `places.filters.all`
- `places.viewDetails`
- And more...

### Settings (`settings.*`)
- `settings.title`
- `settings.account.email`
- `settings.preferences.theme`
- And more...

---

## ➕ Adding New Languages

### Step 1: Create Language File

Create a new file in `locales/` (e.g., `te.ts` for Telugu):

```typescript
import { TranslationKeys } from './en';

export const te: TranslationKeys = {
  nav: {
    home: 'హోమ్',
    dashboard: 'డాష్‌బోర్డ్',
    // ... translate all keys
  },
  // ... rest of translations
};
```

### Step 2: Export from Index

Update `locales/index.ts`:

```typescript
import { en } from './en';
import { hi } from './hi';
import { te } from './te';  // Add this

export const translations = {
  en,
  hi,
  te,  // Add this
};
```

### Step 3: Test

The language will now be available when users select Telugu from the language selector!

---

## 🔄 How Language Changes Work

1. **User clicks language selector** in top right
2. **LanguageSelector component** calls `setSelectedLanguage('hi')`
3. **LanguageProvider** updates context and saves to localStorage
4. **All components using `useTranslation()`** automatically re-render
5. **Text throughout the app** changes to the selected language

---

## 🎨 Integration with Theme System

The translation system works seamlessly with the theme system. Both use React Context and update automatically when changed.

```typescript
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from '@/providers/ThemeProvider';

export default function MyComponent() {
  const { t } = useTranslation();  // For translations
  const { theme } = useTheme();     // For theme

  return (
    <div className="bg-background text-foreground">
      <h1>{t('common.welcome')}</h1>
      <p>Current theme: {theme}</p>
    </div>
  );
}
```

---

## 📝 Best Practices

### 1. Always Use Translation Keys

❌ **Bad:**
```typescript
<button>Translate</button>
```

✅ **Good:**
```typescript
<button>{t('translator.textTranslation.translate')}</button>
```

### 2. Use Descriptive Keys

❌ **Bad:**
```typescript
t('button1')
```

✅ **Good:**
```typescript
t('dashboard.quickActions.translate')
```

### 3. Organize by Section

Keep translations organized by page/component:
- `nav.*` - Navigation items
- `auth.*` - Authentication pages
- `dashboard.*` - Dashboard page
- etc.

### 4. Add Fallbacks

The `useTranslation` hook automatically falls back to English if a translation is missing.

---

## 🧪 Testing Translations

### Test in Browser:

1. Open the app: `http://localhost:3000`
2. Click language selector (top right)
3. Select "Hindi" (हिन्दी)
4. **All text should change to Hindi**
5. Select "English" again
6. **All text should change back to English**

### What Should Change:

- ✅ Navigation menu items
- ✅ Page titles and headings
- ✅ Button labels
- ✅ Form labels and placeholders
- ✅ Error messages
- ✅ Loading states
- ✅ Settings options

---

## 🚀 Quick Start Checklist

To make a page translatable:

1. Import the hook:
   ```typescript
   import { useTranslation } from '@/hooks/useTranslation';
   ```

2. Use the hook in your component:
   ```typescript
   const { t } = useTranslation();
   ```

3. Replace hardcoded strings:
   ```typescript
   // Before: <h1>Dashboard</h1>
   // After:
   <h1>{t('dashboard.title')}</h1>
   ```

4. Test by switching languages in the language selector!

---

## 📚 Currently Supported Languages

- ✅ **English (en)** - Fully translated
- ✅ **Hindi (hi)** - Fully translated
- ⏳ **Telugu (te)** - Ready to add
- ⏳ **Tamil (ta)** - Ready to add
- ⏳ **Other Indian languages** - Ready to add

---

## 🎉 Summary

**You now have a complete i18n system!**

- 🌍 Two languages ready (English, Hindi)
- 🔧 Easy to add more languages
- 🎨 Works with theme system
- 📱 Automatic re-rendering
- 💾 Persists across sessions
- 🚀 Simple API with `t()` function

**When a user selects a language, the ENTIRE website UI changes to that language!**
