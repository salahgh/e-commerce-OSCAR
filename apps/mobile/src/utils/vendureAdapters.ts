/**
 * Vendure Data Adapters
 * Transform Vendure API data to the format expected by the app
 */

// Vendure uses cents for prices, we display in DZD (whole numbers)
export const formatPrice = (cents: number): number => {
  return Math.round(cents / 100);
};

// Format price for display with currency
export const formatPriceDisplay = (cents: number, locale: string = 'fr-DZ'): string => {
  const amount = formatPrice(cents);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Adapt Vendure Product to app's expected Product format
export interface AppProduct {
  id: string;
  sku: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionFr: string;
  descriptionEn: string;
  basePrice: number;
  salePrice: number | null;
  stockQuantity: number;
  imageUrls: string[];
  categoryId: string | null;
  categoryName: string | null;
  isFeatured: boolean;
  availableSizes: string[];
  availableColors: string[];
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  // Vendure-specific
  slug: string;
  variants: AppProductVariant[];
}

export interface AppProductVariant {
  id: string;
  sku: string;
  name: string;
  priceWithTax: number;
  stockLevel: string;
  options: { name: string; code: string; group: string }[];
}

export interface VendureProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  featuredAsset?: { preview: string } | null;
  assets?: { preview: string }[];
  variants: {
    id: string;
    sku: string;
    name: string;
    priceWithTax: number;
    stockLevel: string;
    options: { name: string; code: string; group: { name: string } }[];
  }[];
  collections?: { id: string; name: string }[];
  customFields?: {
    nameAr?: string;
    nameFr?: string;
    descriptionAr?: string;
    descriptionFr?: string;
    isFeatured?: boolean;
    viewCount?: number;
  };
  createdAt?: string;
  updatedAt?: string;
}

export const adaptVendureProduct = (product: VendureProduct): AppProduct => {
  const defaultVariant = product.variants[0];
  const allOptions = product.variants.flatMap((v) => v.options);

  // Extract unique sizes and colors
  const sizes = [...new Set(allOptions.filter((o) => o.group.name.toLowerCase().includes('size')).map((o) => o.name))];
  const colors = [...new Set(allOptions.filter((o) => o.group.name.toLowerCase().includes('color')).map((o) => o.name))];

  // Get image URLs
  const imageUrls: string[] = [];
  if (product.featuredAsset?.preview) {
    imageUrls.push(product.featuredAsset.preview);
  }
  if (product.assets) {
    product.assets.forEach((asset) => {
      if (!imageUrls.includes(asset.preview)) {
        imageUrls.push(asset.preview);
      }
    });
  }

  // Calculate stock from variants
  const totalStock = product.variants.reduce((sum, v) => {
    const level = v.stockLevel;
    if (level === 'IN_STOCK') return sum + 100; // Assume high stock
    if (level === 'LOW_STOCK') return sum + 10;
    return sum;
  }, 0);

  return {
    id: product.id,
    sku: defaultVariant?.sku || '',
    nameAr: product.customFields?.nameAr || product.name,
    nameFr: product.customFields?.nameFr || product.name,
    nameEn: product.name,
    descriptionAr: product.customFields?.descriptionAr || product.description,
    descriptionFr: product.customFields?.descriptionFr || product.description,
    descriptionEn: product.description,
    basePrice: defaultVariant ? formatPrice(defaultVariant.priceWithTax) : 0,
    salePrice: null, // Vendure handles this differently
    stockQuantity: totalStock,
    imageUrls,
    categoryId: product.collections?.[0]?.id || null,
    categoryName: product.collections?.[0]?.name || null,
    isFeatured: product.customFields?.isFeatured || false,
    availableSizes: sizes,
    availableColors: colors,
    viewCount: product.customFields?.viewCount || 0,
    createdAt: product.createdAt || '',
    updatedAt: product.updatedAt || '',
    slug: product.slug,
    variants: product.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      name: v.name,
      priceWithTax: formatPrice(v.priceWithTax),
      stockLevel: v.stockLevel,
      options: v.options.map((o) => ({
        name: o.name,
        code: o.code,
        group: o.group.name,
      })),
    })),
  };
};

// Adapt Vendure Collection to app's Category format
export interface AppCategory {
  id: string;
  nameAr: string;
  nameFr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionFr: string;
  descriptionEn: string;
  imageUrl: string | null;
  parentId: string | null;
  isActive: boolean;
  displayOrder: number;
  slug: string;
}

export interface VendureCollection {
  id: string;
  name: string;
  slug: string;
  description: string;
  featuredAsset?: { preview: string } | null;
  parent?: { id: string } | null;
  position: number;
  customFields?: {
    nameAr?: string;
    nameFr?: string;
    descriptionAr?: string;
    descriptionFr?: string;
  };
}

export const adaptVendureCollection = (collection: VendureCollection): AppCategory => {
  return {
    id: collection.id,
    nameAr: collection.customFields?.nameAr || collection.name,
    nameFr: collection.customFields?.nameFr || collection.name,
    nameEn: collection.name,
    descriptionAr: collection.customFields?.descriptionAr || collection.description,
    descriptionFr: collection.customFields?.descriptionFr || collection.description,
    descriptionEn: collection.description,
    imageUrl: collection.featuredAsset?.preview || null,
    parentId: collection.parent?.id || null,
    isActive: true,
    displayOrder: collection.position,
    slug: collection.slug,
  };
};

