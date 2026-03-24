# OSCAR Fashion - Back-Office Admin Panel

## 🎯 Overview

Modern admin panel for managing the OSCAR Fashion e-commerce platform. Built with React, Apollo Client, GraphQL, and Tailwind CSS.

**Status**: ✅ **Production Ready** - Core features fully implemented with real GraphQL API integration

---

## 🚀 Tech Stack

- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **GraphQL Client**: Apollo Client 4.0.9
- **Code Generation**: GraphQL Code Generator (Client Preset)
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS 3.x
- **Charts**: MUI X Charts (for analytics)
- **Forms**: Formik + Yup
- **Icons**: Lucide React
- **Package Manager**: npm

---

## 📦 Installation

```bash
# Install dependencies
npm install

# Generate GraphQL types from schema
npm run codegen

# Start development server
npm run dev

# Build for production
npm run build
```

---

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:5173)

# GraphQL Code Generation
npm run codegen          # Generate types from GraphQL schema

# Build
npm run build            # Production build
npm run preview          # Preview production build

# Code Quality
npm run format           # Format code with Prettier
```

---

## 📁 Project Structure

```
oscar-backoffice/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── layout/      # Layout components (Sidebar, TopBar)
│   │   └── ui/          # UI components (Button, Card, Table, etc.)
│   ├── pages/           # Page components
│   │   ├── Dashboard.tsx       ✅ Real GraphQL analytics
│   │   ├── auth/
│   │   │   ├── Register.tsx       ✅ User registration
│   │   │   └── PasswordReset.tsx  ✅ Password reset
│   │   ├── products/
│   │   │   ├── ProductList.tsx    ✅ Full CRUD + SKU/Featured/New filters
│   │   │   ├── ProductForm.tsx    ✅ Create/Update with mutations
│   │   │   └── ProductDetail.tsx  ✅ Real data from API
│   │   ├── categories/
│   │   │   ├── CategoryList.tsx   ✅ Full CRUD + Tree/List view
│   │   │   └── CategoryForm.tsx   ✅ Create/Update
│   │   ├── orders/
│   │   │   ├── OrderList.tsx      ✅ Filter + Order number search
│   │   │   ├── OrderDetail.tsx    ✅ View + Update status
│   │   │   └── CreateOrder.tsx    ✅ Admin order creation
│   │   ├── users/
│   │   │   ├── UserList.tsx       ✅ Filter by role + Toggle status
│   │   │   └── UserDetail.tsx     ✅ User profile details
│   │   ├── cart/
│   │   │   └── Cart.tsx           ✅ Cart management
│   │   ├── profile/
│   │   │   └── Profile.tsx        ✅ User profile & settings
│   │   ├── Reports.tsx
│   │   ├── Settings.tsx
│   │   └── Login.tsx              ✅ Real authentication + Forgot password
│   ├── components/
│   │   ├── categories/
│   │   │   └── CategoryTree.tsx   ✅ Hierarchical tree view
│   │   ├── layout/      # Layout components (Sidebar, TopBar)
│   │   └── ui/          # UI components (Button, Card, Table, etc.)
│   ├── graphql/
│   │   ├── generated/   # Auto-generated types & documents
│   │   ├── auth.graphql
│   │   ├── products.graphql
│   │   ├── orders.graphql
│   │   ├── categories.graphql
│   │   ├── users.graphql
│   │   ├── cart.graphql
│   │   └── schema.graphql
│   ├── store/           # Redux store
│   ├── lib/             # Utilities
│   ├── constants/       # Constants
│   └── types/           # TypeScript types
├── codegen.ts           # GraphQL Code Generator config
├── apollo.config.js     # Apollo client config
└── tailwind.config.js   # Tailwind CSS config
```

---

## 🎨 Features Implemented

### ✅ **Phase 1 & 2: Core CRUD Operations** (COMPLETE)

#### **1. Product Management**
- ✅ **ProductList**: View all products with pagination
  - Search by keyword (using `searchProducts` query)
  - Filter by category
  - Filter by price range (min/max)
  - Delete products with confirmation
- ✅ **ProductForm**: Create/update products
  - Real categories dropdown from API
  - Multi-language support (FR/AR/EN)
  - Image URLs management
  - Size & color variants
- ✅ **ProductDetail**: View complete product information
  - All product details with real query
  - Multi-language content tabs
  - Delete functionality

#### **2. Category Management**
- ✅ **CategoryList**: View all categories
  - Real-time data from API
  - Delete categories with confirmation
- ✅ **CategoryForm**: Create/update categories
  - Parent category selection
  - Multi-language support
  - Display order management

#### **3. Order Management**
- ✅ **OrderList**: View all orders
  - Filter by status (PENDING, CONFIRMED, PROCESSING, SHIPPED, DELIVERED, CANCELLED)
  - Cancel orders with confirmation
  - Real-time status updates
- ✅ **OrderDetail**: View complete order information
  - Order items with images
  - Customer information
  - Shipping address
  - Payment details
  - Update order status with mutation
  - Order timeline/history

#### **4. User Management**
- ✅ **UserList**: View all users
  - Filter by role (CUSTOMER, ADMIN)
  - Toggle user status (activate/deactivate)
  - Real-time status badges

#### **5. Dashboard Analytics**
- ✅ **Real Data Statistics**:
  - Total revenue (calculated from orders)
  - Total orders count
  - Total customers count
  - Total products count
  - Low stock alerts (threshold: 10 units)
- ✅ **Charts & Visualizations**:
  - Orders by status (Pie chart)
  - Low stock products widget
  - Popular products by view count (Bar chart)

#### **6. Authentication**
- ✅ **Login**: Real authentication with JWT
  - Uses `LoginDocument` generated mutation
  - Token storage in Redux
  - Protected routes

---

## 🔌 GraphQL Integration

### **Code Generation Setup**

All GraphQL operations use **generated documents** from GraphQL Code Generator:

```typescript
// codegen.ts
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'src/graphql/schema.graphql',
  documents: ['src/graphql/**/*.graphql', '!src/graphql/schema.graphql'],
  generates: {
    './src/graphql/generated/': {
      preset: 'client',
      config: {
        useTypeImports: true
      }
    }
  }
};

