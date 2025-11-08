# OSCAR Fashion GraphQL API Guide

Complete guide to using the OSCAR Fashion e-commerce GraphQL API.

## 📍 API Endpoints

| Endpoint | Description |
|----------|-------------|
| **POST** `/graphql` | Main GraphQL endpoint for queries and mutations |
| **GET** `/playground` | Interactive GraphQL Playground UI |
| **GET** `/voyager` | GraphQL schema visualization |
| **GET** `/actuator/health` | Health check endpoint |

---

## 🔐 Authentication

### How Authentication Works

1. **Register or Login** to get access tokens
2. **Include access token** in subsequent requests
3. **Refresh token** when access token expires (24h)

### Authorization Header Format

```http
Authorization: Bearer <your-access-token>
```

### Token Lifetimes

- **Access Token**: 24 hours
- **Refresh Token**: 7 days

---

## 📋 Table of Contents

1. [Authentication Operations](#authentication-operations)
2. [Product Operations](#product-operations)
3. [Cart Operations](#cart-operations)
4. [Order Operations](#order-operations)
5. [Admin Operations](#admin-operations)
6. [Error Handling](#error-handling)

---

## 🔑 Authentication Operations

### 1. Register New User

Create a new customer account.

**Mutation:**
```graphql
mutation Register {
  register(input: {
    firstName: "Ahmed"
    lastName: "Benali"
    email: "ahmed.benali@example.com"
    password: "SecurePassword123"
  }) {
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
```

**Response:**
```json
{
  "data": {
    "register": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "tokenType": "Bearer",
      "expiresIn": 86400000,
      "userId": 1,
      "email": "ahmed.benali@example.com",
      "firstName": "Ahmed",
      "lastName": "Benali",
      "role": "CUSTOMER"
    }
  }
}
```

### 2. Login

Authenticate existing user.

**Mutation:**
```graphql
mutation Login {
  login(input: {
    email: "ahmed.benali@example.com"
    password: "SecurePassword123"
  }) {
    accessToken
    refreshToken
    userId
    email
    firstName
    lastName
    role
  }
}
```

### 3. Refresh Access Token

Get a new access token using refresh token.

**Mutation:**
```graphql
mutation RefreshToken {
  refreshToken(input: {
    refreshToken: "your-refresh-token-here"
  }) {
    accessToken
    refreshToken
    userId
    email
  }
}
```

### 4. Forgot Password

Request password reset email.

**Mutation:**
```graphql
mutation ForgotPassword {
  forgotPassword(email: "ahmed.benali@example.com")
}
```

### 5. Reset Password

Reset password using token from email.

**Mutation:**
```graphql
mutation ResetPassword {
  resetPassword(
    token: "reset-token-from-email"
    newPassword: "NewSecurePassword456"
  )
}
```

---

## 🛍️ Product Operations

### 1. Get All Products (Paginated)

**Query:**
```graphql
query GetProducts {
  products(page: 0, size: 20, sortBy: "createdAt", sortDirection: "DESC") {
    content {
      id
      sku
      nameEn
      nameFr
      nameAr
      descriptionEn
      basePrice
      salePrice
      stockQuantity
      categoryId
      categoryName
      imageUrls
      availableSizes
      availableColors
      isFeatured
      viewCount
      createdAt
      updatedAt
    }
    totalElements
    totalPages
    number
    size
  }
}
```

### 2. Get Single Product

**Query:**
```graphql
query GetProduct {
  product(id: 1) {
    id
    sku
    nameEn
    nameFr
    nameAr
    descriptionEn
    descriptionFr
    descriptionAr
    basePrice
    salePrice
    stockQuantity
    categoryName
    imageUrls
    availableSizes
    availableColors
    isFeatured
    viewCount
  }
}
```

### 3. Search Products

Search across French, Arabic, and English names.

**Query:**
```graphql
query SearchProducts {
  searchProducts(keyword: "قميص", page: 0, size: 10) {
    content {
      id
      nameEn
      nameFr
      nameAr
      basePrice
      salePrice
      imageUrls
    }
    totalElements
  }
}
```

### 4. Get Products by Category

**Query:**
```graphql
query ProductsByCategory {
  productsByCategory(categoryId: 1, page: 0, size: 20) {
    content {
      id
      nameEn
      basePrice
      salePrice
      categoryName
      imageUrls
    }
    totalElements
  }
}
```

### 5. Get Products by Price Range

**Query:**
```graphql
query ProductsByPriceRange {
  productsByPriceRange(minPrice: 1000, maxPrice: 5000, page: 0, size: 20) {
    content {
      id
      nameEn
      basePrice
      salePrice
      imageUrls
    }
  }
}
```

### 6. Get Featured Products

**Query:**
```graphql
query FeaturedProducts {
  featuredProducts {
    id
    nameEn
    basePrice
    salePrice
    imageUrls
    isFeatured
  }
}
```

### 7. Get New Arrivals

**Query:**
```graphql
query NewArrivals {
  newArrivals(page: 0, size: 10) {
    content {
      id
      nameEn
      basePrice
      imageUrls
      createdAt
    }
  }
}
```

### 8. Get Popular Products

Sorted by view count.

**Query:**
```graphql
query PopularProducts {
  popularProducts(page: 0, size: 10) {
    content {
      id
      nameEn
      basePrice
      viewCount
      imageUrls
    }
  }
}
```

---

## 🛒 Cart Operations

**Note:** All cart operations require authentication.

### 1. Get My Cart

**Query:**
```graphql
query MyCart {
  myCart {
    id
    userId
    items {
      id
      productId
      productName
      productImage
      quantity
      selectedSize
      selectedColor
      price
      subtotal
    }
    totalAmount
    createdAt
    updatedAt
  }
}
```

**Headers:**
```http
Authorization: Bearer <your-access-token>
```

### 2. Add Item to Cart

**Mutation:**
```graphql
mutation AddToCart {
  addToCart(input: {
    productId: 1
    quantity: 2
    selectedSize: "M"
    selectedColor: "Blue"
  }) {
    id
    items {
      id
      productName
      quantity
      selectedSize
      selectedColor
      price
      subtotal
    }
    totalAmount
  }
}
```

### 3. Update Cart Item Quantity

**Mutation:**
```graphql
mutation UpdateCartItem {
  updateCartItem(itemId: 1, input: {
    quantity: 3
  }) {
    id
    items {
      id
      productName
      quantity
      subtotal
    }
    totalAmount
  }
}
```

### 4. Remove Item from Cart

**Mutation:**
```graphql
mutation RemoveFromCart {
  removeFromCart(itemId: 1) {
    id
    items {
      id
      productName
    }
    totalAmount
  }
}
```

### 5. Clear Cart

**Mutation:**
```graphql
mutation ClearCart {
  clearCart
}
```

---

## 📦 Order Operations

**Note:** All order operations require authentication.

### 1. Get My Orders

**Query:**
```graphql
query MyOrders {
  myOrders(page: 0, size: 10) {
    content {
      id
      orderNumber
      status
      paymentMethod
      totalAmount
      shippingAddress
      trackingNumber
      createdAt
      deliveredAt
      items {
        productName
        quantity
        selectedSize
        selectedColor
        price
        subtotal
      }
    }
    totalElements
    totalPages
  }
}
```

**Headers:**
```http
Authorization: Bearer <your-access-token>
```

### 2. Get Single Order

**Query:**
```graphql
query GetOrder {
  order(id: 1) {
    id
    orderNumber
    status
    paymentMethod
    items {
      id
      productName
      productImage
      quantity
      selectedSize
      selectedColor
      price
      subtotal
    }
    subtotal
    shippingCost
    totalAmount
    shippingAddress
    phoneNumber
    notes
    trackingNumber
    paidAt
    deliveredAt
    createdAt
    updatedAt
  }
}
```

### 3. Get Order by Order Number

**Query:**
```graphql
query GetOrderByNumber {
  orderByNumber(orderNumber: "ORD-1234567890-ABC123") {
    id
    orderNumber
    status
    totalAmount
    trackingNumber
  }
}
```

### 4. Create Order from Cart

**Mutation:**
```graphql
mutation CreateOrder {
  createOrder(input: {
    paymentMethod: "CASH_ON_DELIVERY"
    shippingAddress: "123 Rue Didouche Mourad, Algiers 16000, Algeria"
    phoneNumber: "0555123456"
    notes: "Please call before delivery"
  }) {
    id
    orderNumber
    status
    paymentMethod
    items {
      productName
      quantity
      price
      subtotal
    }
    subtotal
    shippingCost
    totalAmount
    shippingAddress
    phoneNumber
  }
}
```

**Payment Methods:**
- `CASH_ON_DELIVERY` - Pay on delivery
- `CIB` - CIB card payment
- `BARIDIMOB` - Baridimob mobile payment

### 5. Cancel Order

**Mutation:**
```graphql
mutation CancelOrder {
  cancelOrder(id: 1) {
    id
    orderNumber
    status
    totalAmount
  }
}
```

---

## 👨‍💼 Admin Operations

**Note:** All admin operations require `ADMIN` or `SUPER_ADMIN` role.

### 1. Get All Orders (Admin)

**Query:**
```graphql
query AllOrders {
  allOrders(page: 0, size: 20) {
    content {
      id
      orderNumber
      userEmail
      status
      paymentMethod
      totalAmount
      createdAt
    }
    totalElements
    totalPages
  }
}
```

**Headers:**
```http
Authorization: Bearer <admin-access-token>
```

### 2. Get Orders by Status (Admin)

**Query:**
```graphql
query OrdersByStatus {
  ordersByStatus(status: "PENDING", page: 0, size: 20) {
    content {
      id
      orderNumber
      userEmail
      status
      totalAmount
      createdAt
    }
  }
}
```

**Order Statuses:**
- `PENDING` - Awaiting confirmation
- `CONFIRMED` - Confirmed by admin
- `PROCESSING` - Being prepared
- `SHIPPED` - In transit
- `DELIVERED` - Delivered to customer
- `CANCELLED` - Cancelled
- `REFUNDED` - Refunded

### 3. Update Order Status (Admin)

**Mutation:**
```graphql
mutation UpdateOrderStatus {
  updateOrderStatus(id: 1, input: {
    status: "SHIPPED"
    trackingNumber: "TRK123456789"
  }) {
    id
    orderNumber
    status
    trackingNumber
    updatedAt
  }
}
```

### 4. Get Low Stock Products (Admin)

**Query:**
```graphql
query LowStockProducts {
  lowStockProducts(threshold: 10) {
    id
    sku
    nameEn
    stockQuantity
    categoryName
  }
}
```

### 5. Create Product (Admin)

**Mutation:**
```graphql
mutation CreateProduct {
  createProduct(input: {
    sku: "SHIRT-COTTON-001"
    nameEn: "Premium Cotton Shirt"
    nameFr: "Chemise en coton premium"
    nameAr: "قميص قطني فاخر"
    descriptionEn: "High quality Egyptian cotton shirt"
    descriptionFr: "Chemise en coton égyptien de haute qualité"
    descriptionAr: "قميص من القطن المصري عالي الجودة"
    basePrice: 2500
    salePrice: 2000
    stockQuantity: 100
    categoryId: 1
    imageUrls: [
      "https://cdn.example.com/shirts/cotton-001-1.jpg",
      "https://cdn.example.com/shirts/cotton-001-2.jpg"
    ]
    availableSizes: ["S", "M", "L", "XL", "XXL"]
    availableColors: ["White", "Black", "Blue", "Navy"]
    isFeatured: true
  }) {
    id
    sku
    nameEn
    basePrice
    salePrice
    stockQuantity
    createdAt
  }
}
```

### 6. Update Product (Admin)

**Mutation:**
```graphql
mutation UpdateProduct {
  updateProduct(id: 1, input: {
    basePrice: 2800
    salePrice: 2300
    stockQuantity: 150
    isFeatured: true
  }) {
    id
    sku
    nameEn
    basePrice
    salePrice
    stockQuantity
    isFeatured
    updatedAt
  }
}
```

### 7. Delete Product (Admin)

Soft delete - sets `isActive = false`.

**Mutation:**
```graphql
mutation DeleteProduct {
  deleteProduct(id: 1)
}
```

---

## ⚠️ Error Handling

### Error Response Format

```json
{
  "errors": [
    {
      "message": "User not found with email: 'nonexistent@example.com'",
      "locations": [{"line": 2, "column": 3}],
      "path": ["login"],
      "extensions": {
        "classification": "DataFetchingException"
      }
    }
  ]
}
```

### Common Error Types

| Error | Description | HTTP Status |
|-------|-------------|-------------|
| `AuthenticationException` | Invalid credentials or token | 401 |
| `ResourceNotFoundException` | Requested resource not found | 404 |
| `AccessDeniedException` | Insufficient permissions | 403 |
| `ValidationException` | Input validation failed | 400 |
| `InternalServerError` | Unexpected server error | 500 |

### Validation Errors

```json
{
  "errors": [
    {
      "message": "Validation Failed",
      "extensions": {
        "validationErrors": {
          "email": "Email must be valid",
          "password": "Password must be at least 8 characters"
        }
      }
    }
  ]
}
```

---

## 🔧 GraphQL Playground Examples

### Using Variables

**Query:**
```graphql
query GetProduct($productId: Long!) {
  product(id: $productId) {
    id
    nameEn
    basePrice
  }
}
```

**Variables:**
```json
{
  "productId": 1
}
```

### Using Fragments

```graphql
fragment ProductBasicInfo on ProductResponse {
  id
  sku
  nameEn
  basePrice
  salePrice
  imageUrls
}

query GetFeaturedProducts {
  featuredProducts {
    ...ProductBasicInfo
    isFeatured
  }
}

query GetProduct($id: Long!) {
  product(id: $id) {
    ...ProductBasicInfo
    descriptionEn
    stockQuantity
  }
}
```

---

## 📱 Client Integration Examples

### JavaScript/TypeScript (Apollo Client)

```typescript
import { ApolloClient, InMemoryCache, createHttpLink, gql } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Create HTTP link
const httpLink = createHttpLink({
  uri: 'http://localhost:8080/graphql',
});

// Add auth header
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('accessToken');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

// Create client
const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});

// Example: Login mutation
const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(input: { email: $email, password: $password }) {
      accessToken
      refreshToken
      userId
      email
      firstName
    }
  }
`;

async function login(email: string, password: string) {
  const { data } = await client.mutate({
    mutation: LOGIN,
    variables: { email, password }
  });

  // Store tokens
  localStorage.setItem('accessToken', data.login.accessToken);
  localStorage.setItem('refreshToken', data.login.refreshToken);

  return data.login;
}
```

### React Native (Expo)

```typescript
import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const httpLink = createHttpLink({
  uri: 'http://10.0.2.2:8080/graphql', // Android emulator
});

const authLink = setContext(async (_, { headers }) => {
  const token = await AsyncStorage.getItem('accessToken');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});
```

---

## 🚀 Best Practices

### 1. Always Use Pagination

```graphql
# Good
query {
  products(page: 0, size: 20) {
    content { ... }
  }
}

# Avoid (can cause performance issues)
query {
  products(page: 0, size: 10000) {
    content { ... }
  }
}
```

### 2. Request Only Needed Fields

```graphql
# Good - Only request what you need
query {
  products(page: 0, size: 10) {
    content {
      id
      nameEn
      basePrice
    }
  }
}

# Avoid - Don't fetch unnecessary data
query {
  products(page: 0, size: 10) {
    content {
      id
      sku
      nameEn
      nameFr
      nameAr
      descriptionEn
      descriptionFr
      descriptionAr
      # ... all fields even if not needed
    }
  }
}
```

### 3. Handle Token Expiration

```typescript
async function fetchWithTokenRefresh(query: DocumentNode) {
  try {
    return await client.query({ query });
  } catch (error) {
    if (error.message.includes('Expired')) {
      // Refresh token
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const { data } = await client.mutate({
        mutation: REFRESH_TOKEN,
        variables: { refreshToken }
      });

      // Store new tokens
      await AsyncStorage.setItem('accessToken', data.refreshToken.accessToken);

      // Retry original query
      return await client.query({ query });
    }
    throw error;
  }
}
```

---

## 📊 GraphQL Schema Introspection

Access the full schema documentation:

1. **GraphQL Playground**: http://localhost:8080/playground
2. **Voyager (Visual Schema)**: http://localhost:8080/voyager

---

**Last Updated:** November 2025
**API Version:** 1.0.0
**Backend Status:** Production Ready