// Adapt Vendure OrderLine to app's CartItem format
export interface AppCartItem {
  id: string;
  productId: string;
  productVariantId: string;
  productName: string;
  productImage: string | null;
  quantity: number;
  unitPrice: number;
  /** Pre-discount list price for the line, when the backend reports a per-item
   * discount (original > charged unit price). Null when there is no line discount. */
  originalUnitPrice: number | null;
  totalPrice: number;
  size: string | null;
  color: string | null;
  sku: string;
}

export interface VendureOrderLine {
  id: string;
  quantity: number;
  linePriceWithTax: number;
  unitPriceWithTax: number;
  /** After-promotion unit price. Optional until wired into the cart fragment. */
  discountedUnitPriceWithTax?: number;
  productVariant: {
    id: string;
    sku: string;
    name: string;
    product: {
      id: string;
      name: string;
      featuredAsset?: { preview: string } | null;
    };
    options: { name: string; code: string; group: { name: string } }[];
  };
}

export const adaptVendureOrderLine = (line: VendureOrderLine): AppCartItem => {
  const sizeOption = line.productVariant.options.find((o) =>
    o.group.name.toLowerCase().includes('size')
  );
  const colorOption = line.productVariant.options.find((o) =>
    o.group.name.toLowerCase().includes('color')
  );

  return {
    id: line.id,
    productId: line.productVariant.product.id,
    productVariantId: line.productVariant.id,
    productName: line.productVariant.product.name,
    productImage: line.productVariant.product.featuredAsset?.preview || null,
    quantity: line.quantity,
    // Charge the discounted unit price when the backend reports one; otherwise
    // the plain unit price. originalUnitPrice carries the pre-discount list price
    // (for the strikethrough) only when an actual discount applies.
    unitPrice: formatPrice(line.discountedUnitPriceWithTax ?? line.unitPriceWithTax),
    originalUnitPrice:
      line.discountedUnitPriceWithTax != null &&
      line.discountedUnitPriceWithTax < line.unitPriceWithTax
        ? formatPrice(line.unitPriceWithTax)
        : null,
    totalPrice: formatPrice(line.linePriceWithTax),
    size: sizeOption?.name || null,
    color: colorOption?.name || null,
    sku: line.productVariant.sku,
  };
};

// Adapt Vendure Order to app's Order format
export interface AppOrder {
  id: string;
  code: string;
  state: string;
  total: number;
  subTotal: number;
  shipping: number;
  items: AppCartItem[];
  createdAt: string;
  updatedAt: string;
  shippingAddress: {
    fullName: string;
    streetLine1: string;
    streetLine2: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
    phoneNumber: string;
  } | null;
}

export interface VendureOrder {
  id: string;
  code: string;
  state: string;
  totalWithTax: number;
  subTotalWithTax: number;
  shippingWithTax: number;
  lines: VendureOrderLine[];
  createdAt: string;
  updatedAt: string;
  shippingAddress?: {
    fullName: string;
    streetLine1: string;
    streetLine2: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
    phoneNumber: string;
  } | null;
}

export const adaptVendureOrder = (order: VendureOrder): AppOrder => {
  return {
    id: order.id,
    code: order.code,
    state: mapVendureOrderState(order.state),
    total: formatPrice(order.totalWithTax),
    subTotal: formatPrice(order.subTotalWithTax),
    shipping: formatPrice(order.shippingWithTax),
    items: order.lines.map(adaptVendureOrderLine),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    shippingAddress: order.shippingAddress || null,
  };
};

// Map Vendure order states to app-friendly display states
export const mapVendureOrderState = (vendureState: string): string => {
  const stateMap: Record<string, string> = {
    AddingItems: 'CART',
    ArrangingPayment: 'PENDING_PAYMENT',
    PaymentAuthorized: 'PAYMENT_AUTHORIZED',
    PaymentSettled: 'PAID',
    PartiallyShipped: 'PARTIALLY_SHIPPED',
    Shipped: 'SHIPPED',
    PartiallyDelivered: 'PARTIALLY_DELIVERED',
    Delivered: 'DELIVERED',
    Modifying: 'MODIFYING',
    ArrangingAdditionalPayment: 'ADDITIONAL_PAYMENT',
    Cancelled: 'CANCELLED',
  };
  return stateMap[vendureState] || vendureState;
};

// Get localized name based on current language
export const getLocalizedName = (
  item: { nameAr?: string; nameFr?: string; nameEn?: string; name?: string },
  language: 'ar' | 'fr' | 'en' = 'en'
): string => {
  switch (language) {
    case 'ar':
      return item.nameAr || item.nameEn || item.name || '';
    case 'fr':
      return item.nameFr || item.nameEn || item.name || '';
    case 'en':
    default:
      return item.nameEn || item.name || '';
  }
};

// Get localized description based on current language
export const getLocalizedDescription = (
  item: { descriptionAr?: string; descriptionFr?: string; descriptionEn?: string; description?: string },
  language: 'ar' | 'fr' | 'en' = 'en'
): string => {
  switch (language) {
    case 'ar':
      return item.descriptionAr || item.descriptionEn || item.description || '';
    case 'fr':
      return item.descriptionFr || item.descriptionEn || item.description || '';
    case 'en':
    default:
      return item.descriptionEn || item.description || '';
  }
};

// Find variant by selected options (size, color)
export const findVariantByOptions = (
  variants: AppProductVariant[],
  selectedSize?: string | null,
  selectedColor?: string | null
): AppProductVariant | undefined => {
  return variants.find((variant) => {
    const sizeMatch = !selectedSize || variant.options.some(
      (o) => o.group.toLowerCase().includes('size') && o.name === selectedSize
    );
    const colorMatch = !selectedColor || variant.options.some(
      (o) => o.group.toLowerCase().includes('color') && o.name === selectedColor
    );
    return sizeMatch && colorMatch;
  });
};
