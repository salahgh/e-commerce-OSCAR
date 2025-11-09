/* eslint-disable */
import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** An arbitrary precision signed decimal */
  BigDecimal: { input: any; output: any; }
  /** Built-in scalar representing a local date-time */
  LocalDateTime: { input: any; output: any; }
  /** A 64-bit signed integer */
  Long: { input: any; output: any; }
};

export type AddToCartRequestInput = {
  productId: Scalars['Long']['input'];
  quantity: Scalars['Int']['input'];
  selectedColor?: InputMaybe<Scalars['String']['input']>;
  selectedSize?: InputMaybe<Scalars['String']['input']>;
};

export type CartItemResponse = {
  __typename?: 'CartItemResponse';
  id?: Maybe<Scalars['Long']['output']>;
  price?: Maybe<Scalars['BigDecimal']['output']>;
  productId?: Maybe<Scalars['Long']['output']>;
  productImage?: Maybe<Scalars['String']['output']>;
  productName?: Maybe<Scalars['String']['output']>;
  quantity?: Maybe<Scalars['Int']['output']>;
  selectedColor?: Maybe<Scalars['String']['output']>;
  selectedSize?: Maybe<Scalars['String']['output']>;
  subtotal?: Maybe<Scalars['BigDecimal']['output']>;
};

export type CartResponse = {
  __typename?: 'CartResponse';
  createdAt?: Maybe<Scalars['LocalDateTime']['output']>;
  id?: Maybe<Scalars['Long']['output']>;
  items?: Maybe<Array<Maybe<CartItemResponse>>>;
  totalAmount?: Maybe<Scalars['BigDecimal']['output']>;
  updatedAt?: Maybe<Scalars['LocalDateTime']['output']>;
  userId?: Maybe<Scalars['Long']['output']>;
};

export type CategoryResponse = {
  __typename?: 'CategoryResponse';
  /** Child categories */
  children?: Maybe<Array<Maybe<CategoryResponse>>>;
  /** Creation timestamp */
  createdAt?: Maybe<Scalars['LocalDateTime']['output']>;
  /** Description in Arabic */
  descriptionAr?: Maybe<Scalars['String']['output']>;
  /** Description in English */
  descriptionEn?: Maybe<Scalars['String']['output']>;
  /** Description in French */
  descriptionFr?: Maybe<Scalars['String']['output']>;
  /** Display order for sorting */
  displayOrder?: Maybe<Scalars['Int']['output']>;
  /** Category ID */
  id?: Maybe<Scalars['Long']['output']>;
  /** Category image URL */
  imageUrl?: Maybe<Scalars['String']['output']>;
  /** Is category active */
  isActive?: Maybe<Scalars['Boolean']['output']>;
  /** Name in Arabic */
  nameAr?: Maybe<Scalars['String']['output']>;
  /** Name in English */
  nameEn?: Maybe<Scalars['String']['output']>;
  /** Name in French */
  nameFr?: Maybe<Scalars['String']['output']>;
  /** Parent category ID (null if root) */
  parentId?: Maybe<Scalars['Long']['output']>;
  /** Parent category name */
  parentName?: Maybe<Scalars['String']['output']>;
  /** Number of products in this category */
  productCount?: Maybe<Scalars['Long']['output']>;
  /** URL-friendly slug */
  slug?: Maybe<Scalars['String']['output']>;
  /** Last update timestamp */
  updatedAt?: Maybe<Scalars['LocalDateTime']['output']>;
};

export type ChangePasswordRequestInput = {
  /** Current password */
  currentPassword: Scalars['String']['input'];
  /** New password */
  newPassword: Scalars['String']['input'];
};

export type CreateCategoryRequestInput = {
  /** Description in Arabic */
  descriptionAr?: InputMaybe<Scalars['String']['input']>;
  /** Description in English */
  descriptionEn?: InputMaybe<Scalars['String']['input']>;
  /** Description in French */
  descriptionFr?: InputMaybe<Scalars['String']['input']>;
  /** Display order for sorting */
  displayOrder?: InputMaybe<Scalars['Int']['input']>;
  /** Category image URL */
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  /** Name in Arabic */
  nameAr: Scalars['String']['input'];
  /** Name in English */
  nameEn?: InputMaybe<Scalars['String']['input']>;
  /** Name in French */
  nameFr: Scalars['String']['input'];
  /** Parent category ID (null for root category) */
  parentId?: InputMaybe<Scalars['Long']['input']>;
  /** URL-friendly slug (must be unique) */
  slug: Scalars['String']['input'];
};

export type CreateOrderRequestInput = {
  notes?: InputMaybe<Scalars['String']['input']>;
  paymentMethod: Scalars['String']['input'];
  phoneNumber: Scalars['String']['input'];
  shippingAddress: Scalars['String']['input'];
};

export type CreateProductRequestInput = {
  availableColors?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  availableSizes?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  basePrice: Scalars['BigDecimal']['input'];
  categoryId: Scalars['Long']['input'];
  descriptionAr?: InputMaybe<Scalars['String']['input']>;
  descriptionEn?: InputMaybe<Scalars['String']['input']>;
  descriptionFr?: InputMaybe<Scalars['String']['input']>;
  imageUrls?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  isFeatured?: InputMaybe<Scalars['Boolean']['input']>;
  nameAr: Scalars['String']['input'];
  nameEn: Scalars['String']['input'];
  nameFr: Scalars['String']['input'];
  salePrice?: InputMaybe<Scalars['BigDecimal']['input']>;
  sku: Scalars['String']['input'];
  stockQuantity: Scalars['Int']['input'];
};

