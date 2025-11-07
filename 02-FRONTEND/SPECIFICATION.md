# Frontend Web - Spécifications Détaillées
## OSCAR Fashion E-commerce Platform (Next.js)

---

## 1. Vue d'ensemble

Le frontend web constitue l'interface client principale de la plateforme OSCAR Fashion, développée avec **Next.js 14+** utilisant l'App Router. Il offre une expérience d'achat moderne, responsive et performante avec rendu côté serveur (SSR) et génération statique (SSG).

### Objectifs Principaux
- Créer une expérience utilisateur fluide avec Next.js App Router
- Performance optimale grâce au SSR/SSG
- Intégration GraphQL avec code generation
- Design moderne avec Tailwind CSS
- Support multilingue (Arabe RTL, Français, Anglais)
- SEO optimisé natif avec Next.js
- Accessibilité (WCAG 2.1 niveau AA)

---

## 2. Stack Technique

### Core Framework
- **Framework**: Next.js 14+ (App Router)
- **Build Tool**: Vite
- **Langage**: TypeScript
- **Package Manager**: npm
- **Runtime**: Node.js 18+

### GraphQL & Data Fetching
- **GraphQL Client**: Proposition - Apollo Client, urql, ou graphql-request
- **Code Generation**: GraphQL Code Generator (@graphql-codegen)
- **Schema**: Auto-generated types from backend
- **SSR Support**: GraphQL queries compatibles avec Next.js SSR

### UI & Styling
- **CSS Framework**: Tailwind CSS 3.x
- **Icons**: Heroicons, Lucide Icons, ou React Icons
- **Animations**: Framer Motion
- **Utility**: clsx, tailwind-merge

### State Management
- **Server State**: Géré par GraphQL (Apollo cache ou urql)
- **Client State**: React Context API, Zustand (si nécessaire)
- **URL State**: Next.js searchParams

### Routing & Navigation
- **Router**: Next.js App Router (app directory)
- **Navigation**: next/link, useRouter
- **Parallel Routes**: Pour modals et layouts complexes
- **Intercepting Routes**: Pour optimiser UX

### Formulaires & Validation
- **Forms**: Formik
- **Validation**: Yup
- **File Upload**: next-cloudinary ou custom

### Dates
- **Library**: date-fns

### Internationalisation
- **i18n**: next-intl
- **RTL Support**: Tailwind RTL utilities
- **Locales**: ar, fr, en

### Images & Optimisation
- **Images**: next/image (optimisation automatique)
- **Fonts**: next/font (Google Fonts)
- **Lazy Loading**: React.lazy + Suspense

### Code Quality
- **Formatter**: Prettier
- **Type Checking**: TypeScript strict mode

### Développement
- **Hot Reload**: Next.js Fast Refresh
- **Environment**: .env.local, .env.production

**Note**: Pas de testing, CI/CD, ESLint, git hooks, Storybook pour le moment

---

## 3. Architecture Frontend

### Structure du Projet (App Router)

```
oscar-frontend/
├── public/
│   ├── images/
│   ├── icons/
│   └── locales/           # Fichiers traduction (si nécessaire)
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── (shop)/        # Route group pour shop
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx   # Homepage
│   │   │   ├── products/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx
│   │   │   ├── cart/
│   │   │   │   └── page.tsx
│   │   │   ├── checkout/
│   │   │   │   └── page.tsx
│   │   │   └── profile/
│   │   │       └── page.tsx
│   │   ├── (auth)/        # Route group pour auth
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── register/
│   │   │       └── page.tsx
│   │   ├── api/           # API routes (si nécessaire)
│   │   ├── layout.tsx     # Root layout
│   │   └── globals.css    # Tailwind directives
│   ├── components/
│   │   ├── ui/            # Composants UI de base
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── ...
│   │   ├── layout/        # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── Navbar.tsx
│   │   ├── product/       # Product components
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   └── ProductFilters.tsx
│   │   ├── cart/
│   │   ├── checkout/
│   │   └── forms/
│   ├── graphql/
│   │   ├── queries/       # GraphQL queries
│   │   ├── mutations/     # GraphQL mutations
│   │   ├── fragments/     # GraphQL fragments
│   │   └── generated/     # Auto-generated types
│   ├── lib/
│   │   ├── apollo-client.ts  # Apollo setup (ou autre client)
│   │   ├── utils.ts
│   │   └── validators.ts  # Yup schemas
│   ├── hooks/             # Custom React hooks
│   ├── contexts/          # React contexts
│   ├── types/             # TypeScript types
│   ├── constants/         # Constantes
│   └── styles/            # Styles globaux supplémentaires
├── .env.local
├── .env.production
├── codegen.ts             # GraphQL Code Generator config
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .prettierrc
```

