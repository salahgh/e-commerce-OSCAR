/**
 * OSCAR Fashion Design System — Typography
 *
 * Figma sources:
 *   Arabic:  node 14-7341  → IBM Plex Sans Arabic (Bold 700, Medium 500)
 *   French:  node 139-3592 → Gabarito (Bold 700, Medium 500)
 *
 * Font loading happens in app/_layout.tsx via @expo-google-fonts.
 * Use `fonts.latin.*` for FR/EN and `fonts.arabic.*` for AR.
 */

// ─── Font family tokens ─────────────────────────────────────────────
// These names must match the keys used in useFonts() in _layout.tsx.
export const fonts = {
  latin: {
    regular: 'Gabarito_400Regular',
    medium: 'Gabarito_500Medium',
    semiBold: 'Gabarito_600SemiBold',
    bold: 'Gabarito_700Bold',
  },
  arabic: {
    regular: 'IBMPlexSansArabic_400Regular',
    medium: 'IBMPlexSansArabic_500Medium',
    semiBold: 'IBMPlexSansArabic_600SemiBold',
    bold: 'IBMPlexSansArabic_700Bold',
  },
} as const;

// ─── Font sizes ─────────────────────────────────────────────────────
export const fontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 36,
  '5xl': 50,
  '6xl': 64,
} as const;

// ─── Font weights (used with system fonts as fallback) ──────────────
export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semiBold: '600' as const,
  bold: '700' as const,
};

// ─── Line heights (absolute, matching Figma specs) ──────────────────
export const lineHeight = {
  xs: 16,   // caption / 12px
  sm: 24,   // body / 14–16px
  md: 32,   // heading / 18–24px
  lg: 48,   // display / 36px
  xl: 72,   // display / 50px
  '2xl': 96, // display / 64px
} as const;

// ─── Figma type scale ───────────────────────────────────────────────
// Bold variants (weight 700) — used for emphasis and headings
// Medium variants (weight 500) — used for regular/body text

export const textStyles = {
  // Display — large hero/title text
  displayLarge: {
    fontSize: fontSize['6xl'],    // 64
    lineHeight: lineHeight['2xl'], // 96
  },
  displayMedium: {
    fontSize: fontSize['5xl'],    // 50
    lineHeight: lineHeight.xl,     // 72
  },
  displaySmall: {
    fontSize: fontSize['4xl'],    // 36
    lineHeight: lineHeight.lg,     // 48
  },

  // Heading — section titles
  headingLarge: {
    fontSize: fontSize['2xl'],    // 24
    lineHeight: lineHeight.md,     // 32
  },
  headingMedium: {
    fontSize: fontSize.xl,         // 20
    lineHeight: lineHeight.md,     // 32
  },
  headingSmall: {
    fontSize: fontSize.lg,         // 18
    lineHeight: lineHeight.md,     // 32
  },

  // Body — paragraph / subtext
  bodyLarge: {
    fontSize: fontSize.md,         // 16
    lineHeight: lineHeight.sm,     // 24
  },
  bodyMedium: {
    fontSize: fontSize.sm,         // 14
    lineHeight: lineHeight.sm,     // 24
  },
  bodySmall: {
    fontSize: fontSize.xs,         // 12
    lineHeight: lineHeight.xs,     // 16
  },
} as const;

// ─── Backward-compatible aliases ────────────────────────────────────
// Maps the old `typography.styles.h1` shape to the new Figma scale
// so existing components don't break.

export const typography = {
  fonts: fonts.latin,
  fontSize,
  fontWeight,
  lineHeight,
  styles: {
    h1: {
      fontSize: textStyles.displaySmall.fontSize,       // 36
      fontWeight: fontWeight.bold,
      lineHeight: textStyles.displaySmall.lineHeight,   // 48
    },
    h2: {
      fontSize: textStyles.headingLarge.fontSize,        // 24
      fontWeight: fontWeight.semiBold,
      lineHeight: textStyles.headingLarge.lineHeight,    // 32
    },
    h3: {
      fontSize: textStyles.headingLarge.fontSize,        // 24
      fontWeight: fontWeight.semiBold,
      lineHeight: textStyles.headingLarge.lineHeight,    // 32
    },
    h4: {
      fontSize: textStyles.headingMedium.fontSize,       // 20
      fontWeight: fontWeight.semiBold,
      lineHeight: textStyles.headingMedium.lineHeight,   // 32
    },
    h5: {
      fontSize: textStyles.headingSmall.fontSize,        // 18
      fontWeight: fontWeight.medium,
      lineHeight: textStyles.headingSmall.lineHeight,    // 32
    },
    h6: {
      fontSize: textStyles.bodyLarge.fontSize,           // 16
      fontWeight: fontWeight.medium,
      lineHeight: textStyles.bodyLarge.lineHeight,       // 24
    },
    body: {
      fontSize: textStyles.bodyLarge.fontSize,           // 16
      fontWeight: fontWeight.regular,
      lineHeight: textStyles.bodyLarge.lineHeight,       // 24
    },
    bodySmall: {
      fontSize: textStyles.bodyMedium.fontSize,          // 14
      fontWeight: fontWeight.regular,
      lineHeight: textStyles.bodyMedium.lineHeight,      // 24
    },
    caption: {
      fontSize: textStyles.bodySmall.fontSize,           // 12
      fontWeight: fontWeight.regular,
      lineHeight: textStyles.bodySmall.lineHeight,       // 16
    },
    button: {
      fontSize: textStyles.bodyLarge.fontSize,           // 16
      fontWeight: fontWeight.semiBold,
      lineHeight: textStyles.bodyLarge.lineHeight,       // 24
    },
  },
} as const;

export type Typography = typeof typography;
export type Fonts = typeof fonts;
export type TextStyles = typeof textStyles;
