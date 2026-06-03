import type { ResolvedTheme } from '../contexts/ThemeContext';
import { colors } from './colors';
import { darkColors, type ColorPalette } from './darkColors';

/** Light/dark palette map. `light` holds the existing `colors` by reference. */
export const palettes: Record<ResolvedTheme, ColorPalette> = {
  light: colors,
  dark: darkColors,
};

/** Pure selector: resolved theme mode → palette. Defaults to light. */
export function getPalette(resolved: ResolvedTheme): ColorPalette {
  return resolved === 'dark' ? palettes.dark : palettes.light;
}