export enum Direction {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type LoginRequestInput = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type LoginResponse = {
  __typename?: 'LoginResponse';
  accessToken?: Maybe<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  expiresIn?: Maybe<Scalars['Long']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  refreshToken?: Maybe<Scalars['String']['output']>;
  role?: Maybe<Scalars['String']['output']>;
  tokenType?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['Long']['output']>;
};

/** Mutation root */
export type Mutation = {
  __typename?: 'Mutation';
  /** Add item to shopping cart */
  addToCart?: Maybe<CartResponse>;
  /** Cancel an order */
  cancelOrder?: Maybe<OrderResponse>;
  /** Change current user's password */
  changePassword?: Maybe<Scalars['Boolean']['output']>;
  /** Clear all items from shopping cart */
  clearCart?: Maybe<Scalars['Boolean']['output']>;
  /** Create a new category (Admin only) */
  createCategory?: Maybe<CategoryResponse>;
  /** Create order from shopping cart */
  createOrder?: Maybe<OrderResponse>;
  /** Create a new product (Admin only) */
  createProduct?: Maybe<ProductResponse>;
  /** Delete a category (Admin only) */
  deleteCategory?: Maybe<Scalars['Boolean']['output']>;
  /** Delete current user's account (soft delete) */
  deleteMyAccount?: Maybe<Scalars['Boolean']['output']>;
  /** Delete a product (soft delete - Admin only) */
  deleteProduct?: Maybe<Scalars['Boolean']['output']>;
  /** Request password reset email */
  forgotPassword?: Maybe<Scalars['Boolean']['output']>;
  /** Authenticate user and receive access tokens */
  login?: Maybe<LoginResponse>;
  /** Refresh access token using refresh token */
  refreshToken?: Maybe<LoginResponse>;
  /** Register a new user account */
  register?: Maybe<LoginResponse>;
  /** Remove item from shopping cart */
  removeFromCart?: Maybe<CartResponse>;
  /** Reset password using reset token */
  resetPassword?: Maybe<Scalars['Boolean']['output']>;
  /** Activate/Deactivate user account (Admin only) */
  toggleUserStatus?: Maybe<UserProfileResponse>;
  /** Update cart item quantity */
  updateCartItem?: Maybe<CartResponse>;
  /** Update a category (Admin only) */
  updateCategory?: Maybe<CategoryResponse>;
  /** Update order status (Admin only) */
  updateOrderStatus?: Maybe<OrderResponse>;
  /** Update a product (Admin only) */
  updateProduct?: Maybe<ProductResponse>;
  /** Update current user's profile */
  updateProfile?: Maybe<UserProfileResponse>;
};


/** Mutation root */
export type MutationAddToCartArgs = {
  input?: InputMaybe<AddToCartRequestInput>;
};


/** Mutation root */
export type MutationCancelOrderArgs = {
  id?: InputMaybe<Scalars['Long']['input']>;
};


/** Mutation root */
export type MutationChangePasswordArgs = {
  input?: InputMaybe<ChangePasswordRequestInput>;
};


/** Mutation root */
export type MutationCreateCategoryArgs = {
  input?: InputMaybe<CreateCategoryRequestInput>;
};


/** Mutation root */
export type MutationCreateOrderArgs = {
  input?: InputMaybe<CreateOrderRequestInput>;
};


/** Mutation root */
export type MutationCreateProductArgs = {
  input?: InputMaybe<CreateProductRequestInput>;
};


/** Mutation root */
export type MutationDeleteCategoryArgs = {
  id?: InputMaybe<Scalars['Long']['input']>;
};


/** Mutation root */
export type MutationDeleteProductArgs = {
  id?: InputMaybe<Scalars['Long']['input']>;
};


/** Mutation root */
export type MutationForgotPasswordArgs = {
  email?: InputMaybe<Scalars['String']['input']>;
};


/** Mutation root */
export type MutationLoginArgs = {
  input?: InputMaybe<LoginRequestInput>;
};


/** Mutation root */
export type MutationRefreshTokenArgs = {
  input?: InputMaybe<TokenRefreshRequestInput>;
};


/** Mutation root */
export type MutationRegisterArgs = {
  input?: InputMaybe<RegisterRequestInput>;
};


/** Mutation root */
export type MutationRemoveFromCartArgs = {
  itemId?: InputMaybe<Scalars['Long']['input']>;
};


/** Mutation root */
export type MutationResetPasswordArgs = {
  newPassword?: InputMaybe<Scalars['String']['input']>;
  token?: InputMaybe<Scalars['String']['input']>;
};


/** Mutation root */
export type MutationToggleUserStatusArgs = {
  userId?: InputMaybe<Scalars['Long']['input']>;
};


/** Mutation root */
export type MutationUpdateCartItemArgs = {
  input?: InputMaybe<UpdateCartItemRequestInput>;
  itemId?: InputMaybe<Scalars['Long']['input']>;
};


/** Mutation root */
export type MutationUpdateCategoryArgs = {
  id?: InputMaybe<Scalars['Long']['input']>;
  input?: InputMaybe<UpdateCategoryRequestInput>;
};


/** Mutation root */
export type MutationUpdateOrderStatusArgs = {
  id?: InputMaybe<Scalars['Long']['input']>;
  input?: InputMaybe<UpdateOrderStatusRequestInput>;
};


/** Mutation root */
export type MutationUpdateProductArgs = {
  id?: InputMaybe<Scalars['Long']['input']>;
  input?: InputMaybe<UpdateProductRequestInput>;
};


/** Mutation root */
export type MutationUpdateProfileArgs = {
  input?: InputMaybe<UpdateProfileRequestInput>;
};

export enum NullHandling {
  Native = 'NATIVE',
  NullsFirst = 'NULLS_FIRST',
  NullsLast = 'NULLS_LAST'
}

export type Order = {
  __typename?: 'Order';
  direction?: Maybe<Direction>;
  ignoreCase?: Maybe<Scalars['Boolean']['output']>;
  nullHandlingHint?: Maybe<NullHandling>;
  property: Scalars['String']['output'];
};

export type OrderItemResponse = {
  __typename?: 'OrderItemResponse';
  id?: Maybe<Scalars['Long']['output']>;
  price?: Maybe<Scalars['BigDecimal']['output']>;
  productId?: Maybe<Scalars['Long']['output']>;
  productImage?: Maybe<Scalars['String']['output']>;
  productName?: Maybe<Scalars['String']['output']>;
  quantity?: Maybe<Scalars['Int']['output']>;
  selectedColor?: Maybe<Scalars['String']['output']>;
  selectedSize?: Maybe<Scalars['String']['output']>;
  subtotal?: Maybe<Scalars['BigDecimal']['output']>;
};

export type OrderResponse = {
  __typename?: 'OrderResponse';
  createdAt?: Maybe<Scalars['LocalDateTime']['output']>;
  deliveredAt?: Maybe<Scalars['LocalDateTime']['output']>;
  id?: Maybe<Scalars['Long']['output']>;
  items?: Maybe<Array<Maybe<OrderItemResponse>>>;
  notes?: Maybe<Scalars['String']['output']>;
  orderNumber?: Maybe<Scalars['String']['output']>;
  paidAt?: Maybe<Scalars['LocalDateTime']['output']>;
  paymentMethod?: Maybe<Scalars['String']['output']>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  shippingAddress?: Maybe<Scalars['String']['output']>;
  shippingCost?: Maybe<Scalars['BigDecimal']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  subtotal?: Maybe<Scalars['BigDecimal']['output']>;
  totalAmount?: Maybe<Scalars['BigDecimal']['output']>;
  trackingNumber?: Maybe<Scalars['String']['output']>;
  updatedAt?: Maybe<Scalars['LocalDateTime']['output']>;
  userEmail?: Maybe<Scalars['String']['output']>;
  userId?: Maybe<Scalars['Long']['output']>;
};

export type Page_OrderResponse = {
  __typename?: 'Page_OrderResponse';
  content?: Maybe<Array<Maybe<OrderResponse>>>;
  first: Scalars['Boolean']['output'];
  hasContent: Scalars['Boolean']['output'];
  hasNext: Scalars['Boolean']['output'];
  hasPrevious: Scalars['Boolean']['output'];
  last: Scalars['Boolean']['output'];
  nextOrLastPageable?: Maybe<Pagination>;
  nextPageable?: Maybe<Pagination>;
  number: Scalars['Int']['output'];
  numberOfElements: Scalars['Int']['output'];
  pageable?: Maybe<Pagination>;
  previousOrFirstPageable?: Maybe<Pagination>;
  previousPageable?: Maybe<Pagination>;
  size: Scalars['Int']['output'];
  sort?: Maybe<Sorting>;
  totalElements: Scalars['Long']['output'];
  totalPages: Scalars['Int']['output'];
};

export type Page_ProductResponse = {
  __typename?: 'Page_ProductResponse';
  content?: Maybe<Array<Maybe<ProductResponse>>>;
  first: Scalars['Boolean']['output'];
  hasContent: Scalars['Boolean']['output'];
  hasNext: Scalars['Boolean']['output'];
  hasPrevious: Scalars['Boolean']['output'];
  last: Scalars['Boolean']['output'];
  nextOrLastPageable?: Maybe<Pagination>;
  nextPageable?: Maybe<Pagination>;
  number: Scalars['Int']['output'];
  numberOfElements: Scalars['Int']['output'];
  pageable?: Maybe<Pagination>;
  previousOrFirstPageable?: Maybe<Pagination>;
  previousPageable?: Maybe<Pagination>;
  size: Scalars['Int']['output'];
  sort?: Maybe<Sorting>;
  totalElements: Scalars['Long']['output'];
  totalPages: Scalars['Int']['output'];
};

export type Page_UserProfileResponse = {
  __typename?: 'Page_UserProfileResponse';
  content?: Maybe<Array<Maybe<UserProfileResponse>>>;
  first: Scalars['Boolean']['output'];
  hasContent: Scalars['Boolean']['output'];
  hasNext: Scalars['Boolean']['output'];
  hasPrevious: Scalars['Boolean']['output'];
  last: Scalars['Boolean']['output'];
  nextOrLastPageable?: Maybe<Pagination>;
  nextPageable?: Maybe<Pagination>;
  number: Scalars['Int']['output'];
  numberOfElements: Scalars['Int']['output'];
  pageable?: Maybe<Pagination>;
  previousOrFirstPageable?: Maybe<Pagination>;
  previousPageable?: Maybe<Pagination>;
  size: Scalars['Int']['output'];
  sort?: Maybe<Sorting>;
  totalElements: Scalars['Long']['output'];
  totalPages: Scalars['Int']['output'];
};

export type Pagination = {
  __typename?: 'Pagination';
  pageNumber: Scalars['Int']['output'];
  pageSize?: Maybe<Scalars['Int']['output']>;
  sort?: Maybe<Sort>;
};

export type ProductResponse = {
  __typename?: 'ProductResponse';
  availableColors?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  availableSizes?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  basePrice?: Maybe<Scalars['BigDecimal']['output']>;
  categoryId?: Maybe<Scalars['Long']['output']>;
  categoryName?: Maybe<Scalars['String']['output']>;
  createdAt?: Maybe<Scalars['LocalDateTime']['output']>;
  descriptionAr?: Maybe<Scalars['String']['output']>;
  descriptionEn?: Maybe<Scalars['String']['output']>;
  descriptionFr?: Maybe<Scalars['String']['output']>;
  id?: Maybe<Scalars['Long']['output']>;
  imageUrls?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  isFeatured?: Maybe<Scalars['Boolean']['output']>;
  nameAr?: Maybe<Scalars['String']['output']>;
  nameEn?: Maybe<Scalars['String']['output']>;
  nameFr?: Maybe<Scalars['String']['output']>;
  salePrice?: Maybe<Scalars['BigDecimal']['output']>;
  sku?: Maybe<Scalars['String']['output']>;
  stockQuantity?: Maybe<Scalars['Int']['output']>;
  updatedAt?: Maybe<Scalars['LocalDateTime']['output']>;
  viewCount?: Maybe<Scalars['Long']['output']>;
};

/** Query root */
export type Query = {
  __typename?: 'Query';
  /** Get all active categories */
  activeCategories?: Maybe<Array<Maybe<CategoryResponse>>>;
  /** Get all orders (Admin only) */
  allOrders?: Maybe<Page_OrderResponse>;
  /** Get all categories (flat list) */
  categories?: Maybe<Array<Maybe<CategoryResponse>>>;
  /** Get category by ID */
  category?: Maybe<CategoryResponse>;
  /** Get category by slug */
  categoryBySlug?: Maybe<CategoryResponse>;
  /** Get category tree (hierarchical structure) */
  categoryTree?: Maybe<Array<Maybe<CategoryResponse>>>;
  /** Get featured products */
  featuredProducts?: Maybe<Array<Maybe<ProductResponse>>>;
  /** Get products with low stock (Admin only) */
  lowStockProducts?: Maybe<Array<Maybe<ProductResponse>>>;
  /** Get current authenticated user's profile */
  me?: Maybe<UserProfileResponse>;
  /** Get current user's shopping cart */
  myCart?: Maybe<CartResponse>;
  /** Get current user's orders */
  myOrders?: Maybe<Page_OrderResponse>;
  /** Get new arrivals (sorted by creation date) */
  newArrivals?: Maybe<Page_ProductResponse>;
  /** Get order by ID */
  order?: Maybe<OrderResponse>;
  /** Get order by order number */
  orderByNumber?: Maybe<OrderResponse>;
  /** Get orders by status (Admin only) */
  ordersByStatus?: Maybe<Page_OrderResponse>;
  /** Get popular products (sorted by view count) */
  popularProducts?: Maybe<Page_ProductResponse>;
  /** Get product by ID */
  product?: Maybe<ProductResponse>;
  /** Get product by SKU */
  productBySku?: Maybe<ProductResponse>;
  /** Get all active products with pagination */
  products?: Maybe<Page_ProductResponse>;
  /** Get products by category */
  productsByCategory?: Maybe<Page_ProductResponse>;
  /** Get products by price range */
  productsByPriceRange?: Maybe<Page_ProductResponse>;
  /** Get root categories (no parent) */
  rootCategories?: Maybe<Array<Maybe<CategoryResponse>>>;
  /** Search products by keyword (searches FR/AR/EN names) */
  searchProducts?: Maybe<Page_ProductResponse>;
  /** Get subcategories of a category */
  subcategories?: Maybe<Array<Maybe<CategoryResponse>>>;
  /** Get user by ID (Admin only) */
  user?: Maybe<UserProfileResponse>;
  /** Get all users (Admin only) */
  users?: Maybe<Page_UserProfileResponse>;
  /** Get users by role (Admin only) */
  usersByRole?: Maybe<Page_UserProfileResponse>;
};


/** Query root */
export type QueryAllOrdersArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
};


