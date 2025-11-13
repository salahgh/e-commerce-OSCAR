import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
  [_ in K]?: never;
};
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  BigDecimal: { input: number; output: number };
  LocalDateTime: { input: string; output: string };
  Long: { input: number; output: number };
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
  Desc = 'DESC',
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
  NullsLast = 'NULLS_LAST',
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

export type LoginMutation = {
  __typename?: 'Mutation';
  login?: {
    __typename?: 'LoginResponse';
    accessToken?: string | null;
    refreshToken?: string | null;
    tokenType?: string | null;
    expiresIn?: number | null;
    userId?: number | null;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    role?: string | null;
  } | null;
};

export type RegisterMutationVariables = Exact<{
  input: RegisterRequestInput;
}>;

export type RegisterMutation = {
  __typename?: 'Mutation';
  register?: {
    __typename?: 'LoginResponse';
    accessToken?: string | null;
    refreshToken?: string | null;
    tokenType?: string | null;
    expiresIn?: number | null;
    userId?: number | null;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    role?: string | null;
  } | null;
};

export type ForgotPasswordMutationVariables = Exact<{
  email: Scalars['String']['input'];
}>;

export type ForgotPasswordMutation = { __typename?: 'Mutation'; forgotPassword?: boolean | null };

export type ResetPasswordMutationVariables = Exact<{
  token: Scalars['String']['input'];
  newPassword: Scalars['String']['input'];
}>;

export type ResetPasswordMutation = { __typename?: 'Mutation'; resetPassword?: boolean | null };

export type ChangePasswordMutationVariables = Exact<{
  input: ChangePasswordRequestInput;
}>;

export type ChangePasswordMutation = { __typename?: 'Mutation'; changePassword?: boolean | null };

export type UpdateProfileMutationVariables = Exact<{
  input: UpdateProfileRequestInput;
}>;

export type UpdateProfileMutation = {
  __typename?: 'Mutation';
  updateProfile?: {
    __typename?: 'UserProfileResponse';
    id?: number | null;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    role?: string | null;
    isActive?: boolean | null;
    emailVerified?: boolean | null;
    createdAt?: string | null;
    updatedAt?: string | null;
  } | null;
};

export type AddToCartMutationVariables = Exact<{
  input: AddToCartRequestInput;
}>;

export type AddToCartMutation = {
  __typename?: 'Mutation';
  addToCart?: {
    __typename?: 'CartResponse';
    id?: number | null;
    userId?: number | null;
    totalAmount?: number | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    items?: Array<{
      __typename?: 'CartItemResponse';
      id?: number | null;
      productId?: number | null;
      productName?: string | null;
      productImage?: string | null;
      quantity?: number | null;
      price?: number | null;
      subtotal?: number | null;
      selectedSize?: string | null;
      selectedColor?: string | null;
    } | null> | null;
  } | null;
};

export type UpdateCartItemMutationVariables = Exact<{
  itemId: Scalars['Long']['input'];
  input: UpdateCartItemRequestInput;
}>;

export type UpdateCartItemMutation = {
  __typename?: 'Mutation';
  updateCartItem?: {
    __typename?: 'CartResponse';
    id?: number | null;
    userId?: number | null;
    totalAmount?: number | null;
    updatedAt?: string | null;
    items?: Array<{
      __typename?: 'CartItemResponse';
      id?: number | null;
      productId?: number | null;
      productName?: string | null;
      productImage?: string | null;
      quantity?: number | null;
      price?: number | null;
      subtotal?: number | null;
      selectedSize?: string | null;
      selectedColor?: string | null;
    } | null> | null;
  } | null;
};

export type RemoveFromCartMutationVariables = Exact<{
  itemId: Scalars['Long']['input'];
}>;

export type RemoveFromCartMutation = {
  __typename?: 'Mutation';
  removeFromCart?: {
    __typename?: 'CartResponse';
    id?: number | null;
    userId?: number | null;
    totalAmount?: number | null;
    updatedAt?: string | null;
    items?: Array<{
      __typename?: 'CartItemResponse';
      id?: number | null;
      productId?: number | null;
      productName?: string | null;
      productImage?: string | null;
      quantity?: number | null;
      price?: number | null;
      subtotal?: number | null;
      selectedSize?: string | null;
      selectedColor?: string | null;
    } | null> | null;
  } | null;
};

export type ClearCartMutationVariables = Exact<{ [key: string]: never }>;

export type ClearCartMutation = { __typename?: 'Mutation'; clearCart?: boolean | null };

export type CreateOrderMutationVariables = Exact<{
  input: CreateOrderRequestInput;
}>;

export type CreateOrderMutation = {
  __typename?: 'Mutation';
  createOrder?: {
    __typename?: 'OrderResponse';
    id?: number | null;
    orderNumber?: string | null;
    userId?: number | null;
    userEmail?: string | null;
    status?: string | null;
    subtotal?: number | null;
    shippingCost?: number | null;
    totalAmount?: number | null;
    paymentMethod?: string | null;
    shippingAddress?: string | null;
    phoneNumber?: string | null;
    notes?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    items?: Array<{
      __typename?: 'OrderItemResponse';
      id?: number | null;
      productId?: number | null;
      productName?: string | null;
      productImage?: string | null;
      quantity?: number | null;
      price?: number | null;
      subtotal?: number | null;
      selectedSize?: string | null;
      selectedColor?: string | null;
    } | null> | null;
  } | null;
};

export type CancelOrderMutationVariables = Exact<{
  id: Scalars['Long']['input'];
}>;

export type CancelOrderMutation = {
  __typename?: 'Mutation';
  cancelOrder?: {
    __typename?: 'OrderResponse';
    id?: number | null;
    orderNumber?: string | null;
    status?: string | null;
    updatedAt?: string | null;
  } | null;
};

export type GetCurrentUserQueryVariables = Exact<{ [key: string]: never }>;

export type GetCurrentUserQuery = {
  __typename?: 'Query';
  me?: {
    __typename?: 'UserProfileResponse';
    id?: number | null;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    role?: string | null;
    isActive?: boolean | null;
    emailVerified?: boolean | null;
    createdAt?: string | null;
    updatedAt?: string | null;
  } | null;
};

export type GetCartQueryVariables = Exact<{ [key: string]: never }>;

export type GetCartQuery = {
  __typename?: 'Query';
  myCart?: {
    __typename?: 'CartResponse';
    id?: number | null;
    userId?: number | null;
    totalAmount?: number | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    items?: Array<{
      __typename?: 'CartItemResponse';
      id?: number | null;
      productId?: number | null;
      productName?: string | null;
      productImage?: string | null;
      quantity?: number | null;
      price?: number | null;
      subtotal?: number | null;
      selectedSize?: string | null;
      selectedColor?: string | null;
    } | null> | null;
  } | null;
};

export type GetCategoriesQueryVariables = Exact<{ [key: string]: never }>;

export type GetCategoriesQuery = {
  __typename?: 'Query';
  categories?: Array<{
    __typename?: 'CategoryResponse';
    id?: number | null;
    nameAr?: string | null;
    nameFr?: string | null;
    nameEn?: string | null;
    slug?: string | null;
    imageUrl?: string | null;
    parentId?: number | null;
    isActive?: boolean | null;
    productCount?: number | null;
  } | null> | null;
};

