/**
 * OSCAR Fashion Design System - Mobile Color Palette
 * Source: Figma file C7Jv2nh0qbyuGVLpnj3T9Q (node 14:7381)
 */

export const colors = {
  // Primary Brand Colors (أساسي)
  primary: '#1E1E1E',
  primaryLight: '#4D4D4D',
  primaryDark: '#000000',
  primaryScale: {
    1: '#DFDFDF',
    2: '#B7B7B7',
    3: '#4D4D4D',
    4: '#1E1E1E',
    5: '#131313',
    6: '#000000',
  },

  // Secondary Brand Colors (ثانوي)
  secondary: '#FFD500',
  secondaryLight: '#FCEEA6',
  secondaryDark: '#D8B506',
  secondaryScale: {
    1: '#FFFDF5',
    2: '#FEF9E2',
    3: '#FCEEA6',
    4: '#F9D72A',
    5: '#D8B506',
    6: '#6E5C03',
  },

  // Background Colors
  background: '#FAFBFF',
  surface: '#FFFFFF',
  surfaceDark: '#EDEEF2',

  // Text Colors (النص الغامق / النص الفاتح)
  text: {
    primary: '#010B38',
    secondary: 'rgba(1, 11, 56, 0.6)',
    tertiary: 'rgba(1, 11, 56, 0.4)',
    disabled: 'rgba(1, 11, 56, 0.2)',
    inverse: '#FFFFFF',
  },

  // Dark Text Scale
  darkText: {
    DEFAULT: '#010B38',
    1: 'rgba(1, 11, 56, 0.2)',
    2: 'rgba(1, 11, 56, 0.3)',
    3: 'rgba(1, 11, 56, 0.4)',
    4: 'rgba(1, 11, 56, 0.5)',
    5: 'rgba(1, 11, 56, 0.6)',
    6: 'rgba(1, 11, 56, 0.8)',
  },

  // Gray Scale (رمادي)
  gray: {
    1: '#FAFBFF',
    2: '#EDEEF2',
    3: '#E1E2E5',
    4: '#D5D5D9',
    5: '#C8C9CC',
    6: '#646466',
  },

  // Status Colors
  success: '#2FD976',
  successLight: '#E5FFEE',
  successScale: {
    1: '#E5FFEE',
    2: '#99FFBB',
    3: '#66FF99',
    4: '#2EE56B',
    5: '#24B755',
    6: '#2EA154',
  },

  error: '#EB3E3E',
  errorLight: '#FFE5E5',
  errorScale: {
    1: '#FFE5E5',
    2: '#FF9999',
    3: '#FF6666',
    4: '#E53C3C',
    5: '#CC3636',
    6: '#B22F2F',
  },

  warning: '#FFBC1F',
  warningLight: '#FFF7E5',
  warningScale: {
    1: '#FFF7E5',
    2: '#FFDB87',
    3: '#FFCA4F',
    4: '#E5A91C',
    5: '#CC9619',
    6: '#B28416',
  },

  info: '#11CAEF',
  infoLight: '#E5FBFF',
  infoScale: {
    1: '#E5FBFF',
    2: '#99EEFF',
    3: '#66E6FF',
    4: '#43CBE5',
    5: '#29B1CC',
    6: '#1298B2',
  },

  // Border Colors
  border: '#E1E2E5',
  borderLight: '#EDEEF2',
  borderDark: '#C8C9CC',

  // Special Colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  shadow: 'rgba(0, 0, 0, 0.1)',
  transparent: 'transparent',

  // Gradient Colors
  gradient: {
    start: '#1E1E1E',
    end: '#000000',
  },
} as const;

export type Colors = typeof colors;