/** Query root */
export type QueryCategoryArgs = {
  id?: InputMaybe<Scalars['Long']['input']>;
};


/** Query root */
export type QueryCategoryBySlugArgs = {
  slug?: InputMaybe<Scalars['String']['input']>;
};


/** Query root */
export type QueryLowStockProductsArgs = {
  threshold?: InputMaybe<Scalars['Int']['input']>;
};


/** Query root */
export type QueryMyOrdersArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
};


/** Query root */
export type QueryNewArrivalsArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
};


/** Query root */
export type QueryOrderArgs = {
  id?: InputMaybe<Scalars['Long']['input']>;
};


/** Query root */
export type QueryOrderByNumberArgs = {
  orderNumber?: InputMaybe<Scalars['String']['input']>;
};


/** Query root */
export type QueryOrdersByStatusArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
};


/** Query root */
export type QueryPopularProductsArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
};


/** Query root */
export type QueryProductArgs = {
  id?: InputMaybe<Scalars['Long']['input']>;
};


/** Query root */
export type QueryProductBySkuArgs = {
  sku?: InputMaybe<Scalars['String']['input']>;
};


/** Query root */
export type QueryProductsArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<Scalars['String']['input']>;
};


/** Query root */
export type QueryProductsByCategoryArgs = {
  categoryId?: InputMaybe<Scalars['Long']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
};


/** Query root */
export type QueryProductsByPriceRangeArgs = {
  maxPrice?: InputMaybe<Scalars['BigDecimal']['input']>;
  minPrice?: InputMaybe<Scalars['BigDecimal']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
};


/** Query root */
export type QuerySearchProductsArgs = {
  keyword?: InputMaybe<Scalars['String']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
};


/** Query root */
export type QuerySubcategoriesArgs = {
  parentId?: InputMaybe<Scalars['Long']['input']>;
};


/** Query root */
export type QueryUserArgs = {
  id?: InputMaybe<Scalars['Long']['input']>;
};


/** Query root */
export type QueryUsersArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<Scalars['String']['input']>;
};


/** Query root */
export type QueryUsersByRoleArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  role?: InputMaybe<Scalars['String']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
};

export type RegisterRequestInput = {
  email: Scalars['String']['input'];
  firstName: Scalars['String']['input'];
  lastName: Scalars['String']['input'];
  password: Scalars['String']['input'];
};

export type Sort = {
  __typename?: 'Sort';
  orders: Array<Order>;
};

export type Sorting = {
  __typename?: 'Sorting';
  orders: Array<Order>;
};

export type TokenRefreshRequestInput = {
  refreshToken: Scalars['String']['input'];
};

export type UpdateCartItemRequestInput = {
  quantity: Scalars['Int']['input'];
};

export type UpdateCategoryRequestInput = {
  /** Description in Arabic */
  descriptionAr?: InputMaybe<Scalars['String']['input']>;
  /** Description in English */
  descriptionEn?: InputMaybe<Scalars['String']['input']>;
  /** Description in French */
  descriptionFr?: InputMaybe<Scalars['String']['input']>;
  /** Display order for sorting */
  displayOrder?: InputMaybe<Scalars['Int']['input']>;
  /** Category image URL */
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  /** Is category active */
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  /** Name in Arabic */
  nameAr?: InputMaybe<Scalars['String']['input']>;
  /** Name in English */
  nameEn?: InputMaybe<Scalars['String']['input']>;
  /** Name in French */
  nameFr?: InputMaybe<Scalars['String']['input']>;
  /** Parent category ID (null for root category) */
  parentId?: InputMaybe<Scalars['Long']['input']>;
  /** URL-friendly slug */
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateOrderStatusRequestInput = {
  status: Scalars['String']['input'];
  trackingNumber?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProductRequestInput = {
  availableColors?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  availableSizes?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  basePrice?: InputMaybe<Scalars['BigDecimal']['input']>;
  categoryId?: InputMaybe<Scalars['Long']['input']>;
  descriptionAr?: InputMaybe<Scalars['String']['input']>;
  descriptionEn?: InputMaybe<Scalars['String']['input']>;
  descriptionFr?: InputMaybe<Scalars['String']['input']>;
  imageUrls?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  isFeatured?: InputMaybe<Scalars['Boolean']['input']>;
  nameAr?: InputMaybe<Scalars['String']['input']>;
  nameEn?: InputMaybe<Scalars['String']['input']>;
  nameFr?: InputMaybe<Scalars['String']['input']>;
  salePrice?: InputMaybe<Scalars['BigDecimal']['input']>;
  stockQuantity?: InputMaybe<Scalars['Int']['input']>;
};

export type UpdateProfileRequestInput = {
  /** Email address */
  email?: InputMaybe<Scalars['String']['input']>;
  /** First name */
  firstName?: InputMaybe<Scalars['String']['input']>;
  /** Last name */
  lastName?: InputMaybe<Scalars['String']['input']>;
  /** Phone number */
  phone?: InputMaybe<Scalars['String']['input']>;
};

export type UserProfileResponse = {
  __typename?: 'UserProfileResponse';
  /** Account creation date */
  createdAt?: Maybe<Scalars['LocalDateTime']['output']>;
  /** Email address */
  email?: Maybe<Scalars['String']['output']>;
  /** Is email verified */
  emailVerified?: Maybe<Scalars['Boolean']['output']>;
  /** First name */
  firstName?: Maybe<Scalars['String']['output']>;
  /** User ID */
  id?: Maybe<Scalars['Long']['output']>;
  /** Is account active */
  isActive?: Maybe<Scalars['Boolean']['output']>;
  /** Last name */
  lastName?: Maybe<Scalars['String']['output']>;
  /** Phone number */
  phone?: Maybe<Scalars['String']['output']>;
  /** User role */
  role?: Maybe<Scalars['String']['output']>;
  /** Last update date */
  updatedAt?: Maybe<Scalars['LocalDateTime']['output']>;
};

export type LoginMutationVariables = Exact<{
  input: LoginRequestInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login?: { __typename?: 'LoginResponse', accessToken?: string | null, refreshToken?: string | null, tokenType?: string | null, expiresIn?: any | null, userId?: any | null, email?: string | null, firstName?: string | null, lastName?: string | null, role?: string | null } | null };

export type RegisterMutationVariables = Exact<{
  input: RegisterRequestInput;
}>;


export type RegisterMutation = { __typename?: 'Mutation', register?: { __typename?: 'LoginResponse', accessToken?: string | null, refreshToken?: string | null, tokenType?: string | null, expiresIn?: any | null, userId?: any | null, email?: string | null, firstName?: string | null, lastName?: string | null, role?: string | null } | null };

export type RefreshTokenMutationVariables = Exact<{
  input: TokenRefreshRequestInput;
}>;


export type RefreshTokenMutation = { __typename?: 'Mutation', refreshToken?: { __typename?: 'LoginResponse', accessToken?: string | null, refreshToken?: string | null, tokenType?: string | null, expiresIn?: any | null } | null };

export type ChangePasswordMutationVariables = Exact<{
  input: ChangePasswordRequestInput;
}>;


export type ChangePasswordMutation = { __typename?: 'Mutation', changePassword?: boolean | null };

export type ForgotPasswordMutationVariables = Exact<{
  email: Scalars['String']['input'];
}>;


export type ForgotPasswordMutation = { __typename?: 'Mutation', forgotPassword?: boolean | null };

export type ResetPasswordMutationVariables = Exact<{
  token: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
}>;


export type ResetPasswordMutation = { __typename?: 'Mutation', resetPassword?: boolean | null };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'UserProfileResponse', id?: any | null, email?: string | null, firstName?: string | null, lastName?: string | null, phone?: string | null, role?: string | null, isActive?: boolean | null, emailVerified?: boolean | null, createdAt?: any | null, updatedAt?: any | null } | null };

