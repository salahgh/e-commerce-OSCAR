# SPECIFICATIONS TECHNIQUES ET FONCTIONNELLES
## Plateforme E-commerce OSCAR Fashion

---

**Version**: 2.0
**Date**: Novembre 2025
**Référence**: SPEC-OSCAR-2025-002

---

# TABLE DES MATIERES

1. [Vue d'ensemble du Projet](#1-vue-densemble-du-projet)
2. [Spécifications Fonctionnelles](#2-specifications-fonctionnelles)
3. [Livrables Designer](#3-livrables-designer)
4. [Livrables Développeur](#4-livrables-developpeur)

---

# 1. VUE D'ENSEMBLE DU PROJET

## 1.1 Présentation

OSCAR Fashion développe une **solution e-commerce complète et moderne** comprenant:
- Une plateforme web responsive (desktop et mobile)
- Des applications mobiles natives (iOS et Android)
- Un back-office d'administration complet
- Une API backend robuste et sécurisée

## 1.2 Objectifs Business

- Digitaliser l'activité de vente OSCAR Fashion
- Offrir une expérience client moderne et fluide
- Augmenter la portée commerciale (web + mobile)
- Faciliter la gestion administrative via back-office
- Intégrer les moyens de paiement algériens (CIB, Baridimob, COD)

## 1.3 Périmètre du Projet

### Composants à Développer

| Composant | Description |
|-----------|-------------|
| **Backend API** | API GraphQL avec Spring Boot |
| **Frontend Web** | Application Next.js 15 |
| **Back-Office** | Interface admin React.js |
| **Mobile** | Applications iOS et Android (Expo) |

### Langues Supportées
- Arabe (avec support RTL complet)
- Français
- Anglais

---

# 2. SPECIFICATIONS FONCTIONNELLES

## 2.1 Module Authentification & Utilisateurs

### Fonctionnalités

| Fonctionnalité | Description |
|----------------|-------------|
| **Inscription** | Email/mot de passe avec validation email |
| **Connexion** | JWT avec refresh token |
| **Déconnexion** | Invalidation du token |
| **Profil utilisateur** | Consultation et modification des informations |
| **Gestion des adresses** | CRUD adresses de livraison (multiple) |
| **Mot de passe oublié** | Reset via email sécurisé |
| **Historique commandes** | Liste complète avec détails |

---

## 2.2 Module Catalogue Produits

### 2.2.1 Gestion des Produits

| Fonctionnalité | Description |
|----------------|-------------|
| **CRUD Produits** | Création, lecture, modification, suppression |
| **Support multilingue** | Titres et descriptions en AR/FR/EN |
| **Images multiples** | Galerie avec image principale |
| **Variantes** | Gestion taille, couleur, matière |
| **Prix et promotions** | Prix de base, prix promo, dates de validité |
| **Stock** | Quantité par variante |
| **Statut** | Actif, inactif, rupture |
| **SEO** | Meta title, description, slug |

### 2.2.2 Gestion des Catégories

| Fonctionnalité | Description |
|----------------|-------------|
| **Hiérarchie** | Catégories et sous-catégories (3 niveaux max) |
| **Multilingue** | Noms en AR/FR/EN |
| **Images** | Image de catégorie pour affichage |
| **Ordre d'affichage** | Position personnalisable |
| **Slug SEO** | URL friendly automatique |

### 2.2.3 Attributs Produits

| Attribut | Type | Valeurs |
|----------|------|---------|
| **Taille** | Liste | XS, S, M, L, XL, XXL, etc. |
| **Couleur** | Liste + Code hex | Noir (#000), Blanc (#FFF), etc. |
| **Matière** | Liste | Coton, Polyester, Lin, etc. |
| **Genre** | Liste | Homme, Femme, Enfant, Unisexe |

### 2.2.4 Recherche et Filtrage

| Fonctionnalité | Description |
|----------------|-------------|
| **Recherche textuelle** | Full-text search sur titre, description |
| **Filtres multiples** | Catégorie, prix, taille, couleur, disponibilité |
| **Tri** | Pertinence, prix (asc/desc), nouveauté, popularité |
| **Pagination** | Offset ou cursor-based |
| **Auto-complétion** | Suggestions de recherche |

---

## 2.3 Module Panier & Commandes

### 2.3.1 Panier d'Achat

| Fonctionnalité | Description |
|----------------|-------------|
| **Ajout au panier** | Produit + variante + quantité |
| **Modification quantité** | Incrémentation/décrémentation |
| **Suppression article** | Retrait individuel |
| **Persistance** | LocalStorage (guest) + Backend (connecté) |
| **Fusion panier** | Merge à la connexion |
| **Code promo** | Application et validation |
| **Calcul automatique** | Sous-total, remise, livraison, total |

### 2.3.2 Processus de Commande (Checkout)

**Étape 1: Adresse de Livraison**
- Sélection adresse existante
- Ajout nouvelle adresse
- Formulaire: Nom, Prénom, Téléphone, Adresse, Wilaya, Commune

**Étape 2: Méthode de Livraison**
- Livraison standard
- Livraison express (si disponible)
- Affichage délais et frais

**Étape 3: Méthode de Paiement**
- CIB (Carte Interbancaire)
- Baridimob (QR Code / Transfert)
- Paiement à la livraison (COD)

**Étape 4: Confirmation**
- Récapitulatif complet
- CGV à accepter
- Bouton de validation

### 2.3.3 Workflow Commandes

```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
    ↓         ↓           ↓           ↓
CANCELLED  CANCELLED  CANCELLED   RETURNED
```

| Statut | Description |
|--------|-------------|
| **PENDING** | Commande créée, en attente de paiement |
| **CONFIRMED** | Paiement validé |
| **PROCESSING** | En préparation |
| **SHIPPED** | Expédiée, numéro de suivi disponible |
| **DELIVERED** | Livrée |
| **CANCELLED** | Annulée (client ou admin) |
| **RETURNED** | Retournée |

---

## 2.4 Module Paiements

### 2.4.1 Passerelles Intégrées

| Passerelle | Type | Flux |
|------------|------|------|
| **CIB** | Carte bancaire | Redirection vers page sécurisée CIB |
| **Baridimob** | Mobile wallet | QR Code ou transfert direct |
| **COD** | Cash | Paiement à la livraison |

### 2.4.2 Sécurité Paiements

- HTTPS obligatoire
- Aucune donnée carte stockée
- Logs de transactions sécurisés
- Vérification des callbacks (signature)
- Timeout sur transactions en attente

---

## 2.5 Module Reporting

### 2.5.1 Rapports Disponibles

| Rapport | Description | Format |
|---------|-------------|--------|
| **Ventes journalières** | Résumé des ventes du jour | Dashboard + export CSV |
| **Ventes période** | Ventes sur période personnalisée | Dashboard + export CSV |
| **Top produits** | Produits les plus vendus | Dashboard + export CSV |
| **Clients actifs** | Analyse comportement clients | Dashboard |
| **Stock faible** | Alertes rupture de stock | Dashboard |

### 2.5.2 Documents PDF Générés

> _Hors périmètre — non inclus dans la livraison._

---

## 2.6 Fonctionnalités par Plateforme

### 2.6.1 Frontend Web (Next.js)

#### Pages

| Page | Fonctionnalités |
|------|-----------------|
| **Accueil** | Hero slider, featured products, catégories, promotions |
| **Catalogue** | Grille produits, filtres, tri, pagination |
| **Produit** | Galerie, variantes, add to cart, produits similaires |
| **Panier** | Liste articles, modification, code promo, récap |
| **Checkout** | 4 étapes, formulaires, paiement |
| **Profil** | Informations, adresses, commandes |
| **Connexion/Inscription** | Formulaires auth |
| **Contact** | Formulaire, carte |
| **Pages légales** | CGV, confidentialité |

### 2.6.2 Back-Office (React)

#### Modules

| Module | Fonctionnalités |
|--------|-----------------|
| **Dashboard** | KPIs temps réel, graphiques ventes, alertes |
| **Produits** | CRUD, import/export, gestion images |
| **Catégories** | Gestion hiérarchique, drag & drop |
| **Commandes** | Liste, détail, changement statut |
| **Clients** | Liste, détail, historique, blocage |
| **Promotions** | CRUD codes promo, validité |
| **Rapports** | Génération, export CSV |
| **Utilisateurs** | CRUD admins, rôles, permissions |
| **Paramètres** | Configuration système, intégrations |

#### Dashboard - KPIs Affichés

- Chiffre d'affaires (jour/semaine/mois)
- Nombre de commandes
- Panier moyen
- Nouveaux clients
- Taux de conversion
- Produits en rupture

### 2.6.3 Application Mobile (Expo)

#### Écrans

| Écran | Fonctionnalités |
|-------|-----------------|
| **Home** | Hero slider, featured, catégories, pull-to-refresh |
| **Catalogue** | Grille 2 colonnes, filtres bottom sheet, infinite scroll |
| **Produit** | Galerie swipe, zoom, variantes, add to cart |
| **Panier** | Liste, swipe-to-delete, code promo |
| **Checkout** | 4 étapes, WebView paiement |
| **Profil** | Infos, adresses, commandes, paramètres |
| **Recherche** | Barre de recherche, historique, suggestions |
| **Login/Register** | Formulaires, erreurs |
| **Notifications** | Liste |
| **Settings** | Langue, préférences |

---

# 3. LIVRABLES DESIGNER

## 3.1 Design System

| Composant | Description | Format |
|-----------|-------------|--------|
| **Style Guide** | Couleurs, typographie, spacing, grilles | Figma |
| **Component Library** | Tous les composants UI réutilisables | Figma |
| **Icon Set** | Icônes personnalisées/sélectionnées | Figma + SVG |
| **Brand Guidelines** | Application de la marque OSCAR | Document PDF |

## 3.2 Composants UI à Designer

| Catégorie | Composants |
|-----------|------------|
| **Navigation** | Header, footer, menu mobile, breadcrumb, tabs |
| **Boutons** | Primary, secondary, ghost, icon buttons, FAB |
| **Formulaires** | Input, textarea, select, checkbox, radio, switch |
| **Cards** | Product card, order card, address card |
| **Modals** | Alert, confirm, form modal, lightbox |
| **Feedback** | Toast, snackbar, loading spinner, skeleton |
| **Data display** | Table, list, badge, tag, avatar |
| **Charts** | Line, bar, pie (Back-office) |

## 3.3 Maquettes Haute Fidélité - Frontend Web

| Page | États/Variantes | Responsive |
|------|-----------------|------------|
| **Homepage** | Default, avec promo | Desktop, Tablet, Mobile |
| **Catalogue** | Default, filtres ouverts, empty state | Desktop, Tablet, Mobile |
| **Page produit** | Default, rupture, promo | Desktop, Tablet, Mobile |
| **Panier** | Rempli, vide, avec promo | Desktop, Tablet, Mobile |
| **Checkout - Adresse** | Default, ajout adresse | Desktop, Tablet, Mobile |
| **Checkout - Livraison** | Default | Desktop, Tablet, Mobile |
| **Checkout - Paiement** | CIB, Baridimob, COD | Desktop, Tablet, Mobile |
| **Checkout - Confirmation** | Default | Desktop, Tablet, Mobile |
| **Profil - Informations** | View, edit | Desktop, Tablet, Mobile |
| **Profil - Adresses** | Liste, ajout/edit | Desktop, Tablet, Mobile |
| **Profil - Commandes** | Liste, détail | Desktop, Tablet, Mobile |
| **Login** | Default, erreur | Desktop, Tablet, Mobile |
| **Register** | Default, erreur | Desktop, Tablet, Mobile |
| **Forgot Password** | Default | Desktop, Tablet, Mobile |
| **Contact** | Default, success | Desktop, Tablet, Mobile |
| **404** | Default | Desktop, Tablet, Mobile |

**Total estimé: ~60 écrans (Desktop + Tablet + Mobile)**

## 3.4 Maquettes Haute Fidélité - Back-Office

| Page | États/Variantes |
|------|-----------------|
| **Dashboard** | Default, alertes |
| **Liste produits** | Default, filtres, empty |
| **Formulaire produit** | Création, édition |
| **Liste catégories** | Default, drag mode |
| **Liste commandes** | Default, filtres |
| **Détail commande** | Default, états différents |
| **Liste clients** | Default, filtres |
| **Détail client** | Default |
| **Codes promo** | Liste, formulaire |
| **Rapports** | Dashboard, export |
| **Utilisateurs admin** | Liste, formulaire |
| **Paramètres** | Différents onglets |
| **Login admin** | Default, erreur |

**Total estimé: ~25 écrans**

## 3.5 Maquettes Haute Fidélité - Mobile

| Écran | États/Variantes |
|-------|-----------------|
| **Splash screen** | Default |
| **Onboarding** | 3-4 slides |
| **Home** | Default, loading |
| **Catalogue** | Default, filtres open |
| **Produit** | Default, rupture |
| **Panier** | Rempli, vide |
| **Checkout (4 étapes)** | Tous états |
| **Profil** | Toutes sections |
| **Recherche** | Default, résultats, empty |
| **Login/Register** | Default, erreurs |
| **Notifications** | Liste |
| **Settings** | Default |

**Total estimé: ~35 écrans**

## 3.6 Handoff et Assets

### 3.6.1 Export et Spécifications

| Livrable | Format | Description |
|----------|--------|-------------|
| **Assets images** | PNG, SVG, WebP | Toutes les images optimisées |
| **Icons** | SVG | Set complet d'icônes |
| **Specs développeurs** | Figma | Inspect mode activé, mesures, couleurs |
| **Documentation composants** | Notion/Confluence | Guide d'utilisation des composants |

### 3.6.2 Assets à Exporter

| Type | Formats | Résolutions |
|------|---------|-------------|
| **Logo** | SVG, PNG | 1x, 2x, 3x |
| **Favicon** | ICO, PNG | 16, 32, 180, 192, 512 |
| **OG Images** | PNG, JPG | 1200x630 |
| **App Icons** | PNG | iOS: toutes tailles, Android: toutes tailles |
| **Splash screens** | PNG | iOS: toutes tailles, Android: toutes tailles |
| **Illustrations** | SVG, PNG | 1x, 2x |
| **Placeholders** | PNG | Product, Avatar, Category |

## 3.7 Récapitulatif Livrables Designer

| Livrable | Quantité |
|----------|----------|
| Design System complet | 1 |
| Maquettes Web HD | ~60 |
| Maquettes Back-Office HD | ~25 |
| Maquettes Mobile HD | ~35 |
| Package assets | 1 |
| Documentation | 1 |

---

# 4. LIVRABLES DEVELOPPEUR

## 4.1 Backend API

### 4.1.1 Code Source

| Livrable | Description |
|----------|-------------|
| **Repository Git** | Code source complet, historique git |
| **Structure projet** | Architecture Spring Boot standard |
| **Configuration** | Fichiers properties/yaml pour tous environnements |
| **Docker** | Dockerfile + docker-compose.yml |
| **Scripts SQL** | Migrations et seeds |

### 4.1.2 Modules à Développer

| Module | Entités | Queries/Mutations GraphQL |
|--------|---------|---------------------------|
| **Auth** | User, Role, Permission | login, register, refreshToken, forgotPassword, resetPassword |
| **Users** | User, Address | getMe, updateProfile, getAddresses, createAddress, updateAddress, deleteAddress |
| **Products** | Product, Category, Attribute, Variant, Image | getProducts, getProduct, getCategories, searchProducts |
| **Cart** | Cart, CartItem | getCart, addToCart, updateCartItem, removeFromCart, clearCart |
| **Orders** | Order, OrderItem, Payment | createOrder, getOrders, getOrder, cancelOrder |
| **Payments** | Payment, Transaction | initPayment, confirmPayment, getPaymentStatus |
| **Notifications** | Notification, EmailTemplate | getNotifications, markAsRead |
| **Admin** | - | createProduct, updateProduct, deleteProduct, updateOrderStatus, getStats, etc. |
| **Sync** | SyncLog | syncProducts, syncStock, getOrdersForSync, updateSyncStatus |

### 4.1.3 API Documentation

| Livrable | Description |
|----------|-------------|
| **GraphQL Playground** | Interface interactive de test |
| **GraphQL Voyager** | Visualisation du schéma |
| **Schema SDL** | Export du schéma GraphQL |
| **Postman Collection** | Pour tests manuels (webhooks) |

### 4.1.4 Documentation Technique

| Document | Contenu |
|----------|---------|
| **README.md** | Setup, configuration, démarrage |
| **ARCHITECTURE.md** | Structure, patterns, décisions |
| **API.md** | Documentation endpoints |
| **DEPLOYMENT.md** | Guide déploiement |
| **ENV.example** | Variables d'environnement requises |

---

## 4.2 Frontend Web (Next.js)

### 4.2.1 Code Source

| Livrable | Description |
|----------|-------------|
| **Repository Git** | Code source complet |
| **Structure Next.js** | App Router, pages, components |
| **Configuration** | next.config.js, tailwind.config.js |
| **Types GraphQL** | Générés automatiquement |

### 4.2.2 Pages à Développer

| Route | Composants Principaux |
|-------|----------------------|
| `/` | HomePage (Hero, FeaturedProducts, Categories) |
| `/[locale]` | Layout avec i18n |
| `/products` | ProductList, Filters, Pagination |
| `/products/[slug]` | ProductDetail, Gallery, AddToCart |
| `/cart` | CartList, CartSummary, PromoCode |
| `/checkout` | CheckoutWizard (4 steps) |
| `/checkout/success` | OrderConfirmation |
| `/profile` | ProfileLayout, Tabs |
| `/profile/orders` | OrderList, OrderDetail |
| `/profile/addresses` | AddressList, AddressForm |
| `/login` | LoginForm |
| `/register` | RegisterForm |
| `/forgot-password` | ForgotPasswordForm |
| `/reset-password` | ResetPasswordForm |
| `/contact` | ContactForm, Map |
| `/cgv`, `/privacy` | StaticContent |

### 4.2.3 Composants Réutilisables

| Catégorie | Composants |
|-----------|------------|
| **Layout** | Header, Footer, Navigation, MobileMenu, Breadcrumb |
| **Products** | ProductCard, ProductGrid, QuickView, VariantSelector |
| **Cart** | CartIcon, CartDrawer, CartItem, PriceSummary |
| **Forms** | Input, Select, Checkbox, Button, FormError |
| **UI** | Modal, Toast, Spinner, Skeleton, Badge |
| **SEO** | MetaTags, JsonLd, Sitemap |

### 4.2.4 Documentation

| Document | Contenu |
|----------|---------|
| **README.md** | Setup, scripts, déploiement |
| **COMPONENTS.md** | Documentation composants |
| **STRUCTURE.md** | Architecture projet |

---

## 4.3 Back-Office (React)

### 4.3.1 Code Source

| Livrable | Description |
|----------|-------------|
| **Repository Git** | Code source complet |
| **Structure Vite** | src/, components/, pages/, store/ |
| **Configuration** | vite.config.ts, tailwind.config.js |

### 4.3.2 Pages à Développer

| Route | Composants Principaux |
|-------|----------------------|
| `/login` | AdminLoginForm |
| `/dashboard` | StatsCards, SalesChart, RecentOrders, LowStockAlert |
| `/products` | ProductsTable, ProductFilters |
| `/products/new` | ProductForm |
| `/products/:id/edit` | ProductForm (edit mode) |
| `/categories` | CategoriesTree, CategoryForm |
| `/orders` | OrdersTable, OrderFilters |
| `/orders/:id` | OrderDetail, StatusUpdater |
| `/customers` | CustomersTable |
| `/customers/:id` | CustomerDetail, OrderHistory |
| `/promotions` | PromosTable, PromoForm |
| `/reports` | ReportsFilters, ChartsDisplay, CSVExport |
| `/users` | AdminsTable, AdminForm |
| `/settings` | SettingsTabs (Store, SMTP, Payments, Sync) |

### 4.3.3 Composants Réutilisables

| Catégorie | Composants |
|-----------|------------|
| **Layout** | AdminLayout, Sidebar, Header, Breadcrumb |
| **Data Display** | DataTable, Pagination, Filters, SearchBar |
| **Forms** | FormField, ImageUpload, RichTextEditor, MultiLangInput |
| **Charts** | LineChart, BarChart, PieChart, StatsCard |
| **Actions** | ConfirmModal, StatusBadge, ActionMenu |

### 4.3.4 State Management (Redux)

| Slice | State |
|-------|-------|
| **auth** | user, token, permissions |
| **products** | list, filters, pagination |
| **orders** | list, filters, selectedOrder |
| **ui** | sidebar, modals, notifications |

### 4.3.5 Documentation

| Document | Contenu |
|----------|---------|
| **README.md** | Setup, scripts |
| **USER_GUIDE.md** | Guide utilisateur admin |

---

## 4.4 Application Mobile (Expo)

### 4.4.1 Code Source

| Livrable | Description |
|----------|-------------|
| **Repository Git** | Code source complet |
| **Structure Expo** | app/, components/, hooks/, navigation/ |
| **Configuration** | app.json, eas.json |

### 4.4.2 Écrans à Développer

| Screen | Composants Principaux |
|--------|----------------------|
| **SplashScreen** | Logo, Loading |
| **OnboardingScreen** | Swiper, Slides |
| **HomeScreen** | HeroSlider, FeaturedSection, Categories |
| **CatalogScreen** | ProductGrid, FilterSheet |
| **ProductScreen** | ImageGallery, VariantPicker, AddToCartButton |
| **CartScreen** | CartList, CartSummary |
| **CheckoutScreen** | StepIndicator, Forms |
| **PaymentWebView** | WebView pour CIB/Baridimob |
| **OrderSuccessScreen** | Confirmation, OrderNumber |
| **ProfileScreen** | ProfileHeader, MenuList |
| **OrdersScreen** | OrderList |
| **OrderDetailScreen** | OrderInfo, ItemsList |
| **AddressesScreen** | AddressList |
| **AddressFormScreen** | AddressForm |
| **SearchScreen** | SearchBar, Results, History |
| **SettingsScreen** | LanguagePicker, NotificationToggle |
| **LoginScreen** | LoginForm |
| **RegisterScreen** | RegisterForm |

### 4.4.3 Composants Réutilisables

| Catégorie | Composants |
|-----------|------------|
| **Navigation** | TabBar, Header, BackButton |
| **Products** | ProductCard, ProductGrid, ImageGallery |
| **Cart** | CartItem, QuantitySelector, SwipeableRow |
| **Forms** | Input, Select, Button, ErrorMessage |
| **UI** | Loading, EmptyState, Toast, BottomSheet |

### 4.4.4 Builds et Déploiement

| Livrable | Format | Description |
|----------|--------|-------------|
| **iOS Build** | .ipa | Archive pour App Store |
| **iOS Certificates** | .p12, .mobileprovision | Certificats de distribution |
| **Android Build** | .aab | Bundle pour Play Store |
| **Android Keystore** | .keystore | Clé de signature |

### 4.4.5 Store Submission

| Store | Livrables |
|-------|-----------|
| **App Store** | Screenshots (6.7", 5.5"), App Preview, Metadata |
| **Play Store** | Screenshots (phone, tablet), Feature graphic, Metadata |

### 4.4.6 Documentation

| Document | Contenu |
|----------|---------|
| **README.md** | Setup, développement local |
| **BUILD.md** | Instructions de build iOS/Android |
| **STORE_SUBMISSION.md** | Guide soumission stores |

---

## 4.5 Documentation Globale

### 4.5.1 Documentation Technique

| Document | Contenu |
|----------|---------|
| **Architecture Overview** | Vue d'ensemble système complet |
| **Database Schema** | ERD, relations, indexes |
| **API Reference** | Documentation GraphQL complète |
| **Deployment Guide** | Guide déploiement tous composants |
| **Security Guidelines** | Pratiques de sécurité |

### 4.5.2 Documentation Utilisateur

| Document | Audience |
|----------|----------|
| **Guide Utilisateur Client** | Clients web et mobile |
| **Guide Administrateur** | Équipe back-office |
| **FAQ** | Questions fréquentes |

### 4.5.3 Documentation Projet

| Document | Contenu |
|----------|---------|
| **Spécifications Fonctionnelles** | Ce document |
| **Cahier de Recette** | Plan de tests |
| **PV de Recette** | Validation finale |

---

## 4.6 Récapitulatif Livrables Développeur

| Composant | Livrables Code | Livrables Documentation |
|-----------|----------------|-------------------------|
| **Backend** | Repository, Docker, Scripts SQL | README, API docs, Architecture |
| **Frontend Web** | Repository, Build production | README, Components docs |
| **Back-Office** | Repository, Build production | README, User guide |
| **Mobile** | Repository, Builds iOS/Android | README, Build guide, Store assets |
| **Global** | - | Architecture, Database, Deployment |

---

**FIN DU DOCUMENT**

---

*Ce document constitue les spécifications techniques et fonctionnelles pour le développement de la plateforme e-commerce OSCAR Fashion. Il détaille l'ensemble des livrables attendus du designer et du développeur.*

**Version**: 2.0
**Date de création**: Novembre 2025
**Référence**: SPEC-OSCAR-2025-002
