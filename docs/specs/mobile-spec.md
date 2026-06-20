# Application Mobile - Spécifications Détaillées (Version 2.0)
## OSCAR Fashion E-commerce Platform (iOS & Android)

---

## 1. Vue d'ensemble

L'application mobile OSCAR Fashion offre une expérience d'achat mobile native pour iOS et Android avec **Expo**, permettant aux clients de parcourir et acheter des produits en déplacement avec une interface optimisée et performante.

### Objectifs Principaux
- Offrir une expérience native performante sur iOS et Android via **Expo**
- Interface utilisateur moderne et fluide
- Support multilingue complet (Arabe RTL, Français, Anglais)
- Intégration paiements mobiles algériens (CIB, Baridimob)
- **API GraphQL** avec typage TypeScript complet
- Synchronisation temps réel avec le backend

### Changements Version 2.0
- ✅ **Expo** (remplace React Native CLI)
- ✅ **GraphQL + Apollo Client** (remplace REST + React Query)
- ✅ **GraphQL Code Generation** (typage automatique)
- ✅ **Formik + Yup** (remplace React Hook Form)
- ❌ **Pas de Firebase** (pas de push notifications pour le moment)
- ❌ **Pas de mode offline** (simplifié)
- ❌ **Pas de tests** (Jest, Detox) pour le moment
- ❌ **Pas de CI/CD** (développement local)

---

## 2. Stack Technique (Version 2.0)

### Core Framework
- **Framework**: React Native 0.72+ via **Expo SDK 49+**
- **Langage**: TypeScript
- **Setup**: Expo (Managed Workflow)
- **Package Manager**: npm
- **Build**: Expo EAS Build

### API & Data Management
- **API Protocol**: **GraphQL**
- **GraphQL Client**: **Apollo Client** v3.8+
- **Code Generation**: **GraphQL Code Generator**
- **Schema**: Partagé avec backend (Spring Boot + SPQR)
- **Cache**: Apollo InMemoryCache (pas de mode offline)

### Navigation
- **Library**: React Navigation v6
- **Navigators**: Stack, Bottom Tabs, Drawer
- **Deep Linking**: Support URLs personnalisées
- **Type Safety**: TypeScript navigation types

### UI Components & Styling
- **Styling**: React Native StyleSheet + StyleSheet API
- **Icons**: Expo Vector Icons (Material Icons, Ionicons)
- **Animations**: React Native Reanimated 3, Lottie
- **Gestures**: React Native Gesture Handler
- **Safe Area**: react-native-safe-area-context

### Forms & Validation
- **Forms**: **Formik** v2.4+
- **Validation**: **Yup** v1.3+
- **Field Management**: Formik Field, FieldArray

### State Management
- **Local State**: React useState, useReducer
- **Global State**: React Context (léger)
- **Server State**: Apollo Client (cache + queries)
- **No Async Storage**: Pas de persistance offline

### Paiement Mobile
- **Intégration**: WebView pour redirections CIB/Baridimob
- **Library**: react-native-webview
- **Flow**: Redirection → Payment Gateway → Callback

### Media & Images
- **Image Component**: Expo Image (avec cache intégré)
- **Image Picker**: expo-image-picker (photo profil)
- **Gallery**: react-native-reanimated-carousel

### Internationalisation
- **i18n**: i18next + react-i18next
- **RTL**: I18nManager pour support Arabe
- **Storage**: AsyncStorage pour langue sélectionnée

### Storage
- **Secure Storage**: expo-secure-store (JWT tokens)
- **Local Storage**: AsyncStorage (préférences, langue)
- **No Offline Cache**: Pas de cache persistant pour produits

### Maps & Location (si nécessaire)
- **Maps**: react-native-maps (adresse livraison)
- **Location**: expo-location

### Code Quality
- **Formatter**: **Prettier** (uniquement)
- **Linting**: **Pas d'ESLint** pour le moment
- **Git Hooks**: **Pas de Husky** pour le moment

### Monitoring (optionnel)
- **Crash Reporting**: Sentry (optionnel)
- **Analytics**: Amplitude ou Mixpanel (optionnel)

---

## 3. Architecture Mobile

### Structure du Projet

