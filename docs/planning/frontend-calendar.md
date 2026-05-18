# Frontend Web - Calendrier de Développement
## OSCAR Fashion E-commerce Platform

---

## Vue d'ensemble

**Durée totale**: 12 semaines
**Heures estimées**: 1,440 heures
**Équipe requise**:
- 2 Développeurs Frontend Senior (React)
- 1 UI/UX Developer
- 1 QA/Test Engineer (temps partiel)

---

## Phase 1: Setup & Fondations (Semaines 1-2)

### Semaine 1: Initialisation & Configuration

#### Tâches
- [x] Setup projet React (Vite/CRA)
- [x] Configuration TypeScript
- [x] Installation dépendances (MUI, React Router, etc.)
- [x] Configuration ESLint + Prettier
- [x] Setup Git hooks (Husky + lint-staged)
- [x] Configuration CI/CD
- [x] Structure de dossiers
- [x] Configuration environnements (.env)
- [x] Setup Redux Toolkit / Zustand
- [x] Configuration React Query
- [x] Setup i18next (multilingue)
- [x] Configuration MUI theme
- [x] Setup Storybook (documentation composants)

#### Livrables
- Projet initialisé et configuré
- Theme MUI personnalisé
- Configuration multilingue fonctionnelle
- Documentation de base

**Temps estimé**: 120 heures

---

### Semaine 2: Composants de Base & Layout

#### Tâches
- [x] Création du theme OSCAR (couleurs, typography)
- [x] Configuration RTL pour l'Arabe
- [x] Composant Header
  - TopBar (langues, infos livraison)
  - Logo
  - SearchBar
  - Navigation principale
  - Icons (compte, panier, favoris)
- [x] Composant Footer
  - Informations entreprise
  - Liens rapides
  - Newsletter
  - Réseaux sociaux
- [x] Layout principal (Header + Content + Footer)
- [x] Composant Breadcrumb
- [x] Composants UI de base (Button, Input, Select)
- [x] Setup routing (React Router)
- [x] Tests composants layout

#### Livrables
- Layout complet et responsive
- Composants UI de base
- Routing configuré
- Storybook documenté

**Temps estimé**: 120 heures

---

## Phase 2: Authentification & Profil (Semaines 3-4)

### Semaine 3: Pages d'Authentification

#### Tâches
- [x] Service API auth (axios)
- [x] Page Login
  - Formulaire login (React Hook Form)
  - Validation (Yup)
  - Gestion erreurs
  - Intégration API
- [x] Page Register
  - Formulaire inscription
  - Validation complexe
  - Password strength indicator
  - Intégration API
- [x] Page Forgot Password
- [x] Page Reset Password
- [x] Page Email Verification
- [x] Gestion JWT (stockage, refresh)
- [x] Protected routes (PrivateRoute component)
- [x] Redirection après login
- [x] Tests authentification

#### Livrables
- Système d'authentification complet
- Protected routes fonctionnelles
- Tests

**Temps estimé**: 120 heures

---

### Semaine 4: Profil Utilisateur

#### Tâches
- [x] Page Profil (layout avec tabs)
- [x] Tab Informations personnelles
  - Formulaire modification profil
  - Upload photo de profil
  - Validation
  - Intégration API
- [x] Tab Mes adresses
  - Liste des adresses
  - Formulaire ajout/modification adresse
  - Suppression adresse
  - Adresse par défaut
- [x] Tab Historique commandes
  - Liste des commandes
  - Filtrage et recherche
  - Statuts visuels
- [x] Tab Favoris (optionnel)
- [x] Service User API
- [x] Tests profil utilisateur

#### Livrables
- Interface profil complète
- Gestion des adresses fonctionnelle
- Tests

**Temps estimé**: 120 heures

---

## Phase 3: Catalogue & Produits (Semaines 5-7)

### Semaine 5: Composants Produits

#### Tâches
- [x] Service Products API
- [x] Composant ProductCard
  - Image avec lazy load
  - Badge (Nouveau, Promo, Rupture)
  - Prix avec ancien prix
  - Bouton ajout rapide au panier
  - Hover effects
- [x] Composant ProductGrid (responsive)
- [x] Composant ProductImage (zoom, lazy load)
- [x] Composant ProductPrice
- [x] Composant ProductBadge
- [x] Composant QuantitySelector
- [x] Composant AddToCartButton
- [x] Tests composants produits
- [x] Stories Storybook

#### Livrables
- Composants produits réutilisables
- Documentation Storybook
- Tests

**Temps estimé**: 120 heures

---

### Semaine 6: Page Catalogue

#### Tâches
- [x] Page Catalogue (/products)
- [x] Sidebar Filters
  - Filtres catégories
  - Filtre prix (range slider)
  - Filtres tailles
  - Filtres couleurs
  - Reset filters
