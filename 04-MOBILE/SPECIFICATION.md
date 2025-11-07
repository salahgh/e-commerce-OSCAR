# Application Mobile - Spécifications Détaillées
## OSCAR Fashion E-commerce Platform (iOS & Android)

---

## 1. Vue d'ensemble

L'application mobile OSCAR Fashion offre une expérience d'achat mobile native pour iOS et Android, permettant aux clients de parcourir et acheter des produits en déplacement avec une interface optimisée pour mobile.

### Objectifs Principaux
- Offrir une expérience native performante sur iOS et Android
- Interface utilisateur moderne et fluide
- Support multilingue (Arabe RTL, Français, Anglais)
- Notifications push pour engagement client
- Intégration paiements mobiles (CIB, Baridimob)
- Synchronisation avec backend en temps réel
- Mode offline (cache produits consultés)

---

## 2. Stack Technique

### Core Framework
- **Framework**: React Native 0.72+
- **Langage**: TypeScript
- **CLI**: React Native CLI ou Expo (recommandé: Expo pour rapidité)
- **Package Manager**: npm ou yarn

### Navigation
- **Navigation**: React Navigation v6
- **Stacks**: Stack, Tab, Drawer navigators
- **Deep Linking**: Support URLs personnalisées

### UI Components & Styling
- **Component Library**: React Native Paper (Material Design)
- **Icons**: React Native Vector Icons (Material Icons)
- **Styling**: Styled Components ou StyleSheet
- **Animations**: React Native Reanimated, Lottie
- **Gestures**: React Native Gesture Handler

### State Management
- **Global State**: Redux Toolkit ou Zustand
- **Server State**: React Query (TanStack Query)
- **Async Storage**: AsyncStorage pour persistance locale

### API & Communication
- **HTTP Client**: Axios
- **API Integration**: React Query
- **WebSocket**: socket.io-client (notifications temps réel)

### Notifications Push
- **Service**: Firebase Cloud Messaging (FCM)
- **Library**: @react-native-firebase/messaging

### Forms & Validation
- **Forms**: React Hook Form
- **Validation**: Yup ou Zod

### Paiement Mobile
- **Intégration**: WebView pour redirections CIB/Baridimob
- **In-App Browser**: react-native-webview

### Media & Images
- **Image Handling**: react-native-fast-image (cache)
- **Image Picker**: react-native-image-picker (photo profil)
- **Image Zoom**: react-native-image-zoom-viewer

### Internationalisation
- **i18n**: react-i18next
- **RTL**: I18nManager pour support Arabe

### Storage & Cache
- **Local Storage**: AsyncStorage
- **Secure Storage**: react-native-keychain (JWT tokens)
- **Cache**: React Query cache + FastImage cache

### Maps & Location (optionnel)
- **Maps**: react-native-maps (adresse livraison)
- **Geolocation**: @react-native-community/geolocation

### Performance
- **Code Splitting**: Lazy loading
- **Image Optimization**: WebP, caching, lazy load
- **Memory Management**: Flatlist optimization

### Testing
- **Unit Tests**: Jest + React Native Testing Library
- **E2E Tests**: Detox (iOS & Android)
- **Coverage**: > 60%

### DevOps
- **CI/CD**: Fastlane + GitHub Actions / GitLab CI
- **App Distribution**: TestFlight (iOS), Google Play Console (Android)
- **Crash Reporting**: Sentry ou Firebase Crashlytics
- **Analytics**: Firebase Analytics ou Mixpanel

---

## 3. Architecture Mobile

### Structure du Projet