export type UpdateProfileMutationVariables = Exact<{
  input: UpdateProfileRequestInput;
}>;


export type UpdateProfileMutation = { __typename?: 'Mutation', updateProfile?: { __typename?: 'UserProfileResponse', id?: any | null, email?: string | null, firstName?: string | null, lastName?: string | null, phone?: string | null, role?: string | null, isActive?: boolean | null, emailVerified?: boolean | null, createdAt?: any | null, updatedAt?: any | null } | null };

export type DeleteMyAccountMutationVariables = Exact<{ [key: string]: never; }>;


export type DeleteMyAccountMutation = { __typename?: 'Mutation', deleteMyAccount?: boolean | null };

export type CategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type CategoriesQuery = { __typename?: 'Query', categories?: Array<{ __typename?: 'CategoryResponse', id?: any | null, slug?: string | null, nameFr?: string | null, nameAr?: string | null, nameEn?: string | null, descriptionFr?: string | null, descriptionAr?: string | null, descriptionEn?: string | null, parentId?: any | null, parentName?: string | null, imageUrl?: string | null, displayOrder?: number | null, isActive?: boolean | null, productCount?: any | null, createdAt?: any | null, updatedAt?: any | null, children?: Array<{ __typename?: 'CategoryResponse', id?: any | null, slug?: string | null, nameFr?: string | null, nameAr?: string | null, nameEn?: string | null, parentId?: any | null, displayOrder?: number | null, isActive?: boolean | null, productCount?: any | null } | null> | null } | null> | null };

export type CategoryQueryVariables = Exact<{
  id: Scalars['Long']['input'];
}>;


export type CategoryQuery = { __typename?: 'Query', category?: { __typename?: 'CategoryResponse', id?: any | null, slug?: string | null, nameFr?: string | null, nameAr?: string | null, nameEn?: string | null, descriptionFr?: string | null, descriptionAr?: string | null, descriptionEn?: string | null, parentId?: any | null, parentName?: string | null, imageUrl?: string | null, displayOrder?: number | null, isActive?: boolean | null, productCount?: any | null, createdAt?: any | null, updatedAt?: any | null, children?: Array<{ __typename?: 'CategoryResponse', id?: any | null, slug?: string | null, nameFr?: string | null, nameAr?: string | null, nameEn?: string | null, isActive?: boolean | null, productCount?: any | null } | null> | null } | null };

export type CategoryBySlugQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type CategoryBySlugQuery = { __typename?: 'Query', categoryBySlug?: { __typename?: 'CategoryResponse', id?: any | null, slug?: string | null, nameFr?: string | null, nameAr?: string | null, nameEn?: string | null, descriptionFr?: string | null, descriptionAr?: string | null, descriptionEn?: string | null, parentId?: any | null, parentName?: string | null, imageUrl?: string | null, displayOrder?: number | null, isActive?: boolean | null, productCount?: any | null, createdAt?: any | null, updatedAt?: any | null } | null };

export type ActiveCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type ActiveCategoriesQuery = { __typename?: 'Query', activeCategories?: Array<{ __typename?: 'CategoryResponse', id?: any | null, slug?: string | null, nameFr?: string | null, nameAr?: string | null, nameEn?: string | null, parentId?: any | null, imageUrl?: string | null, displayOrder?: number | null, productCount?: any | null } | null> | null };

export type RootCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type RootCategoriesQuery = { __typename?: 'Query', rootCategories?: Array<{ __typename?: 'CategoryResponse', id?: any | null, slug?: string | null, nameFr?: string | null, nameAr?: string | null, nameEn?: string | null, imageUrl?: string | null, displayOrder?: number | null, isActive?: boolean | null, productCount?: any | null, children?: Array<{ __typename?: 'CategoryResponse', id?: any | null, slug?: string | null, nameFr?: string | null, nameAr?: string | null, nameEn?: string | null, displayOrder?: number | null, productCount?: any | null } | null> | null } | null> | null };

export type CategoryTreeQueryVariables = Exact<{ [key: string]: never; }>;


export type CategoryTreeQuery = { __typename?: 'Query', categoryTree?: Array<{ __typename?: 'CategoryResponse', id?: any | null, slug?: string | null, nameFr?: string | null, nameAr?: string | null, nameEn?: string | null, parentId?: any | null, displayOrder?: number | null, isActive?: boolean | null, productCount?: any | null, children?: Array<{ __typename?: 'CategoryResponse', id?: any | null, slug?: string | null, nameFr?: string | null, nameAr?: string | null, nameEn?: string | null, parentId?: any | null, displayOrder?: number | null, productCount?: any | null, children?: Array<{ __typename?: 'CategoryResponse', id?: any | null, slug?: string | null, nameFr?: string | null, nameAr?: string | null, nameEn?: string | null, parentId?: any | null, displayOrder?: number | null, productCount?: any | null } | null> | null } | null> | null } | null> | null };

export type SubcategoriesQueryVariables = Exact<{
  parentId: Scalars['Long']['input'];
}>;


export type SubcategoriesQuery = { __typename?: 'Query', subcategories?: Array<{ __typename?: 'CategoryResponse', id?: any | null, slug?: string | null, nameFr?: string | null, nameAr?: string | null, nameEn?: string | null, displayOrder?: number | null, isActive?: boolean | null, productCount?: any | null } | null> | null };

export type CreateCategoryMutationVariables = Exact<{
  input: CreateCategoryRequestInput;
}>;


export type CreateCategoryMutation = { __typename?: 'Mutation', createCategory?: { __typename?: 'CategoryResponse', id?: any | null, slug?: string | null, nameFr?: string | null, nameAr?: string | null, nameEn?: string | null, descriptionFr?: string | null, descriptionAr?: string | null, descriptionEn?: string | null, parentId?: any | null, imageUrl?: string | null, displayOrder?: number | null, isActive?: boolean | null, createdAt?: any | null, updatedAt?: any | null } | null };

export type UpdateCategoryMutationVariables = Exact<{
  id: Scalars['Long']['input'];
  input: UpdateCategoryRequestInput;
}>;


export type UpdateCategoryMutation = { __typename?: 'Mutation', updateCategory?: { __typename?: 'CategoryResponse', id?: any | null, slug?: string | null, nameFr?: string | null, nameAr?: string | null, nameEn?: string | null, descriptionFr?: string | null, descriptionAr?: string | null, descriptionEn?: string | null, parentId?: any | null, imageUrl?: string | null, displayOrder?: number | null, isActive?: boolean | null, createdAt?: any | null, updatedAt?: any | null } | null };

export type DeleteCategoryMutationVariables = Exact<{
  id: Scalars['Long']['input'];
}>;


export type DeleteCategoryMutation = { __typename?: 'Mutation', deleteCategory?: boolean | null };

export type AllOrdersQueryVariables = Exact<{
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
}>;


