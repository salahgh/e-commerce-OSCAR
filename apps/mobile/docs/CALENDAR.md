# Application Mobile - Calendrier de Développement
## OSCAR Fashion E-commerce Platform (iOS & Android)

---

## Vue d'ensemble

**Durée totale**: 10 semaines
**Heures estimées**: 1,200 heures
**Équipe requise**:
- 2 Développeurs React Native Senior
- 1 QA/Test Engineer (temps partiel)

---

## Phase 1: Setup & Foundation (Semaines 1-2)

### Semaine 1: Initialisation & Navigation

#### Tâches
- [x] Setup projet React Native (Expo ou CLI)
- [x] Configuration TypeScript
- [x] Installation dépendances
  - React Navigation
  - React Native Paper
  - Redux Toolkit / Zustand
  - React Query
  - Firebase (FCM)
  - react-native-webview
  - react-native-fast-image
  - etc.
- [x] Configuration ESLint + Prettier
- [x] Setup Git hooks
- [x] Configuration CI/CD (Fastlane + GitHub Actions)
- [x] Structure de dossiers
- [x] Configuration environnements (.env)
- [x] Configuration thème (couleurs, fonts)
- [x] **Navigation Setup**
  - Stack Navigator
  - Bottom Tab Navigator
  - Navigation structure complète
- [x] Splash Screen
- [x] Onboarding screens (3-4 slides)

#### Livrables
- Projet initialisé iOS + Android
- Navigation fonctionnelle
- Splash & Onboarding

**Temps estimé**: 120 heures

---

### Semaine 2: Authentification

#### Tâches
- [x] Service API auth
- [x] **Screen Login**
  - Formulaire login (React Hook Form)
  - Validation (Yup)
  - Gestion erreurs
  - Loading states
  - Intégration API
- [x] **Screen Register**
  - Formulaire inscription
  - Validation complexe
  - Password strength indicator
  - Intégration API
- [x] **Screen Forgot Password**
  - Formulaire email
  - Message succès
- [x] Gestion JWT (react-native-keychain)
- [x] Protected screens configuration
- [x] Auto-login (token check)
- [x] Tests auth (iOS + Android)

#### Livrables
- Système d'authentification complet
- Stockage sécurisé tokens
- Tests

**Temps estimé**: 120 heures

---

## Phase 2: Catalogue & Produits (Semaines 3-5)

### Semaine 3: Home Screen & Composants Produits

#### Tâches
- [x] Service Products API
- [x] **Screen Home**
  - Header (logo, notifications, favoris)
  - Search Bar
  - Hero Slider (bannières)
  - Featured Products section
  - Categories Grid
  - New Arrivals section
  - Pull-to-refresh
- [x] **Composants Produits**
  - ProductCard (mobile)
  - ProductList (FlatList optimized)
  - ProductImage (lazy load)
  - Badge component
- [x] Skeleton loading states
- [x] Tests home screen

#### Livrables
- Home screen attrayant et fonctionnel
- Composants produits réutilisables
- Tests

**Temps estimé**: 120 heures

---

### Semaine 4: Catalogue & Recherche

#### Tâches
- [x] **Screen Catalog**
  - Header (titre, filtres, tri)
  - Product List (FlatList 2 colonnes)
  - Pagination (infinite scroll)
  - Empty state
- [x] **Filters Modal** (bottom sheet)
  - Filtres catégories
  - Filtre prix (range slider)
  - Filtres tailles (chips)
  - Filtres couleurs (chips colorés)
  - Boutons Réinitialiser / Appliquer
- [x] **Sort Modal**
  - Options de tri (pertinence, prix, nouveauté)
- [x] **Screen Search**
  - Search Bar (autofocus)
  - Autocomplete suggestions
  - Historique recherches (AsyncStorage)
  - Search Results
  - Highlighting
- [x] Integration React Query (cache)
- [x] Tests catalog & search

#### Livrables
- Catalogue complet avec filtres et tri
- Recherche avec autocomplete
- Tests

**Temps estimé**: 120 heures

---

### Semaine 5: Détail Produit

#### Tâches
- [x] **Screen Product Detail**
  - Header (retour, partage, favoris)
  - Image Gallery (swiper)
    - Horizontal scroll
    - Pagination dots
    - Pinch-to-zoom
    - Fullscreen mode
  - Product Info (nom, prix, note)
  - Variant Selector (taille, couleur)
  - Quantity Selector (- / +)
  - Add to Cart Button (sticky bottom)
  - Tabs/Accordion:
    - Description
    - Caractéristiques
    - Guide tailles
  - Related Products section
- [x] Vérification stock temps réel
- [x] Animation ajout panier
- [x] Partage (share sheet natif)
- [x] Favoris (toggle)
- [x] Tests product detail