export type GetCategoryQueryVariables = Exact<{
  id: Scalars['Long']['input'];
}>;

export type GetCategoryQuery = {
  __typename?: 'Query';
  category?: {
    __typename?: 'CategoryResponse';
    id?: number | null;
    nameAr?: string | null;
    nameFr?: string | null;
    nameEn?: string | null;
    descriptionAr?: string | null;
    descriptionFr?: string | null;
    descriptionEn?: string | null;
    slug?: string | null;
    imageUrl?: string | null;
    parentId?: number | null;
    parentName?: string | null;
    isActive?: boolean | null;
    displayOrder?: number | null;
    productCount?: number | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    children?: Array<{
      __typename?: 'CategoryResponse';
      id?: number | null;
      nameAr?: string | null;
      nameFr?: string | null;
      nameEn?: string | null;
      slug?: string | null;
      imageUrl?: string | null;
      productCount?: number | null;
    } | null> | null;
  } | null;
};

export type GetCategoryBySlugQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;

export type GetCategoryBySlugQuery = {
  __typename?: 'Query';
  categoryBySlug?: {
    __typename?: 'CategoryResponse';
    id?: number | null;
    nameAr?: string | null;
    nameFr?: string | null;
    nameEn?: string | null;
    descriptionAr?: string | null;
    descriptionFr?: string | null;
    descriptionEn?: string | null;
    slug?: string | null;
    imageUrl?: string | null;
    parentId?: number | null;
    parentName?: string | null;
    isActive?: boolean | null;
    productCount?: number | null;
    children?: Array<{
      __typename?: 'CategoryResponse';
      id?: number | null;
      nameAr?: string | null;
      nameFr?: string | null;
      nameEn?: string | null;
      slug?: string | null;
      imageUrl?: string | null;
      productCount?: number | null;
    } | null> | null;
  } | null;
};

export type GetCategoryTreeQueryVariables = Exact<{ [key: string]: never }>;

export type GetCategoryTreeQuery = {
  __typename?: 'Query';
  categoryTree?: Array<{
    __typename?: 'CategoryResponse';
    id?: number | null;
    nameAr?: string | null;
    nameFr?: string | null;
    nameEn?: string | null;
    slug?: string | null;
    imageUrl?: string | null;
    productCount?: number | null;
    children?: Array<{
      __typename?: 'CategoryResponse';
      id?: number | null;
      nameAr?: string | null;
      nameFr?: string | null;
      nameEn?: string | null;
      slug?: string | null;
      imageUrl?: string | null;
      productCount?: number | null;
    } | null> | null;
  } | null> | null;
};

export type GetActiveCategoriesQueryVariables = Exact<{ [key: string]: never }>;

export type GetActiveCategoriesQuery = {
  __typename?: 'Query';
  activeCategories?: Array<{
    __typename?: 'CategoryResponse';
    id?: number | null;
    nameAr?: string | null;
    nameFr?: string | null;
    nameEn?: string | null;
    slug?: string | null;
    imageUrl?: string | null;
    productCount?: number | null;
  } | null> | null;
};

export type GetMyOrdersQueryVariables = Exact<{
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
}>;

export type GetMyOrdersQuery = {
  __typename?: 'Query';
  myOrders?: {
    __typename?: 'Page_OrderResponse';
    totalElements: number;
    totalPages: number;
    content?: Array<{
      __typename?: 'OrderResponse';
      id?: number | null;
      orderNumber?: string | null;
      userId?: number | null;
      userEmail?: string | null;
      status?: string | null;
      subtotal?: number | null;
      shippingCost?: number | null;
      totalAmount?: number | null;
      paymentMethod?: string | null;
      shippingAddress?: string | null;
      phoneNumber?: string | null;
      notes?: string | null;
      trackingNumber?: string | null;
      createdAt?: string | null;
      updatedAt?: string | null;
      paidAt?: string | null;
      deliveredAt?: string | null;
      items?: Array<{
        __typename?: 'OrderItemResponse';
        id?: number | null;
        productId?: number | null;
        productName?: string | null;
        productImage?: string | null;
        quantity?: number | null;
        price?: number | null;
        subtotal?: number | null;
        selectedSize?: string | null;
        selectedColor?: string | null;
      } | null> | null;
    } | null> | null;
  } | null;
};

export type GetOrderQueryVariables = Exact<{
  id: Scalars['Long']['input'];
}>;

export type GetOrderQuery = {
  __typename?: 'Query';
  order?: {
    __typename?: 'OrderResponse';
    id?: number | null;
    orderNumber?: string | null;
    userId?: number | null;
    userEmail?: string | null;
    status?: string | null;
    subtotal?: number | null;
    shippingCost?: number | null;
    totalAmount?: number | null;
    paymentMethod?: string | null;
    shippingAddress?: string | null;
    phoneNumber?: string | null;
    notes?: string | null;
    trackingNumber?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
    paidAt?: string | null;
    deliveredAt?: string | null;
    items?: Array<{
      __typename?: 'OrderItemResponse';
      id?: number | null;
      productId?: number | null;
      productName?: string | null;
      productImage?: string | null;
      quantity?: number | null;
      price?: number | null;
      subtotal?: number | null;
      selectedSize?: string | null;
      selectedColor?: string | null;
    } | null> | null;
  } | null;
};

export type GetProductsQueryVariables = Exact<{
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
  sortBy?: InputMaybe<Scalars['String']['input']>;
  sortDirection?: InputMaybe<Scalars['String']['input']>;
}>;

export type GetProductsQuery = {
  __typename?: 'Query';
  products?: {
    __typename?: 'Page_ProductResponse';
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
    content?: Array<{
      __typename?: 'ProductResponse';
      id?: number | null;
      sku?: string | null;
      nameAr?: string | null;
      nameFr?: string | null;
      nameEn?: string | null;
      descriptionAr?: string | null;
      descriptionFr?: string | null;
      descriptionEn?: string | null;
      basePrice?: number | null;
      salePrice?: number | null;
      stockQuantity?: number | null;
      imageUrls?: Array<string | null> | null;
      categoryId?: number | null;
      categoryName?: string | null;
      isFeatured?: boolean | null;
      availableSizes?: Array<string | null> | null;
      availableColors?: Array<string | null> | null;
      viewCount?: number | null;
      createdAt?: string | null;
      updatedAt?: string | null;
    } | null> | null;
  } | null;
};

export type GetProductQueryVariables = Exact<{
  id: Scalars['Long']['input'];
}>;

export type GetProductQuery = {
  __typename?: 'Query';
  product?: {
    __typename?: 'ProductResponse';
    id?: number | null;
    sku?: string | null;
    nameAr?: string | null;
    nameFr?: string | null;
    nameEn?: string | null;
    descriptionAr?: string | null;
    descriptionFr?: string | null;
    descriptionEn?: string | null;
    basePrice?: number | null;
    salePrice?: number | null;
    stockQuantity?: number | null;
    imageUrls?: Array<string | null> | null;
    categoryId?: number | null;
    categoryName?: string | null;
    isFeatured?: boolean | null;
    availableSizes?: Array<string | null> | null;
    availableColors?: Array<string | null> | null;
    viewCount?: number | null;
    createdAt?: string | null;
    updatedAt?: string | null;
  } | null;
};

export type GetProductBySkuQueryVariables = Exact<{
  sku: Scalars['String']['input'];
}>;