export type AllOrdersQuery = { __typename?: 'Query', allOrders?: { __typename?: 'Page_OrderResponse', totalElements: any, totalPages: number, number: number, size: number, first: boolean, last: boolean, hasNext: boolean, hasPrevious: boolean, content?: Array<{ __typename?: 'OrderResponse', id?: any | null, orderNumber?: string | null, userId?: any | null, userEmail?: string | null, status?: string | null, paymentMethod?: string | null, subtotal?: any | null, shippingCost?: any | null, totalAmount?: any | null, phoneNumber?: string | null, shippingAddress?: string | null, notes?: string | null, trackingNumber?: string | null, createdAt?: any | null, updatedAt?: any | null, deliveredAt?: any | null, paidAt?: any | null, items?: Array<{ __typename?: 'OrderItemResponse', id?: any | null, productId?: any | null, productName?: string | null, productImage?: string | null, quantity?: number | null, price?: any | null, selectedSize?: string | null, selectedColor?: string | null, subtotal?: any | null } | null> | null } | null> | null } | null };

export type OrderQueryVariables = Exact<{
  id: Scalars['Long']['input'];
}>;


export type OrderQuery = { __typename?: 'Query', order?: { __typename?: 'OrderResponse', id?: any | null, orderNumber?: string | null, userId?: any | null, userEmail?: string | null, status?: string | null, paymentMethod?: string | null, subtotal?: any | null, shippingCost?: any | null, totalAmount?: any | null, phoneNumber?: string | null, shippingAddress?: string | null, notes?: string | null, trackingNumber?: string | null, createdAt?: any | null, updatedAt?: any | null, deliveredAt?: any | null, paidAt?: any | null, items?: Array<{ __typename?: 'OrderItemResponse', id?: any | null, productId?: any | null, productName?: string | null, productImage?: string | null, quantity?: number | null, price?: any | null, selectedSize?: string | null, selectedColor?: string | null, subtotal?: any | null } | null> | null } | null };

export type OrderByNumberQueryVariables = Exact<{
  orderNumber: Scalars['String']['input'];
}>;


export type OrderByNumberQuery = { __typename?: 'Query', orderByNumber?: { __typename?: 'OrderResponse', id?: any | null, orderNumber?: string | null, userId?: any | null, userEmail?: string | null, status?: string | null, paymentMethod?: string | null, subtotal?: any | null, shippingCost?: any | null, totalAmount?: any | null, phoneNumber?: string | null, shippingAddress?: string | null, notes?: string | null, trackingNumber?: string | null, createdAt?: any | null, updatedAt?: any | null, deliveredAt?: any | null, paidAt?: any | null, items?: Array<{ __typename?: 'OrderItemResponse', id?: any | null, productId?: any | null, productName?: string | null, productImage?: string | null, quantity?: number | null, price?: any | null, selectedSize?: string | null, selectedColor?: string | null, subtotal?: any | null } | null> | null } | null };

export type MyOrdersQueryVariables = Exact<{
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
}>;


export type MyOrdersQuery = { __typename?: 'Query', myOrders?: { __typename?: 'Page_OrderResponse', totalElements: any, totalPages: number, content?: Array<{ __typename?: 'OrderResponse', id?: any | null, orderNumber?: string | null, status?: string | null, paymentMethod?: string | null, totalAmount?: any | null, createdAt?: any | null, items?: Array<{ __typename?: 'OrderItemResponse', id?: any | null, productName?: string | null, productImage?: string | null, quantity?: number | null, price?: any | null } | null> | null } | null> | null } | null };

export type OrdersByStatusQueryVariables = Exact<{
  status: Scalars['String']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
}>;


export type OrdersByStatusQuery = { __typename?: 'Query', ordersByStatus?: { __typename?: 'Page_OrderResponse', totalElements: any, totalPages: number, content?: Array<{ __typename?: 'OrderResponse', id?: any | null, orderNumber?: string | null, userId?: any | null, userEmail?: string | null, status?: string | null, paymentMethod?: string | null, totalAmount?: any | null, phoneNumber?: string | null, shippingAddress?: string | null, createdAt?: any | null, items?: Array<{ __typename?: 'OrderItemResponse', id?: any | null, productName?: string | null, quantity?: number | null, price?: any | null } | null> | null } | null> | null } | null };

export type CreateOrderMutationVariables = Exact<{
  input: CreateOrderRequestInput;
}>;


export type CreateOrderMutation = { __typename?: 'Mutation', createOrder?: { __typename?: 'OrderResponse', id?: any | null, orderNumber?: string | null, status?: string | null, paymentMethod?: string | null, subtotal?: any | null, shippingCost?: any | null, totalAmount?: any | null, phoneNumber?: string | null, shippingAddress?: string | null, notes?: string | null, createdAt?: any | null } | null };

export type UpdateOrderStatusMutationVariables = Exact<{
  id: Scalars['Long']['input'];
  input: UpdateOrderStatusRequestInput;
}>;


export type UpdateOrderStatusMutation = { __typename?: 'Mutation', updateOrderStatus?: { __typename?: 'OrderResponse', id?: any | null, orderNumber?: string | null, status?: string | null, trackingNumber?: string | null, updatedAt?: any | null, deliveredAt?: any | null } | null };

export type CancelOrderMutationVariables = Exact<{
  id: Scalars['Long']['input'];
}>;


export type CancelOrderMutation = { __typename?: 'Mutation', cancelOrder?: { __typename?: 'OrderResponse', id?: any | null, orderNumber?: string | null, status?: string | null, updatedAt?: any | null } | null };

export type ProductsQueryVariables = Exact<{
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<Scalars['String']['input']>;
}>;


export type ProductsQuery = { __typename?: 'Query', products?: { __typename?: 'Page_ProductResponse', totalElements: any, totalPages: number, number: number, size: number, first: boolean, last: boolean, hasNext: boolean, hasPrevious: boolean, content?: Array<{ __typename?: 'ProductResponse', id?: any | null, sku?: string | null, nameFr?: string | null, nameAr?: string | null, nameEn?: string | null, descriptionFr?: string | null, descriptionAr?: string | null, descriptionEn?: string | null, basePrice?: any | null, salePrice?: any | null, stockQuantity?: number | null, categoryId?: any | null, categoryName?: string | null, isFeatured?: boolean | null, imageUrls?: Array<string | null> | null, availableSizes?: Array<string | null> | null, availableColors?: Array<string | null> | null, viewCount?: any | null, createdAt?: any | null, updatedAt?: any | null } | null> | null } | null };

export type ProductQueryVariables = Exact<{
  id: Scalars['Long']['input'];
}>;


export type ProductQuery = { __typename?: 'Query', product?: { __typename?: 'ProductResponse', id?: any | null, sku?: string | null, nameFr?: string | null, nameAr?: string | null, nameEn?: string | null, descriptionFr?: string | null, descriptionAr?: string | null, descriptionEn?: string | null, basePrice?: any | null, salePrice?: any | null, stockQuantity?: number | null, categoryId?: any | null, categoryName?: string | null, isFeatured?: boolean | null, imageUrls?: Array<string | null> | null, availableSizes?: Array<string | null> | null, availableColors?: Array<string | null> | null, viewCount?: any | null, createdAt?: any | null, updatedAt?: any | null } | null };

export type ProductBySkuQueryVariables = Exact<{
  sku: Scalars['String']['input'];
}>;


export type ProductBySkuQuery = { __typename?: 'Query', productBySku?: { __typename?: 'ProductResponse', id?: any | null, sku?: string | null, nameFr?: string | null, nameAr?: string | null, nameEn?: string | null, descriptionFr?: string | null, descriptionAr?: string | null, descriptionEn?: string | null, basePrice?: any | null, salePrice?: any | null, stockQuantity?: number | null, categoryId?: any | null, categoryName?: string | null, isFeatured?: boolean | null, imageUrls?: Array<string | null> | null, availableSizes?: Array<string | null> | null, availableColors?: Array<string | null> | null, viewCount?: any | null, createdAt?: any | null, updatedAt?: any | null } | null };

export type SearchProductsQueryVariables = Exact<{
  keyword: Scalars['String']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
}>;


export type SearchProductsQuery = { __typename?: 'Query', searchProducts?: { __typename?: 'Page_ProductResponse', totalElements: any, totalPages: number, number: number, size: number, content?: Array<{ __typename?: 'ProductResponse', id?: any | null, sku?: string | null, nameFr?: string | null, nameAr?: string | null, nameEn?: string | null, basePrice?: any | null, salePrice?: any | null, stockQuantity?: number | null, categoryId?: any | null, categoryName?: string | null, isFeatured?: boolean | null, imageUrls?: Array<string | null> | null, createdAt?: any | null } | null> | null } | null };

export type ProductsByCategoryQueryVariables = Exact<{
  categoryId: Scalars['Long']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
}>;


