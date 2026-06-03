import { useMemo } from 'react';
import { useThemeMode } from '../contexts/ThemeContext';
import { getPalette } from './palettes';
import type { ColorPalette } from './darkColors';

/** Current palette for the resolved theme mode. */
export function useThemeColors(): ColorPalette {
  const { resolved } = useThemeMode();
  return getPalette(resolved);
}

/**
 * Bind a style factory to the theme. Returns a hook that builds the StyleSheet
 * from the current palette, memoized on the palette (a stable module constant),
 * so it recomputes only on an actual light↔dark flip.
 *
 * Usage (StyleSheet body is unchanged — the factory param is also named `colors`):
 *   const useStyles = makeThemedStyles((colors) => StyleSheet.create({ ... }));
 *   function Screen() { const styles = useStyles(); ... }
 */
export function makeThemedStyles<T>(factory: (colors: ColorPalette) => T) {
  return function useStyles(): T {
    const colors = useThemeColors();
    return useMemo(() => factory(colors), [colors]);
  };
}