export type GetProductBySkuQuery = {
  __typename?: 'Query';
  productBySku?: {
    __typename?: 'ProductResponse';
    id?: number | null;
    sku?: string | null;
    nameAr?: string | null;
    nameFr?: string | null;
    nameEn?: string | null;
    descriptionAr?: string | null;
    descriptionFr?: string | null;
    descriptionEn?: string | null;
    basePrice?: number | null;
    salePrice?: number | null;
    stockQuantity?: number | null;
    imageUrls?: Array<string | null> | null;
    categoryId?: number | null;
    categoryName?: string | null;
    isFeatured?: boolean | null;
    availableSizes?: Array<string | null> | null;
    availableColors?: Array<string | null> | null;
    viewCount?: number | null;
    createdAt?: string | null;
    updatedAt?: string | null;
  } | null;
};

export type GetFeaturedProductsQueryVariables = Exact<{ [key: string]: never }>;

export type GetFeaturedProductsQuery = {
  __typename?: 'Query';
  featuredProducts?: Array<{
    __typename?: 'ProductResponse';
    id?: number | null;
    sku?: string | null;
    nameAr?: string | null;
    nameFr?: string | null;
    nameEn?: string | null;
    basePrice?: number | null;
    salePrice?: number | null;
    stockQuantity?: number | null;
    imageUrls?: Array<string | null> | null;
    categoryId?: number | null;
    categoryName?: string | null;
    isFeatured?: boolean | null;
  } | null> | null;
};

export type SearchProductsQueryVariables = Exact<{
  keyword: Scalars['String']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
}>;

export type SearchProductsQuery = {
  __typename?: 'Query';
  searchProducts?: {
    __typename?: 'Page_ProductResponse';
    totalElements: number;
    totalPages: number;
    content?: Array<{
      __typename?: 'ProductResponse';
      id?: number | null;
      sku?: string | null;
      nameAr?: string | null;
      nameFr?: string | null;
      nameEn?: string | null;
      basePrice?: number | null;
      salePrice?: number | null;
      stockQuantity?: number | null;
      imageUrls?: Array<string | null> | null;
      categoryId?: number | null;
      categoryName?: string | null;
      isFeatured?: boolean | null;
    } | null> | null;
  } | null;
};

export type GetProductsByCategoryQueryVariables = Exact<{
  categoryId: Scalars['Long']['input'];
  page?: InputMaybe<Scalars['Int']['input']>;
  size?: InputMaybe<Scalars['Int']['input']>;
}>;

export type GetProductsByCategoryQuery = {
  __typename?: 'Query';
  productsByCategory?: {
    __typename?: 'Page_ProductResponse';
    totalElements: number;
    totalPages: number;
    content?: Array<{
      __typename?: 'ProductResponse';
      id?: number | null;
      sku?: string | null;
      nameAr?: string | null;
      nameFr?: string | null;
      nameEn?: string | null;
      basePrice?: number | null;
      salePrice?: number | null;
      stockQuantity?: number | null;
      imageUrls?: Array<string | null> | null;
      categoryId?: number | null;
      categoryName?: string | null;
      isFeatured?: boolean | null;
    } | null> | null;
  } | null;
};

export const LoginDocument = gql`
  mutation Login($input: LoginRequestInput!) {
    login(input: $input) {
      accessToken
      refreshToken
      tokenType
      expiresIn
      userId
      email
      firstName
      lastName
      role
    }
  }
`;
export type LoginMutationFn = Apollo.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useLoginMutation(
  baseOptions?: Apollo.MutationHookOptions<LoginMutation, LoginMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
}
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = Apollo.MutationResult<LoginMutation>;
export type LoginMutationOptions = Apollo.BaseMutationOptions<
  LoginMutation,
  LoginMutationVariables
>;
export const RegisterDocument = gql`
  mutation Register($input: RegisterRequestInput!) {
    register(input: $input) {
      accessToken
      refreshToken
      tokenType
      expiresIn
      userId
      email
      firstName
      lastName
      role
    }
  }
`;
export type RegisterMutationFn = Apollo.MutationFunction<
  RegisterMutation,
  RegisterMutationVariables
>;

/**
 * __useRegisterMutation__
 *
 * To run a mutation, you first call `useRegisterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRegisterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [registerMutation, { data, loading, error }] = useRegisterMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRegisterMutation(
  baseOptions?: Apollo.MutationHookOptions<RegisterMutation, RegisterMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<RegisterMutation, RegisterMutationVariables>(RegisterDocument, options);
}
export type RegisterMutationHookResult = ReturnType<typeof useRegisterMutation>;
export type RegisterMutationResult = Apollo.MutationResult<RegisterMutation>;
export type RegisterMutationOptions = Apollo.BaseMutationOptions<
  RegisterMutation,
  RegisterMutationVariables
>;
export const ForgotPasswordDocument = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`;
export type ForgotPasswordMutationFn = Apollo.MutationFunction<
  ForgotPasswordMutation,
  ForgotPasswordMutationVariables
>;

/**
 * __useForgotPasswordMutation__
 *
 * To run a mutation, you first call `useForgotPasswordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useForgotPasswordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [forgotPasswordMutation, { data, loading, error }] = useForgotPasswordMutation({
 *   variables: {
 *      email: // value for 'email'
 *   },
 * });
 */
export function useForgotPasswordMutation(
  baseOptions?: Apollo.MutationHookOptions<ForgotPasswordMutation, ForgotPasswordMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<ForgotPasswordMutation, ForgotPasswordMutationVariables>(
    ForgotPasswordDocument,
    options
  );
}
export type ForgotPasswordMutationHookResult = ReturnType<typeof useForgotPasswordMutation>;
export type ForgotPasswordMutationResult = Apollo.MutationResult<ForgotPasswordMutation>;
export type ForgotPasswordMutationOptions = Apollo.BaseMutationOptions<
  ForgotPasswordMutation,
  ForgotPasswordMutationVariables
>;
export const ResetPasswordDocument = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword)
  }
`;
export type ResetPasswordMutationFn = Apollo.MutationFunction<
  ResetPasswordMutation,
  ResetPasswordMutationVariables
>;

/**
 * __useResetPasswordMutation__
 *
 * To run a mutation, you first call `useResetPasswordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useResetPasswordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [resetPasswordMutation, { data, loading, error }] = useResetPasswordMutation({
 *   variables: {
 *      token: // value for 'token'
 *      newPassword: // value for 'newPassword'
 *   },
 * });
 */
export function useResetPasswordMutation(
  baseOptions?: Apollo.MutationHookOptions<ResetPasswordMutation, ResetPasswordMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<ResetPasswordMutation, ResetPasswordMutationVariables>(
    ResetPasswordDocument,
    options
  );
}
export type ResetPasswordMutationHookResult = ReturnType<typeof useResetPasswordMutation>;
export type ResetPasswordMutationResult = Apollo.MutationResult<ResetPasswordMutation>;
export type ResetPasswordMutationOptions = Apollo.BaseMutationOptions<
  ResetPasswordMutation,
  ResetPasswordMutationVariables
>;
export const ChangePasswordDocument = gql`
  mutation ChangePassword($input: ChangePasswordRequestInput!) {
    changePassword(input: $input)
  }
`;
export type ChangePasswordMutationFn = Apollo.MutationFunction<
  ChangePasswordMutation,
  ChangePasswordMutationVariables
