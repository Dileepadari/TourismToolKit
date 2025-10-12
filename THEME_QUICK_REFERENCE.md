# 🎨 Theme System - Quick Reference

## **Semantic Tokens Cheat Sheet**

### **🎯 Use This Instead of That**

| ❌ **DON'T USE** | ✅ **USE INSTEAD** | 📝 **Purpose** |
|---|---|---|
| `bg-white dark:bg-gray-800` | `bg-card` | Card/panel backgrounds |
| `bg-gray-50 dark:bg-gray-900` | `bg-background` | Page backgrounds |
| `bg-gray-100 dark:bg-gray-700` | `bg-muted` | Subtle backgrounds |
| `text-gray-900 dark:text-white` | `text-foreground` | Primary text |
| `text-gray-600 dark:text-gray-400` | `text-muted-foreground` | Secondary text |
| `border-gray-300 dark:border-gray-600` | `border-input` | Form borders |
| `border-gray-200 dark:border-gray-700` | `border-border` | General borders |
| `text-blue-600 dark:text-blue-400` | `text-primary` | Brand color text |
| `bg-blue-600 dark:bg-blue-500` | `bg-primary` | Primary buttons |
| `hover:bg-gray-100 dark:hover:bg-gray-800` | `hover:bg-muted` | Hover states |

---

## **🎨 Complete Token Reference**

### **Backgrounds:**
```tsx
bg-background       // Main page background
bg-card            // Card/panel background
bg-muted           // Subtle background (disabled, secondary)
bg-primary         // Primary brand color
bg-primary/10      // Subtle primary highlight
bg-secondary       // Secondary brand color
bg-accent          // Accent color
bg-destructive     // Error/danger background
```

### **Text Colors:**
```tsx
text-foreground            // Primary text
text-muted-foreground      // Secondary/subtle text
text-primary              // Brand color text
text-primary-foreground   // Text on primary backgrounds
text-secondary            // Secondary brand text
text-accent               // Accent text
text-destructive          // Error text
```

### **Borders:**
```tsx
border-border      // Default borders
border-input       // Form input borders  
border-primary     // Primary brand borders
border-destructive // Error borders
```

### **States:**
```tsx
hover:bg-muted          // Hover background
hover:bg-muted/80       // Lighter hover
hover:bg-primary/10     // Primary hover
hover:text-foreground   // Hover text
focus:ring-ring         // Focus ring
focus:ring-2            // Focus ring width
```

---

## **🚀 Common Patterns**

### **1. Card/Panel:**
```tsx
<div className="bg-card rounded-xl border border-border p-6">
  <h3 className="text-lg font-semibold text-foreground">Title</h3>
  <p className="text-muted-foreground">Description</p>
</div>
```

### **2. Input Field:**
```tsx
<input 
  className="w-full px-4 py-2 
    bg-background 
    text-foreground 
    border border-input 
    rounded-lg 
    focus:ring-2 
    focus:ring-ring 
    focus:border-transparent"
  placeholder="Enter text..."
/>
```

### **3. Button Primary:**
```tsx
<button className="
  px-6 py-3 
  bg-gradient-to-r from-primary to-accent 
  text-primary-foreground 
  rounded-lg 
  hover:opacity-90
  focus:ring-2 
  focus:ring-ring
">
  Click Me
</button>
```

### **4. Button Secondary/Outline:**
```tsx
<button className="
  px-4 py-2 
  border-2 border-primary 
  text-primary 
  rounded-lg 
  hover:bg-primary/10
">
  Secondary Action
</button>
```

### **5. List Item (Hover):**
```tsx
<li className="
  p-3 
  rounded-lg 
  text-foreground 
  hover:bg-muted 
  cursor-pointer 
  transition-colors
">
  Item
</li>
```

### **6. Badge/Tag:**
```tsx
<span className="
  px-3 py-1 
  bg-primary/10 
  text-primary 
  rounded-full 
  text-sm
">
  Tag
</span>
```

