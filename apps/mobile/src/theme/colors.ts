export const colors = {
  // Primary Brand Colors (OSCAR Fashion)
  primary: '#2C3E50', // Blue marine
  primaryLight: '#34495E',
  primaryDark: '#1A252F',

  // Secondary Brand Colors
  secondary: '#E8D5C4', // Beige/cream
  secondaryLight: '#F5EAE0',
  secondaryDark: '#D4BFA8',

  // Accent Colors
  accent: '#C9A992', // Terracotta
  accentLight: '#E0C4B3',
  accentDark: '#B08D70',

  // Background Colors
  background: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceDark: '#F8F9FA',

  // Text Colors
  text: {
    primary: '#333333',
    secondary: '#666666',
    tertiary: '#999999',
    disabled: '#CCCCCC',
    inverse: '#FFFFFF',
  },

  // Status Colors
  success: '#4CAF50',
  successLight: '#81C784',
  error: '#F44336',
  errorLight: '#E57373',
  warning: '#FFC107',
  warningLight: '#FFD54F',
  info: '#2196F3',
  infoLight: '#64B5F6',

  // Border Colors
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  borderDark: '#BDBDBD',

  // Special Colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  shadow: 'rgba(0, 0, 0, 0.1)',
  transparent: 'transparent',

  // Gradient Colors
  gradient: {
    start: '#2C3E50',
    end: '#34495E',
  },
} as const;

export type Colors = typeof colors;
