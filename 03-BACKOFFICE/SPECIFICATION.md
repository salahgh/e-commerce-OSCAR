# Back-Office (Admin Panel) - Spécifications Détaillées
## OSCAR Fashion E-commerce Platform

---

## 1. Vue d'ensemble

Le back-office est l'interface d'administration développée en **React.js** avec **Tailwind CSS** et **GraphQL**, permettant de gérer l'ensemble de la plateforme e-commerce OSCAR Fashion. Il offre aux administrateurs les outils nécessaires pour gérer les produits, commandes, clients, statistiques et configurations.

### Objectifs Principaux
- Fournir une interface d'administration complète et intuitive
- Centraliser la gestion via GraphQL API
- Offrir des tableaux de bord avec **MUI X Charts**
- Permettre la génération de rapports et documents (PDF via backend)
- Gérer les utilisateurs et les permissions
- Design moderne avec **Tailwind CSS**

---

## 2. Stack Technique

### Core Framework
- **Bibliothèque**: React.js 18+
- **Build Tool**: Vite
- **Langage**: TypeScript
- **Package Manager**: npm

### GraphQL & Data Management
- **GraphQL Client**: **Apollo Client**
- **Code Generation**: GraphQL Code Generator (@graphql-codegen)
- **Schema**: Auto-generated types from backend
- **Cache**: Apollo InMemory Cache

### UI & Styling
- **CSS Framework**: **Tailwind CSS 3.x**
- **Charts**: **MUI X Charts** (only for analytics/dashboard)
- **Icons**: Heroicons, Lucide Icons, ou React Icons
- **Animations**: Framer Motion (optional)
- **Utility**: clsx, tailwind-merge

### State Management
- **Global State**: **Redux Toolkit**
- **Server State**: Apollo Client cache
- **Forms State**: Formik

### Forms & Validation
- **Forms**: **Formik**
- **Validation**: **Yup**

### Dates
- **Library**: date-fns

### Data Tables
- **Option 1**: Custom table with Tailwind (recommended)
- **Option 2**: Keep MUI DataGrid (if needed for complex features)

### Code Quality
- **Formatter**: **Prettier** (no ESLint)
- **Type Checking**: TypeScript strict mode

### Développement
- **Hot Reload**: Vite HMR
- **Environment**: .env.local, .env.production

**Note**: Pas de testing, CI/CD, git hooks pour le moment

---

## 3. Architecture Back-Office

### Structure du Projet

```
oscar-backoffice/
├── public/
│   └── images/
├── src/
│   ├── components/
│   │   ├── ui/              # UI components (Tailwind)
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Table.tsx
│   │   │   └── Modal.tsx
│   │   ├── layout/          # Layout components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── TopBar.tsx
│   │   │   └── MainLayout.tsx
│   │   ├── charts/          # MUI X Charts wrappers
│   │   │   ├── LineChart.tsx
│   │   │   ├── BarChart.tsx
│   │   │   └── PieChart.tsx
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── orders/
│   │   └── customers/
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Products/
│   │   │   ├── ProductList.tsx
│   │   │   ├── ProductForm.tsx
│   │   │   └── ProductDetail.tsx
│   │   ├── Orders/
│   │   ├── Customers/
│   │   ├── Reports/
│   │   ├── Settings/
│   │   └── Login.tsx
│   ├── graphql/
│   │   ├── queries/         # GraphQL queries
│   │   ├── mutations/       # GraphQL mutations
│   │   ├── fragments/       # GraphQL fragments
│   │   └── generated/       # Auto-generated types
│   ├── store/               # Redux store
│   │   ├── slices/
│   │   │   ├── authSlice.ts
│   │   │   ├── productsSlice.ts
│   │   │   └── ordersSlice.ts
│   │   └── store.ts
│   ├── lib/
│   │   ├── apollo-client.ts
│   │   ├── utils.ts
│   │   └── validators.ts    # Yup schemas
│   ├── hooks/
│   ├── types/
│   ├── constants/
│   ├── styles/
│   │   └── index.css        # Tailwind imports
│   ├── App.tsx
│   └── main.tsx
├── .env.local
├── .env.production
├── codegen.ts               # GraphQL Code Generator config
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .prettierrc
```

---

## 4. GraphQL Integration

### Configuration Apollo Client

