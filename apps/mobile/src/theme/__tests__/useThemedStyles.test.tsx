import { StyleSheet } from 'react-native';
import { renderHook } from '@testing-library/react-native';

// Mock the theme context so `resolved` is fully controlled (no provider needed).
jest.mock('@/src/contexts/ThemeContext', () => ({ useThemeMode: jest.fn() }));

import { useThemeMode } from '@/src/contexts/ThemeContext';
import { colors } from '../colors';
import { darkColors } from '../darkColors';
import { useThemeColors, makeThemedStyles } from '../useThemedStyles';

const mockUseThemeMode = useThemeMode as jest.Mock;
const setDark = () =>
  mockUseThemeMode.mockReturnValue({ mode: 'dark', resolved: 'dark', setMode: jest.fn() });
const setLight = () =>
  mockUseThemeMode.mockReturnValue({ mode: 'light', resolved: 'light', setMode: jest.fn() });

const useProbeStyles = makeThemedStyles((c) =>
  StyleSheet.create({ box: { backgroundColor: c.background } }),
);

describe('useThemeColors', () => {
  it('returns the dark palette when resolved is dark', () => {
    setDark();
    const { result } = renderHook(() => useThemeColors());
    expect(result.current).toBe(darkColors);
  });

  it('returns the light palette when resolved is light', () => {
    setLight();
    const { result } = renderHook(() => useThemeColors());
    expect(result.current).toBe(colors);
  });
});

describe('makeThemedStyles', () => {
  it('builds dark styles under dark mode and light styles under light mode', () => {
    setDark();
    expect(renderHook(() => useProbeStyles()).result.current.box.backgroundColor).toBe('#121212');
    setLight();
    expect(renderHook(() => useProbeStyles()).result.current.box.backgroundColor).toBe('#FAFBFF');
  });

  it('returns a stable (memoized) style object across re-renders at a fixed mode', () => {
    setDark();
    const { result, rerender } = renderHook(() => useProbeStyles());
    const first = result.current;
    rerender({});
    expect(result.current).toBe(first);
  });
});
