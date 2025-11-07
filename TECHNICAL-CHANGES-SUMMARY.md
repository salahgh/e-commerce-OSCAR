# Technical Stack Changes Summary
## OSCAR Fashion E-commerce Platform - Version 2.0

---

## 📋 Overview of Changes

This document summarizes the major technical stack changes applied to all components based on the updated requirements.

---

## 🔧 Backend Changes

### Previous Stack → New Stack

| Component | Before | After |
|-----------|--------|-------|
| **API Type** | REST | **GraphQL** |
| **GraphQL Library** | - | **SPQR (GraphQL SPQR)** |
| **PDF Generation** | Jasper Reports | **iText 7** |
| **Cache** | Redis | **Removed** (DataLoader only) |
| **Documentation** | Swagger/OpenAPI | **GraphQL Playground + Voyager** |

### Key Implementation Details

**GraphQL with SPQR**:
- Code-first approach using Java annotations
- Automatic schema generation from resolvers
- GraphQL Playground for interactive testing
- GraphQL Voyager for schema visualization
- Built-in introspection for documentation

**iText for PDF**:
```java
@Service
public class PdfReportService {
    public byte[] generateInvoicePdf(Order order) {
        // Use iText 7 for PDF generation
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf, PageSize.A4);
        // ... generate PDF content
    }
}
```

**Dependencies Changed**:
- Added: `graphql-spqr-spring-boot-starter`
- Added: `itext7-core`
- Removed: `jasperreports`
- Removed: `spring-data-redis`

---

## 🌐 Frontend Web Changes

### Previous Stack → New Stack

| Component | Before | After |
|-----------|--------|-------|
| **Framework** | React.js (CRA) | **Next.js 14+ (App Router)** |
| **Build Tool** | Webpack (via CRA) | **Vite** |
| **Data Fetching** | REST API + React Query | **GraphQL + Apollo Client** |
| **UI Library** | Material-UI (MUI) | **Tailwind CSS** |
| **Forms** | React Hook Form | **Formik + Yup** |
| **Dates** | Day.js | **date-fns** |
| **i18n** | react-i18next | **next-intl** |
| **Icons** | Material Icons | **Lucide Icons / Heroicons** |
| **Testing** | Jest, Cypress | **Removed** (for now) |
| **CI/CD** | GitHub Actions | **Removed** (local dev) |
| **Linting** | ESLint | **Prettier only** |
| **Git Hooks** | Husky | **Removed** |
| **Storybook** | Yes | **Removed** |

### Architecture Changes

**Next.js App Router**:
```
src/app/
├── (shop)/          # Route group
│   ├── page.tsx     # Homepage
│   ├── products/
│   └── cart/
├── (auth)/          # Auth route group
│   ├── login/
│   └── register/
└── layout.tsx       # Root layout
```

**GraphQL Code Generation**:
```typescript
// codegen.ts
const config: CodegenConfig = {
  schema: 'http://localhost:8080/graphql',
  documents: ['src/graphql/**/*.{ts,tsx}'],
  generates: {
    './src/graphql/generated/': {
      preset: 'client',
    },
  },
};
```

**Tailwind CSS**:
```typescript
// Replaces all MUI components with Tailwind utilities
<button className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark">
  Ajouter au panier
</button>
```

---

## 🖥️ Back-Office Changes

### Previous Stack → New Stack

| Component | Before | After |
|-----------|--------|-------|
| **Framework** | React.js | **React.js** (unchanged) |
| **Data Fetching** | REST API + React Query | **GraphQL + Apollo Client** |
| **UI Library** | Material-UI (MUI) | **Tailwind CSS** (except MUI X Charts) |
| **State Management** | Redux Toolkit / Zustand | **Redux Toolkit** (confirmed) |
| **Forms** | React Hook Form | **Formik + Yup** |
| **Charts** | MUI X Charts | **MUI X Charts** (kept) |
| **Data Grid** | MUI DataGrid | **Custom with Tailwind** (or keep MUI DataGrid) |
| **Testing** | Jest + RTL | **Removed** (for now) |

