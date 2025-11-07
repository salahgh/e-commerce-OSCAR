# Frontend Web - Spécifications Détaillées
## OSCAR Fashion E-commerce Platform

---

## 1. Vue d'ensemble

Le frontend web constitue l'interface client principale de la plateforme OSCAR Fashion. Il offre une expérience d'achat moderne, responsive et performante pour les utilisateurs desktop, tablette et mobile.

### Objectifs Principaux
- Créer une expérience utilisateur fluide et intuitive
- Implémenter un design moderne conforme à la charte graphique OSCAR
- Assurer une performance optimale (temps de chargement < 3s)
- Support multilingue (Arabe, Français, Anglais) avec RTL pour l'Arabe
- SEO optimisé pour un meilleur référencement
- Accessibilité (WCAG 2.1 niveau AA)

---

## 2. Stack Technique

### Core Framework
- **Bibliothèque**: React.js 18+
- **Build Tool**: Vite ou Create React App
- **Langage**: TypeScript (recommandé) ou JavaScript ES6+
- **Package Manager**: npm ou yarn

### UI & Styling
- **Component Library**: Material-UI (MUI) v5
- **Styling**:
  - Emotion (MUI default)
  - CSS Modules (optionnel)
  - Styled Components (alternative)
- **Icônes**: Material Icons, React Icons
- **Animations**: Framer Motion ou React Spring

### State Management
- **Global State**: Redux Toolkit ou Zustand
- **Server State**: React Query (TanStack Query)
- **Context API**: Pour thèmes et i18n

### Routing & Navigation
- **Router**: React Router v6
- **Code Splitting**: React.lazy + Suspense
- **SEO**: React Helmet Async

### Formulaires & Validation
- **Formulaires**: React Hook Form
- **Validation**: Yup ou Zod
- **Date/Time**: date-fns ou Day.js

### API & Communication
- **HTTP Client**: Axios
- **WebSocket**: socket.io-client (notifications temps réel)
- **API Integration**: React Query pour le caching

### Internationalisation
- **i18n**: react-i18next
- **RTL Support**: MUI RTL configuration
- **Format**: i18next JSON files

### Optimisation & Performance
- **Images**: react-image-lazy-load, WebP format
- **Compression**: Image optimization (sharp)
- **Caching**: Service Workers (PWA)
- **Bundle Optimization**: Code splitting, tree shaking

### Testing
- **Unit Tests**: Jest + React Testing Library
- **E2E Tests**: Cypress ou Playwright
- **Coverage**: > 70%

### DevOps & Qualité
- **Linting**: ESLint + Prettier
- **Git Hooks**: Husky + lint-staged
- **CI/CD**: GitHub Actions / GitLab CI

---

## 3. Architecture Frontend

### Structure du Projet

```
oscar-frontend/
├── public/
│   ├── locales/           # Fichiers de traduction
│   │   ├── ar/
│   │   ├── fr/
│   │   └── en/
│   ├── images/
│   └── index.html
├── src/
│   ├── assets/            # Images, fonts, icons
│   ├── components/        # Composants réutilisables
│   │   ├── common/       # Button, Input, Card, etc.
│   │   ├── layout/       # Header, Footer, Navbar
│   │   └── product/      # ProductCard, ProductGrid
│   ├── features/          # Features modulaires
│   │   ├── auth/
│   │   ├── cart/
│   │   ├── checkout/
│   │   ├── products/
│   │   └── user/
│   ├── pages/             # Pages principales
│   │   ├── HomePage/
│   │   ├── ProductPage/
│   │   ├── CartPage/
│   │   ├── CheckoutPage/
│   │   └── ProfilePage/
│   ├── hooks/             # Custom hooks
│   ├── services/          # API calls
│   ├── store/             # Redux/Zustand store
│   ├── routes/            # Configuration routing
│   ├── utils/             # Fonctions utilitaires
│   ├── constants/         # Constantes
│   ├── theme/             # MUI theme configuration
│   ├── types/             # TypeScript types
│   ├── App.tsx
│   └── index.tsx
├── .env.development
├── .env.production
├── package.json
└── tsconfig.json
```

---

## 4. Pages & Fonctionnalités

### 4.1 Page d'Accueil

#### Composants
- **Hero Section**: Bannière principale avec slider
- **Featured Products**: Produits mis en avant
- **New Arrivals**: Nouvelles collections
- **Categories Grid**: Grille des catégories
- **Promotions Banner**: Bannières promotionnelles
- **Newsletter**: Inscription newsletter

#### Fonctionnalités
- Slider automatique (autoplay)
- Lazy loading des images
- Personnalisation (si utilisateur connecté)
- Responsive design (mobile, tablet, desktop)

