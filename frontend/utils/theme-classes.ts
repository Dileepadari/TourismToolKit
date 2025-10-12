/**
 * Centralized theme-aware Tailwind classes
 * Use these instead of hardcoded colors for proper theme support
 */

export const themeClasses = {
  // Page backgrounds
  page: {
    gradient: 'min-h-screen bg-gradient-to-br from-background via-muted/30 to-background',
    solid: 'min-h-screen bg-background',
  },

  // Headers
  header: {
    default: 'bg-card/80 backdrop-blur-md border-b border-border',
    solid: 'bg-card border-b border-border',
  },

  // Cards
  card: {
    default: 'bg-card text-card-foreground rounded-xl shadow-lg border border-border',
    hover: 'bg-card text-card-foreground rounded-xl shadow-lg border border-border hover:shadow-xl transition-shadow',
    glass: 'bg-card/80 backdrop-blur-sm text-card-foreground rounded-xl shadow-lg border border-border',
  },

  // Buttons
  button: {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg font-medium transition-colors',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 px-4 py-2 rounded-lg font-medium transition-colors',
    accent: 'bg-accent text-accent-foreground hover:bg-accent/90 px-4 py-2 rounded-lg font-medium transition-colors',
    outline: 'border border-border bg-background text-foreground hover:bg-muted px-4 py-2 rounded-lg font-medium transition-colors',
    ghost: 'bg-transparent text-foreground hover:bg-muted px-4 py-2 rounded-lg font-medium transition-colors',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 px-4 py-2 rounded-lg font-medium transition-colors',
  },

  // Inputs
  input: {
    default: 'w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent placeholder:text-muted-foreground',
    select: 'px-4 py-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring',
    textarea: 'w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground focus:ring-2 focus:ring-ring focus:border-transparent resize-none placeholder:text-muted-foreground',
  },

  // Text
  text: {
    heading: 'text-foreground font-bold',
    body: 'text-foreground',
    muted: 'text-muted-foreground',
    link: 'text-muted-foreground hover:text-foreground transition-colors',
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
  },

  // Tabs
  tabs: {
    container: 'flex space-x-1 bg-muted p-1 rounded-xl',
    active: 'bg-background text-foreground shadow-sm px-4 py-2 rounded-lg font-medium transition-all',
    inactive: 'text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg font-medium transition-all',
  },

  // Badges/Pills
  badge: {
    primary: 'bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium',
    secondary: 'bg-secondary/10 text-secondary px-3 py-1 rounded-full text-sm font-medium',
    accent: 'bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium',
    muted: 'bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm font-medium',
  },

  // Icons
  icon: {
    primary: 'text-primary',
    secondary: 'text-secondary',
    accent: 'text-accent',
    muted: 'text-muted-foreground',
    foreground: 'text-foreground',
  },

  // Dividers
  divider: {
    default: 'border-border',
  },

  // Modals/Overlays
  modal: {
    overlay: 'fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50',
    content: 'bg-card text-card-foreground rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto',
  },

  // Special states
  state: {
    hover: 'hover:bg-muted',
    active: 'bg-accent text-accent-foreground',
    disabled: 'opacity-50 cursor-not-allowed',
    focus: 'focus:ring-2 focus:ring-ring focus:outline-none',
  },
};

/**
 * Helper function to combine theme classes
 */
export function cn(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