### Key Points

- **Apollo Client** for GraphQL queries/mutations
- **Redux** for state management (products, orders, filters)
- **Tailwind CSS** for all UI except charts
- **MUI X Charts** retained for dashboard analytics
- **Formik + Yup** for all forms
- **GraphQL Code Generation** for type safety

**Example**:
```typescript
// Apollo Client setup
import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:8080/graphql',
  cache: new InMemoryCache(),
});

// Usage in component
import { useQuery } from '@apollo/client';
import { GET_PRODUCTS } from './graphql/queries';

function ProductList() {
  const { data, loading } = useQuery(GET_PRODUCTS);
  // ...
}
```

---

## 📱 Mobile Application Changes

### Previous Stack → New Stack

| Component | Before | After |
|-----------|--------|-------|
| **Framework** | React Native CLI | **Expo** |
| **Data Fetching** | REST API + React Query | **GraphQL + Apollo Client** |
| **Push Notifications** | Firebase Cloud Messaging | **Removed** (for now) |
| **Offline Mode** | AsyncStorage + cache | **Removed** |
| **Forms** | React Hook Form | **Formik + Yup** (implicit) |
| **Testing** | Jest + Detox | **Removed** (for now) |

### Key Changes

**Expo Setup**:
```bash
npx create-expo-app@latest oscar-mobile
```

**GraphQL Integration**:
```typescript
// Using Apollo Client with Expo
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client';

const client = new ApolloClient({
  uri: 'http://localhost:8080/graphql',
  cache: new InMemoryCache(),
});

export default function App() {
  return (
    <ApolloProvider client={client}>
      <Navigation />
    </ApolloProvider>
  );
}
```

**Code Generation**:
- Same GraphQL Code Generator setup as frontend
- Auto-generate TypeScript types from backend schema

**Removed Features**:
- No offline mode (no AsyncStorage caching)
- No Firebase (no push notifications for now)
- Simplified architecture focused on core e-commerce features

---

## 📦 Updated Dependencies

### Backend (Maven)
```xml
<!-- Added -->
<dependency>
    <groupId>io.leangen.graphql</groupId>
    <artifactId>graphql-spqr-spring-boot-starter</artifactId>
    <version>0.0.6</version>
</dependency>
<dependency>
    <groupId>com.itextpdf</groupId>
    <artifactId>itext7-core</artifactId>
    <version>7.2.5</version>
    <type>pom</type>
</dependency>

<!-- Removed -->
<!-- jasperreports -->
<!-- spring-data-redis -->
```

### Frontend Web (npm)
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "@apollo/client": "^3.8.0",
    "graphql": "^16.8.0",
    "tailwindcss": "^3.3.0",
    "formik": "^2.4.0",
    "yup": "^1.3.0",
    "date-fns": "^2.30.0",
    "next-intl": "^3.0.0",
    "lucide-react": "^0.292.0"
  },
  "devDependencies": {
    "@graphql-codegen/cli": "^5.0.0",
    "prettier": "^3.0.0"
  }
}
```

### Back-Office (npm)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "@apollo/client": "^3.8.0",
    "graphql": "^16.8.0",
    "@reduxjs/toolkit": "^1.9.0",
    "tailwindcss": "^3.3.0",
    "@mui/x-charts": "^6.0.0",
    "formik": "^2.4.0",
    "yup": "^1.3.0"
  }
}
```

### Mobile (npm - Expo)
```json
{
  "dependencies": {
    "expo": "~49.0.0",
    "react-native": "0.72.0",
    "@apollo/client": "^3.8.0",
    "graphql": "^16.8.0",
    "@react-navigation/native": "^6.0.0",
    "formik": "^2.4.0",
    "yup": "^1.3.0"
  }
}
```

---

## 🔄 GraphQL Schema Integration

All frontend components (Frontend, Back-office, Mobile) will share the same GraphQL schema from the backend:

