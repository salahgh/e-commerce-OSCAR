# Application Mobile - Budget Détaillé
## OSCAR Fashion E-commerce Platform (iOS & Android)

---

## 1. Résumé Exécutif

**Durée**: 10 semaines (2.5 mois)
**Heures totales**: 1,200 heures
**Taux horaire moyen**: 185 DZD/heure
**Coût total**: 222,000 DZD

---

## 2. Composition de l'Équipe

### 2.1 Ressources Humaines Détaillées

| Rôle | Nombre | Taux/heure | Allocation | Heures | Coût |
|------|--------|------------|------------|--------|------|
| Développeur Expo/React Native Mid-Level | 2 | 185 | 100% | 800 | 148,000 |
| Testeur Mobile | 1 | 185 | 30% | 120 | 22,200 |
| Tech Lead Junior | 1 | 185 | 20% | 80 | 14,800 |

**Sous-total RH**: 185,000 DZD

### 2.2 Taux Moyen Pondéré

Équipe junior/mid-level avec taux uniforme: **185 DZD/heure**

---

## 3. Détail par Phase

### Phase 1: Setup & Foundation (Semaines 1-2)

| Activité | Heures | Coût |
|----------|--------|------|
| **Semaine 1: Setup & Navigation** | 120 | 120,000 |
| - Initialisation projet React Native | 16 | 16,000 |
| - Configuration TypeScript & tooling | 16 | 16,000 |
| - Installation dépendances | 20 | 20,000 |
| - Configuration CI/CD (Fastlane) | 16 | 16,000 |
| - Configuration thème | 12 | 12,000 |
| - Navigation setup (Stack + Tab) | 24 | 24,000 |
| - Splash Screen & Onboarding | 16 | 16,000 |
| | | |
| **Semaine 2: Authentification** | 120 | 120,000 |
| - Service API auth | 12 | 12,000 |
| - Screen Login | 24 | 24,000 |
| - Screen Register | 32 | 32,000 |
| - Screen Forgot Password | 12 | 12,000 |
| - Gestion JWT (keychain) | 16 | 16,000 |
| - Protected screens | 8 | 8,000 |
| - Tests (iOS + Android) | 16 | 16,000 |

**Total Phase 1**: 240 heures = **44,400 DZD**

---

### Phase 2: Catalogue & Produits (Semaines 3-5)

| Activité | Heures | Coût |
|----------|--------|------|
| **Semaine 3: Home & Composants** | 120 | 120,000 |
| - Service Products API | 12 | 12,000 |
| - Screen Home | 60 | 60,000 |
|   - Header, Search Bar | 12 | 12,000 |
|   - Hero Slider | 16 | 16,000 |
|   - Featured Products | 12 | 12,000 |
|   - Categories Grid | 12 | 12,000 |
|   - New Arrivals | 8 | 8,000 |
| - Composants Produits | 32 | 32,000 |
|   - ProductCard mobile | 16 | 16,000 |
|   - ProductList (FlatList) | 16 | 16,000 |
| - Skeleton loading | 8 | 8,000 |
| - Tests | 8 | 8,000 |
| | | |
| **Semaine 4: Catalogue & Recherche** | 120 | 120,000 |
| - Screen Catalog | 40 | 40,000 |
|   - Product List (FlatList 2 col) | 20 | 20,000 |
|   - Infinite scroll | 12 | 12,000 |
|   - Empty state | 8 | 8,000 |
| - Filters Modal (bottom sheet) | 32 | 32,000 |
|   - Filtres catégories, prix, tailles | 24 | 24,000 |
|   - Range slider | 8 | 8,000 |
| - Sort Modal | 8 | 8,000 |
| - Screen Search | 32 | 32,000 |
|   - Autocomplete | 16 | 16,000 |
|   - Historique (AsyncStorage) | 8 | 8,000 |
|   - Search Results | 8 | 8,000 |
| - Integration React Query | 8 | 8,000 |
| | | |
| **Semaine 5: Détail Produit** | 120 | 120,000 |
| - Screen Product Detail | 88 | 88,000 |
|   - Header (retour, partage, favoris) | 12 | 12,000 |
|   - Image Gallery (swiper, zoom) | 32 | 32,000 |
|   - Product Info | 12 | 12,000 |
|   - Variant Selector | 16 | 16,000 |
|   - Quantity Selector | 8 | 8,000 |
|   - Add to Cart Button (sticky) | 8 | 8,000 |
| - Tabs/Accordion (description, etc.) | 16 | 16,000 |
| - Related Products | 8 | 8,000 |
| - Tests | 8 | 8,000 |