---

## 4. GraphQL Integration

### Configuration GraphQL Code Generator

**codegen.ts**:
```typescript
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://localhost:8080/graphql', // Backend GraphQL endpoint
  documents: ['src/graphql/**/*.{ts,tsx}'],
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
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "codegen": "graphql-codegen --config codegen.ts",
    "codegen:watch": "graphql-codegen --config codegen.ts --watch"
  }
}
```

### Proposition: Apollo Client avec Next.js

**lib/apollo-client.ts**:
```typescript
import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8080/graphql',
});

const authLink = setContext((_, { headers }) => {
  // Get token from storage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

export const apolloClient = new ApolloClient({
  link: from([authLink, httpLink]),
  cache: new InMemoryCache(),
  ssrMode: typeof window === 'undefined', // SSR support
});
```

**Alternative: urql** (plus léger):
```typescript
import { createClient, ssrExchange, cacheExchange, fetchExchange } from 'urql';

const isServerSide = typeof window === 'undefined';
const ssrCache = ssrExchange({ isClient: !isServerSide });

export const urqlClient = createClient({
  url: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8080/graphql',
  exchanges: [cacheExchange, ssrCache, fetchExchange],
  fetchOptions: () => {
    const token = !isServerSide ? localStorage.getItem('token') : null;
    return {
      headers: { authorization: token ? `Bearer ${token}` : '' },
    };
  },
});
```

### Exemple Query avec Code Generation

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
          basePrice
          salePrice
          images {
            id
            url
          }
          status
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`;
```

**Usage dans Component (Server Component)**:
```typescript
// app/products/page.tsx
import { apolloClient } from '@/lib/apollo-client';
import { GET_PRODUCTS } from '@/graphql/queries/products';
import ProductGrid from '@/components/product/ProductGrid';

export default async function ProductsPage() {
  const { data } = await apolloClient.query({
    query: GET_PRODUCTS,
    variables: { page: 1, size: 20 },
  });

  return (
    <div>
      <h1>Produits</h1>
      <ProductGrid products={data.products.edges.map(e => e.node)} />
    </div>
  );
}
```

**Usage dans Client Component**:
```typescript
'use client';

import { useQuery } from '@apollo/client';
import { GET_PRODUCTS } from '@/graphql/queries/products';

export default function ProductList() {
  const { data, loading, error } = useQuery(GET_PRODUCTS, {
    variables: { page: 1, size: 20 },
  });

  if (loading) return <Skeleton />;
  if (error) return <Error />;

  return <ProductGrid products={data.products.edges.map(e => e.node)} />;
}
```

---

## 5. Tailwind CSS Setup

### Configuration

**tailwind.config.ts**:
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
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
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};

export default config;
```

**app/globals.css**:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --font-inter: 'Inter', sans-serif;
  }

  [dir='rtl'] {
    direction: rtl;
  }
}

@layer components {
  .btn-primary {
    @apply bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors;
  }

  .card {
    @apply bg-white rounded-lg shadow-md p-6;
  }
}
```

### Composants UI avec Tailwind

**components/ui/Button.tsx**:
```typescript
import { ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'rounded-lg font-medium transition-colors',
        {
          'bg-primary text-white hover:bg-primary-dark': variant === 'primary',
          'bg-secondary text-primary hover:bg-secondary-dark': variant === 'secondary',
          'border-2 border-primary text-primary hover:bg-primary hover:text-white':
            variant === 'outline',
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

---

## 6. Pages & Fonctionnalités Principales

### 6.1 Homepage (SSG)

**app/page.tsx**:
```typescript
import { apolloClient } from '@/lib/apollo-client';
import { GET_FEATURED_PRODUCTS, GET_CATEGORIES } from '@/graphql/queries';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import CategoriesGrid from '@/components/home/CategoriesGrid';

export default async function HomePage() {
  const [{ data: productsData }, { data: categoriesData }] = await Promise.all([
    apolloClient.query({ query: GET_FEATURED_PRODUCTS }),
    apolloClient.query({ query: GET_CATEGORIES }),
  ]);

  return (
    <div>
      <HeroSection />
      <FeaturedProducts products={productsData.featuredProducts} />
      <CategoriesGrid categories={categoriesData.categories} />
    </div>
  );
}