>;

/**
 * __useChangePasswordMutation__
 *
 * To run a mutation, you first call `useChangePasswordMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useChangePasswordMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [changePasswordMutation, { data, loading, error }] = useChangePasswordMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useChangePasswordMutation(
  baseOptions?: Apollo.MutationHookOptions<ChangePasswordMutation, ChangePasswordMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<ChangePasswordMutation, ChangePasswordMutationVariables>(
    ChangePasswordDocument,
    options
  );
}
export type ChangePasswordMutationHookResult = ReturnType<typeof useChangePasswordMutation>;
export type ChangePasswordMutationResult = Apollo.MutationResult<ChangePasswordMutation>;
export type ChangePasswordMutationOptions = Apollo.BaseMutationOptions<
  ChangePasswordMutation,
  ChangePasswordMutationVariables
>;
export const UpdateProfileDocument = gql`
  mutation UpdateProfile($input: UpdateProfileRequestInput!) {
    updateProfile(input: $input) {
      id
      email
      firstName
      lastName
      phone
      role
      isActive
      emailVerified
      createdAt
      updatedAt
    }
  }
`;
export type UpdateProfileMutationFn = Apollo.MutationFunction<
  UpdateProfileMutation,
  UpdateProfileMutationVariables
>;

/**
 * __useUpdateProfileMutation__
 *
 * To run a mutation, you first call `useUpdateProfileMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateProfileMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateProfileMutation, { data, loading, error }] = useUpdateProfileMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateProfileMutation(
  baseOptions?: Apollo.MutationHookOptions<UpdateProfileMutation, UpdateProfileMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UpdateProfileMutation, UpdateProfileMutationVariables>(
    UpdateProfileDocument,
    options
  );
}
export type UpdateProfileMutationHookResult = ReturnType<typeof useUpdateProfileMutation>;
export type UpdateProfileMutationResult = Apollo.MutationResult<UpdateProfileMutation>;
export type UpdateProfileMutationOptions = Apollo.BaseMutationOptions<
  UpdateProfileMutation,
  UpdateProfileMutationVariables
>;
export const AddToCartDocument = gql`
  mutation AddToCart($input: AddToCartRequestInput!) {
    addToCart(input: $input) {
      id
      userId
      items {
        id
        productId
        productName
        productImage
        quantity
        price
        subtotal
        selectedSize
        selectedColor
      }
      totalAmount
      createdAt
      updatedAt
    }
  }
`;
export type AddToCartMutationFn = Apollo.MutationFunction<
  AddToCartMutation,
  AddToCartMutationVariables
>;

/**
 * __useAddToCartMutation__
 *
 * To run a mutation, you first call `useAddToCartMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddToCartMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addToCartMutation, { data, loading, error }] = useAddToCartMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddToCartMutation(
  baseOptions?: Apollo.MutationHookOptions<AddToCartMutation, AddToCartMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<AddToCartMutation, AddToCartMutationVariables>(
    AddToCartDocument,
    options
  );
}
export type AddToCartMutationHookResult = ReturnType<typeof useAddToCartMutation>;
export type AddToCartMutationResult = Apollo.MutationResult<AddToCartMutation>;
export type AddToCartMutationOptions = Apollo.BaseMutationOptions<
  AddToCartMutation,
  AddToCartMutationVariables
>;
export const UpdateCartItemDocument = gql`
  mutation UpdateCartItem($itemId: Long!, $input: UpdateCartItemRequestInput!) {
    updateCartItem(itemId: $itemId, input: $input) {
      id
      userId
      items {
        id
        productId
        productName
        productImage
        quantity
        price
        subtotal
        selectedSize
        selectedColor
      }
      totalAmount
      updatedAt
    }
  }
`;
export type UpdateCartItemMutationFn = Apollo.MutationFunction<
  UpdateCartItemMutation,
  UpdateCartItemMutationVariables
>;

/**
 * __useUpdateCartItemMutation__
 *
 * To run a mutation, you first call `useUpdateCartItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCartItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCartItemMutation, { data, loading, error }] = useUpdateCartItemMutation({
 *   variables: {
 *      itemId: // value for 'itemId'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateCartItemMutation(
  baseOptions?: Apollo.MutationHookOptions<UpdateCartItemMutation, UpdateCartItemMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<UpdateCartItemMutation, UpdateCartItemMutationVariables>(
    UpdateCartItemDocument,
    options
  );
}
export type UpdateCartItemMutationHookResult = ReturnType<typeof useUpdateCartItemMutation>;
export type UpdateCartItemMutationResult = Apollo.MutationResult<UpdateCartItemMutation>;
export type UpdateCartItemMutationOptions = Apollo.BaseMutationOptions<
  UpdateCartItemMutation,
  UpdateCartItemMutationVariables
>;
export const RemoveFromCartDocument = gql`
  mutation RemoveFromCart($itemId: Long!) {
    removeFromCart(itemId: $itemId) {
      id
      userId
      items {
        id
        productId
        productName
        productImage
        quantity
        price
        subtotal
        selectedSize
        selectedColor
      }
      totalAmount
      updatedAt
    }
  }
`;
export type RemoveFromCartMutationFn = Apollo.MutationFunction<
  RemoveFromCartMutation,
  RemoveFromCartMutationVariables
>;

/**
 * __useRemoveFromCartMutation__
 *
 * To run a mutation, you first call `useRemoveFromCartMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveFromCartMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeFromCartMutation, { data, loading, error }] = useRemoveFromCartMutation({
 *   variables: {
 *      itemId: // value for 'itemId'
 *   },
 * });
 */
export function useRemoveFromCartMutation(
  baseOptions?: Apollo.MutationHookOptions<RemoveFromCartMutation, RemoveFromCartMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<RemoveFromCartMutation, RemoveFromCartMutationVariables>(
    RemoveFromCartDocument,
    options
  );
}
export type RemoveFromCartMutationHookResult = ReturnType<typeof useRemoveFromCartMutation>;
export type RemoveFromCartMutationResult = Apollo.MutationResult<RemoveFromCartMutation>;
export type RemoveFromCartMutationOptions = Apollo.BaseMutationOptions<
  RemoveFromCartMutation,
  RemoveFromCartMutationVariables
>;
export const ClearCartDocument = gql`
  mutation ClearCart {
    clearCart
  }
`;
export type ClearCartMutationFn = Apollo.MutationFunction<
  ClearCartMutation,
  ClearCartMutationVariables
>;

/**
 * __useClearCartMutation__
 *
 * To run a mutation, you first call `useClearCartMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useClearCartMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [clearCartMutation, { data, loading, error }] = useClearCartMutation({
 *   variables: {
 *   },
 * });
 */
export function useClearCartMutation(
  baseOptions?: Apollo.MutationHookOptions<ClearCartMutation, ClearCartMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<ClearCartMutation, ClearCartMutationVariables>(
    ClearCartDocument,
    options
  );
}
export type ClearCartMutationHookResult = ReturnType<typeof useClearCartMutation>;
export type ClearCartMutationResult = Apollo.MutationResult<ClearCartMutation>;
export type ClearCartMutationOptions = Apollo.BaseMutationOptions<
  ClearCartMutation,
  ClearCartMutationVariables