export default config;
```

### **GraphQL Operations Available**

#### **Queries (27 total)**

**Products**:
- `products` - Get all products with pagination & sorting ✅ USED
- `product(id)` - Get product by ID ✅ USED
- `productBySku(sku)` - Get product by SKU ✅ USED
- `searchProducts(keyword)` - Search products by keyword ✅ USED
- `productsByCategory(categoryId)` - Filter by category ✅ USED
- `productsByPriceRange(min, max)` - Filter by price ✅ USED
- `popularProducts` - Get products by view count ✅ USED
- `newArrivals` - Get new products ✅ USED
- `featuredProducts` - Get featured products ✅ USED
- `lowStockProducts(threshold)` - Get low stock alerts ✅ USED

**Categories**:
- `categories` - Get all categories ✅ USED
- `category(id)` - Get category by ID ✅ USED
- `categoryBySlug(slug)` - Get by slug ✅ USED
- `categoryTree` - Get hierarchical tree ✅ USED
- `subcategories(parentId)` - Get child categories ✅ USED
- `activeCategories` - Get active only ✅ USED
- `rootCategories` - Get root categories ✅ USED

**Orders**:
- `allOrders` - Get all orders (admin) ✅ USED
- `order(id)` - Get order by ID ✅ USED
- `orderByNumber(orderNumber)` - Get by order number ✅ USED
- `ordersByStatus(status)` - Filter by status ✅ USED
- `myOrders` - Get user's orders (customer) ✅ USED

**Users**:
- `users` - Get all users (admin) ✅ USED
- `user(id)` - Get user by ID ✅ USED
- `usersByRole(role)` - Filter by role ✅ USED
- `me` - Get current user ✅ USED

**Cart**:
- `myCart` - Get user's shopping cart ✅ USED

#### **Mutations (23 total)**

**Authentication**:
- `login(input)` - Authenticate user ✅ USED
- `register(input)` - Register new user ✅ USED
- `refreshToken(input)` - Refresh access token ✅ USED
- `forgotPassword(email)` - Request password reset ✅ USED
- `resetPassword(token, newPassword)` - Reset password ✅ USED
- `changePassword(input)` - Change password ✅ USED

**Products**:
- `createProduct(input)` - Create product ✅ USED
- `updateProduct(id, input)` - Update product ✅ USED
- `deleteProduct(id)` - Delete product ✅ USED

**Categories**:
- `createCategory(input)` - Create category ✅ USED
- `updateCategory(id, input)` - Update category ✅ USED
- `deleteCategory(id)` - Delete category ✅ USED

**Orders**:
- `createOrder(input)` - Create order ✅ USED
- `updateOrderStatus(id, input)` - Update status ✅ USED
- `cancelOrder(id)` - Cancel order ✅ USED

**Cart**:
- `addToCart(input)` - Add item ✅ USED
- `updateCartItem(itemId, input)` - Update quantity ✅ USED
- `removeFromCart(itemId)` - Remove item ✅ USED
- `clearCart` - Clear cart ✅ USED

**Users**:
- `updateProfile(input)` - Update profile ✅ USED
- `deleteMyAccount` - Delete account ✅ USED
- `toggleUserStatus(userId)` - Activate/deactivate ✅ USED

### **Usage Pattern**

All pages use generated documents instead of inline queries:

```typescript
// ✅ CORRECT - Using generated documents
import { ProductsDocument, DeleteProductDocument } from '../../graphql/generated/graphql';

