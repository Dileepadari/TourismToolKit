# 🎨 Theme System - Visual Test Checklist

Use this checklist to verify the theme system is working correctly across all pages.

---

## 🧪 Testing Instructions

### Before You Start
1. Make sure the app is running: `npm run dev` (port 3000)
2. Open browser DevTools (F12)
3. Have the theme toggle visible in the navigation

---

## ✅ Page-by-Page Verification

### 1️⃣ Welcome/Landing Page (`/`)

**Light Mode:**
- [ ] Background is white/light
- [ ] Text is dark and readable
- [ ] Feature card gradients use India colors (saffron, heritage, purple)
- [ ] Buttons have visible borders
- [ ] Stats section has subtle background
- [ ] CTA section has gradient background

**Dark Mode:**
- [ ] Background is dark
- [ ] Text is light and readable
- [ ] Feature card gradients remain vibrant
- [ ] Borders are visible (not blending)
- [ ] Stats section background is darker

**Transition:**
- [ ] Theme toggle changes all colors smoothly
- [ ] No white flashes or jarring transitions

---

### 2️⃣ Login Page (`/auth/login`)

**Light Mode:**
- [ ] Background is solid light color (not gradient)
- [ ] Form card has visible border
- [ ] Input fields have visible borders
- [ ] Text is dark and readable
- [ ] Links are primary color (saffron)
- [ ] Demo account box has light primary background
- [ ] Logo gradient visible

**Dark Mode:**
- [ ] Background is dark
- [ ] Form card visible with border
- [ ] Input fields have dark backgrounds with borders
- [ ] Text is light and readable
- [ ] Links remain primary color
- [ ] Demo account box has dark primary background

**Interactions:**
- [ ] Password toggle icon visible
- [ ] Hover states work on buttons
- [ ] Focus states visible on inputs
- [ ] Submit button gradient (primary to accent)

---

### 3️⃣ Register Page (`/auth/register`)

**Light Mode:**
- [ ] Background is solid light color
- [ ] All form inputs have visible borders
- [ ] Selects (country, language) have borders
- [ ] Text labels are dark
- [ ] Submit button has gradient
- [ ] Sign in link is primary color

**Dark Mode:**
- [ ] Background is dark
- [ ] All inputs have dark backgrounds with borders
- [ ] Text is light and readable
- [ ] Submit button gradient remains vibrant
- [ ] All form fields clearly visible

**Interactions:**
- [ ] Password toggle works
- [ ] All inputs accept text properly
- [ ] Dropdown selects work
- [ ] Form validation visible

---

### 4️⃣ Dashboard (`/dashboard`)

**Loading State:**
- [ ] Spinner is primary color
- [ ] Background is solid (not gradient)
- [ ] Loading text is muted color
- [ ] Centered on screen

**After Loading (Light Mode):**
- [ ] All cards have visible borders
- [ ] Text is dark and readable
- [ ] Icons are visible
- [ ] Quick action buttons have borders
- [ ] Stats cards visible

**Dark Mode:**
- [ ] Cards have dark backgrounds with borders
- [ ] Text is light
- [ ] Icons visible
- [ ] Borders don't blend with background

---

### 5️⃣ Translator Page (`/translator`)

**Light Mode:**
- [ ] Header has gradient background
- [ ] Tab buttons visible and switch
- [ ] Input fields have borders
- [ ] Language selectors have borders
- [ ] Translation output area visible
- [ ] Translate button has gradient

**Dark Mode:**
- [ ] Header gradient remains vibrant
- [ ] All inputs dark with visible borders
- [ ] Text readable
- [ ] Loading spinner (if translating) is primary

**Test Translation:**
- [ ] Click translate button
- [ ] Spinner appears (primary color)
- [ ] Result appears in output area
- [ ] Quick phrases work

---

### 6️⃣ Dictionary Page (`/dictionary`)

**Light Mode:**
- [ ] Search bar has visible border
- [ ] Language selectors visible
- [ ] Search button has gradient
- [ ] Result cards have borders
- [ ] All text readable

**Dark Mode:**
- [ ] Search inputs dark with borders
- [ ] Cards dark with visible borders
- [ ] Text light and readable

---

### 7️⃣ Places Page (`/places`)

**Loading State:**
- [ ] Skeleton cards animate
- [ ] Cards use muted backgrounds
- [ ] Layout matches actual cards

**Light Mode:**
- [ ] Search bar has border
- [ ] Filter buttons have borders
- [ ] Place cards have borders
- [ ] Images load correctly
- [ ] Category badges visible

