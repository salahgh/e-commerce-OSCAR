import React from 'react';
import { StyleSheet } from 'react-native';

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn() }) }));
jest.mock('@/src/components/profile', () => ({ SettingsItem: () => null }));
jest.mock('@/src/contexts/ThemeContext', () => ({
  useThemeMode: jest.fn(),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

import { useThemeMode } from '@/src/contexts/ThemeContext';
import { renderWithProviders } from '@/src/test/renderWithProviders';
import SettingsScreen from '../settings';

const mockUseThemeMode = useThemeMode as jest.Mock;

function pageBackground() {
  const { getByTestId } = renderWithProviders(<SettingsScreen />);
  return StyleSheet.flatten(getByTestId('settings-screen').props.style).backgroundColor;
}

describe('SettingsScreen — themed background', () => {
  it('paints the dark page background when resolved is dark', () => {
    mockUseThemeMode.mockReturnValue({ mode: 'dark', resolved: 'dark', setMode: jest.fn() });
    expect(pageBackground()).toBe('#121212');
  });

  it('paints the light page background when resolved is light', () => {
    mockUseThemeMode.mockReturnValue({ mode: 'light', resolved: 'light', setMode: jest.fn() });
    expect(pageBackground()).toBe('#FAFBFF');
  });
});