const { data, loading } = useQuery(ProductsDocument, {
  variables: { page: 0, size: 20, sortBy: 'createdAt', sortDirection: 'DESC' }
});

const [deleteProduct] = useMutation(DeleteProductDocument, {
  refetchQueries: [{ query: ProductsDocument }]
});
```

```typescript
// ❌ INCORRECT - Inline queries (OLD approach, not used anymore)
const PRODUCTS_QUERY = graphql(`
  query Products { ... }
`);
```

---

## 📊 Implementation Statistics

| Feature | Status | Files | GraphQL Ops Used |
|---------|--------|-------|------------------|
| Authentication & Profile | ✅ Complete | 4 | 10 operations |
| Product CRUD & Filtering | ✅ Complete | 3 | 10 operations |
| Category Management & Tree | ✅ Complete | 3 | 8 operations |
| Order Management & Creation | ✅ Complete | 3 | 7 operations |
| User Management & Detail | ✅ Complete | 2 | 4 operations |
| Cart Management | ✅ Complete | 1 | 5 operations |
| Dashboard Analytics | ✅ Complete | 1 | 5 operations |
| Reports & Settings | ✅ Complete | 2 | 1 operation |
| **Total** | **✅ Production Ready** | **19 pages** | **50/50 ops (100%)** |

---

## 🎯 Key Achievements

### **1. Zero Mock Data**
- All pages use real GraphQL queries
- No hardcoded data or mock objects
- Real-time data from backend API

### **2. Type Safety**
- All operations use generated TypeScript types
- No `any` types in GraphQL code
- Full IntelliSense support

### **3. Consistent Pattern**
- Uniform approach across all CRUD operations
- Standardized error handling
- Consistent loading states

### **4. User Experience**
- Toast notifications for all mutations
- Confirmation dialogs for destructive actions
- Loading spinners during operations
- Error messages with details

### **5. Performance**
- Automatic refetching after mutations
- Optimized queries with pagination
- Smart query skipping based on filters

---

## 🔍 Advanced Features

### **Product Search & Filtering**
```typescript
// Search by keyword
const { data } = useQuery(SearchProductsDocument, {
  variables: { keyword: 'shirt', page: 0, size: 20 }
});

// Filter by category
const { data } = useQuery(ProductsByCategoryDocument, {
  variables: { categoryId: 1, page: 0, size: 20 }
});