**Code Generation Workflow**:
1. Backend exposes GraphQL schema at `/graphql`
2. Run `npm run codegen` in each frontend project
3. Auto-generated TypeScript types in `src/graphql/generated/`
4. Import and use typed queries/mutations

**Example Query** (shared across all frontends):
```graphql
query GetProducts($page: Int!, $size: Int!) {
  products(page: $page, size: $size) {
    edges {
      node {
        id
        name { fr ar en }
        basePrice
        salePrice
        images { url }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

**Generated TypeScript**:
```typescript
export type GetProductsQuery = {
  __typename?: 'Query';
  products: {
    __typename?: 'ProductConnection';
    edges: Array<{
      __typename?: 'ProductEdge';
      node: {
        __typename?: 'Product';
        id: string;
        name: LocalizedString;
        basePrice: number;
        salePrice?: number;
        // ...
      };
    }>;
  };
};
```

---

## ⚠️ Removed Features (For Now)

Based on requirements, the following are **not included** in initial development:

### All Components
- ❌ Unit/Integration/E2E Testing
- ❌ ESLint (Prettier only)
- ❌ Git Hooks (Husky)
- ❌ CI/CD pipelines (local development only)

### Frontend Web
- ❌ Storybook
- ❌ React Query (replaced by GraphQL)
- ❌ Material-UI (replaced by Tailwind)

### Backend
- ❌ Redis cache (using DataLoader for query-level caching only)
- ❌ Jasper Reports (replaced by iText)

### Mobile
- ❌ Firebase Cloud Messaging (push notifications)
- ❌ Offline mode
- ❌ React Native CLI (using Expo)

---

## 📊 Impact on Timeline & Budget

### Timeline Adjustments

| Component | Original | Adjusted | Change |
|-----------|----------|----------|--------|
| Backend | 16 weeks | **14 weeks** | -2 weeks (simpler PDF, no Redis) |
| Frontend | 12 weeks | **14 weeks** | +2 weeks (Next.js learning curve) |
| Back-Office | 8 weeks | **8 weeks** | No change |
| Mobile | 10 weeks | **9 weeks** | -1 week (Expo simplification) |
| **Total** | **26 weeks** | **26 weeks** | **Balanced** |

### Budget Adjustments

**Cost Changes**:
- **Backend**: Slight decrease (no Jasper Reports license, no Redis)
- **Frontend**: Slight increase (Next.js expertise)
- **Back-Office**: No significant change
- **Mobile**: Slight decrease (Expo, no Firebase)

**Net Impact**: Approximately neutral (adjustments balance out)

---

## ✅ Benefits of New Stack

### Performance
- **Next.js SSR/SSG**: Better initial load times, SEO
- **GraphQL**: Single endpoint, efficient data fetching
- **Tailwind CSS**: Smaller bundle size vs MUI
- **Expo**: Faster development, easier deployment

### Developer Experience
- **TypeScript + Code Generation**: Full type safety across stack
- **GraphQL**: Strongly typed API contract
- **Formik + Yup**: Consistent form handling
- **Prettier**: Automated code formatting

### Maintainability
- **Shared GraphQL Schema**: Single source of truth
- **Code Generation**: Reduces manual type definitions
- **Modern Stack**: Better long-term support

---

## 📝 Migration Notes

### For Development Team

1. **Backend Team**:
   - Learn GraphQL SPQR annotations
   - Study iText 7 PDF generation
   - Remove Redis configurations

2. **Frontend Team**:
   - Learn Next.js App Router paradigm
   - Master Tailwind CSS utilities
   - Understand Apollo Client with SSR

3. **Mobile Team**:
   - Transition from CLI to Expo workflow
   - Remove Firebase dependencies
   - Simplify offline handling

4. **All Teams**:
   - Run `npm run codegen` after backend schema changes
   - Use generated types for all GraphQL operations
   - Follow Prettier formatting (no ESLint rules)

---

**Version**: 2.0
**Date**: Novembre 2025
**Status**: Technical Changes Summary
**Next Steps**: Update all specification documents, calendars, and budgets accordingly
