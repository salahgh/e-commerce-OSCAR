/**
 * OSCAR Fashion - Design System Theme Configuration
 *
 * This file contains centralized design tokens for easy customization.
 * To change the theme:
 * 1. Modify the CSS variables in globals.css for color changes
 * 2. Update this file for spacing, typography, and animation tokens
 */

export const theme = {
  colors: {
    brand: {
      // Primary - Corporate Navy Blue
      primary: 'hsl(210, 29%, 24%)',
      primaryLight: 'hsl(210, 29%, 35%)',
      primaryDark: 'hsl(210, 29%, 18%)',

      // Secondary - Warm Beige
      secondary: 'hsl(30, 30%, 90%)',
      secondaryLight: 'hsl(30, 30%, 95%)',
      secondaryDark: 'hsl(30, 30%, 80%)',

      // Accent - Taupe Gold
      accent: 'hsl(30, 35%, 69%)',
      accentLight: 'hsl(30, 35%, 80%)',
      accentDark: 'hsl(30, 35%, 55%)',
    },
    status: {
      success: 'hsl(142, 76%, 36%)',
      successLight: 'hsl(142, 76%, 50%)',
      warning: 'hsl(38, 92%, 50%)',
      warningLight: 'hsl(38, 92%, 65%)',
      error: 'hsl(0, 84%, 60%)',
      errorLight: 'hsl(0, 84%, 75%)',
      info: 'hsl(217, 91%, 60%)',
      infoLight: 'hsl(217, 91%, 75%)',
    },
    neutral: {
      white: '#ffffff',
      black: '#000000',
      gray50: 'hsl(30, 20%, 98%)',
      gray100: 'hsl(30, 20%, 96%)',
      gray200: 'hsl(30, 15%, 90%)',
      gray300: 'hsl(30, 10%, 80%)',
      gray400: 'hsl(30, 8%, 65%)',
      gray500: 'hsl(210, 10%, 50%)',
      gray600: 'hsl(210, 12%, 40%)',
      gray700: 'hsl(210, 15%, 30%)',
      gray800: 'hsl(210, 18%, 20%)',
      gray900: 'hsl(210, 20%, 12%)',
    }
  },

  fonts: {
    heading: 'var(--font-inter)',
    body: 'var(--font-inter)',
    arabic: 'var(--font-noto-arabic)',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
  },

  fontSizes: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
    '5xl': '3rem',     // 48px
  },

  fontWeights: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  lineHeights: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },

  spacing: {
    page: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
    section: 'py-12 sm:py-16 lg:py-20',
    container: 'container mx-auto px-4 sm:px-6 lg:px-8',
  },

  borderRadius: {
    none: '0',
    sm: 'calc(var(--radius) - 4px)',
    md: 'calc(var(--radius) - 2px)',
    lg: 'var(--radius)',
    xl: 'calc(var(--radius) + 4px)',
    full: '9999px',
  },

  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },

  animation: {
    timing: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modal: 1040,
    popover: 1050,
    tooltip: 1060,
    toast: 1070,
  },
} as const;

// Type exports for TypeScript support
export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
export type ThemeFonts = typeof theme.fonts;
export type ThemeSpacing = typeof theme.spacing;