### **7. Alert/Notice:**
```tsx
<div className="
  p-4 
  bg-muted 
  border-l-4 border-primary 
  rounded-r-lg
">
  <p className="text-foreground">Notice message</p>
</div>
```

### **8. Modal/Dialog:**
```tsx
<div className="
  bg-card 
  rounded-xl 
  border border-border 
  shadow-lg 
  p-6
">
  <h2 className="text-2xl font-bold text-foreground mb-4">Modal Title</h2>
  <div className="text-muted-foreground">Content</div>
</div>
```

---

## **⚡ Quick Migration Guide**

### **Step 1: Find & Replace**
Use your editor's find/replace with regex:

```
Find:    bg-white dark:bg-gray-800
Replace: bg-card

Find:    text-gray-900 dark:text-white
Replace: text-foreground

Find:    text-gray-600 dark:text-gray-400
Replace: text-muted-foreground

Find:    border-gray-300 dark:border-gray-600
Replace: border-input
```

### **Step 2: Test**
- Toggle between light/dark themes
- Check all hover states
- Verify form inputs
- Test button variants

### **Step 3: Refine**
- Adjust subtle colors (`/10`, `/20` alpha values)
- Ensure proper contrast
- Test accessibility

---

## **🎭 Theme Context Usage**

### **TypeScript:**
```tsx
import { useTheme } from '@/providers/ThemeProvider';

function MyComponent() {
  const { theme, setTheme, toggleTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme('dark')}>
      Current: {theme}
    </button>
  );
}
```

---

## **💡 Pro Tips**

### **1. Alpha Channels:**
```tsx
// Subtle backgrounds
bg-primary/10     // 10% opacity
bg-primary/20     // 20% opacity
bg-muted/50       // 50% opacity
```

### **2. Gradients:**
```tsx
// Brand gradient
bg-gradient-to-r from-primary to-accent

// Subtle gradient  
bg-gradient-to-br from-card to-primary/5

// Overlay gradient
bg-gradient-to-t from-background to-transparent
```

### **3. Combining Tokens:**
```tsx
// Card with accent border
className="bg-card border-l-4 border-primary"

// Muted card with hover
className="bg-muted hover:bg-muted/80 transition-colors"

// Active state
className={cn(
  "px-4 py-2 rounded-lg",
  isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground"
)}
```

---

## **❌ Common Mistakes**

### **1. Mixing Old and New:**
```tsx
❌ className="bg-card text-gray-900 dark:text-white"
✅ className="bg-card text-foreground"
```

### **2. Forgetting Foreground:**
```tsx
❌ className="bg-primary"  // Text won't be visible!
✅ className="bg-primary text-primary-foreground"
```

### **3. Hardcoded Hover:**
```tsx
❌ className="hover:bg-gray-100 dark:hover:bg-gray-800"
✅ className="hover:bg-muted"
```

### **4. Wrong Border Token:**
```tsx
❌ className="border border-input"  // Use for form inputs only
✅ className="border border-border"  // For general borders
```

---

## **📋 Component Checklist**

When creating a new component:

- [ ] Use `bg-card` for card backgrounds
- [ ] Use `text-foreground` for primary text
- [ ] Use `text-muted-foreground` for secondary text
- [ ] Use `border-border` for general borders
- [ ] Use `border-input` for form inputs
- [ ] Use `hover:bg-muted` for hover states
- [ ] Use `focus:ring-ring` for focus states
- [ ] Test in both light and dark modes
- [ ] Verify color contrast
- [ ] No hardcoded gray/blue colors

---

## **🔗 Resources**

- **Full Guide:** [THEME_SYSTEM_COMPLETE.md](./THEME_SYSTEM_COMPLETE.md)
- **Implementation:** [THEME_FIX_GUIDE.md](./THEME_FIX_GUIDE.md)
- **Migration Patterns:** [THEME_MIGRATION.md](./THEME_MIGRATION.md)

---

## **🎯 Remember:**

**One token, two themes!** 

Every semantic token automatically adapts to light and dark modes. No conditional classes needed!

```tsx
// This one line handles both themes ✨
className="bg-card text-foreground border-border"
```
