import { I18nManager } from 'react-native';

/**
 * Directional Ionicons that must be mirrored in RTL (Arabic). React Native's
 * forceRTL mirrors layout but NOT icon glyphs, so chevrons/arrows keep pointing
 * the wrong way unless we swap the icon name explicitly.
 */
const DIRECTIONAL_SWAP: Record<string, string> = {
  'chevron-back': 'chevron-forward',
  'chevron-forward': 'chevron-back',
  'chevron-back-outline': 'chevron-forward-outline',
  'chevron-forward-outline': 'chevron-back-outline',
  'arrow-back': 'arrow-forward',
  'arrow-forward': 'arrow-back',
  'arrow-back-outline': 'arrow-forward-outline',
  'arrow-forward-outline': 'arrow-back-outline',
};

/**
 * Returns the RTL-aware variant of a directional Ionicon name.
 * In LTR (or for non-directional icons) the name is returned unchanged.
 */
export function rtlIcon<T extends string>(name: T): T {
  return (I18nManager.isRTL && DIRECTIONAL_SWAP[name] ? DIRECTIONAL_SWAP[name] : name) as T;
}