```
oscar-mobile/
├── android/                # Code natif Android
├── ios/                    # Code natif iOS
├── src/
│   ├── assets/            # Images, fonts, icons
│   ├── components/        # Composants réutilisables
│   │   ├── common/       # Button, Input, Card
│   │   ├── layout/       # Header, TabBar
│   │   └── product/      # ProductCard, ProductList
│   ├── screens/           # Écrans de l'app
│   │   ├── auth/         # Login, Register
│   │   ├── home/         # Home screen
│   │   ├── catalog/      # Product list, search
│   │   ├── product/      # Product detail
│   │   ├── cart/         # Cart screen
│   │   ├── checkout/     # Checkout flow
│   │   ├── profile/      # User profile
│   │   └── orders/       # Order history
│   ├── navigation/        # Navigation configuration
│   ├── hooks/             # Custom hooks
│   ├── services/          # API calls
│   ├── store/             # Redux/Zustand store
│   ├── utils/             # Utilitaires
│   ├── constants/         # Constantes
│   ├── theme/             # Thème (colors, fonts)
│   ├── types/             # TypeScript types
│   └── App.tsx
├── .env.development
├── .env.production
├── app.json
├── package.json
└── tsconfig.json
```

---

## 4. Fonctionnalités & Écrans

### 4.1 Splash Screen & Onboarding

#### Splash Screen
- Logo OSCAR animé
- Chargement initial de l'app
- Vérification authentification
- Transition vers Home ou Onboarding

#### Onboarding (Premier lancement)
- 3-4 slides explicatives:
  - "Découvrez la mode OSCAR"
  - "Paiement sécurisé"
  - "Livraison rapide"
  - "Notifications exclusives"
