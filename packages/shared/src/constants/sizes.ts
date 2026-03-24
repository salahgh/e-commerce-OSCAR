export const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'] as const;

export const AVAILABLE_COLORS = [
  'Noir',
  'Blanc',
  'Gris',
  'Beige',
  'Marron',
  'Bleu',
  'Marine',
  'Rouge',
  'Rose',
  'Vert',
  'Jaune',
  'Orange',
  'Violet',
  'Multicolore',
] as const;

export const USER_ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  CUSTOMER: 'Client',
} as const;

export const ITEMS_PER_PAGE = 20;
