/**
 * OSCAR Fashion Design System - Color Palette
 * Source: Figma file C7Jv2nh0qbyuGVLpnj3T9Q (node 14:7381)
 *
 * Each color group has a main/brand color and 6 shades (1=lightest, 6=darkest).
 */

export const oscarColors = {
  primary: {
    1: '#DFDFDF',
    2: '#B7B7B7',
    3: '#4D4D4D',
    DEFAULT: '#1E1E1E',
    4: '#1E1E1E',
    5: '#131313',
    6: '#000000',
  },
  secondary: {
    1: '#FFFDF5',
    2: '#FEF9E2',
    3: '#FCEEA6',
    DEFAULT: '#FFD500',
    4: '#F9D72A',
    5: '#D8B506',
    6: '#6E5C03',
  },
  darkText: {
    DEFAULT: '#010B38',
    1: 'rgba(1, 11, 56, 0.2)',
    2: 'rgba(1, 11, 56, 0.3)',
    3: 'rgba(1, 11, 56, 0.4)',
    4: 'rgba(1, 11, 56, 0.5)',
    5: 'rgba(1, 11, 56, 0.6)',
    6: 'rgba(1, 11, 56, 0.8)',
  },
  lightText: {
    DEFAULT: '#FFFFFF',
    1: 'rgba(255, 255, 255, 0.2)',
    2: 'rgba(255, 255, 255, 0.3)',
    3: 'rgba(255, 255, 255, 0.4)',
    4: 'rgba(255, 255, 255, 0.5)',
    5: 'rgba(255, 255, 255, 0.6)',
    6: 'rgba(255, 255, 255, 0.8)',
  },
  gray: {
    DEFAULT: '#FFFFFF',
    1: '#FAFBFF',
    2: '#EDEEF2',
    3: '#E1E2E5',
    4: '#D5D5D9',
    5: '#C8C9CC',
    6: '#646466',
  },
  error: {
    DEFAULT: '#EB3E3E',
    1: '#FFE5E5',
    2: '#FF9999',
    3: '#FF6666',
    4: '#E53C3C',
    5: '#CC3636',
    6: '#B22F2F',
  },
  success: {
    DEFAULT: '#2FD976',
    1: '#E5FFEE',
    2: '#99FFBB',
    3: '#66FF99',
    4: '#2EE56B',
    5: '#24B755',
    6: '#2EA154',
  },
  warning: {
    DEFAULT: '#FFBC1F',
    1: '#FFF7E5',
    2: '#FFDB87',
    3: '#FFCA4F',
    4: '#E5A91C',
    5: '#CC9619',
    6: '#B28416',
  },
  info: {
    DEFAULT: '#11CAEF',
    1: '#E5FBFF',
    2: '#99EEFF',
    3: '#66E6FF',
    4: '#43CBE5',
    5: '#29B1CC',
    6: '#1298B2',
  },
} as const;

export type OscarColors = typeof oscarColors;