**Dark Mode:**
- [ ] All cards dark with borders
- [ ] Text readable on cards
- [ ] Filter buttons visible
- [ ] Images still visible

---

### 8️⃣ Settings Page (`/settings`)

**Loading State:**
- [ ] Spinner is primary color
- [ ] Background solid
- [ ] Loading text visible

**Light Mode:**
- [ ] All form inputs have borders
- [ ] Theme preview buttons visible
- [ ] Language selector has border
- [ ] Save button has gradient
- [ ] All sections clearly separated

**Dark Mode:**
- [ ] Form inputs dark with borders
- [ ] Theme preview buttons still work
- [ ] All text readable
- [ ] Save button gradient visible

---

## 🎯 Component-Specific Checks

### Navigation Bar (All Pages)
- [ ] Logo visible in both modes
- [ ] Menu items readable
- [ ] Theme toggle works
- [ ] Active page highlighted
- [ ] Hover states work

### Theme Toggle
- [ ] Sun icon in dark mode
- [ ] Moon icon in light mode
- [ ] Click switches theme
- [ ] Preference saved (refresh page)

### Header Component
- [ ] Gradient pages: white text on gradient
- [ ] Non-gradient: text uses foreground color
- [ ] Back button visible (if present)
- [ ] Decorative elements visible (gradient mode)

### Buttons
- [ ] Primary buttons have gradients
- [ ] Outline buttons have borders
- [ ] Disabled state shows opacity
- [ ] Loading state shows spinner (primary color)
- [ ] Hover states work

---

## 🐛 Common Issues to Check

### Border Visibility
- [ ] No invisible borders (check all cards)
- [ ] Borders don't blend with backgrounds
- [ ] Input borders visible in both modes

### Text Readability
- [ ] No white text on white background
- [ ] No dark text on dark background
- [ ] Muted text still readable
- [ ] Links stand out but readable

### Color Consistency
- [ ] Primary color (saffron) used consistently
- [ ] Gradients use semantic tokens
- [ ] No hardcoded blue/green/etc colors
- [ ] India-inspired colors throughout

### Transitions
- [ ] Theme switch is smooth
- [ ] No sudden flashes
- [ ] All elements transition together
- [ ] No elements stay in wrong theme

---

## 📱 Responsive Testing

### Desktop (1920px)
- [ ] All pages display correctly
- [ ] No overflow issues
- [ ] Grid layouts work

### Tablet (768px)
- [ ] Navigation adapts
- [ ] Cards stack properly
- [ ] Forms still usable

### Mobile (375px)
- [ ] Mobile menu works
- [ ] Forms are usable
- [ ] No horizontal scroll
- [ ] Theme toggle accessible

---

## ✨ Advanced Tests

### Browser DevTools
```javascript
// Open console and run:
document.documentElement.classList
// Should show: ['dark'] in dark mode, [] in light mode

localStorage.getItem('theme')
// Should show: 'dark', 'light', or 'system'

// Check CSS variables:
getComputedStyle(document.documentElement).getPropertyValue('--foreground')
// Should return HSL values like "0 0% 5%" (light) or "0 0% 98%" (dark)
```

### System Preference
1. Set theme to "System" in settings
2. Change OS theme (System Settings > Appearance)
3. [ ] App theme follows OS theme
4. [ ] Changes apply automatically

### Persistence
1. Toggle theme to dark
2. Refresh page (F5)
3. [ ] Theme remains dark
4. Close tab and reopen
5. [ ] Theme still dark

---

## 📊 Final Verification

### Overall Theme Quality
- [ ] **Consistency**: All pages use same color scheme
- [ ] **Accessibility**: Text contrast meets WCAG AA
- [ ] **Performance**: Theme switch is instant (<100ms)
- [ ] **Polish**: No visual bugs or glitches
- [ ] **Brand**: India-inspired colors throughout

### User Experience
- [ ] **Intuitive**: Theme toggle easy to find
- [ ] **Reliable**: Theme persists across sessions
- [ ] **Smooth**: No jarring transitions
- [ ] **Complete**: Every page responds to theme

---

## 🎉 Sign-Off

**Tester:** _______________  
**Date:** _______________  
**Build Version:** _______________  

**Status:**
- [ ] ✅ All checks passed - Ready for production
- [ ] ⚠️ Minor issues found (list below)
- [ ] ❌ Major issues found - Not ready

**Issues Found:**
```
1. 
2. 
3. 
```

**Notes:**
```


```

---

**If all checks pass, the theme system is production-ready! 🚀**
