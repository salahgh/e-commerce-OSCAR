import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

export type Theme = 'light' | 'dark' | 'actuelle';

interface ThemeState {
  theme: Theme;
}

// Get theme from localStorage or default to 'actuelle'
const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const savedTheme = localStorage.getItem('oscar-theme');
    if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'actuelle') {
      return savedTheme;
    }
  }
  return 'actuelle'; // Default to current theme
};

const initialState: ThemeState = {
  theme: getInitialTheme(),
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      // Persist to localStorage
      localStorage.setItem('oscar-theme', action.payload);
      // Apply to document
      document.documentElement.setAttribute('data-theme', action.payload);
    },
    toggleTheme: (state) => {
      const themes: Theme[] = ['light', 'dark', 'actuelle'];
      const currentIndex = themes.indexOf(state.theme);
      const nextIndex = (currentIndex + 1) % themes.length;
      state.theme = themes[nextIndex];
      localStorage.setItem('oscar-theme', state.theme);
      document.documentElement.setAttribute('data-theme', state.theme);
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export default themeSlice.reducer;