#### Livrables
- Page produit riche et interactive
- Galerie images avec zoom
- Tests

**Temps estimé**: 120 heures

---

## Phase 3: Panier & Checkout (Semaines 6-8)

### Semaine 6: Panier

#### Tâches
- [x] Service Cart API
- [x] Redux/Zustand store Cart
- [x] **Screen Cart**
  - Header (titre, icône vider)
  - Cart Items List (FlatList)
    - CartItem Card
      - Image, nom, variante
      - Quantity selector
      - Prix unitaire/total
      - Swipe-to-delete
  - Promo Code Section
  - Cart Summary (sticky bottom)
    - Sous-total, livraison, réduction, total
    - Bouton "Passer commande"
  - Empty Cart State
- [x] Update quantité temps réel
- [x] Calcul auto total
- [x] Persistance panier (AsyncStorage + backend)
- [x] Merge cart (guest → user)
- [x] Badge panier (tab navigator)
- [x] Tests cart

#### Livrables
- Panier complet et fonctionnel
- Persistance et sync
- Tests

**Temps estimé**: 120 heures

---

### Semaine 7: Checkout (Étapes 1-2)

#### Tâches
- [x] Service Checkout API
- [x] **Checkout Stack Navigator** (4 étapes)
- [x] Progress Indicator component
- [x] **Screen Shipping Address** (Étape 1)
  - Liste adresses existantes (cards sélectionnables)
  - Formulaire nouvelle adresse (modal)
    - Validation
  - Bouton "Continuer"
- [x] **Screen Shipping Method** (Étape 2)
  - Options livraison (Standard / Express)
  - Cards sélectionnables
  - Calcul frais livraison
  - Récapitulatif commande
  - Bouton "Continuer"
- [x] Navigation entre étapes
- [x] Sauvegarde progression (AsyncStorage)
- [x] Tests checkout (étapes 1-2)

#### Livrables
- Checkout étapes 1 & 2 fonctionnelles
- Navigation et persistance
- Tests

**Temps estimé**: 120 heures

---

### Semaine 8: Checkout (Étapes 3-4) & Paiement

#### Tâches
- [x] **Screen Payment** (Étape 3)
  - Options paiement (CIB, Baridimob, COD)
  - Cards sélectionnables
  - Icônes sécurité
  - Checkbox CGV
  - Bouton "Passer la commande"
- [x] **WebView Paiement** (CIB/Baridimob)
  - Ouverture WebView
  - Gestion redirections
  - Callback handling
  - Loading states
  - Gestion erreurs
- [x] **Screen Order Confirmation** (Étape 4)
  - Icône succès animé
  - Numéro commande
  - Récapitulatif
  - Boutons (facture, suivi, continuer)
- [x] Vider panier après confirmation
- [x] Tests checkout complet (E2E)

#### Livrables
- Tunnel de commande complet
- Intégration paiements fonctionnelle
- Tests E2E

**Temps estimé**: 120 heures

---

## Phase 4: Profil & Finitions (Semaines 9-10)

### Semaine 9: Profil & Commandes

#### Tâches
- [x] Service User API
- [x] Service Orders API
- [x] **Screen Profile (connecté)**
  - Header profil (photo, nom, email)
  - Upload photo profil (image picker)
  - Menu options (liste)
    - Mes commandes (badge)
    - Mes adresses
    - Favoris (optionnel)
    - Paramètres
    - Aide & Support
    - À propos
    - Déconnexion
- [x] **Screen Profile (non connecté)**
  - Message connexion
  - Boutons Login/Register
- [x] **Screen Mes Commandes**
  - Tabs (En cours, Livrées, Annulées)
  - Order List (FlatList)
    - OrderCard (numéro, date, statut, total)
  - Empty state
- [x] **Screen Détail Commande**
  - Numéro, statut
  - Timeline statuts
  - Informations livraison
  - Articles commandés
  - Récapitulatif
  - Actions (facture PDF, support, annuler)
- [x] **Screen Mes Adresses**
  - Liste adresses
  - Ajout/modification/suppression adresse
- [x] Tests profil & commandes

#### Livrables
- Profil utilisateur complet
- Historique et détail commandes
- Gestion adresses
- Tests

**Temps estimé**: 120 heures

---

### Semaine 10: Notifications, Paramètres & Finitions

#### Tâches
- [x] **Firebase Cloud Messaging (FCM)**
  - Configuration iOS (APNs)
  - Configuration Android
  - Permission request
  - Token handling
  - Notification listeners
  - Deep linking (notification → screen)
- [x] **Screen Notifications** (centre notifications in-app)
  - Liste notifications
  - Badge non lu
  - Marquer comme lu
  - Filtres