**lib/apollo-client.ts**:
```typescript
import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

const httpLink = new HttpLink({
  uri: import.meta.env.VITE_GRAPHQL_URL || 'http://localhost:8080/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('admin_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(`[GraphQL error]: Message: ${message}, Path: ${path}`);
    });
  }
  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});
```

### GraphQL Code Generator

**codegen.ts**:
```typescript
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://localhost:8080/graphql',
  documents: ['src/graphql/**/*.ts'],
  generates: {
    './src/graphql/generated/': {
      preset: 'client',
      plugins: [],
      presetConfig: {
        gqlTagName: 'gql',
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
```

**package.json scripts**:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "codegen": "graphql-codegen --config codegen.ts",
    "codegen:watch": "graphql-codegen --config codegen.ts --watch",
    "format": "prettier --write \"src/**/*.{ts,tsx}\""
  }
}
```

### Exemple Queries GraphQL

**graphql/queries/products.ts**:
```typescript
import { gql } from '@apollo/client';

export const GET_PRODUCTS = gql`
  query GetProducts($page: Int!, $size: Int!, $filter: ProductFilter) {
    products(page: $page, size: $size, filter: $filter) {
      edges {
        node {
          id
          sku
          name {
            fr
            ar
            en
          }
          slug
          category {
            id
            name { fr }
          }
          basePrice
          salePrice
          stockQuantity
          status
          images {
            id
            url
          }
          createdAt
          updatedAt
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        endCursor
      }
      totalCount
    }
  }
`;

export const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      sku
      name { fr ar en }
      description { fr ar en }
      slug
      category { id name { fr } }
      basePrice
      salePrice
      stockQuantity
      status
      images { id url order isMain }
      attributes { id name values }
      createdAt
      updatedAt
    }
  }
`;
```

**graphql/mutations/products.ts**:
```typescript
import { gql } from '@apollo/client';

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input) {
      id
      sku
      name { fr ar en }
      slug
      basePrice
      status
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $input: ProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      sku
      name { fr ar en }
      updatedAt
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;
```

---

## 5. Redux Toolkit Configuration

### Store Setup

**store/store.ts**:
```typescript
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productsReducer from './slices/productsSlice';
import ordersReducer from './slices/ordersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productsReducer,
    orders: ordersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

**store/slices/authSlice.ts**:
```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'SUPER_ADMIN';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('admin_token'),
  isAuthenticated: !!localStorage.getItem('admin_token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('admin_token', action.payload.token);
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('admin_token');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
```

---

## 6. Tailwind CSS Setup

### Configuration

**tailwind.config.ts**:
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2C3E50',
          light: '#3F5568',
          dark: '#1F2D3D',
        },
        secondary: {
          DEFAULT: '#E8D5C4',
          light: '#F0E4D7',
          dark: '#D4C3B0',
        },
        accent: {
          DEFAULT: '#C9A992',
          light: '#D9BCA9',
          dark: '#B8957D',
        },
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};

export default config;
```

**src/styles/index.css**:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .btn {
    @apply px-4 py-2 rounded-lg font-medium transition-colors;
  }

  .btn-primary {
    @apply bg-primary text-white hover:bg-primary-dark;
  }

  .btn-secondary {
    @apply bg-gray-200 text-gray-800 hover:bg-gray-300;
  }

  .btn-danger {
    @apply bg-red-600 text-white hover:bg-red-700;
  }

  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }

  .input {
    @apply w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary;
  }

  .table {
    @apply min-w-full divide-y divide-gray-200;
  }

  .table-header {
    @apply bg-gray-50;
  }

  .table-cell {
    @apply px-6 py-4 whitespace-nowrap text-sm;
  }
}
```

### UI Components avec Tailwind

**components/ui/Button.tsx**:
```typescript
import { ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'btn',
        {
          'btn-primary': variant === 'primary',
          'btn-secondary': variant === 'secondary',
          'btn-danger': variant === 'danger',
          'border-2 border-primary text-primary hover:bg-primary hover:text-white':
            variant === 'outline',
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
          'opacity-50 cursor-not-allowed': disabled || loading,
        },
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          Chargement...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
```

**components/ui/Table.tsx**:
```typescript
import { ReactNode } from 'react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
}

