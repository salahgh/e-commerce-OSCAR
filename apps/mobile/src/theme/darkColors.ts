/**
 * OSCAR Fashion Design System — Mobile Dark Palette (conventional dark).
 *
 * Twin of `colors` (same key structure) with conventional-dark values:
 * near-black page, elevated surfaces LIGHTER than the page, off-white text,
 * a neutral (#ECECEC) primary accent, and brand yellow (#FFD500) kept as the
 * "pop" secondary. Brand/status hues read fine on dark and stay vivid; only the
 * pale status TINT backgrounds are darkened. See the M3d-1 design spec.
 */
import { colors } from './colors';

/** Widen the `as const` literal palette type so a twin can supply different values. */
type Widen<T> = {
  [K in keyof T]: T[K] extends string ? string : Widen<T[K]>;
};

export type ColorPalette = Widen<typeof colors>;

export const darkColors: ColorPalette = {
  // Primary — neutral accent on dark (was near-black)
  primary: '#ECECEC',
  primaryLight: '#FFFFFF',
  primaryDark: '#D5D5D5',
  primaryScale: {
    1: '#2A2A2A',
    2: '#3D3D3D',
    3: '#5C5C5C',
    4: '#8A8A8A',
    5: '#B7B7B7',
    6: '#ECECEC',
  },

  // Secondary — brand yellow stays the pop accent; pale tints muted for dark bg
  secondary: '#FFD500',
  secondaryLight: '#3D3517',
  secondaryDark: '#D8B506',
  secondaryScale: {
    1: '#FFFDF5',
    2: '#FEF9E2',
    3: '#FCEEA6',
    4: '#F9D72A',
    5: '#D8B506',
    6: '#6E5C03',
  },

  // Backgrounds — conventional dark: elevated surfaces are LIGHTER than the page
  background: '#121212',
  surface: '#1E1E1E',
  surfaceDark: '#2A2A2A',

  // Text — off-white primary, white-based alpha ramp
  text: {
    primary: '#ECECEC',
    secondary: 'rgba(255, 255, 255, 0.6)',
    tertiary: 'rgba(255, 255, 255, 0.4)',
    disabled: 'rgba(255, 255, 255, 0.3)',
    inverse: '#1E1E1E',
  },

  // Dark Text Scale — inverted to a light-on-dark alpha ramp
  darkText: {
    DEFAULT: '#ECECEC',
    1: 'rgba(255, 255, 255, 0.2)',
    2: 'rgba(255, 255, 255, 0.3)',
    3: 'rgba(255, 255, 255, 0.4)',
    4: 'rgba(255, 255, 255, 0.5)',
    5: 'rgba(255, 255, 255, 0.6)',
    6: 'rgba(255, 255, 255, 0.8)',
  },

  // Gray Scale — inverted neutral ramp (subtle → mid grey on dark)
  gray: {
    1: '#1E1E1E',
    2: '#242424',
    3: '#2E2E2E',
    4: '#3A3A3A',
    5: '#4A4A4A',
    6: '#8A8A8A',
  },

  // Status — vivid base + scales kept (read fine on dark); pale tints darkened
  success: '#2FD976',
  successLight: '#12301E',
  successScale: {
    1: '#E5FFEE',
    2: '#99FFBB',
    3: '#66FF99',
    4: '#2EE56B',
    5: '#24B755',
    6: '#2EA154',
  },

  error: '#EB3E3E',
  errorLight: '#3A1717',
  errorScale: {
    1: '#FFE5E5',
    2: '#FF9999',
    3: '#FF6666',
    4: '#E53C3C',
    5: '#CC3636',
    6: '#B22F2F',
  },

  warning: '#FFBC1F',
  warningLight: '#3A2E12',
  warningScale: {
    1: '#FFF7E5',
    2: '#FFDB87',
    3: '#FFCA4F',
    4: '#E5A91C',
    5: '#CC9619',
    6: '#B28416',
  },

  info: '#11CAEF',
  infoLight: '#12303A',
  infoScale: {
    1: '#E5FBFF',
    2: '#99EEFF',
    3: '#66E6FF',
    4: '#43CBE5',
    5: '#29B1CC',
    6: '#1298B2',
  },

  // Borders — subtle dark greys
  border: '#2E2E2E',
  borderLight: '#242424',
  borderDark: '#3A3A3A',

  // Base Colors — literal, unchanged
  white: '#FFFFFF',
  black: '#000000',

  // Special — overlays slightly stronger on dark
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',
  overlayDark: 'rgba(0, 0, 0, 0.8)',
  overlayWhite: 'rgba(255, 255, 255, 0.2)',
  overlayWhiteLight: 'rgba(255, 255, 255, 0.6)',
  overlayWhiteMedium: 'rgba(255, 255, 255, 0.9)',
  shadow: 'rgba(0, 0, 0, 0.3)',
  transparent: 'transparent',

  // Gradient — dark
  gradient: {
    start: '#2A2A2A',
    end: '#121212',
  },
};