**Total Phase 2**: 360 heures = **66,600 DZD**

---

### Phase 3: Panier & Checkout (Semaines 6-8)

| Activité | Heures | Coût |
|----------|--------|------|
| **Semaine 6: Panier** | 120 | 120,000 |
| - Service Cart API | 12 | 12,000 |
| - Redux/Zustand store Cart | 12 | 12,000 |
| - Screen Cart | 60 | 60,000 |
|   - Cart Items List (FlatList) | 24 | 24,000 |
|   - CartItem Card (swipe-to-delete) | 20 | 20,000 |
|   - Promo Code Section | 8 | 8,000 |
|   - Cart Summary (sticky) | 8 | 8,000 |
| - Update quantité temps réel | 12 | 12,000 |
| - Persistance panier (AsyncStorage) | 12 | 12,000 |
| - Badge panier (tab) | 8 | 8,000 |
| - Tests | 4 | 4,000 |
| | | |
| **Semaine 7: Checkout (Étapes 1-2)** | 120 | 120,000 |
| - Service Checkout API | 8 | 8,000 |
| - Checkout Stack Navigator | 8 | 8,000 |
| - Progress Indicator | 8 | 8,000 |
| - Screen Shipping Address (Étape 1) | 40 | 40,000 |
|   - Liste adresses | 16 | 16,000 |
|   - Formulaire nouvelle adresse | 24 | 24,000 |
| - Screen Shipping Method (Étape 2) | 32 | 32,000 |
|   - Options livraison (cards) | 16 | 16,000 |
|   - Calcul frais | 8 | 8,000 |
|   - Récapitulatif | 8 | 8,000 |
| - Navigation & persistance | 16 | 16,000 |
| - Tests | 8 | 8,000 |
| | | |
| **Semaine 8: Checkout (Étapes 3-4)** | 120 | 120,000 |
| - Screen Payment (Étape 3) | 32 | 32,000 |
|   - Options paiement | 16 | 16,000 |
|   - Checkbox CGV | 8 | 8,000 |
|   - Bouton commande | 8 | 8,000 |
| - WebView Paiement (CIB/Baridimob) | 40 | 40,000 |
|   - Ouverture WebView | 16 | 16,000 |
|   - Callback handling | 16 | 16,000 |
|   - Gestion erreurs | 8 | 8,000 |
| - Screen Order Confirmation (Étape 4) | 32 | 32,000 |
|   - Icône succès animé | 8 | 8,000 |
|   - Récapitulatif | 16 | 16,000 |
|   - Boutons (facture, suivi) | 8 | 8,000 |
| - Tests E2E checkout | 16 | 16,000 |

**Total Phase 3**: 360 heures = **66,600 DZD**

---

### Phase 4: Profil & Finitions (Semaines 9-10)

| Activité | Heures | Coût |
|----------|--------|------|
| **Semaine 9: Profil & Commandes** | 120 | 120,000 |
| - Service User & Orders API | 12 | 12,000 |
| - Screen Profile (connecté) | 32 | 32,000 |
|   - Header profil (photo, nom) | 12 | 12,000 |
|   - Upload photo (image picker) | 8 | 8,000 |
|   - Menu options | 12 | 12,000 |
| - Screen Profile (non connecté) | 8 | 8,000 |
| - Screen Mes Commandes | 32 | 32,000 |
|   - Tabs (En cours, Livrées, etc.) | 8 | 8,000 |
|   - Order List (FlatList) | 16 | 16,000 |
|   - OrderCard | 8 | 8,000 |
| - Screen Détail Commande | 24 | 24,000 |
|   - Timeline statuts | 8 | 8,000 |
|   - Informations & articles | 12 | 12,000 |
|   - Actions (facture, annuler) | 4 | 4,000 |
| - Screen Mes Adresses | 12 | 12,000 |
| | | |
| **Semaine 10: Notifications & Finitions** | 120 | 120,000 |
| - Firebase Cloud Messaging (FCM) | 40 | 40,000 |
|   - Configuration iOS (APNs) | 16 | 16,000 |
|   - Configuration Android | 16 | 16,000 |
|   - Notification listeners | 8 | 8,000 |
| - Screen Notifications (in-app) | 16 | 16,000 |
| - Screen Paramètres | 24 | 24,000 |
|   - Langue (AR/FR/EN) | 12 | 12,000 |
|   - Notifications (toggle) | 4 | 4,000 |
|   - Compte & À propos | 8 | 8,000 |
| - Support i18n complet (RTL) | 16 | 16,000 |
| - Screen Favoris (optionnel) | 8 | 8,000 |
| - Optimisations | 16 | 16,000 |
|   - Performance (FlatList) | 8 | 8,000 |
|   - Images (cache) | 8 | 8,000 |
| - Tests finaux (E2E, RTL) | 16 | 16,000 |
| - Préparation stores (screenshots, descriptions) | 12 | 12,000 |
| - Documentation | 8 | 8,000 |

