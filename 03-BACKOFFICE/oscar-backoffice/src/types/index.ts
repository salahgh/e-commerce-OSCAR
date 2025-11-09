export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phoneNumber?: string;
  emailVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];

export const OrderStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;
export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

export const PaymentStatus = {
  PENDING: 'PENDING',
  PAID: 'PAID',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
  CANCELLED: 'CANCELLED',
} as const;
export type PaymentStatus = typeof PaymentStatus[keyof typeof PaymentStatus];

export const PaymentMethod = {
  CASH_ON_DELIVERY: 'CASH_ON_DELIVERY',
  CIB: 'CIB',
  BARIDIMOB: 'BARIDIMOB',
} as const;
export type PaymentMethod = typeof PaymentMethod[keyof typeof PaymentMethod];

export interface LocalizedString {
  fr: string;
  ar: string;
  en?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: LocalizedString;
  description: LocalizedString;
  basePrice: number;
  salePrice?: number;
  stockQuantity: number;
  minStockAlert: number;
  imageUrls: string[];
  availableSizes: string[];
  availableColors: string[];
  isActive: boolean;
  isFeatured: boolean;
  viewCount: number;
  weightKg?: number;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  slug: string;
  name: LocalizedString;
  description: LocalizedString;
  imageUrl?: string;
  displayOrder: number;
  isActive: boolean;
  parent?: Category;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  user: User;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
  shippingFullName: string;
  shippingPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingWilaya: string;
  shippingPostalCode?: string;
  customerNotes?: string;
  trackingNumber?: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  paidAt?: string;
}

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  selectedSize?: string;
  selectedColor?: string;
  productNameFr: string;
  productNameAr: string;
  productNameEn?: string;
  productSku: string;
  productImageUrl?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  customersGrowth: number;
  lowStockProducts: number;
}

export interface PaginationInfo {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