export default function Table<T extends { id: string }>({
  columns,
  data,
  loading,
  emptyMessage = 'Aucune donnée disponible',
}: TableProps<T>) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">{emptyMessage}</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead className="table-header">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              {columns.map((column) => (
                <td key={column.key} className="table-cell">
                  {column.render
                    ? column.render(item)
                    : (item[column.key as keyof T] as ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 7. Pages & Fonctionnalités

### 7.1 Login (Authentification Admin)

**pages/Login.tsx**:
```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch } from '../hooks/redux';
import { setCredentials } from '../store/slices/authSlice';
import { LOGIN_MUTATION } from '../graphql/mutations/auth';
import Button from '../components/ui/Button';

const loginSchema = Yup.object({
  email: Yup.string().email('Email invalide').required('Email requis'),
  password: Yup.string().required('Mot de passe requis'),
});

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [login, { loading, error }] = useMutation(LOGIN_MUTATION);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          OSCAR Fashion Admin
        </h1>
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={loginSchema}
          onSubmit={async (values) => {
            const { data } = await login({ variables: { input: values } });
            dispatch(setCredentials({
              user: data.login.user,
              token: data.login.token,
            }));
            navigate('/dashboard');
          }}
        >
          <Form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Field name="email" type="email" className="input" />
              <ErrorMessage
                name="email"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <Field name="password" type="password" className="input" />
              <ErrorMessage
                name="password"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm">{error.message}</div>
            )}
            <Button type="submit" className="w-full" loading={loading}>
              Se connecter
            </Button>
          </Form>
        </Formik>
      </div>
    </div>
  );
}
```

---

### 7.2 Dashboard (MUI X Charts)

**pages/Dashboard.tsx**:
```typescript
import { useQuery } from '@apollo/client';
import { LineChart, BarChart, PieChart } from '@mui/x-charts';
import { GET_SALES_STATS } from '../graphql/queries/reports';
import StatsCard from '../components/dashboard/StatsCard';

export default function Dashboard() {
  const { data, loading } = useQuery(GET_SALES_STATS, {
    variables: { period: 'MONTH' },
  });

  if (loading) return <div>Chargement...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">Tableau de Bord</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Revenus du mois"
          value={`${data.stats.monthlyRevenue.toLocaleString()} DZD`}
          change="+12%"
          positive
        />
        <StatsCard
          title="Commandes"
          value={data.stats.totalOrders}
          change="+8%"
          positive
        />
        <StatsCard
          title="Clients actifs"
          value={data.stats.activeCustomers}
          change="+15%"
          positive
        />
        <StatsCard
          title="Panier moyen"
          value={`${data.stats.averageCart} DZD`}
          change="-3%"
          positive={false}
        />
      </div>

      {/* Charts avec MUI X Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart - Évolution des ventes */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Évolution des ventes</h2>
          <LineChart
            xAxis={[{ data: data.salesTrend.dates, scaleType: 'time' }]}
            series={[
              {
                data: data.salesTrend.values,
                area: true,
                color: '#2C3E50',
              },
            ]}
            width={500}
            height={300}
          />
        </div>

        {/* Pie Chart - Ventes par catégorie */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Ventes par catégorie</h2>
          <PieChart
            series={[
              {
                data: data.categorySales.map((cat: any) => ({
                  id: cat.id,
                  value: cat.value,
                  label: cat.name,
                })),
              },
            ]}
            width={500}
            height={300}
          />
        </div>

        {/* Bar Chart - Top produits */}
        <div className="card lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Top 10 Produits</h2>
          <BarChart
            xAxis={[
              { scaleType: 'band', data: data.topProducts.map((p: any) => p.name) },
            ]}
            series={[
              {
                data: data.topProducts.map((p: any) => p.sales),
                color: '#C9A992',
              },
            ]}
            width={1000}
            height={300}
          />
        </div>
      </div>
    </div>
  );
}
```

---

### 7.3 Liste Produits

**pages/Products/ProductList.tsx**:
```typescript
import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Link } from 'react-router-dom';
import { GET_PRODUCTS } from '../../graphql/queries/products';
import { DELETE_PRODUCT } from '../../graphql/mutations/products';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function ProductList() {
  const [page, setPage] = useState(1);
  const { data, loading, refetch } = useQuery(GET_PRODUCTS, {
    variables: { page, size: 20 },
  });

  const [deleteProduct] = useMutation(DELETE_PRODUCT, {
    onCompleted: () => refetch(),
  });

  const columns = [
    {
      key: 'image',
      header: 'Image',
      render: (product: any) => (
        <img
          src={product.images[0]?.url}
          alt={product.name.fr}
          className="w-12 h-12 object-cover rounded"
        />
      ),
    },
    {
      key: 'name',
      header: 'Nom',
      render: (product: any) => product.name.fr,
    },
    { key: 'sku', header: 'SKU' },
    {
      key: 'category',
      header: 'Catégorie',
      render: (product: any) => product.category.name.fr,
    },
    {
      key: 'basePrice',
      header: 'Prix',
      render: (product: any) => `${product.basePrice} DZD`,
    },
    { key: 'stockQuantity', header: 'Stock' },
    {
      key: 'status',
      header: 'Statut',
      render: (product: any) => (
        <Badge
          variant={
            product.status === 'ACTIVE'
              ? 'success'
              : product.status === 'DRAFT'
              ? 'warning'
              : 'danger'
          }
        >
          {product.status}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (product: any) => (
        <div className="flex space-x-2">
          <Link to={`/products/${product.id}/edit`}>
            <Button size="sm" variant="secondary">
              Modifier
            </Button>
          </Link>
          <Button
            size="sm"
            variant="danger"
            onClick={() => {
              if (confirm('Êtes-vous sûr ?')) {
                deleteProduct({ variables: { id: product.id } });
              }
            }}
          >
            Supprimer
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Produits</h1>
        <Link to="/products/new">
          <Button>+ Nouveau produit</Button>
        </Link>
      </div>

      <div className="card">
        <Table
          columns={columns}
          data={data?.products.edges.map((e: any) => e.node) || []}
          loading={loading}
        />

        {/* Pagination */}
        {data && (
          <div className="flex justify-between items-center mt-6">
            <Button
              variant="secondary"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Précédent
            </Button>
            <span className="text-gray-600">Page {page}</span>
            <Button
              variant="secondary"
              disabled={!data.products.pageInfo.hasNextPage}
              onClick={() => setPage(page + 1)}
            >
              Suivant
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### 7.4 Formulaire Produit (Formik + Yup)

**pages/Products/ProductForm.tsx**:
```typescript
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from '@apollo/client';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { GET_PRODUCT } from '../../graphql/queries/products';
import { CREATE_PRODUCT, UPDATE_PRODUCT } from '../../graphql/mutations/products';
import Button from '../../components/ui/Button';

const productSchema = Yup.object({
  sku: Yup.string().required('SKU requis'),
  name_fr: Yup.string().required('Nom en français requis'),
  name_ar: Yup.string().required('Nom en arabe requis'),
  name_en: Yup.string().required('Nom en anglais requis'),
  description_fr: Yup.string().required('Description en français requise'),
  categoryId: Yup.string().required('Catégorie requise'),
  basePrice: Yup.number().min(0, 'Prix invalide').required('Prix requis'),
  stockQuantity: Yup.number().min(0, 'Stock invalide').required('Stock requis'),
});

export default function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;

  const { data: productData, loading: loadingProduct } = useQuery(GET_PRODUCT, {
    variables: { id },
    skip: !isEdit,
  });

  const [createProduct, { loading: creating }] = useMutation(CREATE_PRODUCT, {
    onCompleted: () => navigate('/products'),
  });

  const [updateProduct, { loading: updating }] = useMutation(UPDATE_PRODUCT, {
    onCompleted: () => navigate('/products'),
  });

  const initialValues = isEdit && productData
    ? {
        sku: productData.product.sku,
        name_fr: productData.product.name.fr,
        name_ar: productData.product.name.ar,
        name_en: productData.product.name.en,
        description_fr: productData.product.description.fr,
        description_ar: productData.product.description.ar || '',
        description_en: productData.product.description.en || '',
        categoryId: productData.product.category.id,
        basePrice: productData.product.basePrice,
        salePrice: productData.product.salePrice || '',
        stockQuantity: productData.product.stockQuantity,
        status: productData.product.status,
      }
    : {
        sku: '',
        name_fr: '',
        name_ar: '',
        name_en: '',
        description_fr: '',
        description_ar: '',
        description_en: '',
        categoryId: '',
        basePrice: 0,
        salePrice: '',
        stockQuantity: 0,
        status: 'DRAFT',
      };

  if (loadingProduct) return <div>Chargement...</div>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8">
        {isEdit ? 'Modifier le produit' : 'Nouveau produit'}
      </h1>

      <div className="card max-w-4xl">
        <Formik
          initialValues={initialValues}
          validationSchema={productSchema}
          onSubmit={async (values) => {
            const input = {
              sku: values.sku,
              name: {
                fr: values.name_fr,
                ar: values.name_ar,
                en: values.name_en,
              },
              description: {
                fr: values.description_fr,
                ar: values.description_ar,
                en: values.description_en,
              },
              categoryId: values.categoryId,
              basePrice: parseFloat(values.basePrice.toString()),
              salePrice: values.salePrice ? parseFloat(values.salePrice.toString()) : null,
              stockQuantity: parseInt(values.stockQuantity.toString()),
              status: values.status,
            };

            if (isEdit) {
              await updateProduct({ variables: { id, input } });
            } else {
              await createProduct({ variables: { input } });
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-6">
              {/* SKU */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SKU *
                </label>
                <Field name="sku" className="input" />
                <ErrorMessage
                  name="sku"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Nom multilingue */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom (Français) *
                  </label>
                  <Field name="name_fr" className="input" />
                  <ErrorMessage
                    name="name_fr"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom (Arabe) *
                  </label>
                  <Field name="name_ar" className="input" dir="rtl" />
                  <ErrorMessage
                    name="name_ar"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom (Anglais) *
                  </label>
                  <Field name="name_en" className="input" />
                  <ErrorMessage
                    name="name_en"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Français) *
                </label>
                <Field name="description_fr" as="textarea" rows={4} className="input" />
                <ErrorMessage
                  name="description_fr"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Prix */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix de base (DZD) *
                  </label>
                  <Field name="basePrice" type="number" className="input" />
                  <ErrorMessage
                    name="basePrice"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prix promo (DZD)
                  </label>
                  <Field name="salePrice" type="number" className="input" />
                </div>
              </div>

              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantité en stock *
                </label>
                <Field name="stockQuantity" type="number" className="input" />
                <ErrorMessage
                  name="stockQuantity"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              {/* Statut */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <Field as="select" name="status" className="input">
                  <option value="DRAFT">Brouillon</option>
                  <option value="ACTIVE">Actif</option>
                  <option value="OUT_OF_STOCK">Rupture de stock</option>
                </Field>
              </div>

              {/* Actions */}
              <div className="flex space-x-4">
                <Button
                  type="submit"
                  loading={isSubmitting || creating || updating}
                >
                  {isEdit ? 'Mettre à jour' : 'Créer le produit'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/products')}
                >
                  Annuler
                </Button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
```

---

## 8. Dépendances Principales

**package.json**:
```json
{
  "name": "oscar-backoffice",
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "codegen": "graphql-codegen --config codegen.ts",
    "codegen:watch": "graphql-codegen --config codegen.ts --watch",
    "format": "prettier --write \"src/**/*.{ts,tsx}\""
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.18.0",
    "@apollo/client": "^3.8.0",
    "graphql": "^16.8.0",
    "@reduxjs/toolkit": "^1.9.7",
    "react-redux": "^8.1.3",
    "tailwindcss": "^3.3.0",
    "@mui/x-charts": "^6.18.0",
    "formik": "^2.4.5",
    "yup": "^1.3.3",
    "date-fns": "^2.30.0",
    "clsx": "^2.0.0",
    "lucide-react": "^0.292.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.37",
    "@types/react-dom": "^18.2.15",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.2.2",
    "vite": "^5.0.0",
    "@graphql-codegen/cli": "^5.0.0",
    "@graphql-codegen/client-preset": "^4.1.0",
    "@tailwindcss/forms": "^0.5.7",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "prettier": "^3.1.0",
    "prettier-plugin-tailwindcss": "^0.5.7"
  }
}
```

---

## 9. Variables d'Environnement

**.env.local**:
```
VITE_GRAPHQL_URL=http://localhost:8080/graphql
```

**.env.production**:
```
VITE_GRAPHQL_URL=https://api.oscarfashion.dz/graphql
```

---

**Version**: 2.0 (React + Apollo + Tailwind + Redux)
**Date**: Novembre 2025
**Statut**: Spécification technique détaillée (Mise à jour complète)
