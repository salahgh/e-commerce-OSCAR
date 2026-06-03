import * as theme from '../index';

describe('theme barrel', () => {
  it('re-exports the dark-mode foundation', () => {
    expect(typeof theme.getPalette).toBe('function');
    expect(typeof theme.useThemeColors).toBe('function');
    expect(typeof theme.makeThemedStyles).toBe('function');
    expect(theme.darkColors.background).toBe('#121212');
    expect(theme.palettes.light).toBe(theme.colors);
  });
});