>;
export const CreateOrderDocument = gql`
  mutation CreateOrder($input: CreateOrderRequestInput!) {
    createOrder(input: $input) {
      id
      orderNumber
      userId
      userEmail
      status
      subtotal
      shippingCost
      totalAmount
      paymentMethod
      shippingAddress
      phoneNumber
      notes
      items {
        id
        productId
        productName
        productImage
        quantity
        price
        subtotal
        selectedSize
        selectedColor
      }
      createdAt
      updatedAt
    }
  }
`;
export type CreateOrderMutationFn = Apollo.MutationFunction<
  CreateOrderMutation,
  CreateOrderMutationVariables
>;

/**
 * __useCreateOrderMutation__
 *
 * To run a mutation, you first call `useCreateOrderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateOrderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createOrderMutation, { data, loading, error }] = useCreateOrderMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateOrderMutation(
  baseOptions?: Apollo.MutationHookOptions<CreateOrderMutation, CreateOrderMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CreateOrderMutation, CreateOrderMutationVariables>(
    CreateOrderDocument,
    options
  );
}
export type CreateOrderMutationHookResult = ReturnType<typeof useCreateOrderMutation>;
export type CreateOrderMutationResult = Apollo.MutationResult<CreateOrderMutation>;
export type CreateOrderMutationOptions = Apollo.BaseMutationOptions<
  CreateOrderMutation,
  CreateOrderMutationVariables
>;
export const CancelOrderDocument = gql`
  mutation CancelOrder($id: Long!) {
    cancelOrder(id: $id) {
      id
      orderNumber
      status
      updatedAt
    }
  }
`;
export type CancelOrderMutationFn = Apollo.MutationFunction<
  CancelOrderMutation,
  CancelOrderMutationVariables
>;

/**
 * __useCancelOrderMutation__
 *
 * To run a mutation, you first call `useCancelOrderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCancelOrderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [cancelOrderMutation, { data, loading, error }] = useCancelOrderMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useCancelOrderMutation(
  baseOptions?: Apollo.MutationHookOptions<CancelOrderMutation, CancelOrderMutationVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<CancelOrderMutation, CancelOrderMutationVariables>(
    CancelOrderDocument,
    options
  );
}
export type CancelOrderMutationHookResult = ReturnType<typeof useCancelOrderMutation>;
export type CancelOrderMutationResult = Apollo.MutationResult<CancelOrderMutation>;
export type CancelOrderMutationOptions = Apollo.BaseMutationOptions<
  CancelOrderMutation,
  CancelOrderMutationVariables
>;
export const GetCurrentUserDocument = gql`
  query GetCurrentUser {
    me {
      id
      email
      firstName
      lastName
      phone
      role
      isActive
      emailVerified
      createdAt
      updatedAt
    }
  }
`;

/**
 * __useGetCurrentUserQuery__
 *
 * To run a query within a React component, call `useGetCurrentUserQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCurrentUserQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCurrentUserQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetCurrentUserQuery(
  baseOptions?: Apollo.QueryHookOptions<GetCurrentUserQuery, GetCurrentUserQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetCurrentUserQuery, GetCurrentUserQueryVariables>(
    GetCurrentUserDocument,
    options
  );
}
export function useGetCurrentUserLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetCurrentUserQuery, GetCurrentUserQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetCurrentUserQuery, GetCurrentUserQueryVariables>(
    GetCurrentUserDocument,
    options
  );
}
export function useGetCurrentUserSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetCurrentUserQuery, GetCurrentUserQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetCurrentUserQuery, GetCurrentUserQueryVariables>(
    GetCurrentUserDocument,
    options
  );
}
export type GetCurrentUserQueryHookResult = ReturnType<typeof useGetCurrentUserQuery>;
export type GetCurrentUserLazyQueryHookResult = ReturnType<typeof useGetCurrentUserLazyQuery>;
export type GetCurrentUserSuspenseQueryHookResult = ReturnType<
  typeof useGetCurrentUserSuspenseQuery
>;
export type GetCurrentUserQueryResult = Apollo.QueryResult<
  GetCurrentUserQuery,
  GetCurrentUserQueryVariables
>;
export const GetCartDocument = gql`
  query GetCart {
    myCart {
      id
      userId
      items {
        id
        productId
        productName
        productImage
        quantity
        price
        subtotal
        selectedSize
        selectedColor
      }
      totalAmount
      createdAt
      updatedAt
    }
  }
`;

/**
 * __useGetCartQuery__
 *
 * To run a query within a React component, call `useGetCartQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCartQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCartQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetCartQuery(
  baseOptions?: Apollo.QueryHookOptions<GetCartQuery, GetCartQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetCartQuery, GetCartQueryVariables>(GetCartDocument, options);
}
export function useGetCartLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetCartQuery, GetCartQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetCartQuery, GetCartQueryVariables>(GetCartDocument, options);
}
export function useGetCartSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetCartQuery, GetCartQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetCartQuery, GetCartQueryVariables>(GetCartDocument, options);
}
export type GetCartQueryHookResult = ReturnType<typeof useGetCartQuery>;
export type GetCartLazyQueryHookResult = ReturnType<typeof useGetCartLazyQuery>;
export type GetCartSuspenseQueryHookResult = ReturnType<typeof useGetCartSuspenseQuery>;
export type GetCartQueryResult = Apollo.QueryResult<GetCartQuery, GetCartQueryVariables>;
export const GetCategoriesDocument = gql`
  query GetCategories {
    categories {
      id
      nameAr
      nameFr
      nameEn
      slug
      imageUrl
      parentId
      isActive
      productCount
    }
  }
`;

/**
 * __useGetCategoriesQuery__
 *
 * To run a query within a React component, call `useGetCategoriesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCategoriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCategoriesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetCategoriesQuery(
  baseOptions?: Apollo.QueryHookOptions<GetCategoriesQuery, GetCategoriesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetCategoriesQuery, GetCategoriesQueryVariables>(
    GetCategoriesDocument,
    options
  );
}
export function useGetCategoriesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetCategoriesQuery, GetCategoriesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetCategoriesQuery, GetCategoriesQueryVariables>(
    GetCategoriesDocument,
    options
  );
}
export function useGetCategoriesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetCategoriesQuery, GetCategoriesQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetCategoriesQuery, GetCategoriesQueryVariables>(
    GetCategoriesDocument,
    options
  );
}
export type GetCategoriesQueryHookResult = ReturnType<typeof useGetCategoriesQuery>;
export type GetCategoriesLazyQueryHookResult = ReturnType<typeof useGetCategoriesLazyQuery>;
export type GetCategoriesSuspenseQueryHookResult = ReturnType<typeof useGetCategoriesSuspenseQuery>;
export type GetCategoriesQueryResult = Apollo.QueryResult<
  GetCategoriesQuery,
  GetCategoriesQueryVariables
>;
export const GetCategoryDocument = gql`
  query GetCategory($id: Long!) {
    category(id: $id) {
      id
      nameAr
      nameFr
      nameEn
      descriptionAr
      descriptionFr
      descriptionEn
      slug
      imageUrl
      parentId
      parentName
      isActive
      displayOrder
      productCount
      children {
        id
        nameAr
        nameFr
        nameEn
        slug
        imageUrl
        productCount
      }
      createdAt
      updatedAt
    }
  }
`;

/**
 * __useGetCategoryQuery__
 *
 * To run a query within a React component, call `useGetCategoryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCategoryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCategoryQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetCategoryQuery(
  baseOptions: Apollo.QueryHookOptions<GetCategoryQuery, GetCategoryQueryVariables> &
    ({ variables: GetCategoryQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetCategoryQuery, GetCategoryQueryVariables>(GetCategoryDocument, options);
}
export function useGetCategoryLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetCategoryQuery, GetCategoryQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetCategoryQuery, GetCategoryQueryVariables>(
    GetCategoryDocument,
    options
  );
}
export function useGetCategorySuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetCategoryQuery, GetCategoryQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetCategoryQuery, GetCategoryQueryVariables>(
    GetCategoryDocument,
    options
  );
}
export type GetCategoryQueryHookResult = ReturnType<typeof useGetCategoryQuery>;
export type GetCategoryLazyQueryHookResult = ReturnType<typeof useGetCategoryLazyQuery>;
export type GetCategorySuspenseQueryHookResult = ReturnType<typeof useGetCategorySuspenseQuery>;
export type GetCategoryQueryResult = Apollo.QueryResult<
  GetCategoryQuery,
  GetCategoryQueryVariables
>;
export const GetCategoryBySlugDocument = gql`
  query GetCategoryBySlug($slug: String!) {
    categoryBySlug(slug: $slug) {
      id
      nameAr
      nameFr
      nameEn
      descriptionAr
      descriptionFr
      descriptionEn
      slug
      imageUrl
      parentId
      parentName
      isActive
      productCount
      children {
        id
        nameAr
        nameFr
        nameEn
        slug
        imageUrl
        productCount
      }
    }
  }
`;

/**
 * __useGetCategoryBySlugQuery__
 *
 * To run a query within a React component, call `useGetCategoryBySlugQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCategoryBySlugQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCategoryBySlugQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *   },
 * });
 */