#### Performance
- Above-the-fold optimization
- Preload critical assets
- Defer non-critical JS
- Image optimization (WebP, lazy load)

---

### 4.2 Catalogue Produits

#### Composants
- **Product Grid**: Grille de produits
- **Product Card**: Carte produit (image, nom, prix, CTA)
- **Filters Sidebar**: Filtres (catégorie, prix, taille, couleur)
- **Sort Options**: Tri (pertinence, prix, nouveauté)
- **Pagination**: Navigation pages
- **Breadcrumb**: Fil d'Ariane

#### Fonctionnalités
- Recherche en temps réel (debounce)
- Filtrage multi-critères
- Tri dynamique
- Pagination ou infinite scroll
- Vue grille/liste
- Quick view produit (modal)
- Ajout rapide au panier

#### États
```typescript
interface CatalogState {
  products: Product[];
  filters: {
    categories: string[];
    priceRange: [number, number];
    sizes: string[];
    colors: string[];
  };
  sort: 'relevance' | 'price_asc' | 'price_desc' | 'newest';
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  loading: boolean;
  error: string | null;
}
```

---

### 4.3 Page Détail Produit

#### Composants
- **Product Images Gallery**: Galerie photos (zoom, lightbox)
- **Product Info**: Nom, prix, description
- **Variants Selector**: Sélection taille, couleur
- **Quantity Selector**: Sélecteur quantité
- **Add to Cart Button**: Bouton ajout panier
- **Product Tabs**: Tabs (description, caractéristiques, avis)
- **Related Products**: Produits similaires
- **Breadcrumb**: Fil d'Ariane

#### Fonctionnalités
- Galerie d'images interactive
- Zoom sur image
- Sélection de variantes (taille, couleur)
- Vérification stock en temps réel
- Ajout au panier avec animation
- Wishlist (favoris)
- Partage social

#### États
```typescript
interface ProductDetailState {
  product: Product | null;
  selectedVariant: {
    size?: string;
    color?: string;
  };
  quantity: number;
  inStock: boolean;
  loading: boolean;
  error: string | null;
}
```

---

### 4.4 Recherche

#### Composants
- **Search Bar**: Barre de recherche
- **Search Suggestions**: Suggestions (autocomplete)
- **Search Results**: Résultats de recherche
- **Filters**: Filtres de recherche

#### Fonctionnalités
- Autocomplete avec debounce
- Recherche en temps réel
- Historique de recherche (localStorage)
- Suggestions intelligentes
- Filtrage des résultats
- Highlighting des termes recherchés

---

### 4.5 Panier

#### Composants
- **Cart Items List**: Liste articles
- **Cart Item**: Article (image, nom, variante, quantité, prix)
- **Quantity Controls**: Augmenter/diminuer quantité
- **Remove Button**: Supprimer article
- **Cart Summary**: Récapitulatif (sous-total, livraison, total)
- **Promo Code**: Champ code promo
- **Checkout Button**: Bouton passer commande

#### Fonctionnalités
- Mise à jour quantité en temps réel
- Suppression d'article avec confirmation
- Calcul automatique du total
- Application de code promo
- Vérification stock avant checkout
- Persistance du panier (localStorage + backend)
- Panier invité (localStorage)
- Merge panier lors de la connexion

#### États
```typescript
interface CartState {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  promoCode: string | null;
  loading: boolean;
  error: string | null;
}

interface CartItem {
  id: string;
  productId: string;
  name: string;
  image: string;
  variant: {
    size?: string;
    color?: string;
  };
  quantity: number;
  unitPrice: number;
  total: number;
}
```

---

### 4.6 Tunnel de Commande (Checkout)

#### Étapes
1. **Informations de livraison**
2. **Méthode de livraison**
3. **Méthode de paiement**
4. **Confirmation**

#### Composants
- **Stepper**: Indicateur d'étape
- **Shipping Form**: Formulaire adresse de livraison
- **Shipping Method Selector**: Choix mode livraison
- **Payment Method Selector**: Choix mode paiement
- **Order Summary**: Récapitulatif commande
- **Terms Checkbox**: Acceptation CGV
- **Place Order Button**: Bouton validation

#### Fonctionnalités
- Navigation entre étapes
- Sauvegarde des étapes
- Validation à chaque étape
- Récapitulatif persistant
- Adresses sauvegardées (utilisateur connecté)
- Calcul frais de livraison
- Sécurisation (HTTPS, validation)

#### États
```typescript
interface CheckoutState {
  step: number;
  shippingAddress: Address;
  billingAddress: Address;
  shippingMethod: 'standard' | 'express';
  paymentMethod: 'cib' | 'baridimob' | 'cod';
  termsAccepted: boolean;
  loading: boolean;
  error: string | null;
}
```

---

### 4.7 Authentification