export type ProductsByCategoryQuery = { __typename?: 'Query', productsByCategory?: { __typename?: 'Page_ProductResponse', totalElements: any, totalPages: number, content?: Array<{ __typename?: 'ProductResponse', id?: any | null, sku?: string | null, nameFr?: string | null, nameAr?: string | null, nameEn?: string | null, basePrice?: any | null, salePrice?: any | null, stockQuantity?: number | null, categoryName?: string | null, isFeatured?: boolean | null, imageUrls?: Array<string | null> | null, createdAt?: any | null } | null> | null } | null };

export type FeaturedProductsQueryVariables = Exact<{ [key: string]: never; }>;


export type FeaturedProductsQuery = { __typename?: 'Query', featuredProducts?: Array<{ __typename?: 'ProductResponse', id?: any | null, sku?: string | null, nameFr?: string | null, nameAr?: string | null, nameEn?: string | null, basePrice?: any | null, salePrice?: any | null, stockQuantity?: number | null, categoryName?: string | null, imageUrls?: Array<string | null> | null } | null> | null };

export type PopularProductsQueryVariables = Exact<{
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
}>;


export type PopularProductsQuery = { __typename?: 'Query', popularProducts?: { __typename?: 'Page_ProductResponse', totalElements: any, content?: Array<{ __typename?: 'ProductResponse', id?: any | null, sku?: string | null, nameFr?: string | null, nameAr?: string | null, nameEn?: string | null, basePrice?: any | null, salePrice?: any | null, imageUrls?: Array<string | null> | null, viewCount?: any | null } | null> | null } | null };

export type NewArrivalsQueryVariables = Exact<{
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
}>;


export type NewArrivalsQuery = { __typename?: 'Query', newArrivals?: { __typename?: 'Page_ProductResponse', totalElements: any, content?: Array<{ __typename?: 'ProductResponse', id?: any | null, sku?: string | null, nameFr?: string | null, nameAr?: string | null, nameEn?: string | null, basePrice?: any | null, salePrice?: any | null, imageUrls?: Array<string | null> | null, createdAt?: any | null } | null> | null } | null };

export type LowStockProductsQueryVariables = Exact<{
  threshold?: InputMaybe<Scalars['Int']['input']>;
}>;


export type LowStockProductsQuery = { __typename?: 'Query', lowStockProducts?: Array<{ __typename?: 'ProductResponse', id?: any | null, sku?: string | null, nameFr?: string | null, stockQuantity?: number | null, categoryName?: string | null } | null> | null };

export type ProductsByPriceRangeQueryVariables = Exact<{
  minPrice: Scalars['BigDecimal']['input'];
  maxPrice: Scalars['BigDecimal']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
}>;


export type ProductsByPriceRangeQuery = { __typename?: 'Query', productsByPriceRange?: { __typename?: 'Page_ProductResponse', totalElements: any, content?: Array<{ __typename?: 'ProductResponse', id?: any | null, sku?: string | null, nameFr?: string | null, basePrice?: any | null, salePrice?: any | null, imageUrls?: Array<string | null> | null } | null> | null } | null };

export type CreateProductMutationVariables = Exact<{
  input: CreateProductRequestInput;
}>;


export type CreateProductMutation = { __typename?: 'Mutation', createProduct?: { __typename?: 'ProductResponse', id?: any | null, sku?: string | null, nameFr?: string | null, nameAr?: string | null, nameEn?: string | null, descriptionFr?: string | null, descriptionAr?: string | null, descriptionEn?: string | null, basePrice?: any | null, salePrice?: any | null, stockQuantity?: number | null, categoryId?: any | null, categoryName?: string | null, isFeatured?: boolean | null, imageUrls?: Array<string | null> | null, availableSizes?: Array<string | null> | null, availableColors?: Array<string | null> | null, createdAt?: any | null, updatedAt?: any | null } | null };

export type UpdateProductMutationVariables = Exact<{
  id: Scalars['Long']['input'];
  input: UpdateProductRequestInput;
}>;


export type UpdateProductMutation = { __typename?: 'Mutation', updateProduct?: { __typename?: 'ProductResponse', id?: any | null, sku?: string | null, nameFr?: string | null, nameAr?: string | null, nameEn?: string | null, descriptionFr?: string | null, descriptionAr?: string | null, descriptionEn?: string | null, basePrice?: any | null, salePrice?: any | null, stockQuantity?: number | null, categoryId?: any | null, categoryName?: string | null, isFeatured?: boolean | null, imageUrls?: Array<string | null> | null, availableSizes?: Array<string | null> | null, availableColors?: Array<string | null> | null, createdAt?: any | null, updatedAt?: any | null } | null };

export type DeleteProductMutationVariables = Exact<{
  id: Scalars['Long']['input'];
}>;


export type DeleteProductMutation = { __typename?: 'Mutation', deleteProduct?: boolean | null };

export type UsersQueryVariables = Exact<{
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<Scalars['String']['input']>;
}>;


export type UsersQuery = { __typename?: 'Query', users?: { __typename?: 'Page_UserProfileResponse', totalElements: any, totalPages: number, number: number, size: number, first: boolean, last: boolean, hasNext: boolean, hasPrevious: boolean, content?: Array<{ __typename?: 'UserProfileResponse', id?: any | null, email?: string | null, firstName?: string | null, lastName?: string | null, phone?: string | null, role?: string | null, isActive?: boolean | null, emailVerified?: boolean | null, createdAt?: any | null, updatedAt?: any | null } | null> | null } | null };

export type UserQueryVariables = Exact<{
  id: Scalars['Long']['input'];
}>;


export type UserQuery = { __typename?: 'Query', user?: { __typename?: 'UserProfileResponse', id?: any | null, email?: string | null, firstName?: string | null, lastName?: string | null, phone?: string | null, role?: string | null, isActive?: boolean | null, emailVerified?: boolean | null, createdAt?: any | null, updatedAt?: any | null } | null };

export type UsersByRoleQueryVariables = Exact<{
  role: Scalars['String']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
}>;


export type UsersByRoleQuery = { __typename?: 'Query', usersByRole?: { __typename?: 'Page_UserProfileResponse', totalElements: any, totalPages: number, content?: Array<{ __typename?: 'UserProfileResponse', id?: any | null, email?: string | null, firstName?: string | null, lastName?: string | null, phone?: string | null, role?: string | null, isActive?: boolean | null, emailVerified?: boolean | null, createdAt?: any | null } | null> | null } | null };

export type ToggleUserStatusMutationVariables = Exact<{
  userId: Scalars['Long']['input'];
}>;


export type ToggleUserStatusMutation = { __typename?: 'Mutation', toggleUserStatus?: { __typename?: 'UserProfileResponse', id?: any | null, email?: string | null, firstName?: string | null, lastName?: string | null, isActive?: boolean | null, updatedAt?: any | null } | null };