- [x] Sort Options
  - Tri par pertinence
  - Tri par prix (asc/desc)
  - Tri par nouveauté
- [x] ProductGrid avec pagination
- [x] Infinite scroll (alternative)
- [x] Vue grille/liste (toggle)
- [x] Breadcrumb navigation
- [x] Loading states (skeleton)
- [x] Empty states
- [x] Integration API avec React Query
- [x] Tests page catalogue

#### Livrables
- Page catalogue complète et fonctionnelle
- Filtres et tri opérationnels
- Performance optimisée
- Tests

**Temps estimé**: 120 heures

---

### Semaine 7: Page Détail Produit & Recherche

#### Tâches
- [x] Page Product Detail (/products/:slug)
- [x] Galerie d'images
  - Image principale
  - Thumbnails
  - Lightbox/zoom
  - Swipe mobile
- [x] Informations produit
  - Nom, prix, description
  - Sélection variantes (taille, couleur)
  - Vérification stock
  - Quantity selector
  - Add to cart button
- [x] Tabs produit
  - Description détaillée
  - Caractéristiques
  - Guide des tailles
- [x] Related Products section
- [x] SearchBar avec autocomplete
  - Debounce
  - Suggestions
  - Historique (localStorage)
  - Highlighting
- [x] Page Search Results
- [x] Tests

#### Livrables
- Page produit riche et interactive
- Recherche fonctionnelle avec autocomplete
- Tests

**Temps estimé**: 120 heures

---

## Phase 4: Panier & Checkout (Semaines 8-10)

### Semaine 8: Panier

#### Tâches
- [x] Service Cart API
- [x] Redux slice Cart (ou Zustand store)
- [x] Page Cart (/cart)
- [x] CartItem component
  - Image produit
  - Informations (nom, variante)
  - Quantity controls
  - Prix unitaire et total
  - Bouton suppression
- [x] Cart Summary component
  - Sous-total
  - Frais de livraison
  - Code promo
  - Total
  - Bouton checkout