export function useGetCategoryBySlugQuery(
  baseOptions: Apollo.QueryHookOptions<GetCategoryBySlugQuery, GetCategoryBySlugQueryVariables> &
    ({ variables: GetCategoryBySlugQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetCategoryBySlugQuery, GetCategoryBySlugQueryVariables>(
    GetCategoryBySlugDocument,
    options
  );
}
export function useGetCategoryBySlugLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetCategoryBySlugQuery, GetCategoryBySlugQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetCategoryBySlugQuery, GetCategoryBySlugQueryVariables>(
    GetCategoryBySlugDocument,
    options
  );
}
export function useGetCategoryBySlugSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetCategoryBySlugQuery, GetCategoryBySlugQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetCategoryBySlugQuery, GetCategoryBySlugQueryVariables>(
    GetCategoryBySlugDocument,
    options
  );
}
export type GetCategoryBySlugQueryHookResult = ReturnType<typeof useGetCategoryBySlugQuery>;
export type GetCategoryBySlugLazyQueryHookResult = ReturnType<typeof useGetCategoryBySlugLazyQuery>;
export type GetCategoryBySlugSuspenseQueryHookResult = ReturnType<
  typeof useGetCategoryBySlugSuspenseQuery
>;
export type GetCategoryBySlugQueryResult = Apollo.QueryResult<
  GetCategoryBySlugQuery,
  GetCategoryBySlugQueryVariables
>;
export const GetCategoryTreeDocument = gql`
  query GetCategoryTree {
    categoryTree {
      id
      nameAr
      nameFr
      nameEn
      slug
      imageUrl
      productCount
      children {
        id
        nameAr
        nameFr
        nameEn
        slug
        imageUrl
        productCount
      }
    }
  }
`;

/**
 * __useGetCategoryTreeQuery__
 *
 * To run a query within a React component, call `useGetCategoryTreeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCategoryTreeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCategoryTreeQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetCategoryTreeQuery(
  baseOptions?: Apollo.QueryHookOptions<GetCategoryTreeQuery, GetCategoryTreeQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetCategoryTreeQuery, GetCategoryTreeQueryVariables>(
    GetCategoryTreeDocument,
    options
  );
}
export function useGetCategoryTreeLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetCategoryTreeQuery, GetCategoryTreeQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetCategoryTreeQuery, GetCategoryTreeQueryVariables>(
    GetCategoryTreeDocument,
    options
  );
}
export function useGetCategoryTreeSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetCategoryTreeQuery, GetCategoryTreeQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetCategoryTreeQuery, GetCategoryTreeQueryVariables>(
    GetCategoryTreeDocument,
    options
  );
}
export type GetCategoryTreeQueryHookResult = ReturnType<typeof useGetCategoryTreeQuery>;
export type GetCategoryTreeLazyQueryHookResult = ReturnType<typeof useGetCategoryTreeLazyQuery>;
export type GetCategoryTreeSuspenseQueryHookResult = ReturnType<
  typeof useGetCategoryTreeSuspenseQuery
>;
export type GetCategoryTreeQueryResult = Apollo.QueryResult<
  GetCategoryTreeQuery,
  GetCategoryTreeQueryVariables
>;
export const GetActiveCategoriesDocument = gql`
  query GetActiveCategories {
    activeCategories {
      id
      nameAr
      nameFr
      nameEn
      slug
      imageUrl
      productCount
    }
  }
`;

/**
 * __useGetActiveCategoriesQuery__
 *
 * To run a query within a React component, call `useGetActiveCategoriesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActiveCategoriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActiveCategoriesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetActiveCategoriesQuery(
  baseOptions?: Apollo.QueryHookOptions<GetActiveCategoriesQuery, GetActiveCategoriesQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetActiveCategoriesQuery, GetActiveCategoriesQueryVariables>(
    GetActiveCategoriesDocument,
    options
  );
}
export function useGetActiveCategoriesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetActiveCategoriesQuery,
    GetActiveCategoriesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetActiveCategoriesQuery, GetActiveCategoriesQueryVariables>(
    GetActiveCategoriesDocument,
    options
  );
}
export function useGetActiveCategoriesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetActiveCategoriesQuery, GetActiveCategoriesQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetActiveCategoriesQuery, GetActiveCategoriesQueryVariables>(
    GetActiveCategoriesDocument,
    options
  );
}
export type GetActiveCategoriesQueryHookResult = ReturnType<typeof useGetActiveCategoriesQuery>;
export type GetActiveCategoriesLazyQueryHookResult = ReturnType<
  typeof useGetActiveCategoriesLazyQuery
>;
export type GetActiveCategoriesSuspenseQueryHookResult = ReturnType<
  typeof useGetActiveCategoriesSuspenseQuery
>;
export type GetActiveCategoriesQueryResult = Apollo.QueryResult<
  GetActiveCategoriesQuery,
  GetActiveCategoriesQueryVariables
>;
export const GetMyOrdersDocument = gql`
  query GetMyOrders($page: Int, $size: Int) {
    myOrders(page: $page, size: $size) {
      content {
        id
        orderNumber
        userId
        userEmail
        status
        subtotal
        shippingCost
        totalAmount
        paymentMethod
        shippingAddress
        phoneNumber
        notes
        trackingNumber
        items {
          id
          productId
          productName
          productImage
          quantity
          price
          subtotal
          selectedSize
          selectedColor
        }
        createdAt
        updatedAt
        paidAt
        deliveredAt
      }
      totalElements
      totalPages
    }
  }
`;

/**
 * __useGetMyOrdersQuery__
 *
 * To run a query within a React component, call `useGetMyOrdersQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMyOrdersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMyOrdersQuery({
 *   variables: {
 *      page: // value for 'page'
 *      size: // value for 'size'
 *   },
 * });
 */
