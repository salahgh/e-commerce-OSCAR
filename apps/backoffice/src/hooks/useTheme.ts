import { useEffect } from 'react';
import { useAppSelector } from './useAppSelector';
import { useAppDispatch } from './useAppDispatch';
import { setTheme, toggleTheme } from '../store/slices/themeSlice';
import type { Theme } from '../store/slices/themeSlice';

export const useTheme = () => {
  const theme = useAppSelector((state) => state.theme.theme);
  const dispatch = useAppDispatch();

  // Apply theme on mount and when theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const changeTheme = (newTheme: Theme) => {
    dispatch(setTheme(newTheme));
  };

  const cycleTheme = () => {
    dispatch(toggleTheme());
  };

  return {
    theme,
    setTheme: changeTheme,
    toggleTheme: cycleTheme,
    isDark: theme === 'dark' || theme === 'actuelle',
    isLight: theme === 'light',
  };
};
