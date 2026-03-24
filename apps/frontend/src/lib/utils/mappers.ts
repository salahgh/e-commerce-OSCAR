/**
 * Data mapping utilities to convert backend GraphQL responses to frontend types
 * Note: These mappers are kept for legacy compatibility. With Vendure, you may use direct GraphQL fragments.
 */

export type Locale = 'ar' | 'fr' | 'en';

// Legacy product response type - adjust as needed for your backend
interface LegacyProductResponse {
  id: string | number;
  sku?: string;
  nameAr?: string;
  nameFr?: string;
  nameEn?: string;
  descriptionAr?: string;
  descriptionFr?: string;
  descriptionEn?: string;
  basePrice?: number | string;
  salePrice?: number | string;
  stockQuantity?: number;
  imageUrls?: string[];
  categoryId?: string | number;
  categoryName?: string;
  availableSizes?: string[];
  availableColors?: string[];
  isFeatured?: boolean;
  viewCount?: number | string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Map backend product to frontend product format
 */
export function mapProduct(product: LegacyProductResponse, locale: Locale = 'fr') {
  return {
    id: product.id.toString(),
    sku: product.sku || '',
    slug: product.sku || '', // Using SKU as slug since backend doesn't have slug
    name: {
      ar: product.nameAr || '',
      fr: product.nameFr || '',
      en: product.nameEn || '',
    },
    description: {
      ar: product.descriptionAr || '',
      fr: product.descriptionFr || '',
      en: product.descriptionEn || '',
    },
    basePrice: Number(product.basePrice) || 0,
    salePrice: product.salePrice ? Number(product.salePrice) : undefined,
    stockQuantity: product.stockQuantity || 0,
    images: (product.imageUrls || []).map((url, index) => ({
      id: `${product.id}-${index}`,
      url,
      alt: getLocalizedField(product, 'name', locale),
      isPrimary: index === 0,
    })),
    category: product.categoryId
      ? {
          id: product.categoryId.toString(),
          name: {
            ar: product.categoryName || '',
            fr: product.categoryName || '',
            en: product.categoryName || '',
          },
          slug: product.categoryName?.toLowerCase().replace(/\s+/g, '-') || '',
        }
      : undefined,
    variants: mapProductVariants(product),
    isFeatured: product.isFeatured || false,
    viewCount: product.viewCount ? Number(product.viewCount) : 0,
    createdAt: product.createdAt || new Date().toISOString(),
    updatedAt: product.updatedAt || new Date().toISOString(),
    status: product.stockQuantity && product.stockQuantity > 0 ? 'ACTIVE' : 'OUT_OF_STOCK',
  };
}

/**
 * Map product variants from backend format
 */
function mapProductVariants(product: LegacyProductResponse) {
  const variants: any[] = [];
  const sizes = product.availableSizes || [];
  const colors = product.availableColors || [];

  // If product has both sizes and colors, create combinations
  if (sizes.length > 0 && colors.length > 0) {
    sizes.forEach((size) => {
      colors.forEach((color) => {
        variants.push({
          id: `${product.id}-${size}-${color}`,
          size,
          color,
          price: Number(product.salePrice || product.basePrice),
          stockQuantity: Math.floor((product.stockQuantity || 0) / (sizes.length * colors.length)),
        });
      });
    });
  } else if (sizes.length > 0) {
    // Only sizes
    sizes.forEach((size) => {
      variants.push({
        id: `${product.id}-${size}`,
        size,
        price: Number(product.salePrice || product.basePrice),
        stockQuantity: Math.floor((product.stockQuantity || 0) / sizes.length),
      });
    });
  } else if (colors.length > 0) {
    // Only colors
    colors.forEach((color) => {
      variants.push({
        id: `${product.id}-${color}`,
        color,
        price: Number(product.salePrice || product.basePrice),
        stockQuantity: Math.floor((product.stockQuantity || 0) / colors.length),
      });
    });
  }

  return variants;
}

/**
 * Get localized field value from product
 */
export function getLocalizedField(
  item: any,
  field: string,
  locale: Locale
): string {
  const capitalizedLocale = locale.charAt(0).toUpperCase() + locale.slice(1);
  const fieldName = `${field}${capitalizedLocale}`;
  return item[fieldName] || item[`${field}Fr`] || item[`${field}En`] || '';
}

/**
 * Map backend cart to frontend cart format
 */
export function mapCart(cart: any) {
  if (!cart) return null;

  return {
    id: cart.id?.toString() || 'guest',
    items: (cart.items || []).map((item: any) => ({
      id: item.id?.toString() || '',
      productId: item.productId?.toString() || '',
      product: {
        id: item.productId?.toString() || '',
        slug: item.productId?.toString() || '', // Using ID as fallback
        name: {
          ar: item.productName || '',
          fr: item.productName || '',
          en: item.productName || '',
        },
        basePrice: Number(item.price) || 0,
        images: item.productImage
          ? [
              {
                id: '1',
                url: item.productImage,
                alt: item.productName || '',
                isPrimary: true,
              },
            ]
          : [],
      },
      variant: item.selectedSize || item.selectedColor
        ? {
            id: `${item.productId}-variant`,
            size: item.selectedSize,
            color: item.selectedColor,
            price: Number(item.price) || 0,
          }
        : undefined,
      quantity: item.quantity || 1,
      price: Number(item.price) || 0,
      total: Number(item.subtotal) || 0,
    })),
    subtotal: Number(cart.totalAmount) || 0,
    discount: 0, // Backend doesn't provide this separately
    shippingCost: 0, // Will be calculated at checkout
    total: Number(cart.totalAmount) || 0,
    createdAt: cart.createdAt || new Date().toISOString(),
    updatedAt: cart.updatedAt || new Date().toISOString(),
  };
}

/**
 * Map backend order to frontend order format
 */
export function mapOrder(order: any, locale: Locale = 'fr') {
  if (!order) return null;

  return {
    id: order.id?.toString() || '',
    orderNumber: order.orderNumber || '',
    status: order.status || 'PENDING',
    items: (order.items || []).map((item: any) => ({
      id: item.id?.toString() || '',
      product: {
        id: item.productId?.toString() || '',
        name: {
          ar: item.productName || '',
          fr: item.productName || '',
          en: item.productName || '',
        },
        images: item.productImage
          ? [{ url: item.productImage, isPrimary: true }]
          : [],
      },
      variant: item.selectedSize || item.selectedColor
        ? {
            size: item.selectedSize,
            color: item.selectedColor,
          }
        : undefined,
      quantity: item.quantity || 1,
      price: Number(item.price) || 0,
      total: Number(item.subtotal) || 0,
    })),
    subtotal: Number(order.subtotal) || 0,
    shippingCost: Number(order.shippingCost) || 0,
    discount: 0,
    total: Number(order.totalAmount) || 0,
    paymentMethod: order.paymentMethod || '',
    shippingAddress: order.shippingAddress || '',
    phoneNumber: order.phoneNumber || '',
    notes: order.notes || '',
    trackingNumber: order.trackingNumber || '',
    createdAt: order.createdAt || new Date().toISOString(),
    updatedAt: order.updatedAt || new Date().toISOString(),
    paidAt: order.paidAt,
    deliveredAt: order.deliveredAt,
  };
}

/**
 * Map backend category to frontend category format
 */
export function mapCategory(category: any) {
  if (!category) return null;

  return {
    id: category.id?.toString() || '',
    name: {
      ar: category.nameAr || '',
      fr: category.nameFr || '',
      en: category.nameEn || '',
    },
    description: {
      ar: category.descriptionAr || '',
      fr: category.descriptionFr || '',
      en: category.descriptionEn || '',
    },
    slug: category.slug || '',
    imageUrl: category.imageUrl || '',
    parentId: category.parentId?.toString(),
    isActive: category.isActive !== false,
    productCount: category.productCount || 0,
    children: (category.children || []).map(mapCategory),
  };
}

/**
 * Format price for display
 */
export function formatPrice(price: number | string): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numPrice);
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date, locale: Locale = 'fr'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-DZ' : `${locale}-DZ`, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}