export function useGetMyOrdersQuery(
  baseOptions?: Apollo.QueryHookOptions<GetMyOrdersQuery, GetMyOrdersQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetMyOrdersQuery, GetMyOrdersQueryVariables>(GetMyOrdersDocument, options);
}
export function useGetMyOrdersLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetMyOrdersQuery, GetMyOrdersQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetMyOrdersQuery, GetMyOrdersQueryVariables>(
    GetMyOrdersDocument,
    options
  );
}
export function useGetMyOrdersSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetMyOrdersQuery, GetMyOrdersQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetMyOrdersQuery, GetMyOrdersQueryVariables>(
    GetMyOrdersDocument,
    options
  );
}
export type GetMyOrdersQueryHookResult = ReturnType<typeof useGetMyOrdersQuery>;
export type GetMyOrdersLazyQueryHookResult = ReturnType<typeof useGetMyOrdersLazyQuery>;
export type GetMyOrdersSuspenseQueryHookResult = ReturnType<typeof useGetMyOrdersSuspenseQuery>;
export type GetMyOrdersQueryResult = Apollo.QueryResult<
  GetMyOrdersQuery,
  GetMyOrdersQueryVariables
>;
export const GetOrderDocument = gql`
  query GetOrder($id: Long!) {
    order(id: $id) {
      id
      orderNumber
      userId
      userEmail
      status
      subtotal
      shippingCost
      totalAmount
      paymentMethod
      shippingAddress
      phoneNumber
      notes
      trackingNumber
      items {
        id
        productId
        productName
        productImage
        quantity
        price
        subtotal
        selectedSize
        selectedColor
      }
      createdAt
      updatedAt
      paidAt
      deliveredAt
    }
  }
`;

/**
 * __useGetOrderQuery__
 *
 * To run a query within a React component, call `useGetOrderQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrderQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrderQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetOrderQuery(
  baseOptions: Apollo.QueryHookOptions<GetOrderQuery, GetOrderQueryVariables> &
    ({ variables: GetOrderQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetOrderQuery, GetOrderQueryVariables>(GetOrderDocument, options);
}
export function useGetOrderLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetOrderQuery, GetOrderQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetOrderQuery, GetOrderQueryVariables>(GetOrderDocument, options);
}
export function useGetOrderSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetOrderQuery, GetOrderQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetOrderQuery, GetOrderQueryVariables>(GetOrderDocument, options);
}
export type GetOrderQueryHookResult = ReturnType<typeof useGetOrderQuery>;
export type GetOrderLazyQueryHookResult = ReturnType<typeof useGetOrderLazyQuery>;
export type GetOrderSuspenseQueryHookResult = ReturnType<typeof useGetOrderSuspenseQuery>;
export type GetOrderQueryResult = Apollo.QueryResult<GetOrderQuery, GetOrderQueryVariables>;
export const GetProductsDocument = gql`
  query GetProducts($page: Int, $size: Int, $sortBy: String, $sortDirection: String) {
    products(page: $page, size: $size, sortBy: $sortBy, sortDirection: $sortDirection) {
      content {
        id
        sku
        nameAr
        nameFr
        nameEn
        descriptionAr
        descriptionFr
        descriptionEn
        basePrice
        salePrice
        stockQuantity
        imageUrls
        categoryId
        categoryName
        isFeatured
        availableSizes
        availableColors
        viewCount
        createdAt
        updatedAt
      }
      totalElements
      totalPages
      number
      size
      first
      last
      hasNext
      hasPrevious
    }
  }
`;

/**
 * __useGetProductsQuery__
 *
 * To run a query within a React component, call `useGetProductsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProductsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProductsQuery({
 *   variables: {
 *      page: // value for 'page'
 *      size: // value for 'size'
 *      sortBy: // value for 'sortBy'
 *      sortDirection: // value for 'sortDirection'
 *   },
 * });
 */
export function useGetProductsQuery(
  baseOptions?: Apollo.QueryHookOptions<GetProductsQuery, GetProductsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetProductsQuery, GetProductsQueryVariables>(GetProductsDocument, options);
}
export function useGetProductsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetProductsQuery, GetProductsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetProductsQuery, GetProductsQueryVariables>(
    GetProductsDocument,
    options
  );
}
export function useGetProductsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetProductsQuery, GetProductsQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetProductsQuery, GetProductsQueryVariables>(
    GetProductsDocument,
    options
  );
}
export type GetProductsQueryHookResult = ReturnType<typeof useGetProductsQuery>;
export type GetProductsLazyQueryHookResult = ReturnType<typeof useGetProductsLazyQuery>;
export type GetProductsSuspenseQueryHookResult = ReturnType<typeof useGetProductsSuspenseQuery>;
export type GetProductsQueryResult = Apollo.QueryResult<
  GetProductsQuery,
  GetProductsQueryVariables
>;
export const GetProductDocument = gql`
  query GetProduct($id: Long!) {
    product(id: $id) {
      id
      sku
      nameAr
      nameFr
      nameEn
      descriptionAr
      descriptionFr
      descriptionEn
      basePrice
      salePrice
      stockQuantity
      imageUrls
      categoryId
      categoryName
      isFeatured
      availableSizes
      availableColors
      viewCount
      createdAt
      updatedAt
    }
  }
`;

/**
 * __useGetProductQuery__
 *
 * To run a query within a React component, call `useGetProductQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProductQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProductQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetProductQuery(
  baseOptions: Apollo.QueryHookOptions<GetProductQuery, GetProductQueryVariables> &
    ({ variables: GetProductQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetProductQuery, GetProductQueryVariables>(GetProductDocument, options);
}
export function useGetProductLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetProductQuery, GetProductQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetProductQuery, GetProductQueryVariables>(
    GetProductDocument,
    options
  );
}
export function useGetProductSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetProductQuery, GetProductQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetProductQuery, GetProductQueryVariables>(
    GetProductDocument,
    options
  );
}
export type GetProductQueryHookResult = ReturnType<typeof useGetProductQuery>;
export type GetProductLazyQueryHookResult = ReturnType<typeof useGetProductLazyQuery>;
export type GetProductSuspenseQueryHookResult = ReturnType<typeof useGetProductSuspenseQuery>;
export type GetProductQueryResult = Apollo.QueryResult<GetProductQuery, GetProductQueryVariables>;
export const GetProductBySkuDocument = gql`
  query GetProductBySku($sku: String!) {
    productBySku(sku: $sku) {
      id
      sku
      nameAr
      nameFr
      nameEn
      descriptionAr
      descriptionFr
      descriptionEn
      basePrice
      salePrice
      stockQuantity
      imageUrls
      categoryId
      categoryName
      isFeatured
      availableSizes
      availableColors
      viewCount
      createdAt
      updatedAt
    }
  }
`;

/**
 * __useGetProductBySkuQuery__
 *
 * To run a query within a React component, call `useGetProductBySkuQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProductBySkuQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProductBySkuQuery({
 *   variables: {
 *      sku: // value for 'sku'
 *   },
 * });
 */