#### Pages
- **Login**: Connexion
- **Register**: Inscription
- **Forgot Password**: Mot de passe oublié
- **Reset Password**: Réinitialisation
- **Email Verification**: Vérification email

#### Composants
- **Login Form**: Email + mot de passe
- **Register Form**: Inscription complète
- **Social Login**: Connexion Google/Facebook (optionnel)
- **Password Strength Indicator**: Indicateur force MDP

#### Fonctionnalités
- Validation en temps réel
- Messages d'erreur clairs
- Redirection après connexion
- Persistance session (JWT dans localStorage/cookie)
- Auto-login (remember me)
- Protection routes privées

#### États
```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'customer' | 'admin';
}
```

---

### 4.8 Profil Utilisateur

#### Sections
- **Informations personnelles**
- **Mes adresses**
- **Historique des commandes**
- **Mes favoris** (optionnel)
- **Paramètres**

#### Composants
- **Profile Form**: Modification profil
- **Address List**: Liste adresses
- **Address Form**: Ajout/modification adresse
- **Order History**: Liste commandes
- **Order Details**: Détails commande

#### Fonctionnalités
- Modification des informations
- Gestion des adresses multiples
- Consultation de l'historique
- Suivi de commande
- Téléchargement facture PDF
- Annulation de commande (si autorisée)

---

### 4.9 Confirmation de Commande

#### Composants
- **Success Message**: Message de succès
- **Order Number**: Numéro de commande
- **Order Summary**: Récapitulatif
- **Next Steps**: Prochaines étapes
- **Continue Shopping Button**: Bouton continuer achats

#### Fonctionnalités
- Affichage des détails de commande
- Envoi email de confirmation
- Téléchargement facture
- Tracking (si disponible)

---

## 5. Composants Communs Réutilisables

### 5.1 Layout Components

#### Header
```tsx
<Header>
  <TopBar />      // Livraison gratuite, langues, devises
  <MainNav>       // Logo, recherche, navigation
    <Logo />
    <SearchBar />
    <Navigation />
    <IconButtons>  // Compte, favoris, panier
      <AccountIcon />
      <WishlistIcon />
      <CartIcon badge={itemCount} />
    </IconButtons>
  </MainNav>
  <CategoryNav /> // Navigation catégories (optionnel)
</Header>
```

#### Footer
```tsx
<Footer>
  <FooterTop>
    <CompanyInfo />
    <QuickLinks />
    <CustomerService />
    <Newsletter />
  </FooterTop>
  <FooterBottom>
    <Copyright />
    <PaymentMethods />
    <SocialLinks />
  </FooterBottom>
</Footer>
```

---

### 5.2 UI Components

- **Button**: Variants (primary, secondary, outlined, text)
- **Input**: Text, email, password, number
- **Select**: Dropdown
- **Checkbox**: Case à cocher
- **Radio**: Bouton radio
- **Switch**: Interrupteur
- **Badge**: Pastille de notification
- **Chip**: Étiquette
- **Alert**: Message d'alerte
- **Snackbar**: Toast notification
- **Dialog**: Modal
- **Drawer**: Panneau latéral
- **Breadcrumb**: Fil d'Ariane
- **Pagination**: Pagination
- **Tabs**: Onglets
- **Stepper**: Indicateur d'étapes
- **Skeleton**: Loading placeholder
- **Spinner**: Loader

---

### 5.3 Product Components

- **ProductCard**: Carte produit
- **ProductGrid**: Grille de produits
- **ProductList**: Liste de produits
- **ProductImage**: Image produit avec lazy load
- **ProductPrice**: Prix avec ancien prix barré
- **ProductRating**: Notation étoiles
- **ProductBadge**: Badge (Nouveau, Promo, Rupture)
- **AddToCartButton**: Bouton ajout panier
- **QuantitySelector**: Sélecteur quantité

---

## 6. Thème & Design System

### 6.1 Charte Graphique

#### Palette de Couleurs
```typescript
const theme = {
  palette: {
    primary: {
      main: '#2C3E50',      // Bleu marine
      light: '#3F5568',
      dark: '#1F2D3D',
    },
    secondary: {
      main: '#E8D5C4',      // Beige/crème
      light: '#F0E4D7',
      dark: '#D4C3B0',
    },
    accent: {
      main: '#C9A992',      // Terracotta/sable
      light: '#D9BCA9',
      dark: '#B8957D',
    },
    neutral: {
      main: '#F5F5F5',      // Gris clair
      light: '#FAFAFA',
      dark: '#E0E0E0',
    },
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FF9800',
    info: '#2196F3',
  },
  typography: {
    fontFamily: '"Roboto", "Arial", sans-serif',
    h1: { fontSize: '2.5rem', fontWeight: 600 },
    h2: { fontSize: '2rem', fontWeight: 600 },
    h3: { fontSize: '1.75rem', fontWeight: 500 },
    body1: { fontSize: '1rem', lineHeight: 1.5 },
    button: { textTransform: 'none' },
  },
  spacing: 8, // Base spacing unit
  shape: {
    borderRadius: 8,
  },
};
```

