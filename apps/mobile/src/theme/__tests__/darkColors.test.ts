import { colors } from '../colors';
import { darkColors } from '../darkColors';

/** Collect every leaf key path (e.g. "text.primary", "primaryScale.4"). */
function keyPaths(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    return v && typeof v === 'object' ? keyPaths(v as Record<string, unknown>, path) : [path];
  });
}

describe('darkColors', () => {
  it('has exactly the same key structure as the light palette', () => {
    expect(keyPaths(darkColors).sort()).toEqual(keyPaths(colors).sort());
  });

  it('uses the conventional-dark anchor values', () => {
    expect(darkColors.background).toBe('#121212'); // near-black page
    expect(darkColors.surface).toBe('#1E1E1E'); // cards lighter than page
    expect(darkColors.primary).toBe('#ECECEC'); // neutral accent
    expect(darkColors.text.primary).toBe('#ECECEC'); // off-white text
    expect(darkColors.text.inverse).toBe('#1E1E1E'); // text on light buttons
  });

  it('keeps the brand yellow and vivid status hues unchanged', () => {
    expect(darkColors.secondary).toBe('#FFD500');
    expect(darkColors.success).toBe('#2FD976');
    expect(darkColors.error).toBe('#EB3E3E');
    expect(darkColors.warning).toBe('#FFBC1F');
    expect(darkColors.info).toBe('#11CAEF');
  });

  it('darkens the pale status tint backgrounds', () => {
    expect(darkColors.successLight).toBe('#12301E');
    expect(darkColors.errorLight).toBe('#3A1717');
    expect(darkColors.warningLight).toBe('#3A2E12');
    expect(darkColors.infoLight).toBe('#12303A');
  });
});
