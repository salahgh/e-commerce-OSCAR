// Base types that extend GraphQL generated types
export interface LocalizedString {
  ar: string;
  fr: string;
  en: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface FilterParams {
  categories?: string[];
  priceMin?: number;
  priceMax?: number;
  sizes?: string[];
  colors?: string[];
  inStock?: boolean;
  onSale?: boolean;
}

export interface SortParams {
  field: 'price' | 'name' | 'createdAt' | 'popularity';
  order: 'asc' | 'desc';
}

export interface Address {
  id: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  wilaya: string;
  postalCode?: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  avatar?: string;
  emailVerified: boolean;
  addresses?: Address[];
  createdAt: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: any; // Will be typed by GraphQL generated types
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  price: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  appliedCoupon?: {
    code: string;
    discount: number;
    type: string;
  };
}

export interface WilayaCity {
  wilaya: {
    code: string;
    name: LocalizedString;
  };
  cities: Array<{
    code: string;
    name: LocalizedString;
  }>;
}

export type Locale = 'ar' | 'fr' | 'en';