- Skip button
- Bouton "Commencer"
- Stockage (ne montrer qu'une fois)

---

### 4.2 Navigation Principale

#### Bottom Tab Navigator

```
┌─────────────────────────────────────────┐
│                                         │
│          Content Area                   │
│                                         │
├─────────────────────────────────────────┤
│ [Home] [Catalog] [Cart] [Profile]      │
└─────────────────────────────────────────┘
```

**Tabs**:
1. **Home** (icône: home)
2. **Catalogue** (icône: search)
3. **Panier** (icône: shopping_cart) + Badge (nb articles)
4. **Profil** (icône: person)

---

### 4.3 Écran Home

#### Composants

1. **Header**
   - Logo OSCAR
   - Icône notifications (badge si nouvelles)
   - Icône favoris

2. **Search Bar**
   - "Rechercher un produit..."
   - Redirection vers écran Search

3. **Hero Slider**
   - Bannières promotionnelles (swipeable)
   - Auto-play
   - Pagination dots
   - CTA buttons

4. **Featured Products**
   - Section "Produits vedettes"
   - Horizontal scroll
   - ProductCard miniature

5. **Categories Grid**
   - Grille 2x2 ou 2x3
   - Image + nom catégorie
   - Navigation vers catalogue filtré

6. **New Arrivals**
   - Section "Nouveautés"
   - Horizontal scroll
   - ProductCard

7. **Promotions Banner**
   - Bannière promo statique ou animée

#### Fonctionnalités
- Pull-to-refresh
- Scroll infini
- Lazy loading images
- Navigation rapide

---

### 4.4 Authentification

#### Écran Login

**Composants**:
- Logo OSCAR
- Formulaire:
  - Input Email
  - Input Mot de passe (toggle visibility)
  - Checkbox "Se souvenir de moi"
  - Bouton "Se connecter"
- Lien "Mot de passe oublié ?"
- Bouton "S'inscrire" (vers Register)
- Social login (optionnel): Google, Facebook

**Fonctionnalités**:
- Validation en temps réel
- Messages d'erreur
- Loading state
- Auto-login (si token valide)
- Redirection après connexion

---

#### Écran Register

**Composants**:
- Formulaire:
  - Input Prénom
  - Input Nom
  - Input Email
  - Input Téléphone
  - Input Mot de passe (avec strength indicator)
  - Input Confirmer mot de passe
  - Checkbox "Accepter les CGV"
  - Bouton "S'inscrire"
- Lien "Déjà un compte ? Se connecter"

**Fonctionnalités**:
- Validation complète
- Password strength indicator
- Envoi code vérification (optionnel)

---

#### Écran Forgot Password

**Composants**:
- Instruction: "Entrez votre email"
- Input Email
- Bouton "Envoyer lien de réinitialisation"
- Message succès
- Retour au Login

---

### 4.5 Catalogue & Recherche

#### Écran Catalogue (/catalog)

**Composants**:
- **Header**:
  - Titre (catégorie ou "Tous les produits")
  - Icône filtres
  - Icône tri
- **Filters Modal** (bottom sheet ou side drawer):
  - Catégories
  - Prix (range slider)
  - Tailles (chips sélectionnables)
  - Couleurs (chips colorés)
  - Boutons: "Réinitialiser" / "Appliquer"
- **Sort Modal**:
  - Pertinence
  - Prix croissant
  - Prix décroissant
  - Nouveautés
- **Product List** (FlatList):
  - ProductCard (grille 2 colonnes)
  - Pagination (infinite scroll)
- **Floating Action Button**: Scroll to top

**ProductCard Mobile**:
- Image produit (ratio 3:4)
- Badge (Nouveau/Promo/Rupture)
- Nom produit (2 lignes max, ellipsis)
- Prix (ancien prix barré si promo)
- Icône favoris (cœur)
- Bouton "Ajouter" (icône panier)

**Fonctionnalités**:
- Lazy loading images
- Optimistic updates (favoris, panier)
- Pull-to-refresh
- Empty state (aucun produit)
- Loading skeleton

---

#### Écran Search

**Composants**:
- **Search Bar** (autofocus):
  - Input recherche
  - Icône effacer
  - Bouton retour
- **Search Suggestions** (autocomplete):
  - Recherches récentes (stockées localement)
  - Suggestions produits
  - Suggestions catégories
- **Search Results**:
  - Product List (comme Catalog)
  - Highlighting termes recherchés

**Fonctionnalités**:
- Debounce (300ms)
- Historique recherches (AsyncStorage)
- Effacer historique

---

### 4.6 Détail Produit

#### Écran Product Detail

**Composants**:

1. **Header**:
   - Bouton retour
   - Icône partage
   - Icône favoris

2. **Image Gallery**:
   - Swiper images (horizontal)
   - Pagination dots
   - Pinch-to-zoom
   - Fullscreen mode

3. **Product Info**:
   - Nom produit
   - Prix (ancien prix barré si promo)
   - Badge promo (%)
   - Note moyenne (étoiles) + nb avis (optionnel)

4. **Variant Selector** (si applicable):
   - Taille: Chips sélectionnables (S, M, L, XL)
   - Couleur: Pastilles colorées sélectionnables
   - Stock status (En stock / Rupture)

5. **Quantity Selector**:
   - Boutons - / +
   - Nombre

6. **Add to Cart Button** (sticky bottom):
   - Bouton large "Ajouter au panier"
   - Animation ajout réussi

7. **Tabs/Accordion**:
   - Description
   - Caractéristiques
   - Guide des tailles

8. **Related Products**:
   - Section "Produits similaires"
   - Horizontal scroll

**Fonctionnalités**:
- Vérification stock en temps réel
- Animation ajout panier (badge update)
- Partage (share sheet natif)
- Favoris (toggle)
- Lazy loading related products

---

### 4.7 Panier

#### Écran Cart

**Composants**:

1. **Header**:
   - Titre "Mon panier (X articles)"
   - Icône vider panier

2. **Cart Items List** (FlatList):
   - **CartItem Card**:
     - Image produit (thumbnail)
     - Nom produit
     - Variante (taille, couleur)
     - Quantity selector (- / + buttons)
     - Prix unitaire
     - Prix total
     - Bouton supprimer (swipe-to-delete)

3. **Promo Code Section**:
   - Input code promo
   - Bouton "Appliquer"
   - Message succès/erreur

4. **Cart Summary** (sticky bottom):
   - Sous-total
   - Frais de livraison (estimés)
   - Réduction (si code promo)
   - **Total** (en gras)
   - Bouton "Passer commande"

5. **Empty Cart State**:
   - Illustration panier vide
   - Message "Votre panier est vide"
   - Bouton "Découvrir nos produits"

**Fonctionnalités**:
- Update quantité en temps réel
- Swipe-to-delete article
- Confirmation avant vider panier
- Calcul auto du total
- Vérification stock avant checkout
- Persistance panier (AsyncStorage + backend)
- Animation suppression

---

### 4.8 Tunnel de Commande (Checkout)

#### Navigation: Stack Navigator (4 étapes)

**Étapes**:
1. Adresse de livraison
2. Méthode de livraison
3. Paiement
4. Confirmation

---

#### Étape 1: Adresse de Livraison

**Composants**:
- Progress Indicator (1/4)
- **Adresses existantes** (si connecté):
  - Liste adresses (cards sélectionnables)
  - Radio button sélection
  - Bouton "Modifier" / "Supprimer"
- **Nouvelle adresse**:
  - Bouton "+ Ajouter une adresse"
  - Formulaire modal:
    - Nom complet
    - Téléphone
    - Adresse
    - Ville
    - Wilaya (dropdown)
    - Code postal
    - Checkbox "Adresse par défaut"
- Bouton "Continuer"

**Validation**: Adresse obligatoire

---

#### Étape 2: Méthode de Livraison

**Composants**:
- Progress Indicator (2/4)
- **Options de livraison** (cards sélectionnables):
  - **Livraison Standard**
    - Délai: 3-5 jours
    - Prix: 500 DZD (exemple)
    - Radio button
  - **Livraison Express**
    - Délai: 24-48h
    - Prix: 1,000 DZD
    - Radio button
- Récapitulatif commande (sidebar ou section)
- Bouton "Continuer"

**Validation**: Méthode obligatoire

---

#### Étape 3: Paiement

**Composants**:
- Progress Indicator (3/4)
- **Méthodes de paiement** (cards sélectionnables):
  - **CIB** (logo carte bancaire)
    - Description: "Paiement par carte bancaire"
    - Radio button
  - **Baridimob** (logo)
    - Description: "Paiement mobile Baridimob"
    - Radio button
  - **Paiement à la livraison**
    - Description: "Payez en espèces à la réception"
    - Radio button
- Icônes sécurité (cadenas, certifications)
- Checkbox "J'accepte les CGV"
- Bouton "Passer la commande"

**Validation**: Méthode obligatoire, CGV acceptées

---

#### Étape 4: Confirmation Commande

**Composants**:
- Icône succès (checkmark animé)
- Message: "Commande confirmée !"
- Numéro de commande
- Récapitulatif:
  - Articles
  - Adresse livraison
  - Total
- Bouton "Télécharger facture" (PDF)
- Bouton "Suivre ma commande"
- Bouton "Continuer mes achats"

**Fonctionnalités**:
- Notification push de confirmation
- Email de confirmation
- Vider le panier

---

#### Gestion Paiement (CIB/Baridimob)

**Flow**:
1. Utilisateur sélectionne CIB/Baridimob
2. Clic "Passer la commande"
3. Ouverture WebView (react-native-webview)
4. Redirection vers gateway de paiement
5. Utilisateur effectue paiement
6. Callback URL → app
7. Vérification statut paiement (API)
8. Affichage confirmation ou erreur

**Écran WebView Paiement**:
- Header avec bouton fermer
- WebView full-screen
- Loading indicator
- Gestion erreurs réseau

---

### 4.9 Profil Utilisateur

#### Écran Profile (connecté)

**Composants**:

1. **Header Profil**:
   - Photo de profil (uploadable)
   - Nom utilisateur
   - Email
   - Bouton "Modifier profil"

2. **Menu Options** (Liste):
   - **Mes commandes** (icône: shopping_bag)
     - Badge: X commandes en cours
   - **Mes adresses** (icône: location_on)
   - **Favoris** (icône: favorite) - optionnel
   - **Paramètres** (icône: settings)
     - Langue (AR / FR / EN)
     - Notifications (toggle)
   - **Aide & Support** (icône: help)
   - **À propos** (icône: info)
   - **Déconnexion** (icône: logout)

**Fonctionnalités**:
- Upload photo profil (image picker)
- Modification informations
- Gestion adresses

---

#### Écran Profile (non connecté)

**Composants**:
- Illustration utilisateur
- Message: "Connectez-vous pour accéder à votre profil"
- Bouton "Se connecter"
- Bouton "S'inscrire"
- Menu limité:
  - Paramètres (langue)
  - Aide & Support
  - À propos

---

#### Écran Mes Commandes

**Composants**:
- **Tabs**:
  - En cours
  - Livrées
  - Annulées
- **Order List** (FlatList):
  - **OrderCard**:
    - Numéro commande
    - Date
    - Statut (badge coloré)
    - Total
    - Thumbnail premier produit
    - Flèche navigation
- Clic → Détail commande

**Empty State**: "Aucune commande"

---

#### Écran Détail Commande

**Composants**:
- **Header**:
  - Numéro commande
  - Statut (badge)
- **Timeline Statuts**:
  - Commande passée
  - En préparation
  - Expédiée
  - Livrée
  - (avec dates et checkmarks)
- **Informations Livraison**:
  - Adresse
  - Méthode
  - Numéro tracking (si disponible)
- **Articles Commandés**:
  - Liste produits (image, nom, qté, prix)
- **Récapitulatif**:
  - Sous-total, livraison, total
- **Actions**:
  - Bouton "Télécharger facture" (PDF)
  - Bouton "Contacter le support"
  - Bouton "Annuler commande" (si autorisé)

---

### 4.10 Notifications

#### Notifications Push

**Types de notifications**:
1. **Confirmation commande**
   - "Votre commande #12345 a été confirmée !"
2. **Statut commande**
   - "Votre commande est en cours de livraison"
3. **Livraison**
   - "Votre commande a été livrée !"
4. **Promotions**
   - "🔥 -30% sur toute la collection !"
5. **Produit disponible** (si wishlist)
   - "Le produit X est de nouveau en stock !"
6. **Panier abandonné** (optionnel)
   - "Vous avez oublié quelque chose dans votre panier..."

**Gestion Notifications**:
- Permission demandée au premier lancement
- Toggle on/off dans paramètres
- Deep linking (clic → écran correspondant)

#### Centre de Notifications (In-App)

**Écran Notifications**:
- Liste notifications
- Badge "non lu"
- Marquer comme lu
- Filtrer par type
- Suppression notifications

---

### 4.11 Favoris (Optionnel)

#### Écran Favoris

**Composants**:
- Liste produits favoris (grille 2 colonnes)
- ProductCard avec bouton supprimer
- Bouton "Ajouter au panier"
- Empty state: "Aucun favori"

**Fonctionnalités**:
- Ajout/suppression favoris (toggle cœur)
- Persistance (backend)
- Sync multi-devices

---

### 4.12 Paramètres

#### Écran Settings

**Sections**:

1. **Langue**
   - Arabe
   - Français
   - Anglais
   - (change immédiatement l'UI)

2. **Notifications**
   - Toggle notifications push
   - Toggle emails promotionnels

3. **Compte**
   - Modifier mot de passe
   - Supprimer compte

4. **À propos**
   - Version de l'app
   - Conditions d'utilisation
   - Politique de confidentialité

---

## 5. Design & UI/UX

### 5.1 Thème & Couleurs

**Palette** (identique au web):
- **Primary**: #2C3E50 (Bleu marine)
- **Secondary**: #E8D5C4 (Beige/crème)
- **Accent**: #C9A992 (Terracotta)
- **Background**: #F5F5F5
- **Surface**: #FFFFFF
- **Error**: #F44336
- **Success**: #4CAF50

**Typography**:
- **Font Family**: Roboto (Android), SF Pro (iOS)
- **Sizes**: 12, 14, 16, 18, 20, 24, 32

---

### 5.2 Responsive Design

**Support Devices**:
- Smartphones (4" à 6.7")
- Tablettes (iPad, Android tablets)
- Orientation: Portrait (priorité), Landscape (supporté)

**Safe Area**:
- Respect notch (iPhone X+)
- Respect status bar
- Respect navigation gestures

---

### 5.3 Animations

**Animations Clés**:
- Splash screen (logo fade-in)
- Page transitions (slide, fade)
- Add to cart (button → cart icon)
- Pull-to-refresh
- Swipe-to-delete
- Loading skeletons
- Success checkmark (commande)

**Libraries**:
- React Native Reanimated
- Lottie (animations complexes)

---

### 5.4 Support RTL (Arabe)

**Configuration**:
```typescript
import { I18nManager } from 'react-native';

// Activer RTL si langue = Arabe
if (language === 'ar') {
  I18nManager.forceRTL(true);
} else {
  I18nManager.forceRTL(false);
}
```

**Impacts**:
- Inversion layout (flexDirection: row-reverse)
- Alignement texte (textAlign: right)
- Icons mirrorés (si applicable)

---

## 6. Performance & Optimisation

### Stratégies

1. **Images**:
   - Format WebP
   - react-native-fast-image (cache)
   - Lazy loading
   - Thumbnails pour listes

2. **Listes**:
   - FlatList avec:
     - `windowSize={10}`
     - `maxToRenderPerBatch={10}`
     - `removeClippedSubviews={true}`
   - Virtualization
   - Memoization (React.memo)

3. **Bundle**:
   - Code splitting (si Expo)
   - Hermes engine (Android)
   - ProGuard/R8 (Android)

4. **Network**:
   - React Query cache
   - Retry mechanism
   - Offline mode (cached data)

5. **Memory**:
   - Image resize
   - Cache cleanup
   - Navigation optimized

---

## 7. Offline & Cache

### Stratégies

1. **Produits consultés**: Cache local (AsyncStorage + React Query)
2. **Panier**: Persistance locale, sync au retour online
3. **Images**: FastImage cache automatique
4. **No network**: Affichage message + données cached

---

## 8. Sécurité

### Mesures

1. **Tokens JWT**: Stockage sécurisé (react-native-keychain)
2. **HTTPS**: Toutes les requêtes API
3. **Code Obfuscation**: ProGuard (Android), bitcode (iOS)
4. **Validation inputs**: Client + serveur
5. **Sensitive data**: Ne pas logger (console.log en prod)

---

## 9. Tests

### Types de Tests

1. **Unit Tests** (Jest + React Native Testing Library):
   - Composants
   - Hooks
   - Utilitaires
   - Couverture > 60%

2. **E2E Tests** (Detox):
   - Flow login
   - Flow ajout panier → checkout
   - Flow recherche produit
   - iOS + Android

3. **Manual Testing**:
   - Tests sur devices réels
   - Tests différentes tailles écran
   - Tests RTL (Arabe)

---

## 10. Déploiement

### iOS

1. **Apple Developer Account** (99$/an)
2. **TestFlight** (beta testing)
3. **App Store**:
   - Soumission review
   - Screenshots (6.5", 5.5")
   - Description (AR, FR, EN)
   - Keywords
   - Privacy policy

### Android

1. **Google Play Console** (25$ one-time)
2. **Internal/Beta Testing**
3. **Google Play Store**:
   - APK/AAB
   - Screenshots
   - Description (AR, FR, EN)
   - Privacy policy

### CI/CD

**Fastlane**:
- Build automatique
- Screenshots automatiques
- Soumission automatique (TestFlight, Play Console)

---

## 11. Analytics & Monitoring

### Analytics
- **Firebase Analytics**:
  - Événements (view_product, add_to_cart, purchase)
  - User demographics
  - Retention

### Crash Reporting
- **Sentry** ou **Firebase Crashlytics**:
  - Crash reports
  - Error tracking
  - Performance monitoring

---

## 12. Documentation

### Livrables

- Guide d'installation (dev)
- Guide de build (iOS/Android)
- Guide de déploiement
- Documentation technique
- Guide utilisateur (optionnel)

---

**Version**: 1.0
**Date**: Novembre 2025
**Statut**: Spécification technique détaillée