- [x] **Screen Paramètres**
  - Section Langue (AR/FR/EN)
    - Change immédiat UI
  - Section Notifications (toggle)
  - Section Compte (modifier MDP, supprimer)
  - Section À propos (version, CGU, politique)
- [x] **Support i18n complet**
  - Traductions (AR, FR, EN)
  - Configuration RTL (Arabe)
  - Tests RTL
- [x] **Screen Favoris** (optionnel)
  - Liste favoris (grille)
  - Ajout/suppression
  - Empty state
- [x] **Optimisations**
  - Performance (FlatList optimization)
  - Images (WebP, cache)
  - Bundle size optimization
  - Memory optimization
- [x] **Tests finaux**
  - Tests E2E complets (iOS + Android)
  - Tests responsive (différents devices)
  - Tests RTL (Arabe)
  - Tests offline mode
- [x] **Préparation stores**
  - Screenshots (iOS: 6.5", 5.5" / Android)
  - Descriptions (AR, FR, EN)
  - Privacy policy
  - App icons
- [x] Documentation
  - Guide installation dev
  - Guide build/déploiement
  - Documentation technique

#### Livrables
- Notifications push fonctionnelles
- Paramètres complets
- Support multilingue avec RTL
- App optimisée et testée
- Prêt pour soumission stores
- Documentation

**Temps estimé**: 120 heures

---

## Récapitulatif par Semaine

| Semaine | Phase | Heures | Cumul |
|---------|-------|--------|-------|
| 1 | Setup & Navigation | 120 | 120 |
| 2 | Authentification | 120 | 240 |
| 3 | Home & Composants produits | 120 | 360 |
| 4 | Catalogue & Recherche | 120 | 480 |
| 5 | Détail produit | 120 | 600 |
| 6 | Panier | 120 | 720 |
| 7 | Checkout (étapes 1-2) | 120 | 840 |
| 8 | Checkout (étapes 3-4) | 120 | 960 |
| 9 | Profil & Commandes | 120 | 1,080 |
| 10 | Notifications & Finitions | 120 | 1,200 |

**Total: 1,200 heures**

---

## Dépendances Critiques

### Dépendances Backend (API)
- **Semaine 2**: API Auth fonctionnelle
- **Semaine 3**: API Products & Stats fonctionnelle
- **Semaine 4**: API Search fonctionnelle
- **Semaine 6**: API Cart fonctionnelle
- **Semaine 7-8**: API Orders & Payments fonctionnelle
- **Semaine 9**: API User & Orders fonctionnelle
- **Semaine 10**: API Notifications fonctionnelle

**Impact retard backend**: Développement avec mocks possible, intégration différée.

### Dépendances Externes
- **Semaine 1**: Firebase project créé
- **Semaine 8**: Credentials CIB/Baridimob sandbox
- **Semaine 10**: Apple Developer Account + Google Play Console

---

## Jalons (Milestones)

- **Semaine 2**: Authentification fonctionnelle (iOS + Android) ✓
- **Semaine 5**: Catalogue et recherche opérationnels ✓
- **Semaine 6**: Panier fonctionnel ✓
- **Semaine 8**: Checkout complet avec paiements ✓
- **Semaine 10**: App complète, testée et prête pour stores ✓

---

## Risques & Mitigation

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Retard API backend | Élevé | Moyen | Développer avec mocks, API contract-first |
| Problèmes WebView paiement | Élevé | Moyen | Tests précoces avec sandboxes CIB/Baridimob |
| Problèmes FCM (iOS/Android) | Moyen | Moyen | Setup Firebase dès semaine 1, tests réguliers |
| Rejection App Store/Play | Élevé | Faible | Respect guidelines, privacy policy, tests approfondis |
| Performance mobile | Moyen | Moyen | Optimisation continue, tests sur devices réels |
| Complexité RTL (Arabe) | Faible | Faible | Tests RTL dès semaine 2 |

---

## Activités Continues (Semaines 1-10)

### Tests (Intégré)
- Tests unitaires: chaque composant
- Tests d'intégration: chaque feature
- Tests E2E (Detox): parcours critiques
- Tests sur devices réels (iOS + Android)
- Couverture > 60%

### Code Review
- Revue de code systématique
- Respect conventions React Native

### Documentation
- README maintenu
- Documentation technique

---

## Déploiement (Post-développement)

### Beta Testing (Semaine 11)
- TestFlight (iOS): 10-20 beta testers
- Google Play Internal Testing (Android)
- Collecte feedback
- Corrections bugs

### Soumission Stores (Semaine 12)
- App Store (iOS): Review ~1-7 jours
- Google Play Store (Android): Review ~1-3 jours
- Monitoring première semaine

---

**Version**: 1.0
**Date**: Novembre 2025
**Statut**: Planning détaillé
