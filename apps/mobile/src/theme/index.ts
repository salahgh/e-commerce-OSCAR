import { colors } from './colors';
import { typography, fonts, textStyles } from './typography';
import { spacing } from './spacing';

export const theme = {
  colors,
  typography,
  fonts,
  textStyles,
  spacing,
} as const;

export type Theme = typeof theme;

export { colors, typography, fonts, textStyles, spacing };

// ── Dark-mode foundation (M3d-1) ──
export { darkColors, type ColorPalette } from './darkColors';
export { palettes, getPalette } from './palettes';
export { useThemeColors, makeThemedStyles } from './useThemedStyles';