export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"LoginRequestInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}},{"kind":"Field","name":{"kind":"Name","value":"tokenType"}},{"kind":"Field","name":{"kind":"Name","value":"expiresIn"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const RegisterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Register"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RegisterRequestInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"register"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}},{"kind":"Field","name":{"kind":"Name","value":"tokenType"}},{"kind":"Field","name":{"kind":"Name","value":"expiresIn"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]} as unknown as DocumentNode<RegisterMutation, RegisterMutationVariables>;
export const RefreshTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RefreshToken"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"TokenRefreshRequestInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refreshToken"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"refreshToken"}},{"kind":"Field","name":{"kind":"Name","value":"tokenType"}},{"kind":"Field","name":{"kind":"Name","value":"expiresIn"}}]}}]}}]} as unknown as DocumentNode<RefreshTokenMutation, RefreshTokenMutationVariables>;
export const ChangePasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ChangePassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ChangePasswordRequestInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"changePassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<ChangePasswordMutation, ChangePasswordMutationVariables>;
export const ForgotPasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ForgotPassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"forgotPassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}}]}]}}]} as unknown as DocumentNode<ForgotPasswordMutation, ForgotPasswordMutationVariables>;
export const ResetPasswordDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ResetPassword"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"token"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"newPassword"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"resetPassword"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"token"},"value":{"kind":"Variable","name":{"kind":"Name","value":"token"}}},{"kind":"Argument","name":{"kind":"Name","value":"newPassword"},"value":{"kind":"Variable","name":{"kind":"Name","value":"newPassword"}}}]}]}}]} as unknown as DocumentNode<ResetPasswordMutation, ResetPasswordMutationVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerified"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const UpdateProfileDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProfile"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProfileRequestInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProfile"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerified"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateProfileMutation, UpdateProfileMutationVariables>;
export const DeleteMyAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteMyAccount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteMyAccount"}}]}}]} as unknown as DocumentNode<DeleteMyAccountMutation, DeleteMyAccountMutationVariables>;
export const CategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"nameFr"}},{"kind":"Field","name":{"kind":"Name","value":"nameAr"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionFr"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionAr"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionEn"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"parentName"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"displayOrder"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"productCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"nameFr"}},{"kind":"Field","name":{"kind":"Name","value":"nameAr"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"displayOrder"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"productCount"}}]}}]}}]}}]} as unknown as DocumentNode<CategoriesQuery, CategoriesQueryVariables>;
export const CategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Category"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Long"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"category"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"nameFr"}},{"kind":"Field","name":{"kind":"Name","value":"nameAr"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionFr"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionAr"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionEn"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"parentName"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"displayOrder"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"productCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"nameFr"}},{"kind":"Field","name":{"kind":"Name","value":"nameAr"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"productCount"}}]}}]}}]}}]} as unknown as DocumentNode<CategoryQuery, CategoryQueryVariables>;
export const CategoryBySlugDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CategoryBySlug"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categoryBySlug"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"nameFr"}},{"kind":"Field","name":{"kind":"Name","value":"nameAr"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionFr"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionAr"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionEn"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"parentName"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"displayOrder"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"productCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<CategoryBySlugQuery, CategoryBySlugQueryVariables>;
export const ActiveCategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ActiveCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"activeCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"nameFr"}},{"kind":"Field","name":{"kind":"Name","value":"nameAr"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"displayOrder"}},{"kind":"Field","name":{"kind":"Name","value":"productCount"}}]}}]}}]} as unknown as DocumentNode<ActiveCategoriesQuery, ActiveCategoriesQueryVariables>;
export const RootCategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RootCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rootCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"nameFr"}},{"kind":"Field","name":{"kind":"Name","value":"nameAr"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"displayOrder"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"productCount"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"nameFr"}},{"kind":"Field","name":{"kind":"Name","value":"nameAr"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"displayOrder"}},{"kind":"Field","name":{"kind":"Name","value":"productCount"}}]}}]}}]}}]} as unknown as DocumentNode<RootCategoriesQuery, RootCategoriesQueryVariables>;
export const CategoryTreeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CategoryTree"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categoryTree"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"nameFr"}},{"kind":"Field","name":{"kind":"Name","value":"nameAr"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"displayOrder"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"productCount"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"nameFr"}},{"kind":"Field","name":{"kind":"Name","value":"nameAr"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"displayOrder"}},{"kind":"Field","name":{"kind":"Name","value":"productCount"}},{"kind":"Field","name":{"kind":"Name","value":"children"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"nameFr"}},{"kind":"Field","name":{"kind":"Name","value":"nameAr"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"displayOrder"}},{"kind":"Field","name":{"kind":"Name","value":"productCount"}}]}}]}}]}}]}}]} as unknown as DocumentNode<CategoryTreeQuery, CategoryTreeQueryVariables>;
export const SubcategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Subcategories"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"parentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Long"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subcategories"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"parentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"parentId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"nameFr"}},{"kind":"Field","name":{"kind":"Name","value":"nameAr"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"displayOrder"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"productCount"}}]}}]}}]} as unknown as DocumentNode<SubcategoriesQuery, SubcategoriesQueryVariables>;
export const CreateCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateCategoryRequestInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"nameFr"}},{"kind":"Field","name":{"kind":"Name","value":"nameAr"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionFr"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionAr"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionEn"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"displayOrder"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<CreateCategoryMutation, CreateCategoryMutationVariables>;
export const UpdateCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Long"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateCategoryRequestInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"nameFr"}},{"kind":"Field","name":{"kind":"Name","value":"nameAr"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionFr"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionAr"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionEn"}},{"kind":"Field","name":{"kind":"Name","value":"parentId"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"displayOrder"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateCategoryMutation, UpdateCategoryMutationVariables>;
export const DeleteCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Long"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteCategoryMutation, DeleteCategoryMutationVariables>;
export const AllOrdersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AllOrders"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"0"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"size"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"allOrders"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"size"},"value":{"kind":"Variable","name":{"kind":"Name","value":"size"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"content"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"shippingCost"}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"}},{"kind":"Field","name":{"kind":"Name","value":"phoneNumber"}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"trackingNumber"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"deliveredAt"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"productImage"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"selectedSize"}},{"kind":"Field","name":{"kind":"Name","value":"selectedColor"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalElements"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"first"}},{"kind":"Field","name":{"kind":"Name","value":"last"}},{"kind":"Field","name":{"kind":"Name","value":"hasNext"}},{"kind":"Field","name":{"kind":"Name","value":"hasPrevious"}}]}}]}}]} as unknown as DocumentNode<AllOrdersQuery, AllOrdersQueryVariables>;
export const OrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Order"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Long"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"shippingCost"}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"}},{"kind":"Field","name":{"kind":"Name","value":"phoneNumber"}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"trackingNumber"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"deliveredAt"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"productImage"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"selectedSize"}},{"kind":"Field","name":{"kind":"Name","value":"selectedColor"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}}]}}]}}]}}]} as unknown as DocumentNode<OrderQuery, OrderQueryVariables>;
export const OrderByNumberDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrderByNumber"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"orderNumber"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orderByNumber"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"orderNumber"},"value":{"kind":"Variable","name":{"kind":"Name","value":"orderNumber"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"shippingCost"}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"}},{"kind":"Field","name":{"kind":"Name","value":"phoneNumber"}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"trackingNumber"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"deliveredAt"}},{"kind":"Field","name":{"kind":"Name","value":"paidAt"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"productId"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"productImage"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"selectedSize"}},{"kind":"Field","name":{"kind":"Name","value":"selectedColor"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}}]}}]}}]}}]} as unknown as DocumentNode<OrderByNumberQuery, OrderByNumberQueryVariables>;
export const MyOrdersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyOrders"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"0"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"size"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"10"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myOrders"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"size"},"value":{"kind":"Variable","name":{"kind":"Name","value":"size"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"content"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"productImage"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"price"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalElements"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}}]}}]}}]} as unknown as DocumentNode<MyOrdersQuery, MyOrdersQueryVariables>;
export const OrdersByStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"OrdersByStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"0"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"size"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"ordersByStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"size"},"value":{"kind":"Variable","name":{"kind":"Name","value":"size"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"content"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"userEmail"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"}},{"kind":"Field","name":{"kind":"Name","value":"phoneNumber"}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"productName"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"price"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalElements"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}}]}}]}}]} as unknown as DocumentNode<OrdersByStatusQuery, OrdersByStatusQueryVariables>;
export const CreateOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateOrderRequestInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"paymentMethod"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"shippingCost"}},{"kind":"Field","name":{"kind":"Name","value":"totalAmount"}},{"kind":"Field","name":{"kind":"Name","value":"phoneNumber"}},{"kind":"Field","name":{"kind":"Name","value":"shippingAddress"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<CreateOrderMutation, CreateOrderMutationVariables>;
export const UpdateOrderStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateOrderStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Long"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateOrderStatusRequestInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateOrderStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"trackingNumber"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"deliveredAt"}}]}}]}}]} as unknown as DocumentNode<UpdateOrderStatusMutation, UpdateOrderStatusMutationVariables>;
export const CancelOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CancelOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Long"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"orderNumber"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<CancelOrderMutation, CancelOrderMutationVariables>;
export const ProductsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Products"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"0"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"size"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"20"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sortBy"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}},"defaultValue":{"kind":"StringValue","value":"createdAt","block":false}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sortDirection"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}},"defaultValue":{"kind":"StringValue","value":"DESC","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"products"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"size"},"value":{"kind":"Variable","name":{"kind":"Name","value":"size"}}},{"kind":"Argument","name":{"kind":"Name","value":"sortBy"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sortBy"}}},{"kind":"Argument","name":{"kind":"Name","value":"sortDirection"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sortDirection"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"content"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"nameFr"}},{"kind":"Field","name":{"kind":"Name","value":"nameAr"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionFr"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionAr"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionEn"}},{"kind":"Field","name":{"kind":"Name","value":"basePrice"}},{"kind":"Field","name":{"kind":"Name","value":"salePrice"}},{"kind":"Field","name":{"kind":"Name","value":"stockQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}},{"kind":"Field","name":{"kind":"Name","value":"isFeatured"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"availableSizes"}},{"kind":"Field","name":{"kind":"Name","value":"availableColors"}},{"kind":"Field","name":{"kind":"Name","value":"viewCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalElements"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"first"}},{"kind":"Field","name":{"kind":"Name","value":"last"}},{"kind":"Field","name":{"kind":"Name","value":"hasNext"}},{"kind":"Field","name":{"kind":"Name","value":"hasPrevious"}}]}}]}}]} as unknown as DocumentNode<ProductsQuery, ProductsQueryVariables>;
export const ProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Product"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Long"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"nameFr"}},{"kind":"Field","name":{"kind":"Name","value":"nameAr"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionFr"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionAr"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionEn"}},{"kind":"Field","name":{"kind":"Name","value":"basePrice"}},{"kind":"Field","name":{"kind":"Name","value":"salePrice"}},{"kind":"Field","name":{"kind":"Name","value":"stockQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}},{"kind":"Field","name":{"kind":"Name","value":"isFeatured"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"availableSizes"}},{"kind":"Field","name":{"kind":"Name","value":"availableColors"}},{"kind":"Field","name":{"kind":"Name","value":"viewCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<ProductQuery, ProductQueryVariables>;
export const ProductBySkuDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProductBySku"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sku"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productBySku"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"sku"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sku"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"nameFr"}},{"kind":"Field","name":{"kind":"Name","value":"nameAr"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionFr"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionAr"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionEn"}},{"kind":"Field","name":{"kind":"Name","value":"basePrice"}},{"kind":"Field","name":{"kind":"Name","value":"salePrice"}},{"kind":"Field","name":{"kind":"Name","value":"stockQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}},{"kind":"Field","name":{"kind":"Name","value":"isFeatured"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"availableSizes"}},{"kind":"Field","name":{"kind":"Name","value":"availableColors"}},{"kind":"Field","name":{"kind":"Name","value":"viewCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<ProductBySkuQuery, ProductBySkuQueryVariables>;
export const SearchProductsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchProducts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"0"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"size"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchProducts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"keyword"},"value":{"kind":"Variable","name":{"kind":"Name","value":"keyword"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"size"},"value":{"kind":"Variable","name":{"kind":"Name","value":"size"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"content"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"nameFr"}},{"kind":"Field","name":{"kind":"Name","value":"nameAr"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"basePrice"}},{"kind":"Field","name":{"kind":"Name","value":"salePrice"}},{"kind":"Field","name":{"kind":"Name","value":"stockQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}},{"kind":"Field","name":{"kind":"Name","value":"isFeatured"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalElements"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"size"}}]}}]}}]} as unknown as DocumentNode<SearchProductsQuery, SearchProductsQueryVariables>;
export const ProductsByCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProductsByCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"categoryId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Long"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"0"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"size"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productsByCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"categoryId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"categoryId"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"size"},"value":{"kind":"Variable","name":{"kind":"Name","value":"size"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"content"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"nameFr"}},{"kind":"Field","name":{"kind":"Name","value":"nameAr"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"basePrice"}},{"kind":"Field","name":{"kind":"Name","value":"salePrice"}},{"kind":"Field","name":{"kind":"Name","value":"stockQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}},{"kind":"Field","name":{"kind":"Name","value":"isFeatured"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalElements"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}}]}}]}}]} as unknown as DocumentNode<ProductsByCategoryQuery, ProductsByCategoryQueryVariables>;
export const FeaturedProductsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FeaturedProducts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"featuredProducts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"nameFr"}},{"kind":"Field","name":{"kind":"Name","value":"nameAr"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"basePrice"}},{"kind":"Field","name":{"kind":"Name","value":"salePrice"}},{"kind":"Field","name":{"kind":"Name","value":"stockQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}}]}}]}}]} as unknown as DocumentNode<FeaturedProductsQuery, FeaturedProductsQueryVariables>;
export const PopularProductsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PopularProducts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"0"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"size"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"popularProducts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"size"},"value":{"kind":"Variable","name":{"kind":"Name","value":"size"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"content"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"nameFr"}},{"kind":"Field","name":{"kind":"Name","value":"nameAr"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"basePrice"}},{"kind":"Field","name":{"kind":"Name","value":"salePrice"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"viewCount"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalElements"}}]}}]}}]} as unknown as DocumentNode<PopularProductsQuery, PopularProductsQueryVariables>;
export const NewArrivalsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"NewArrivals"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"0"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"size"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"newArrivals"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"size"},"value":{"kind":"Variable","name":{"kind":"Name","value":"size"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"content"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"nameFr"}},{"kind":"Field","name":{"kind":"Name","value":"nameAr"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"basePrice"}},{"kind":"Field","name":{"kind":"Name","value":"salePrice"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalElements"}}]}}]}}]} as unknown as DocumentNode<NewArrivalsQuery, NewArrivalsQueryVariables>;
export const LowStockProductsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LowStockProducts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"threshold"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"10"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lowStockProducts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"threshold"},"value":{"kind":"Variable","name":{"kind":"Name","value":"threshold"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"nameFr"}},{"kind":"Field","name":{"kind":"Name","value":"stockQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}}]}}]}}]} as unknown as DocumentNode<LowStockProductsQuery, LowStockProductsQueryVariables>;
export const ProductsByPriceRangeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProductsByPriceRange"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"minPrice"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BigDecimal"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"maxPrice"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BigDecimal"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"0"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"size"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productsByPriceRange"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"minPrice"},"value":{"kind":"Variable","name":{"kind":"Name","value":"minPrice"}}},{"kind":"Argument","name":{"kind":"Name","value":"maxPrice"},"value":{"kind":"Variable","name":{"kind":"Name","value":"maxPrice"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"size"},"value":{"kind":"Variable","name":{"kind":"Name","value":"size"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"content"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"nameFr"}},{"kind":"Field","name":{"kind":"Name","value":"basePrice"}},{"kind":"Field","name":{"kind":"Name","value":"salePrice"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalElements"}}]}}]}}]} as unknown as DocumentNode<ProductsByPriceRangeQuery, ProductsByPriceRangeQueryVariables>;
export const CreateProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateProductRequestInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"nameFr"}},{"kind":"Field","name":{"kind":"Name","value":"nameAr"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionFr"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionAr"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionEn"}},{"kind":"Field","name":{"kind":"Name","value":"basePrice"}},{"kind":"Field","name":{"kind":"Name","value":"salePrice"}},{"kind":"Field","name":{"kind":"Name","value":"stockQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}},{"kind":"Field","name":{"kind":"Name","value":"isFeatured"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"availableSizes"}},{"kind":"Field","name":{"kind":"Name","value":"availableColors"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<CreateProductMutation, CreateProductMutationVariables>;
export const UpdateProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Long"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateProductRequestInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"sku"}},{"kind":"Field","name":{"kind":"Name","value":"nameFr"}},{"kind":"Field","name":{"kind":"Name","value":"nameAr"}},{"kind":"Field","name":{"kind":"Name","value":"nameEn"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionFr"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionAr"}},{"kind":"Field","name":{"kind":"Name","value":"descriptionEn"}},{"kind":"Field","name":{"kind":"Name","value":"basePrice"}},{"kind":"Field","name":{"kind":"Name","value":"salePrice"}},{"kind":"Field","name":{"kind":"Name","value":"stockQuantity"}},{"kind":"Field","name":{"kind":"Name","value":"categoryId"}},{"kind":"Field","name":{"kind":"Name","value":"categoryName"}},{"kind":"Field","name":{"kind":"Name","value":"isFeatured"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrls"}},{"kind":"Field","name":{"kind":"Name","value":"availableSizes"}},{"kind":"Field","name":{"kind":"Name","value":"availableColors"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateProductMutation, UpdateProductMutationVariables>;
export const DeleteProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Long"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteProductMutation, DeleteProductMutationVariables>;
export const UsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Users"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"0"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"size"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"20"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sortBy"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}},"defaultValue":{"kind":"StringValue","value":"createdAt","block":false}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sortDirection"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}},"defaultValue":{"kind":"StringValue","value":"DESC","block":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"users"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"size"},"value":{"kind":"Variable","name":{"kind":"Name","value":"size"}}},{"kind":"Argument","name":{"kind":"Name","value":"sortBy"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sortBy"}}},{"kind":"Argument","name":{"kind":"Name","value":"sortDirection"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sortDirection"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"content"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerified"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalElements"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"first"}},{"kind":"Field","name":{"kind":"Name","value":"last"}},{"kind":"Field","name":{"kind":"Name","value":"hasNext"}},{"kind":"Field","name":{"kind":"Name","value":"hasPrevious"}}]}}]}}]} as unknown as DocumentNode<UsersQuery, UsersQueryVariables>;
export const UserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"User"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Long"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"user"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerified"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UserQuery, UserQueryVariables>;
export const UsersByRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UsersByRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"role"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"0"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"size"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"20"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"usersByRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"role"},"value":{"kind":"Variable","name":{"kind":"Name","value":"role"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"size"},"value":{"kind":"Variable","name":{"kind":"Name","value":"size"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"content"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"emailVerified"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalElements"}},{"kind":"Field","name":{"kind":"Name","value":"totalPages"}}]}}]}}]} as unknown as DocumentNode<UsersByRoleQuery, UsersByRoleQueryVariables>;
export const ToggleUserStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ToggleUserStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Long"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"toggleUserStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"firstName"}},{"kind":"Field","name":{"kind":"Name","value":"lastName"}},{"kind":"Field","name":{"kind":"Name","value":"isActive"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<ToggleUserStatusMutation, ToggleUserStatusMutationVariables>;