**Total Phase 4**: 240 heures = **44,400 DZD**

---

## 4. Coûts Récapitulatifs par Phase

| Phase | Semaines | Heures | Coût | % Total |
|-------|----------|--------|------|---------|
| Phase 1: Setup & Auth | 1-2 | 240 | 44,400 | 20% |
| Phase 2: Catalogue & Produits | 3-5 | 360 | 66,600 | 30% |
| Phase 3: Panier & Checkout | 6-8 | 360 | 66,600 | 30% |
| Phase 4: Profil & Finitions | 9-10 | 240 | 44,400 | 20% |

**Total Développement**: 1,200 heures = **222,000 DZD**

---

## 5. Coûts d'Infrastructure & Outils

### 5.1 Comptes Développeur

| Item | Coût | Périodicité |
|------|------|-------------|
| Apple Developer Program | 12,000 DZD (~99 USD) | Annuel |
| Google Play Console | 3,000 DZD (~25 USD) | One-time |

**Sous-total Comptes**: 15,000 DZD (première année)

---

### 5.2 Services & Outils

| Item | Coût Mensuel | Durée | Coût Total |
|------|--------------|-------|------------|
| Expo (gratuit) | 0 | - | 0 |
| Sentry (plan gratuit) | 0 | - | 0 |
| Fastlane + GitHub Actions (gratuit) | 0 | - | 0 |

**Sous-total Services**: 0 DZD

---

### 5.3 Testing & Distribution

| Item | Coût |
|------|------|
| TestFlight (iOS - gratuit) | 0 |
| Google Play Internal Testing (gratuit) | 0 |
| Devices tests (utilisation appareils personnels) | 0 |

**Sous-total Testing**: 0 DZD

---

## 6. Budget Total Mobile

| Catégorie | Coût | % Total |
|-----------|------|---------|
| **Développement (RH)** | 222,000 | 93.7% |
| **Comptes Développeur** | 15,000 | 6.3% |
| **Services & Outils** | 0 | 0% |
| **Devices Testing** | 0 | 0% |
| **TOTAL MOBILE** | **237,000** | **100%** |

---

## 7. Provision pour Risques & Imprévus

**Contingence (10%)**: 23,700 DZD

Couvre:
- Problèmes spécifiques iOS/Android
- Rejection stores (corrections)
- Bugs complexes cross-platform
- Optimisation performance supplémentaire

---

## 8. Budget Total Recommandé

| Item | Coût |
|------|------|
| Coût de base | 237,000 |
| Contingence (10%) | 23,700 |
| **TOTAL RECOMMANDÉ** | **260,700 DZD** |

---

## 9. Paiement Échelonné (Recommandation)

| Jalon | % | Montant | Date |
|-------|---|---------|------|
| Signature contrat + Comptes dev | 20% | 282,700 | Semaine 0 |
| Fin Phase 2 (Catalogue OK) | 25% | 353,375 | Semaine 5 |
| Fin Phase 3 (Checkout complet) | 30% | 424,050 | Semaine 8 |
| Livraison finale & soumission stores | 25% | 353,375 | Semaine 10 |

**Total**: 1,413,500 DZD

---

## 10. Coûts Post-Livraison (Non inclus)

### Maintenance & Support (Mensuel)

| Service | Coût/mois |
|---------|-----------|
| Support bugs critiques | 50,000 |
| Maintenance corrective (iOS + Android) | 40,000 |
| Mises à jour OS (iOS/Android) | 30,000 |
| Évolutions mineures | 60,000 |
| **Total Support** | **180,000 DZD/mois** |

