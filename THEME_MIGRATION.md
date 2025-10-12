# Quick Theme Migration Script

Replace these patterns across all `.tsx` files:

## Background Colors
- `bg-white dark:bg-gray-800` → `bg-card`
- `bg-white dark:bg-gray-900` → `bg-card`
- `bg-gray-50 dark:bg-gray-800` → `bg-muted`
- `bg-gray-100 dark:bg-gray-800` → `bg-muted`
- `bg-gray-100 dark:bg-gray-700` → `bg-muted`
- `min-h-screen bg-gradient-to-br from-[color]` → `min-h-screen bg-background`

## Text Colors
- `text-gray-900 dark:text-white` → `text-foreground`
- `text-gray-600 dark:text-gray-300` → `text-muted-foreground`
- `text-gray-600 dark:text-gray-400` → `text-muted-foreground`
- `text-gray-500 dark:text-gray-400` → `text-muted-foreground`
- `text-gray-700 dark:text-gray-300` → `text-muted-foreground`
- `text-blue-600 dark:text-blue-400` → `text-primary`
- `hover:text-gray-900 dark:hover:text-white` → `hover:text-foreground`

## Border Colors
- `border-gray-200 dark:border-gray-700` → `border-border`
- `border-gray-300 dark:border-gray-600` → `border-input`

## Input/Form Elements
- `bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600` →
  `bg-background text-foreground border-input`
- `focus:ring-blue-500` → `focus:ring-ring`
- `focus:ring-2 focus:ring-blue-500` → `focus:ring-2 focus:ring-ring`

## Buttons
- `bg-blue-600 hover:bg-blue-700 text-white` → `bg-primary text-primary-foreground hover:bg-primary/90`
- `bg-gradient-to-r from-saffron-500 to-heritage-500 text-white` → `bg-gradient-to-r from-primary to-secondary text-primary-foreground`

## Cards
- `bg-white/80 dark:bg-gray-900/80` → `bg-card/80`

## Icon Colors  
- `text-saffron-600 dark:text-saffron-400` → `text-primary`
- `text-blue-600 dark:text-blue-400` → `text-primary`
- `text-gray-400` → `text-muted-foreground`

Run this command to update all at once:
```bash
# This is a placeholder - actual implementation would use sed or similar
```