```
oscar-mobile/
├── app.json                    # Expo configuration
├── eas.json                    # EAS Build configuration
├── package.json
├── tsconfig.json
├── codegen.ts                  # GraphQL Code Generator config
├── .prettierrc
├── .env.development
├── .env.production
├── App.tsx                     # Entry point
├── src/
│   ├── apollo/                # Apollo Client setup
│   │   ├── client.ts          # Apollo Client instance
│   │   └── links.ts           # Auth link, error link
│   ├── assets/                # Images, fonts, animations
│   │   ├── images/
│   │   ├── fonts/
│   │   └── lottie/
│   ├── components/            # Composants réutilisables
│   │   ├── common/           # Button, Input, Card, Badge
│   │   ├── layout/           # Header, TabBar, SafeArea
│   │   └── product/          # ProductCard, ProductList
│   ├── screens/               # Écrans de l'app
│   │   ├── auth/             # Login, Register, ForgotPassword
│   │   ├── home/             # HomeScreen
│   │   ├── catalog/          # ProductListScreen, SearchScreen
│   │   ├── product/          # ProductDetailScreen
│   │   ├── cart/             # CartScreen
│   │   ├── checkout/         # CheckoutFlow (4 steps)
│   │   ├── profile/          # ProfileScreen, EditProfile
│   │   ├── orders/           # OrderListScreen, OrderDetailScreen
│   │   └── settings/         # SettingsScreen
│   ├── navigation/            # Navigation configuration
│   │   ├── RootNavigator.tsx # Main navigation
│   │   ├── AuthNavigator.tsx
│   │   ├── MainTabNavigator.tsx
│   │   └── types.ts          # Navigation types
│   ├── graphql/               # GraphQL queries & mutations
│   │   ├── queries/
│   │   │   ├── products.ts
│   │   │   ├── orders.ts
│   │   │   └── user.ts
│   │   ├── mutations/
│   │   │   ├── auth.ts
│   │   │   ├── cart.ts
│   │   │   └── order.ts
│   │   └── generated/         # Auto-generated types
│   │       ├── graphql.ts
│   │       └── types.ts
│   ├── hooks/                 # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   └── useI18n.ts
│   ├── context/               # React Context
│   │   ├── AuthContext.tsx
│   │   └── CartContext.tsx
│   ├── utils/                 # Utilitaires
│   │   ├── format.ts          # Prix, dates
│   │   ├── validation.ts
│   │   └── storage.ts
│   ├── constants/             # Constantes
│   │   ├── colors.ts
│   │   ├── fonts.ts
│   │   └── config.ts
│   ├── theme/                 # Thème global
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   └── typography.ts
│   ├── i18n/                  # Internationalisation
│   │   ├── index.ts
│   │   ├── fr.json
│   │   ├── ar.json
│   │   └── en.json
│   └── types/                 # TypeScript types
│       ├── navigation.ts
│       └── models.ts
```

---

## 4. Configuration Expo

### app.json

```json
{
  "expo": {
    "name": "OSCAR Fashion",
    "slug": "oscar-fashion",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./src/assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./src/assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#2C3E50"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.oscar.fashion",
      "buildNumber": "1.0.0"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./src/assets/adaptive-icon.png",
        "backgroundColor": "#2C3E50"
      },
      "package": "com.oscar.fashion",
      "versionCode": 1
    },
    "web": {
      "favicon": "./src/assets/favicon.png"
    },
    "extra": {
      "graphqlUrl": "http://localhost:8080/graphql"
    }
  }
}
```