export function useGetProductBySkuQuery(
  baseOptions: Apollo.QueryHookOptions<GetProductBySkuQuery, GetProductBySkuQueryVariables> &
    ({ variables: GetProductBySkuQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetProductBySkuQuery, GetProductBySkuQueryVariables>(
    GetProductBySkuDocument,
    options
  );
}
export function useGetProductBySkuLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<GetProductBySkuQuery, GetProductBySkuQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetProductBySkuQuery, GetProductBySkuQueryVariables>(
    GetProductBySkuDocument,
    options
  );
}
export function useGetProductBySkuSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetProductBySkuQuery, GetProductBySkuQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetProductBySkuQuery, GetProductBySkuQueryVariables>(
    GetProductBySkuDocument,
    options
  );
}
export type GetProductBySkuQueryHookResult = ReturnType<typeof useGetProductBySkuQuery>;
export type GetProductBySkuLazyQueryHookResult = ReturnType<typeof useGetProductBySkuLazyQuery>;
export type GetProductBySkuSuspenseQueryHookResult = ReturnType<
  typeof useGetProductBySkuSuspenseQuery
>;
export type GetProductBySkuQueryResult = Apollo.QueryResult<
  GetProductBySkuQuery,
  GetProductBySkuQueryVariables
>;
export const GetFeaturedProductsDocument = gql`
  query GetFeaturedProducts {
    featuredProducts {
      id
      sku
      nameAr
      nameFr
      nameEn
      basePrice
      salePrice
      stockQuantity
      imageUrls
      categoryId
      categoryName
      isFeatured
    }
  }
`;

/**
 * __useGetFeaturedProductsQuery__
 *
 * To run a query within a React component, call `useGetFeaturedProductsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFeaturedProductsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFeaturedProductsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetFeaturedProductsQuery(
  baseOptions?: Apollo.QueryHookOptions<GetFeaturedProductsQuery, GetFeaturedProductsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetFeaturedProductsQuery, GetFeaturedProductsQueryVariables>(
    GetFeaturedProductsDocument,
    options
  );
}
export function useGetFeaturedProductsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetFeaturedProductsQuery,
    GetFeaturedProductsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetFeaturedProductsQuery, GetFeaturedProductsQueryVariables>(
    GetFeaturedProductsDocument,
    options
  );
}
export function useGetFeaturedProductsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<GetFeaturedProductsQuery, GetFeaturedProductsQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetFeaturedProductsQuery, GetFeaturedProductsQueryVariables>(
    GetFeaturedProductsDocument,
    options
  );
}
export type GetFeaturedProductsQueryHookResult = ReturnType<typeof useGetFeaturedProductsQuery>;
export type GetFeaturedProductsLazyQueryHookResult = ReturnType<
  typeof useGetFeaturedProductsLazyQuery
>;
export type GetFeaturedProductsSuspenseQueryHookResult = ReturnType<
  typeof useGetFeaturedProductsSuspenseQuery
>;
export type GetFeaturedProductsQueryResult = Apollo.QueryResult<
  GetFeaturedProductsQuery,
  GetFeaturedProductsQueryVariables
>;
export const SearchProductsDocument = gql`
  query SearchProducts($keyword: String!, $page: Int, $size: Int) {
    searchProducts(keyword: $keyword, page: $page, size: $size) {
      content {
        id
        sku
        nameAr
        nameFr
        nameEn
        basePrice
        salePrice
        stockQuantity
        imageUrls
        categoryId
        categoryName
        isFeatured
      }
      totalElements
      totalPages
    }
  }
`;

/**
 * __useSearchProductsQuery__
 *
 * To run a query within a React component, call `useSearchProductsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchProductsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchProductsQuery({
 *   variables: {
 *      keyword: // value for 'keyword'
 *      page: // value for 'page'
 *      size: // value for 'size'
 *   },
 * });
 */
export function useSearchProductsQuery(
  baseOptions: Apollo.QueryHookOptions<SearchProductsQuery, SearchProductsQueryVariables> &
    ({ variables: SearchProductsQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<SearchProductsQuery, SearchProductsQueryVariables>(
    SearchProductsDocument,
    options
  );
}
export function useSearchProductsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<SearchProductsQuery, SearchProductsQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<SearchProductsQuery, SearchProductsQueryVariables>(
    SearchProductsDocument,
    options
  );
}
export function useSearchProductsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<SearchProductsQuery, SearchProductsQueryVariables>
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<SearchProductsQuery, SearchProductsQueryVariables>(
    SearchProductsDocument,
    options
  );
}
export type SearchProductsQueryHookResult = ReturnType<typeof useSearchProductsQuery>;
export type SearchProductsLazyQueryHookResult = ReturnType<typeof useSearchProductsLazyQuery>;
export type SearchProductsSuspenseQueryHookResult = ReturnType<
  typeof useSearchProductsSuspenseQuery
>;
export type SearchProductsQueryResult = Apollo.QueryResult<
  SearchProductsQuery,
  SearchProductsQueryVariables
>;
export const GetProductsByCategoryDocument = gql`
  query GetProductsByCategory($categoryId: Long!, $page: Int, $size: Int) {
    productsByCategory(categoryId: $categoryId, page: $page, size: $size) {
      content {
        id
        sku
        nameAr
        nameFr
        nameEn
        basePrice
        salePrice
        stockQuantity
        imageUrls
        categoryId
        categoryName
        isFeatured
      }
      totalElements
      totalPages
    }
  }
`;

/**
 * __useGetProductsByCategoryQuery__
 *
 * To run a query within a React component, call `useGetProductsByCategoryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProductsByCategoryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProductsByCategoryQuery({
 *   variables: {
 *      categoryId: // value for 'categoryId'
 *      page: // value for 'page'
 *      size: // value for 'size'
 *   },
 * });
 */
export function useGetProductsByCategoryQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetProductsByCategoryQuery,
    GetProductsByCategoryQueryVariables
  > &
    ({ variables: GetProductsByCategoryQueryVariables; skip?: boolean } | { skip: boolean })
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetProductsByCategoryQuery, GetProductsByCategoryQueryVariables>(
    GetProductsByCategoryDocument,
    options
  );
}
export function useGetProductsByCategoryLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetProductsByCategoryQuery,
    GetProductsByCategoryQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetProductsByCategoryQuery, GetProductsByCategoryQueryVariables>(
    GetProductsByCategoryDocument,
    options
  );
}
export function useGetProductsByCategorySuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetProductsByCategoryQuery,
        GetProductsByCategoryQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken ? baseOptions : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetProductsByCategoryQuery, GetProductsByCategoryQueryVariables>(
    GetProductsByCategoryDocument,
    options
  );
}
export type GetProductsByCategoryQueryHookResult = ReturnType<typeof useGetProductsByCategoryQuery>;
export type GetProductsByCategoryLazyQueryHookResult = ReturnType<
  typeof useGetProductsByCategoryLazyQuery
>;
export type GetProductsByCategorySuspenseQueryHookResult = ReturnType<
  typeof useGetProductsByCategorySuspenseQuery
>;
export type GetProductsByCategoryQueryResult = Apollo.QueryResult<
  GetProductsByCategoryQuery,
  GetProductsByCategoryQueryVariables
>;