---

### 6.2 Responsive Breakpoints

```typescript
const breakpoints = {
  xs: 0,       // Mobile
  sm: 600,     // Tablet
  md: 960,     // Laptop
  lg: 1280,    // Desktop
  xl: 1920,    // Large Desktop
};
```

---

### 6.3 Support RTL (Arabe)

```typescript
import { createTheme } from '@mui/material/styles';
import { prefixer } from 'stylis';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';

// Configuration RTL
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

// Utilisation
<CacheProvider value={cacheRtl}>
  <ThemeProvider theme={themeRtl}>
    <App />
  </ThemeProvider>
</CacheProvider>
```

---

## 7. Internationalisation (i18n)

### Configuration

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'fr',
    supportedLngs: ['ar', 'fr', 'en'],
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    interpolation: {
      escapeValue: false,
    },
  });
```

### Structure des Fichiers
```
/public/locales/
├── ar/
│   ├── common.json
│   ├── products.json
│   ├── cart.json
│   └── checkout.json
├── fr/
│   └── ...
└── en/
    └── ...
```

---

## 8. Gestion d'État

### Redux Toolkit (Exemple)

```typescript
// store/slices/cartSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CartState {
  items: CartItem[];
  total: number;
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], total: 0 } as CartState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      state.items.push(action.payload);
      state.total = calculateTotal(state.items);
    },
    removeItem: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.total = calculateTotal(state.items);
    },
    updateQuantity: (state, action: PayloadAction<{id: string, quantity: number}>) => {
      const item = state.items.find(i => i.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
        state.total = calculateTotal(state.items);
      }
    },
  },
});
```

---

## 9. Performance & Optimisation

### Stratégies

1. **Code Splitting**
```tsx
const ProductPage = React.lazy(() => import('./pages/ProductPage'));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage'));
```

2. **Image Optimization**
- Format WebP avec fallback
- Lazy loading
- Responsive images (srcset)
- CDN pour les images

3. **Caching**
- React Query pour cache API
- Service Workers (PWA)
- localStorage pour panier invité

4. **Bundle Optimization**
- Tree shaking
- Minification
- Compression (gzip/brotli)
- Vendor splitting

5. **Performance Monitoring**
- Web Vitals (LCP, FID, CLS)
- Lighthouse CI
- Bundle analyzer

---

## 10. SEO

### Métadonnées

```tsx
import { Helmet } from 'react-helmet-async';

<Helmet>
  <title>OSCAR Fashion - Vêtements de Mode en Algérie</title>
  <meta name="description" content="..." />
  <meta property="og:title" content="..." />
  <meta property="og:image" content="..." />
  <link rel="canonical" href="..." />
</Helmet>
```

### Stratégies
- URLs SEO-friendly (slugs)
- Sitemap.xml
- Robots.txt
- Structured data (JSON-LD)
- Open Graph tags
- Alt tags sur images
- Semantic HTML

---

## 11. Accessibilité (A11y)

### Standards WCAG 2.1 AA

- Contraste de couleurs (4.5:1 minimum)
- Navigation au clavier
- Aria labels
- Focus visible
- Alt text sur images
- Formulaires accessibles
- Lecteurs d'écran compatibles

---

## 12. Sécurité

- **XSS Protection**: Sanitisation des inputs
- **CSRF Protection**: Tokens CSRF
- **HTTPS Only**: Toutes les communications
- **Content Security Policy**: CSP headers
- **Secure Storage**: JWT dans httpOnly cookies
- **Input Validation**: Client-side + server-side
- **Rate Limiting**: Anti-spam

---

## 13. Tests

### Types de Tests

```typescript
// Test unitaire (Jest + RTL)
describe('ProductCard', () => {
  it('renders product information correctly', () => {
    render(<ProductCard product={mockProduct} />);
    expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
  });
});

// Test d'intégration
describe('Add to Cart flow', () => {
  it('adds product to cart and updates badge', async () => {
    // Test flow complet
  });
});

// Test E2E (Cypress)
describe('Checkout flow', () => {
  it('completes purchase successfully', () => {
    cy.visit('/products');
    cy.contains('Acheter').click();
    // ... suite du test
  });
});
```

---

## 14. Documentation

### Livrables
- Storybook pour composants
- Documentation technique
- Guide de style
- Guide de contribution
- README complet

---

**Version**: 1.0
**Date**: Novembre 2025
**Statut**: Spécification technique détaillée