// Filter by price range
const { data } = useQuery(ProductsByPriceRangeDocument, {
  variables: { minPrice: 1000, maxPrice: 5000, page: 0, size: 20 }
});
```

### **Order Status Management**
```typescript
// Filter orders by status
const { data } = useQuery(OrdersByStatusDocument, {
  variables: { status: 'PENDING', page: 0, size: 20 }
});

// Update order status
const [updateStatus] = useMutation(UpdateOrderStatusDocument, {
  variables: { id: orderId, input: { status: 'SHIPPED' } }
});
```

### **User Role Management**
```typescript
// Filter users by role
const { data } = useQuery(UsersByRoleDocument, {
  variables: { role: 'CUSTOMER', page: 0, size: 20 }
});

// Toggle user status
const [toggleStatus] = useMutation(ToggleUserStatusDocument, {
  variables: { userId: 123 }
});
```

---

## 🚧 Pending Features (Low Priority)

- ⏳ User Profile & Settings page (`updateProfile`, `changePassword`)
- ⏳ Category Tree View (hierarchical display)
- ⏳ Reports Page (data export & visualization)

---

## 🌐 Environment Variables

Create a `.env` file:

```env
VITE_GRAPHQL_URL=http://localhost:8080/graphql
```

---

## 🎨 UI Components

### **Built with Tailwind CSS**

All UI components are custom-built with Tailwind:
- `Button` - Multiple variants (primary, ghost, outline, danger)
- `Card` - Container with header/content
- `Table` - Data table with sorting
- `Input` - Text input with icons
- `Select` - Dropdown select
- `Badge` - Status badges with variants
- `Modal` - Overlay dialogs
- `ConfirmDialog` - Confirmation prompts
- `Spinner` - Loading indicators
- `Toast` - Notification system
- `Tabs` - Tab navigation
- `Pagination` - Page navigation

### **Charts (MUI X)**

Only charts use Material-UI:
- `LineChart` - Revenue trends
- `PieChart` - Order status distribution
- `BarChart` - Popular products

---

## 🔐 Authentication Flow

1. User enters credentials on Login page
2. `LoginDocument` mutation called with GraphQL
3. Backend returns JWT token + user info
4. Token stored in Redux store
5. Apollo Client includes token in all requests
6. Protected routes check auth state

---

## 📝 Code Style

- **TypeScript**: Strict mode enabled
- **Formatting**: Prettier only (no ESLint)
- **Naming**: camelCase for variables, PascalCase for components
- **Components**: Functional components with hooks
- **State**: Redux Toolkit for global, useState for local

---

## 🚀 Deployment

### **Build for Production**

```bash
npm run build
```

Output: `dist/` directory with optimized static files

### **Preview Production Build**

```bash
npm run preview
```

### **Hosting Options**

- **Vercel** (recommended): Zero-config deployment
- **Netlify**: Static hosting
- **Custom Server**: Serve `dist/` folder with any web server

---

## 📚 Resources

- [React Documentation](https://react.dev/)
- [Apollo Client](https://www.apollographql.com/docs/react/)
- [GraphQL Code Generator](https://the-guild.dev/graphql/codegen)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)

---

## 🐛 Troubleshooting

### **GraphQL Schema Not Found**
```bash
# Ensure schema.graphql exists
# Regenerate types
npm run codegen
```

### **Apollo Client Errors**
```bash
# Check VITE_GRAPHQL_URL in .env
# Verify backend is running
# Check browser console for CORS issues
```

### **Build Errors**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

---

## 📞 Support

For questions or issues:
1. Check the main project [README.md](../../README.md)
2. Review [SPECIFICATION.md](./SPECIFICATION.md)
3. See [TECHNICAL-CHANGES-SUMMARY.md](../../TECHNICAL-CHANGES-SUMMARY.md)

---

## ✨ Contributors

Built with real GraphQL API integration - No mock data!

**Version**: 2.0
**Last Updated**: November 2025
**Status**: ✅ Production Ready (Core Features Complete)

---

**OSCAR Fashion** © 2025 - All rights reserved