### eas.json (EAS Build)

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "GRAPHQL_URL": "http://localhost:8080/graphql"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "GRAPHQL_URL": "https://staging.oscar-fashion.dz/graphql"
      }
    },
    "production": {
      "env": {
        "GRAPHQL_URL": "https://api.oscar-fashion.dz/graphql"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## 5. Configuration GraphQL

### codegen.ts (GraphQL Code Generator)

```typescript
import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://localhost:8080/graphql',
  documents: ['src/graphql/**/*.ts'],
  generates: {
    './src/graphql/generated/': {
      preset: 'client',
      plugins: [],
      config: {
        scalars: {
          DateTime: 'string',
          Date: 'string',
          Upload: 'File',
        },
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
```

### package.json scripts

```json
{
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "codegen": "graphql-codegen --config codegen.ts",
    "format": "prettier --write \"src/**/*.{ts,tsx,json}\""
  }
}
```

---

## 6. Apollo Client Setup

### src/apollo/client.ts

```typescript
import { ApolloClient, InMemoryCache, from, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// HTTP Link
const httpLink = new HttpLink({
  uri: Constants.expoConfig?.extra?.graphqlUrl || 'http://localhost:8080/graphql',
});

// Auth Link (JWT token)
const authLink = setContext(async (_, { headers }) => {
  const token = await SecureStore.getItemAsync('jwt_token');
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// Error Link
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

// Apollo Client Instance
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          products: {
            keyArgs: ['filter', 'sort'],
            merge(existing, incoming, { args }) {
              if (!existing || args?.page === 1) {
                return incoming;
              }
              return {
                ...incoming,
                edges: [...existing.edges, ...incoming.edges],
              };
            },
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
});
```

---

## 7. GraphQL Queries & Mutations

### src/graphql/queries/products.ts

```typescript
import { gql } from '@apollo/client';

export const GET_PRODUCTS = gql`
  query GetProducts($page: Int!, $size: Int!, $filter: ProductFilter) {
    products(page: $page, size: $size, filter: $filter) {
      edges {
        node {
          id
          name {
            fr
            ar
            en
          }
          slug
          description {
            fr
            ar
            en
          }
          basePrice
          salePrice
          images {
            url
            altText
          }
          category {
            id
            name {
              fr
              ar
              en
            }
          }
          availableStock
        }
        cursor
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      totalCount
    }
  }
`;

export const GET_PRODUCT_BY_ID = gql`
  query GetProductById($id: ID!) {
    product(id: $id) {
      id
      name {
        fr
        ar
        en
      }
      slug
      description {
        fr
        ar
        en
      }
      basePrice
      salePrice
      images {
        url
        altText
      }
      variants {
        id
        size
        color
        stock
      }
      category {
        id
        name {
          fr
          ar
          en
        }
      }
      availableStock
      isActive
    }
  }
`;

export const SEARCH_PRODUCTS = gql`
  query SearchProducts($query: String!, $page: Int!, $size: Int!) {
    searchProducts(query: $query, page: $page, size: $size) {
      edges {
        node {
          id
          name {
            fr
            ar
            en
          }
          slug
          basePrice
          salePrice
          images {
            url
          }
          availableStock
        }
      }
      pageInfo {
        hasNextPage
      }
      totalCount
    }
  }
`;
```

### src/graphql/mutations/auth.ts

```typescript
import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        firstName
        lastName
        email
        phoneNumber
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        firstName
        lastName
        email
        phoneNumber
      }
    }
  }
`;
```

### src/graphql/mutations/cart.ts

```typescript
import { gql } from '@apollo/client';

export const ADD_TO_CART = gql`
  mutation AddToCart($input: AddToCartInput!) {
    addToCart(input: $input) {
      id
      items {
        id
        product {
          id
          name {
            fr
            ar
            en
          }
          basePrice
          images {
            url
          }
        }
        variant {
          id
          size
          color
        }
        quantity
        unitPrice
        totalPrice
      }
      subtotal
      total
    }
  }
`;

export const UPDATE_CART_ITEM = gql`
  mutation UpdateCartItem($itemId: ID!, $quantity: Int!) {
    updateCartItem(itemId: $itemId, quantity: $quantity) {
      id
      items {
        id
        quantity
        totalPrice
      }
      subtotal
      total
    }
  }
`;

export const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($itemId: ID!) {
    removeFromCart(itemId: $itemId) {
      id
      items {
        id
      }
      subtotal
      total
    }
  }
`;
```

---

## 8. Composants Communs

### src/components/common/Button.tsx

```typescript
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        <Text style={[styles.text, variant === 'outline' && styles.outlineText]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#2C3E50',
  },
  secondary: {
    backgroundColor: '#C9A992',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#2C3E50',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineText: {
    color: '#2C3E50',
  },
});
```

### src/components/product/ProductCard.tsx

```typescript
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { Product } from '../../graphql/generated/graphql';

interface ProductCardProps {
  product: Product;
  onAddToCart?: (productId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const navigation = useNavigation();

  const handlePress = () => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.images[0]?.url }}
          style={styles.image}
          resizeMode="cover"
        />
        {product.salePrice && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              -{Math.round(((product.basePrice - product.salePrice) / product.basePrice) * 100)}%
            </Text>
          </View>
        )}
        <TouchableOpacity style={styles.favoriteIcon} onPress={() => {}}>
          <Ionicons name="heart-outline" size={20} color="#2C3E50" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name.fr}
        </Text>

        <View style={styles.priceRow}>
          {product.salePrice ? (
            <>
              <Text style={styles.salePrice}>{product.salePrice} DZD</Text>
              <Text style={styles.basePrice}>{product.basePrice} DZD</Text>
            </>
          ) : (
            <Text style={styles.salePrice}>{product.basePrice} DZD</Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => onAddToCart?.(product.id)}
        >
          <Ionicons name="cart-outline" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 3 / 4,
  },
  image: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#F44336',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  favoriteIcon: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
    height: 36,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  salePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2C3E50',
    marginRight: 8,
  },
  basePrice: {
    fontSize: 12,
    color: '#999',
    textDecorationLine: 'line-through',
  },
  addButton: {
    backgroundColor: '#2C3E50',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: 12,
    bottom: 12,
  },
});
```

---

## 9. Formulaires avec Formik + Yup

### src/screens/auth/LoginScreen.tsx

```typescript
import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useMutation } from '@apollo/client';
import { LOGIN_MUTATION } from '../../graphql/mutations/auth';
import { Button } from '../../components/common/Button';
import { TextInput } from '../../components/common/TextInput';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Email invalide')
    .required('Email requis'),
  password: Yup.string()
    .min(6, 'Minimum 6 caractères')
    .required('Mot de passe requis'),
});

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation();
  const [login, { loading }] = useMutation(LOGIN_MUTATION);

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      const { data } = await login({
        variables: {
          email: values.email,
          password: values.password,
        },
      });

      if (data?.login?.token) {
        await SecureStore.setItemAsync('jwt_token', data.login.token);
        // Store user info in context or navigation
        navigation.navigate('Main');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Email ou mot de passe incorrect');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Connexion</Text>

      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={loginSchema}
        onSubmit={handleLogin}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <View style={styles.form}>
            <TextInput
              label="Email"
              placeholder="exemple@email.com"
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              error={touched.email && errors.email ? errors.email : undefined}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextInput
              label="Mot de passe"
              placeholder="••••••••"
              value={values.password}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              error={touched.password && errors.password ? errors.password : undefined}
              secureTextEntry
            />

            <Button
              title="Se connecter"
              onPress={handleSubmit}
              loading={loading}
              fullWidth
            />
          </View>
        )}
      </Formik>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#2C3E50',
    marginBottom: 32,
    textAlign: 'center',
  },
  form: {
    gap: 16,
  },
});
```

---

## 10. Écrans Principaux

### 10.1 Écran Home

**Composants**:
1. Header avec logo et icônes
2. Search Bar (navigation vers Search)
3. Hero Slider (bannières promotionnelles)
4. Featured Products (horizontal scroll)
5. Categories Grid (2 colonnes)
6. New Arrivals (horizontal scroll)
7. Promotions Banner

**Fonctionnalités**:
- Pull-to-refresh
- Lazy loading images (Expo Image)
- Navigation rapide
- GraphQL queries pour chaque section

---

### 10.2 Catalogue & Recherche

**Écran ProductList**:
- Header avec filtres et tri
- FlatList avec ProductCard (grille 2 colonnes)
- Infinite scroll (pagination GraphQL)
- Pull-to-refresh
- Empty state

**Écran Search**:
- Search Bar avec autofocus
- Autocomplete suggestions
- Historique recherches (AsyncStorage)
- Résultats en temps réel (debounce)

**Filtres Modal**:
- Catégories
- Prix (range slider)
- Tailles, Couleurs
- Boutons: Réinitialiser / Appliquer

---

### 10.3 Détail Produit

**Composants**:
1. Image Gallery (swiper avec zoom)
2. Product Info (nom, prix, promo)
3. Variant Selector (taille, couleur)
4. Quantity Selector
5. Add to Cart Button (sticky)
6. Tabs: Description, Caractéristiques, Guide tailles
7. Related Products

**Fonctionnalités**:
- Query GraphQL pour produit complet
- Vérification stock en temps réel
- Animation ajout panier
- Partage natif (Share API)

---

### 10.4 Panier

**Composants**:
1. Header "Mon panier (X articles)"
2. Cart Items List (FlatList)
   - CartItem avec image, nom, prix, quantité
   - Swipe-to-delete
3. Promo Code Section
4. Cart Summary (sticky bottom)
   - Sous-total, Livraison, Total
   - Bouton "Passer commande"
5. Empty Cart State

**Fonctionnalités**:
- Mutations GraphQL (add, update, remove)
- Update quantité en temps réel
- Calcul auto du total
- Vérification stock avant checkout

---

### 10.5 Tunnel de Commande (Checkout)

**4 Étapes (Stack Navigator)**:

1. **Adresse de Livraison**
   - Liste adresses existantes (query GraphQL)
   - Formulaire nouvelle adresse (Formik + Yup)
   - Sélection radio button

2. **Méthode de Livraison**
   - Options: Standard (3-5j), Express (24-48h)
   - Prix et délai affichés
   - Radio button sélection

3. **Paiement**
   - CIB (carte bancaire)
   - Baridimob (paiement mobile)
   - Paiement à la livraison
   - Checkbox CGV
   - Bouton "Passer la commande"

4. **Confirmation**
   - Animation succès
   - Numéro commande
   - Récapitulatif
   - Bouton "Suivre ma commande"

**Gestion Paiement CIB/Baridimob**:
- WebView (react-native-webview)
- Redirection gateway
- Callback URL → vérification statut

---

### 10.6 Profil Utilisateur

**Écran Profile (connecté)**:
1. Header avec photo, nom, email
2. Menu Options:
   - Mes commandes (badge X en cours)
   - Mes adresses
   - Favoris (optionnel)
   - Paramètres (langue, notifications)
   - Aide & Support
   - À propos
   - Déconnexion

**Écran Profile (non connecté)**:
- Message "Connectez-vous"
- Boutons Login / Register
- Menu limité (Paramètres, Aide)

---

### 10.7 Mes Commandes

**Écran OrderList**:
- Tabs: En cours / Livrées / Annulées
- OrderCard: numéro, date, statut, total
- Query GraphQL pagination

**Écran OrderDetail**:
- Numéro commande + statut
- Timeline statuts (Passée → Préparation → Expédiée → Livrée)
- Informations livraison
- Articles commandés
- Récapitulatif prix
- Boutons: Contacter support

---

### 10.8 Paramètres

**Sections**:
1. **Langue**: Arabe / Français / Anglais
   - Changement immédiat avec I18nManager (RTL)
2. **Notifications**: Toggle (optionnel si pas de push)
3. **Compte**: Modifier mot de passe, Supprimer compte
4. **À propos**: Version, CGV, Politique confidentialité

---

## 11. Internationalisation (i18n)

### Configuration i18next

```typescript
// src/i18n/index.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import * as Updates from 'expo-updates';

import fr from './fr.json';
import ar from './ar.json';
import en from './en.json';

const LANGUAGE_KEY = 'app_language';

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v3',
    resources: {
      fr: { translation: fr },
      ar: { translation: ar },
      en: { translation: en },
    },
    lng: 'fr',
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false,
    },
  });

export const changeLanguage = async (language: string) => {
  await AsyncStorage.setItem(LANGUAGE_KEY, language);
  i18n.changeLanguage(language);

  const isRTL = language === 'ar';
  if (I18nManager.isRTL !== isRTL) {
    I18nManager.forceRTL(isRTL);
    await Updates.reloadAsync(); // Restart app for RTL change
  }
};

export default i18n;
```

### Fichiers de traduction

```json
// src/i18n/fr.json
{
  "common": {
    "add_to_cart": "Ajouter au panier",
    "buy_now": "Acheter maintenant",
    "price": "Prix",
    "quantity": "Quantité"
  },
  "auth": {
    "login": "Connexion",
    "register": "Inscription",
    "email": "Email",
    "password": "Mot de passe"
  },
  "cart": {
    "my_cart": "Mon panier",
    "empty_cart": "Votre panier est vide",
    "subtotal": "Sous-total",
    "total": "Total"
  }
}
```

```json
// src/i18n/ar.json (RTL)
{
  "common": {
    "add_to_cart": "أضف إلى السلة",
    "buy_now": "اشتري الآن",
    "price": "السعر",
    "quantity": "الكمية"
  },
  "auth": {
    "login": "تسجيل الدخول",
    "register": "إنشاء حساب",
    "email": "البريد الإلكتروني",
    "password": "كلمة المرور"
  }
}
```

---

## 12. Navigation

### RootNavigator.tsx

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../hooks/useAuth';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { LoadingScreen } from '../screens/LoadingScreen';

const Stack = createNativeStackNavigator();

export const RootNavigator: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <Stack.Screen name="Main" component={MainTabNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

### MainTabNavigator.tsx (Bottom Tabs)

```typescript
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { HomeScreen } from '../screens/home/HomeScreen';
import { CatalogScreen } from '../screens/catalog/CatalogScreen';
import { CartScreen } from '../screens/cart/CartScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { useCart } from '../hooks/useCart';

const Tab = createBottomTabNavigator();

export const MainTabNavigator: React.FC = () => {
  const { itemCount } = useCart();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Catalog') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName!} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2C3E50',
        tabBarInactiveTintColor: '#999',
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Accueil' }} />
      <Tab.Screen name="Catalog" component={CatalogScreen} options={{ title: 'Catalogue' }} />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{
          title: 'Panier',
          tabBarBadge: itemCount > 0 ? itemCount : undefined,
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profil' }} />
    </Tab.Navigator>
  );
};
```

---

## 13. Design & UI/UX

### Thème & Couleurs

```typescript
// src/theme/colors.ts
export const colors = {
  primary: '#2C3E50',      // Bleu marine
  secondary: '#E8D5C4',    // Beige/crème
  accent: '#C9A992',       // Terracotta
  background: '#F5F5F5',
  surface: '#FFFFFF',
  error: '#F44336',
  success: '#4CAF50',
  warning: '#FFC107',
  text: {
    primary: '#333333',
    secondary: '#666666',
    disabled: '#999999',
  },
  border: '#E0E0E0',
};
```

### Typography

```typescript
// src/theme/typography.ts
export const typography = {
  h1: {
    fontSize: 32,
    fontWeight: '700',
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
  },
};
```

### Safe Area & Notch

```typescript
import { SafeAreaView } from 'react-native-safe-area-context';

export const HomeScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Content */}
    </SafeAreaView>
  );
};
```

---

## 14. Animations

### Exemples avec Reanimated

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';

export const AnimatedButton: React.FC = () => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Text>Press Me</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};
```

---

## 15. Performance

### Stratégies d'Optimisation

1. **Images**:
   - Expo Image (cache intégré, WebP support)
   - Lazy loading
   - Thumbnails pour listes
   - Compression automatique

2. **Listes** (FlatList):
   ```typescript
   <FlatList
     data={products}
     renderItem={renderProductCard}
     keyExtractor={(item) => item.id}
     windowSize={10}
     maxToRenderPerBatch={10}
     removeClippedSubviews={true}
     initialNumToRender={10}
     getItemLayout={(data, index) => ({
       length: ITEM_HEIGHT,
       offset: ITEM_HEIGHT * index,
       index,
     })}
   />
   ```

3. **React.memo**:
   ```typescript
   export const ProductCard = React.memo<ProductCardProps>(
     ({ product }) => {
       // Component code
     },
     (prevProps, nextProps) => prevProps.product.id === nextProps.product.id
   );
   ```

4. **Apollo Cache**: InMemoryCache optimisé avec merge policies

---

## 16. Sécurité

### Mesures de Sécurité

1. **JWT Tokens**: Stockage sécurisé avec `expo-secure-store`
2. **HTTPS**: Toutes les requêtes GraphQL
3. **Validation**: Formik + Yup côté client + backend
4. **Sensitive Data**: Pas de console.log en production
5. **Code Obfuscation**: EAS Build avec obfuscation

```typescript
// Secure Token Storage
import * as SecureStore from 'expo-secure-store';

export const saveToken = async (token: string) => {
  await SecureStore.setItemAsync('jwt_token', token);
};

export const getToken = async () => {
  return await SecureStore.getItemAsync('jwt_token');
};

export const deleteToken = async () => {
  await SecureStore.deleteItemAsync('jwt_token');
};
```

---

## 17. Déploiement

### Build avec EAS (Expo Application Services)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build for iOS (simulator)
eas build --platform ios --profile development

# Build for Android (APK)
eas build --platform android --profile preview

# Build for production
eas build --platform all --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

### Environment Variables

```typescript
// app.config.js
export default {
  expo: {
    extra: {
      graphqlUrl: process.env.GRAPHQL_URL,
      eas: {
        projectId: "your-project-id"
      }
    }
  }
};
```

---

## 18. Testing (Non inclus pour le moment)

**Note**: Testing est **exclu** de la version initiale selon les exigences.

Peut être ajouté ultérieurement:
- Jest + React Native Testing Library
- Detox (E2E)
- Maestro (E2E alternative)

---

## 19. Dependencies

### package.json

```json
{
  "name": "oscar-mobile",
  "version": "1.0.0",
  "main": "node_modules/expo/AppEntry.js",
  "scripts": {
    "start": "expo start",
    "android": "expo start --android",
    "ios": "expo start --ios",
    "web": "expo start --web",
    "codegen": "graphql-codegen --config codegen.ts",
    "format": "prettier --write \"src/**/*.{ts,tsx,json}\""
  },
  "dependencies": {
    "expo": "~49.0.0",
    "expo-status-bar": "~1.6.0",
    "react": "18.2.0",
    "react-native": "0.72.6",
    "react-native-safe-area-context": "4.6.3",
    "react-native-screens": "~3.22.0",

    "@apollo/client": "^3.8.8",
    "graphql": "^16.8.1",

    "@react-navigation/native": "^6.1.9",
    "@react-navigation/native-stack": "^6.9.17",
    "@react-navigation/bottom-tabs": "^6.5.11",

    "formik": "^2.4.5",
    "yup": "^1.3.3",

    "i18next": "^23.7.6",
    "react-i18next": "^13.5.0",

    "expo-image": "~1.3.5",
    "expo-secure-store": "~12.3.1",
    "expo-constants": "~14.4.2",
    "expo-updates": "~0.18.17",
    "expo-location": "~16.1.0",

    "@react-native-async-storage/async-storage": "1.18.2",
    "react-native-webview": "13.2.2",
    "react-native-reanimated": "~3.3.0",
    "react-native-gesture-handler": "~2.12.0",
    "@expo/vector-icons": "^13.0.0",
    "react-native-reanimated-carousel": "^3.5.1"
  },
  "devDependencies": {
    "@babel/core": "^7.20.0",
    "@graphql-codegen/cli": "^5.0.0",
    "@graphql-codegen/client-preset": "^4.1.0",
    "@types/react": "~18.2.14",
    "typescript": "^5.1.3",
    "prettier": "^3.1.0"
  }
}
```

---

## 20. Livrables

### Documentation
- Guide d'installation développeur
- Guide de build (EAS)
- Guide de déploiement (App Store, Play Store)
- Documentation technique GraphQL
- Guide utilisateur (optionnel)

### Assets
- Fichiers .ipa (iOS)
- Fichiers .apk / .aab (Android)
- Screenshots stores (iPhone, iPad, Android)
- Descriptions multilingues (AR, FR, EN)

---

## 21. Notes Importantes

### Simplifications Version 2.0

**Fonctionnalités Retirées (pour le moment)**:
- ❌ Firebase Cloud Messaging (pas de push notifications)
- ❌ Mode offline complet (pas de cache persistant produits)
- ❌ Tests automatisés (Jest, Detox)
- ❌ CI/CD automatisé
- ❌ ESLint
- ❌ Git hooks

**Bénéfices**:
- ✅ Développement plus rapide avec Expo
- ✅ GraphQL type-safe avec code generation
- ✅ Build simplifié avec EAS
- ✅ Déploiement facilité
- ✅ Stack moderne et maintenable

---

**Version**: 2.0 (Updated Stack)
**Date**: Novembre 2025
**Statut**: Spécification technique détaillée
**Tech Stack**: Expo + GraphQL + Apollo Client + Formik
