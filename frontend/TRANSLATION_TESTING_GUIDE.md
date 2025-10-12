# Translation Testing Guide 🌐

## Quick Test Instructions

### 1. Start the Application
```bash
cd /home/cherry/IIITH/Projects/To_Try/TourismToolKit
pm2 restart tourism-frontend
# or
cd frontend && npm run dev
```

### 2. Test Language Switching

#### **Home Page Test** (http://localhost:3000)
1. Open the home page
2. Look at the top-right corner for the language selector
3. Click on it and select "हिंदी (Hindi)"
4. **Verify all text changes:**
   - Title: "Your Ultimate Travel Companion" → "आपका अंतिम यात्रा साथी"
   - Subtitle changes to Hindi
   - Buttons: "Get Started Free" → "मुफ्त में शुरू करें"
   - All feature cards translate
   - Statistics labels translate
5. Switch back to "English"
6. Verify everything returns to English

#### **Login Page Test** (http://localhost:3000/auth/login)
1. Navigate to login page
2. Switch language to Hindi
3. **Verify translations:**
   - "Welcome Back" → "वापसी पर स्वागत है"
   - "Sign in to continue your journey" → "अपनी यात्रा जारी रखने के लिए साइन इन करें"
   - "Email Address" → "ईमेल पता"
   - "Password" → "पासवर्ड"
   - "Forgot your password?" → "अपना पासवर्ड भूल गए?"
   - "Sign In" button → "साइन इन करें"
   - "Don't have an account? Sign up" → "खाता नहीं है? साइन अप करें"

#### **Register Page Test** (http://localhost:3000/auth/register)
1. Navigate to register page
2. Switch language to Hindi
3. **Verify all form labels translate:**
   - "Join TourismToolKit" → "TourismToolKit में शामिल हों"
   - "Full Name" → "पूरा नाम"
   - "Username" → "उपयोगकर्ता नाम"
   - "Password" → "पासवर्ड"
   - "Confirm Password" → "पासवर्ड की पुष्टि करें"
   - "Home Country" → "गृह देश"
   - "Preferred Language" → "पसंदीदा भाषा"
   - "Create Account" → "खाता बनाएं"
   - "Already have an account? Sign in" → "पहले से खाता है? साइन इन करें"

#### **Dashboard Page Test** (http://localhost:3000/dashboard)
1. Login first (or use demo account)
2. Navigate to dashboard
3. Switch language to Hindi
4. **Verify translations:**
   - Welcome message: "Welcome back" → "वापसी पर स्वागत है"
   - Statistics cards:
     - "Translations" → "अनुवाद"
     - "Places Visited" → "देखे गए स्थान"
     - "Words Learned" → "सीखे गए शब्द"
     - "Trips Planned" → "नियोजित यात्राएं"
   - Quick action cards translate
   - Loading text translates

#### **Settings Page Test** (http://localhost:3000/settings)
1. Navigate to settings
2. Switch language to Hindi
3. **Verify translations:**
   - "Settings" → "सेटिंग्स"
   - "Manage your preferences" → "अपनी प्राथमिकताएं प्रबंधित करें"
   - Profile section translates
   - Theme options: "Light" → "लाइट", "Dark" → "डार्क", "System" → "सिस्टम"

#### **Navigation Menu Test**
1. Login to access the navigation menu
2. Switch language to Hindi
3. **Verify all menu items:**
   - "Dashboard" → "डैशबोर्ड"
   - "Translator" → "अनुवादक"
   - "Dictionary" → "शब्दकोश"
   - "Places" → "स्थान"
   - "Settings" → "सेटिंग्स"
   - "Logout" → "लॉगआउट"

---

## Expected Behavior

### ✅ What Should Work
1. **Instant switching**: Language changes immediately without page reload
2. **Persistence**: Selected language persists across page navigation
3. **LocalStorage**: Language choice saved and restored on next visit
4. **Complete coverage**: All visible text on completed pages translates
5. **No flickering**: Smooth transition between languages
6. **Icons preserved**: Only text changes, icons/images stay the same
7. **Layout intact**: No layout breaks due to longer/shorter translations
8. **Theme compatibility**: Works perfectly in both light and dark modes

### ⚠️ Known Limitations
1. Translator page - Partially translated (only titles)
2. Dictionary page - Partially translated (only titles)
3. Places page - Partially translated (only titles)
4. Some toast notifications may still be in English

---

## Visual Verification Checklist

### Home Page
```
┌─────────────────────────────────────┐
│  [Language: English ▼]              │
│                                      │
│  🌍 TourismToolKit                   │
│                                      │
│  Your Ultimate                       │
│  Travel Companion                    │
│                                      │
│  Break language barriers...          │
│                                      │
│  [Get Started Free] [Sign In]       │
│                                      │
│  100+                50K+            │
│  Languages Supported Places Covered  │
│                                      │
│  ⚡ Real-time Translation            │
│  📍 Local Places Discovery           │
│  📖 Language Dictionary              │
│  🧭 Smart Travel Guide               │
└─────────────────────────────────────┘

Switch to Hindi → Everything changes!

┌─────────────────────────────────────┐
│  [भाषा: हिंदी ▼]                    │
│                                      │
│  🌍 TourismToolKit                   │
│                                      │
│  आपका अंतिम                         │
│  यात्रा साथी                        │
│                                      │
│  AI-संचालित अनुवाद...               │
│                                      │
│  [मुफ्त में शुरू करें] [साइन इन करें] │
│                                      │
│  100+                50K+            │
│  समर्थित भाषाएं     कवर किए गए स्थान│
│                                      │
│  ⚡ रीयल-टाइम अनुवाद                │
│  📍 स्थानीय स्थान खोज                │
│  📖 भाषा शब्दकोश                     │
│  🧭 स्मार्ट ट्रैवल गाइड              │
└─────────────────────────────────────┘
```

---

## Debugging Issues

### If translations don't appear:
1. **Check console**: Open browser DevTools (F12)
2. **Verify hook**: Ensure `useTranslation()` is imported
3. **Check keys**: Verify translation keys exist in both `en.ts` and `hi.ts`
4. **Clear cache**: Hard refresh (Ctrl+Shift+R)
5. **Check localStorage**: Verify `selectedLanguage` is saved

### If language doesn't persist:
1. Check localStorage in DevTools
2. Verify LanguageProvider is wrapping the app
3. Check for errors in console

### If some text doesn't translate:
1. That page/component hasn't been updated yet
2. Check TRANSLATION_STATUS.md for coverage details
3. Add the translation key to the respective file

---

## Browser Testing

Test in multiple browsers:
- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

---

## Performance Check

- Language switching should be **instant** (<100ms)
- No network requests on language change
- No page reload required
- Smooth animations maintained

---

## Accessibility

- Screen readers should announce language change
- RTL support (for future languages) is considered
- Focus management preserved during switch
- Keyboard navigation works in both languages

---

## Success Criteria

✅ All 5 major pages translate completely
✅ Navigation menu translates
✅ No English text visible when Hindi selected (on completed pages)
✅ Language persists across sessions
✅ Theme works perfectly in both languages
✅ No layout breaks or text overflow
✅ Instant, smooth switching

---

*Ready to test? Switch between English and Hindi and watch the magic happen!* ✨
