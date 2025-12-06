/**
 * OSCAR Fashion - Color Utility
 * Maps color names to hex codes for visual display
 */

export interface ColorDefinition {
  name: string;
  nameFr: string;
  nameAr: string;
  hex: string;
}

// Complete color palette used in OSCAR Fashion
export const COLOR_PALETTE: ColorDefinition[] = [
  { name: 'Black', nameFr: 'Noir', nameAr: 'أسود', hex: '#000000' },
  { name: 'White', nameFr: 'Blanc', nameAr: 'أبيض', hex: '#FFFFFF' },
  { name: 'Navy', nameFr: 'Marine', nameAr: 'كحلي', hex: '#001F3F' },
  { name: 'Gray', nameFr: 'Gris', nameAr: 'رمادي', hex: '#808080' },
  { name: 'Beige', nameFr: 'Beige', nameAr: 'بيج', hex: '#F5F5DC' },
  { name: 'Brown', nameFr: 'Marron', nameAr: 'بني', hex: '#8B4513' },
  { name: 'Red', nameFr: 'Rouge', nameAr: 'أحمر', hex: '#FF0000' },
  { name: 'Blue', nameFr: 'Bleu', nameAr: 'أزرق', hex: '#0074D9' },
  { name: 'Green', nameFr: 'Vert', nameAr: 'أخضر', hex: '#2ECC40' },
  { name: 'Pink', nameFr: 'Rose', nameAr: 'وردي', hex: '#FF69B4' },
  { name: 'Purple', nameFr: 'Violet', nameAr: 'بنفسجي', hex: '#B10DC9' },
  { name: 'Orange', nameFr: 'Orange', nameAr: 'برتقالي', hex: '#FF851B' },
];

// Quick lookup map by color name (case-insensitive)
const colorMap = new Map<string, ColorDefinition>();
COLOR_PALETTE.forEach((color) => {
  colorMap.set(color.name.toLowerCase(), color);
  colorMap.set(color.nameFr.toLowerCase(), color);
  colorMap.set(color.nameAr, color);
});

/**
 * Get hex code for a color name
 * Supports English, French, and Arabic color names
 */
export function getColorHex(colorName: string): string | null {
  const color = colorMap.get(colorName.toLowerCase());
  return color?.hex || null;
}

/**
 * Get full color definition by name
 */
export function getColorDefinition(colorName: string): ColorDefinition | null {
  return colorMap.get(colorName.toLowerCase()) || null;
}

/**
 * Check if a string is a valid hex color
 */
export function isValidHexColor(hex: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

/**
 * Get contrasting text color (black or white) for a given background hex
 */
export function getContrastColor(hex: string): 'black' | 'white' {
  // Remove # if present
  const color = hex.replace('#', '');

  // Convert to RGB
  const r = parseInt(color.slice(0, 2), 16);
  const g = parseInt(color.slice(2, 4), 16);
  const b = parseInt(color.slice(4, 6), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? 'black' : 'white';
}