### Services Production (Mensuel)

| Service | Coût/mois |
|---------|-----------|
| Firebase (Blaze plan) | 8,000 |
| Push Notifications (FCM - inclus Firebase) | 0 |
| Sentry | 4,000 |
| Analytics | 0 |
| **Total Services** | **12,000 DZD/mois** |

### Comptes Annuels

| Service | Coût/an |
|---------|---------|
| Apple Developer Program | 12,000 |
| Google Play (one-time déjà payé) | 0 |
| **Total Comptes** | **12,000 DZD/an** |

---

## 11. ROI & Justification

### Pourquoi ce budget?

1. **Application Native Cross-Platform**:
   - React Native (iOS + Android avec une seule codebase)
   - Performance native
   - UX optimisée mobile

2. **Fonctionnalités Complètes**:
   - Catalogue et recherche fluides
   - Panier et checkout complet
   - Paiements mobiles intégrés
   - Notifications push
   - Support multilingue avec RTL

3. **Qualité & Performance**:
   - Tests rigoureux (iOS + Android)
   - Optimisation performance (FlatList, images, bundle)
   - Crash reporting (Sentry)
   - Analytics intégrés

4. **Engagement Client**:
   - App native (meilleure rétention)
   - Notifications push (réengagement)
   - Expérience offline (cache)

### Comparaison

- **Solution template**: 400,000 - 600,000 DZD (fonctionnalités limitées, peu personnalisable)
- **Solution proposée**: 1,413,500 DZD (sur-mesure, complet, iOS + Android)
- **Solutions séparées**: 2,000,000 - 3,000,000 DZD (app native iOS + native Android séparées)

---

## 12. Conditions & Hypothèses

### Inclus dans le budget:
- Développement iOS + Android (React Native)
- Tests (unitaires, intégration, E2E)
- Optimisation performance
- Support multilingue (AR RTL, FR, EN)
- Notifications push (FCM)
- Soumission App Store + Google Play
- Documentation technique
- Support 2 semaines post-livraison

### Non inclus:
- Comptes développeur annuels (année 2+)
- Devices tests (si client possède)
- Maintenance au-delà de 2 semaines
- Évolutions fonctionnelles post-livraison
- Marketing App Store Optimization (ASO)
- Campagnes publicitaires

### Hypothèses critiques:
1. **API backend disponible** selon planning
2. **Firebase project** créé dès semaine 1
3. **Credentials CIB/Baridimob** sandbox disponibles (semaine 7)
4. **Apple Developer Account** créé avant semaine 1
5. **Google Play Console** account créé avant semaine 1
6. **Validation client** sous 2-3 jours
7. **Scope stable** (pas de changements majeurs)

---

## 13. Dépendances Critiques

### Dépendances Backend (API)
- **Semaine 2**: API Auth
- **Semaine 3-5**: API Products & Search
- **Semaine 6**: API Cart
- **Semaine 7-8**: API Orders & Payments
- **Semaine 9**: API User & Orders
- **Semaine 10**: API Notifications

**Impact retard backend**: +1-2 semaines, coût additionnel 120,000-240,000 DZD

### Dépendances Externes
- **Comptes développeur**: Délai création 1-2 jours
- **Firebase**: Setup immédiat
- **Sandbox CIB/Baridimob**: Peut prendre 1-2 semaines
- **Stores Review**: iOS (1-7 jours), Android (1-3 jours)

---

## 14. Timeline Soumission Stores

### Semaine 11-12: Beta Testing & Soumission

| Activité | Durée | Coût (si support) |
|----------|-------|-------------------|
| Beta Testing (TestFlight + Play Internal) | 1 semaine | 60,000 |
| Corrections feedback beta | 3-5 jours | 40,000 |
| Soumission App Store (iOS) | 1 jour | 0 |
| Soumission Google Play (Android) | 1 jour | 0 |
| Review App Store (Apple) | 1-7 jours | 0 |
| Review Google Play | 1-3 jours | 0 |
| Corrections si rejection | Variable | 40,000 - 80,000 |

**Total post-dev (optionnel)**: 100,000 - 180,000 DZD

---

**Version**: 1.0
**Date**: Novembre 2025
**Validité**: 60 jours
**Statut**: Estimation détaillée