export const revalidate = 3600; // Revalidate every hour (ISR)
```

---

### 6.2 Catalogue Produits (SSR avec Filters)

**app/products/page.tsx**:
```typescript
import { apolloClient } from '@/lib/apollo-client';
import { GET_PRODUCTS } from '@/graphql/queries/products';
import ProductGrid from '@/components/product/ProductGrid';
import ProductFilters from '@/components/product/ProductFilters';

interface SearchParams {
  page?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const page = parseInt(searchParams.page || '1');
  const filter = {
    categoryId: searchParams.category,
    minPrice: searchParams.minPrice ? parseFloat(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? parseFloat(searchParams.maxPrice) : undefined,
  };

  const { data } = await apolloClient.query({
    query: GET_PRODUCTS,
    variables: { page, size: 20, filter },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <ProductFilters />
        </aside>
        <main className="lg:col-span-3">
          <ProductGrid products={data.products.edges.map((e) => e.node)} />
        </main>
      </div>
    </div>
  );
}
```

---

### 6.3 Détail Produit (SSG)

**app/products/[slug]/page.tsx**:
```typescript
import { apolloClient } from '@/lib/apollo-client';
import { GET_PRODUCT_BY_SLUG } from '@/graphql/queries/products';
import ProductGallery from '@/components/product/ProductGallery';
import ProductInfo from '@/components/product/ProductInfo';
import AddToCartButton from '@/components/product/AddToCartButton';

export default async function ProductPage({
  params,
}: {
  params: { slug: string };
}) {
  const { data } = await apolloClient.query({
    query: GET_PRODUCT_BY_SLUG,
    variables: { slug: params.slug },
  });

  const product = data.product;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <ProductGallery images={product.images} />
        <div>
          <ProductInfo product={product} />
          <AddToCartButton productId={product.id} />
        </div>
      </div>
    </div>
  );
}

// Generate static params for all products
export async function generateStaticParams() {
  const { data } = await apolloClient.query({
    query: GET_ALL_PRODUCT_SLUGS,
  });

  return data.products.edges.map((edge) => ({
    slug: edge.node.slug,
  }));
}
```

---

### 6.4 Panier (Client Component)

**app/cart/page.tsx**:
```typescript
'use client';

import { useQuery, useMutation } from '@apollo/client';
import { GET_CART, UPDATE_CART_ITEM, REMOVE_FROM_CART } from '@/graphql/queries/cart';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';

export default function CartPage() {
  const { data, loading } = useQuery(GET_CART);
  const [updateItem] = useMutation(UPDATE_CART_ITEM);
  const [removeItem] = useMutation(REMOVE_FROM_CART);

  if (loading) return <LoadingSkeleton />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Mon Panier</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {data.cart.items.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={(quantity) =>
                updateItem({ variables: { itemId: item.id, quantity } })
              }
              onRemove={() => removeItem({ variables: { itemId: item.id } })}
            />
          ))}
        </div>
        <div className="lg:col-span-1">
          <CartSummary cart={data.cart} />
        </div>
      </div>
    </div>
  );
}
```

---

### 6.5 Checkout (Multi-step avec Formik)

**app/checkout/page.tsx**:
```typescript
'use client';

import { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import ShippingAddressForm from '@/components/checkout/ShippingAddressForm';
import ShippingMethodSelector from '@/components/checkout/ShippingMethodSelector';
import PaymentMethodSelector from '@/components/checkout/PaymentMethodSelector';
import OrderSummary from '@/components/checkout/OrderSummary';

const checkoutSchema = Yup.object({
  shippingAddress: Yup.object({
    fullName: Yup.string().required('Nom complet requis'),
    phone: Yup.string().required('Téléphone requis'),
    address: Yup.string().required('Adresse requise'),
    city: Yup.string().required('Ville requise'),
    wilaya: Yup.string().required('Wilaya requise'),
  }),
  shippingMethod: Yup.string().required(),
  paymentMethod: Yup.string().required(),
  acceptTerms: Yup.boolean().oneOf([true], 'Vous devez accepter les CGV'),
});

export default function CheckoutPage() {
  const [step, setStep] = useState(1);

  return (
    <div className="container mx-auto px-4 py-8">
      <Formik
        initialValues={{
          shippingAddress: {},
          shippingMethod: '',
          paymentMethod: '',
          acceptTerms: false,
        }}
        validationSchema={checkoutSchema}
        onSubmit={async (values) => {
          // GraphQL mutation CREATE_ORDER
        }}
      >
        {({ isValid }) => (
          <Form>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {step === 1 && <ShippingAddressForm />}
                {step === 2 && <ShippingMethodSelector />}
                {step === 3 && <PaymentMethodSelector />}
                <div className="flex justify-between mt-8">
                  {step > 1 && (
                    <Button onClick={() => setStep(step - 1)}>Retour</Button>
                  )}
                  {step < 3 ? (
                    <Button onClick={() => setStep(step + 1)}>Continuer</Button>
                  ) : (
                    <Button type="submit" disabled={!isValid}>
                      Passer la commande
                    </Button>
                  )}
                </div>
              </div>
              <div className="lg:col-span-1">
                <OrderSummary />
              </div>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}
```

---

## 7. Authentification

### Login Page

**app/(auth)/login/page.tsx**:
```typescript
'use client';

import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useMutation } from '@apollo/client';
import { LOGIN_MUTATION } from '@/graphql/mutations/auth';
import { useRouter } from 'next/navigation';

const loginSchema = Yup.object({
  email: Yup.string().email('Email invalide').required('Email requis'),
  password: Yup.string().min(6, 'Minimum 6 caractères').required('Mot de passe requis'),
});

export default function LoginPage() {
  const [login, { loading, error }] = useMutation(LOGIN_MUTATION);
  const router = useRouter();

  return (
    <div className="max-w-md mx-auto mt-16 p-8 card">
      <h1 className="text-2xl font-bold mb-6">Connexion</h1>
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={loginSchema}
        onSubmit={async (values) => {
          const { data } = await login({ variables: { input: values } });
          localStorage.setItem('token', data.login.token);
          router.push('/');
        }}
      >
        <Form className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Field
              name="email"
              type="email"
              className="w-full px-4 py-2 border rounded-lg"
            />
            <ErrorMessage
              name="email"
              component="div"
              className="text-red-500 text-sm mt-1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mot de passe</label>
            <Field
              name="password"
              type="password"
              className="w-full px-4 py-2 border rounded-lg"
            />
            <ErrorMessage
              name="password"
              component="div"
              className="text-red-500 text-sm mt-1"
            />
          </div>
          {error && <div className="text-red-500">{error.message}</div>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </Form>
      </Formik>
    </div>
  );
}
```

---

## 8. Internationalisation & RTL

### Setup next-intl

**middleware.ts**:
```typescript
import createMiddleware from 'next-intl/middleware';

export default createMiddleware({
  locales: ['ar', 'fr', 'en'],
  defaultLocale: 'fr',
  localePrefix: 'as-needed',
});

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
```

**app/[locale]/layout.tsx**:
```typescript
import { NextIntlClientProvider } from 'next-intl';
import { notFound } from 'next/navigation';

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

---

## 9. Performance & SEO

### Métadonnées (SEO)

**app/products/[slug]/page.tsx**:
```typescript
import { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const { data } = await apolloClient.query({
    query: GET_PRODUCT_BY_SLUG,
    variables: { slug: params.slug },
  });

  const product = data.product;

  return {
    title: product.name.fr,
    description: product.description.fr,
    openGraph: {
      title: product.name.fr,
      description: product.description.fr,
      images: [product.images[0]?.url],
    },
  };
}
```

### Images Optimisées

```typescript
import Image from 'next/image';

<Image
  src={product.images[0].url}
  alt={product.name.fr}
  width={600}
  height={800}
  priority
  className="rounded-lg"
/>
```

---

## 10. Variables d'Environnement

**.env.local**:
```
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:8080/graphql
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**.env.production**:
```
NEXT_PUBLIC_GRAPHQL_URL=https://api.oscarfashion.dz/graphql
NEXT_PUBLIC_SITE_URL=https://oscarfashion.dz
```

---

## 11. Dépendances Principales

**package.json**:
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "typescript": "^5.2.0",
    "@apollo/client": "^3.8.0",
    "graphql": "^16.8.0",
    "tailwindcss": "^3.3.0",
    "formik": "^2.4.0",
    "yup": "^1.3.0",
    "date-fns": "^2.30.0",
    "next-intl": "^3.0.0",
    "framer-motion": "^10.16.0",
    "clsx": "^2.0.0",
    "lucide-react": "^0.292.0"
  },
  "devDependencies": {
    "@graphql-codegen/cli": "^5.0.0",
    "@graphql-codegen/client-preset": "^4.1.0",
    "@tailwindcss/forms": "^0.5.7",
    "@tailwindcss/typography": "^0.5.10",
    "@types/node": "^20.8.0",
    "@types/react": "^18.2.0",
    "prettier": "^3.0.0",
    "prettier-plugin-tailwindcss": "^0.5.6"
  }
}
```

---

**Version**: 2.0 (Next.js + GraphQL + Tailwind)
**Date**: Novembre 2025
**Statut**: Spécification technique détaillée (Mise à jour)