- [x] Promo Code input
- [x] Empty cart state
- [x] Persistance panier (localStorage)
- [x] Merge cart (guest → user)
- [x] Mini Cart (dropdown header)
- [x] Badge panier (nombre d'articles)
- [x] Tests panier

#### Livrables
- Système de panier complet
- Persistance fonctionnelle
- Tests

**Temps estimé**: 120 heures

---

### Semaine 9: Checkout - Étapes 1 & 2

#### Tâches
- [x] Page Checkout (/checkout)
- [x] Stepper component (4 étapes)
- [x] Service Checkout API
- [x] **Étape 1: Shipping Address**
  - Formulaire adresse livraison
  - Sélection adresse existante
  - Nouvelle adresse
  - Validation
  - Sauvegarde pour prochaine fois
- [x] **Étape 2: Shipping Method**
  - Liste méthodes de livraison
  - Standard / Express
  - Calcul frais de livraison
  - Estimation délai
- [x] Navigation entre étapes
- [x] Sauvegarde progression (localStorage)
- [x] Order Summary (sidebar persistant)
- [x] Responsive mobile
- [x] Tests checkout (étapes 1-2)

#### Livrables
- Étapes 1 & 2 du checkout fonctionnelles
- Navigation et persistance OK
- Tests

**Temps estimé**: 120 heures

---

### Semaine 10: Checkout - Étapes 3 & 4

#### Tâches
- [x] **Étape 3: Payment**
  - Sélection méthode de paiement
  - CIB (redirection)
  - Baridimob (redirection)
  - Cash on Delivery
  - Informations sécurité
- [x] **Étape 4: Review & Confirm**
  - Récapitulatif complet
  - Adresse de livraison
  - Méthode de livraison
  - Méthode de paiement
  - Articles commandés
  - Total
  - Checkbox CGV
  - Bouton "Passer la commande"
- [x] Page Order Confirmation
  - Message succès
  - Numéro de commande
  - Récapitulatif
  - Bouton télécharger facture
  - Bouton continuer shopping
- [x] Gestion erreurs paiement
- [x] Callback pages (CIB, Baridimob)
- [x] Tests checkout complet (E2E)

#### Livrables
- Tunnel de commande complet
- Intégration paiements fonctionnelle
- Page confirmation
- Tests E2E

**Temps estimé**: 120 heures

---

## Phase 5: Page d'Accueil & Finitions (Semaines 11-12)

### Semaine 11: Page d'Accueil

#### Tâches
- [x] Page Home (/)
- [x] Hero Section
  - Slider/Carousel
  - Bannières promotionnelles
  - CTA (call-to-action)
  - Autoplay
- [x] Featured Products section
  - Produits mis en avant
  - Carousel ou grid
- [x] New Arrivals section
  - Nouvelles collections
- [x] Categories Grid
  - Grille catégories principales
  - Images et liens
- [x] Promotions Banner
- [x] Newsletter Section
  - Formulaire inscription
  - Validation email
  - Intégration API
- [x] Testimonials (optionnel)
- [x] Instagram Feed (optionnel)
- [x] Optimisation performance
  - Above-the-fold
  - Lazy loading
  - Image optimization
- [x] Tests page d'accueil

#### Livrables
- Page d'accueil attrayante et performante
- Sections riches en contenu
- Tests

**Temps estimé**: 120 heures

---

### Semaine 12: Optimisation, Multilingue & Tests Finaux

#### Tâches
- [x] Finalisation i18n
  - Traduction complète (AR, FR, EN)
  - Test RTL (Arabe)
  - Switch de langue fonctionnel
- [x] SEO
  - React Helmet sur toutes pages
  - Meta tags
  - Open Graph
  - Structured data (JSON-LD)
  - Sitemap
- [x] Accessibilité (A11y)
  - Audit WCAG 2.1 AA
  - Corrections
  - Aria labels
  - Navigation clavier
- [x] Performance
  - Lighthouse audit
  - Optimisation images
  - Code splitting
  - Bundle optimization
  - Lazy loading
  - Compression
- [x] PWA (Progressive Web App)
  - Service Worker
  - Manifest.json
  - Icons
  - Offline fallback
- [x] Tests finaux
  - Tests E2E complets (Cypress)
  - Tests cross-browser
  - Tests responsive (mobile, tablet, desktop)
  - Tests de régression
- [x] Documentation finale
  - README complet
  - Guide déploiement
  - Storybook finalisé

#### Livrables
- Application multilingue complète
- SEO optimisé
- Performance optimale (Lighthouse > 90)
- Accessibilité WCAG AA
- PWA fonctionnelle
- Tests complets
- Documentation

**Temps estimé**: 120 heures

---

## Récapitulatif par Semaine

| Semaine | Phase | Heures | Cumul |
|---------|-------|--------|-------|
| 1 | Setup & Config | 120 | 120 |
| 2 | Layout & Composants de base | 120 | 240 |
| 3 | Authentification | 120 | 360 |
| 4 | Profil utilisateur | 120 | 480 |
| 5 | Composants produits | 120 | 600 |
| 6 | Page catalogue | 120 | 720 |
| 7 | Détail produit & recherche | 120 | 840 |
| 8 | Panier | 120 | 960 |
| 9 | Checkout (étapes 1-2) | 120 | 1,080 |
| 10 | Checkout (étapes 3-4) | 120 | 1,200 |
| 11 | Page d'accueil | 120 | 1,320 |
| 12 | Optimisation & Tests | 120 | 1,440 |

**Total: 1,440 heures**

---

## Dépendances Critiques

### Dépendances Backend
- **Semaine 3**: API Auth fonctionnelle
- **Semaine 4**: API User & Addresses fonctionnelle
- **Semaine 5-7**: API Products & Search fonctionnelle
- **Semaine 8**: API Cart fonctionnelle
- **Semaine 9-10**: API Orders & Payments fonctionnelle

### Dépendances Design
- **Semaine 1**: Charte graphique finalisée
- **Semaine 2**: Maquettes UI (Figma) validées
- **Semaine 5**: Assets produits (images, descriptions)
- **Semaine 11**: Contenu page d'accueil (bannières, textes)

---

## Jalons (Milestones)

- **Semaine 2**: Layout et navigation fonctionnels ✓
- **Semaine 4**: Authentification et profil complets ✓
- **Semaine 7**: Catalogue et recherche opérationnels ✓
- **Semaine 8**: Panier fonctionnel ✓
- **Semaine 10**: Tunnel de commande complet ✓
- **Semaine 12**: Application complète, optimisée et testée ✓

---

## Risques & Mitigation

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Retard API backend | Élevé | Moyen | Développer avec mocks, API contract-first |
| Manque de contenu (images, textes) | Moyen | Élevé | Utiliser placeholder, communiquer tôt avec client |
| Problèmes de performance | Moyen | Moyen | Tests Lighthouse dès semaine 6 |
| Complexité RTL (Arabe) | Faible | Faible | Tester RTL dès semaine 2 |
| Cross-browser issues | Moyen | Moyen | Tests réguliers sur Chrome, Safari, Firefox |

---

## Activités Continues (Semaines 1-12)

### Tests (Intégré)
- Tests unitaires (Jest + RTL) : chaque composant
- Tests d'intégration : chaque feature
- Tests E2E (Cypress) : parcours critiques
- Couverture > 70%

### Code Review
- Revue de code systématique
- Respect des conventions
- Performance check

### Documentation
- Storybook mis à jour régulièrement
- README maintenu
- Commentaires code

---

**Version**: 1.0
**Date**: Novembre 2025
**Statut**: Planning détaillé
