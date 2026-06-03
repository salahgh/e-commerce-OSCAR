import { colors } from '../colors';
import { darkColors } from '../darkColors';
import { palettes, getPalette } from '../palettes';

describe('getPalette', () => {
  it('returns the light palette (identity) for "light"', () => {
    expect(getPalette('light')).toBe(colors);
  });

  it('returns the dark palette (identity) for "dark"', () => {
    expect(getPalette('dark')).toBe(darkColors);
  });

  it('exposes both palettes on the map', () => {
    expect(palettes.light).toBe(colors);
    expect(palettes.dark).toBe(darkColors);
  });

  it('defaults to the light palette for any non-dark value', () => {
    // @ts-expect-error — defensive default for an out-of-type value
    expect(getPalette('weird')).toBe(colors);
  });
});
