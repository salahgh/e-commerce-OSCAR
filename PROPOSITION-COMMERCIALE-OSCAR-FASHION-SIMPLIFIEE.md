# PROPOSITION COMMERCIALE ET TECHNIQUE
## Plateforme E-commerce OSCAR Fashion

---

**Date**: Novembre 2025

---

# TABLE DES MATIÈRES

1. [Résumé du Projet](#1-résumé-du-projet)
2. [Architecture Technique](#2-architecture-technique)
3. [Version Complète - Toutes Fonctionnalités](#3-version-complète---toutes-fonctionnalités)
4. [Version Standard - Fonctionnalités Réduites](#4-version-standard---fonctionnalités-réduites)
5. [Comparatif des Versions](#5-comparatif-des-versions)
6. [Livrables](#6-livrables)
7. [Garanties et Support](#7-garanties-et-support)
8. [Responsabilités Client](#8-responsabilités-client)

---

# 1. RÉSUMÉ DU PROJET

## 1.1 Présentation

OSCAR Fashion souhaite développer une **solution e-commerce complète** comprenant:
- Une plateforme web responsive (desktop et mobile)
- Des applications mobiles natives (iOS et Android)
- Un back-office d'administration
- Une API backend robuste et sécurisée
- Synchronisation avec les systèmes ERP/WMS existants

## 1.2 Technologies Principales

| Composant | Technologie |
|-----------|-------------|
| **Backend** | Spring Boot + GraphQL (SPQR) |
| **Frontend Web** | Next.js 15 + Tailwind CSS |
| **Back-Office** | React.js + Tailwind CSS + Redux |
| **Mobile** | React Native (Expo) |
| **Base de données** | PostgreSQL |
| **Paiements** | CIB, Baridimob, Cash on Delivery |

## 1.3 Deux Versions Proposées

| | Version Complète | Version Standard |
|---|------------------|------------------|
| **Backend API** | Complet | Complet |
| **Frontend Web** | Complet avec toutes options | Essentiel |
| **Back-Office** | Complet avec graphiques | Simplifié |
| **Mobile iOS + Android** | ✅ Inclus | ✅ Inclus |


---

# 2. ARCHITECTURE TECHNIQUE

## 2.1 Architecture Globale

```
┌─────────────────────────────────────────────────────────┐
│                   CLIENTS / UTILISATEURS                │
│                                                         │
│  [Web Desktop]  [Web Mobile]  [App iOS]  [App Android]  │
└────────────────────┬────────────────────────────────────┘
                     │
                     │ HTTPS / GraphQL
                     │
┌────────────────────▼────────────────────────────────────┐
│                  API BACKEND (GraphQL)                  │
│              Spring Boot + PostgreSQL                   │
│                                                         │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │   Auth &    │  │   Products   │  │    Orders &    │  │
│  │   Users     │  │  & Catalog   │  │   Payments     │  │
│  └─────────────┘  └──────────────┘  └────────────────┘  │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │ Notifications│  │  Reporting   │  │  ERP/WMS Sync  │ │
│  │    (Email)   │  │  (iText PDF) │  │                │ │
│  └──────────────┘  └──────────────┘  └────────────────┘ │
└─────────────────────────────────────────────────────────┘
                     │
                     │ API REST
                     │
┌────────────────────▼────────────────────────────────────┐
│              SYSTÈMES EXTERNES                          │
│                                                         │
│  [ERP]  [WMS]  [CIB]  [Baridimob]                       │
└─────────────────────────────────────────────────────────┘
```

## 2.2 Stack Technique

### Backend (API GraphQL)
- Spring Boot 3.x (Java 17+)
- GraphQL avec SPQR
- PostgreSQL 14+
- Spring Security + JWT
- iText 7 (PDF)

### Frontend Web (Next.js)
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Apollo Client + GraphQL Code Generation
- Formik + Yup
- next-intl (RTL)

### Back-Office (React)
- React.js 18 + Vite
- TypeScript
- Tailwind CSS + MUI X Charts
- Redux Toolkit
- Apollo Client

### Mobile (React Native)
- React Native + Expo
- TypeScript
- Apollo Client
- React Navigation

---

# 3. VERSION COMPLÈTE - TOUTES FONCTIONNALITÉS

> Cette version inclut l'ensemble des fonctionnalités pour une solution e-commerce complète et performante.

## 3.1 Backend API

### Module Authentification & Utilisateurs
- Inscription et connexion (JWT)
- Gestion de profil utilisateur
- Gestion des adresses de livraison
- Récupération de mot de passe (email)
- Vérification email
- Rôles et permissions (CUSTOMER, ADMIN, SUPER_ADMIN)

### Module Produits & Catalogue
- CRUD produits avec support multilingue (AR/FR/EN)
- Gestion des catégories (hiérarchiques)
- Gestion des attributs (taille, couleur, matière)
- Gestion du stock
- Recherche avancée et filtrage
- Synchronisation avec ERP/WMS

### Module Panier & Commandes
- Gestion de panier (persistant pour utilisateurs connectés)
- Création et gestion de commandes
- Calcul automatique des frais de livraison
- Workflow de statuts (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
- Historique complet des commandes
- Gestion des codes promo

### Module Paiements
- Intégration passerelle CIB
- Intégration passerelle Baridimob
- Paiement à la livraison (COD)
- Gestion des callbacks et vérifications
- Logs de transactions sécurisés

### Module Notifications
- Emails transactionnels (confirmation, suivi)
- Notifications temps réel (GraphQL Subscriptions)

### Module Reporting
- Statistiques de ventes (jour, semaine, mois, année)
- Produits les plus vendus
- Analyse des revenus
- Rapports clients
- Génération de factures PDF (iText)

### Module Synchronisation ERP/WMS
- Synchronisation produits (bidirectionnelle)
- Synchronisation stocks en temps réel
- Transmission des commandes
- Mise à jour des statuts de livraison

---

## 3.2 Frontend Web (Next.js)

### Pages Principales

**Page d'Accueil**
- Hero slider (bannières promotionnelles)
- Produits vedettes (carousel)
- Nouvelles collections
- Grille de catégories
- SEO optimisé (SSG)

**Catalogue Produits**
- Grille de produits responsive
- Filtres avancés (catégorie, prix, taille, couleur)
- Tri (pertinence, prix, nouveauté)
- Pagination / infinite scroll
- Quick view produit (modal)

**Détail Produit**
- Galerie d'images (zoom, lightbox)
- Informations détaillées
- Sélection de variantes (taille, couleur)
- Add to cart avec animation
- Produits similaires
- Wishlist

**Panier**
- Liste des articles
- Modification quantité
- Suppression d'articles
- Code promo
- Récapitulatif (sous-total, livraison, total)

**Checkout (4 étapes)**
1. Adresse de livraison
2. Méthode de livraison
3. Méthode de paiement
4. Confirmation

**Profil Utilisateur**
- Informations personnelles
- Mes adresses
- Historique complet des commandes
- Wishlist
- Téléchargement factures PDF

**Authentification**
- Login / Register
- Forgot / Reset password
- Email verification

### Fonctionnalités Techniques
- SSR/SSG pour SEO optimal
- Support multilingue complet (AR RTL / FR / EN)
- Performance Lighthouse > 90

---

## 3.3 Back-Office Admin

### Dashboard
- KPIs en temps réel (revenus, commandes, clients, conversion)
- Graphique évolution des ventes (Line Chart)
- Répartition ventes par catégorie (Pie Chart)
- Top 10 produits (Bar Chart)
- Dernières commandes
- Alertes stock faible

### Gestion Produits
- Liste produits (table avec pagination, tri, filtres)
- Formulaire produit (multilingue AR/FR/EN)
- Upload et gestion d'images (drag & drop)
- Gestion catégories (hiérarchique)
- Gestion attributs (taille, couleur, matière)

### Gestion Commandes
- Liste commandes (filtres par statut, date, montant)
- Détail commande complet
- Modification de statut
- Génération facture PDF
- Annulation et remboursement

### Gestion Clients
- Liste clients
- Détail client (commandes, stats)
- Gestion adresses
- Bloquer/débloquer client

### Rapports & Statistiques
- Rapport des ventes (période personnalisée)
- Top produits
- Rapport clients
- Rapport revenus
- Export PDF

### Gestion Utilisateurs Admin
- Liste administrateurs
- Création/modification admin
- Gestion des rôles (ADMIN, SUPER_ADMIN, MANAGER)
- Permissions granulaires

### Paramètres
- Configuration emails (SMTP)
- Configuration paiements
- Configuration livraison
- Synchronisation ERP/WMS

---

## 3.4 Application Mobile (iOS & Android)

### Écrans Principaux

**Home**
- Hero slider
- Featured products
- Categories grid
- New arrivals
- Pull-to-refresh

**Catalogue**
- Product grid (2 colonnes)
- Filtres (bottom sheet)
- Tri
- Infinite scroll
- Quick add to cart

**Détail Produit**
- Image gallery (swipe, pinch-to-zoom)
- Sélection variantes
- Quantity selector
- Add to cart avec animation
- Related products
- Wishlist

**Panier**
- Liste articles
- Modification quantité
- Swipe-to-delete
- Code promo
- Récapitulatif

**Checkout (4 étapes)**
1. Adresse de livraison
2. Méthode de livraison
3. Paiement (WebView pour CIB/Baridimob)
4. Confirmation

**Profil**
- Informations personnelles
- Mes adresses
- Historique commandes
- Wishlist
- Paramètres (langue, notifications)

**Authentification**
- Login / Register
- Forgot password

---

# 4. VERSION STANDARD - FONCTIONNALITÉS RÉDUITES

> Cette version conserve les éléments essentiels (Mobile + ERP/WMS) tout en simplifiant les fonctionnalités secondaires.

## 4.1 Fonctionnalités Retirées

### ❌ Fonctionnalités E-commerce Avancées

| Élément retiré | Description | Composants affectés |
|----------------|-------------|---------------------|
| **Wishlist** | Liste de souhaits clients | Web + Mobile |
| **Codes promo** | Gestion et application des promotions | Backend + Web + Mobile |
| **Produits similaires** | Suggestions de produits associés | Web + Mobile |

---

### ❌ Fonctionnalités UX Avancées

| Élément retiré | Description | Composants affectés |
|----------------|-------------|---------------------|
| **Quick view** | Aperçu rapide produit en modal | Web |
| **Infinite scroll** | Remplacé par pagination classique | Web + Mobile |
| **Image zoom/lightbox** | Galerie d'images simplifiée | Web |
| **Pinch-to-zoom** | Zoom simplifié sur mobile | Mobile |
| **Animations avancées** | Animations add-to-cart simplifiées | Web + Mobile |

---

### ❌ Fonctionnalités Back-Office Avancées

| Élément retiré | Description |
|----------------|-------------|
| **Graphiques avancés** | Dashboard avec KPIs texte uniquement (pas de charts) |
| **Rapports PDF personnalisés** | Factures simples uniquement |
| **Permissions granulaires** | Rôles basiques (ADMIN, SUPER_ADMIN) |
| **Statistiques détaillées** | Statistiques de base uniquement |
| **Bloquer/débloquer client** | Fonctionnalité retirée |

---

## 4.2 Fonctionnalités Conservées (Version Standard)

### ✅ Backend API
- Authentification & Utilisateurs (sans vérification email)
- Produits & Catalogue complet
- Panier & Commandes (sans codes promo)
- Paiements (CIB + Baridimob + COD)
- Notifications email
- Factures PDF basiques
- **Synchronisation ERP/WMS complète**

### ✅ Frontend Web
- Page d'accueil complète
- Catalogue avec filtres et pagination
- Détail produit (galerie simple, sans zoom)
- Panier complet (sans code promo)
- Checkout complet (4 étapes)
- Profil utilisateur (sans wishlist)
- Authentification complète
- 2 langues (FR + AR avec RTL)
- SEO avec SSR

### ✅ Back-Office
- Dashboard simplifié (KPIs texte)
- Gestion produits complète
- Gestion commandes + factures PDF
- Gestion clients (sans blocage)
- Gestion administrateurs (rôles basiques)
- Paramètres & configuration ERP/WMS

### ✅ Application Mobile (iOS & Android)
- Home complète
- Catalogue avec filtres et pagination
- Détail produit (galerie simple)
- Panier complet (sans code promo)
- Checkout complet avec paiements
- Profil utilisateur (sans wishlist)
- Historique commandes
- 2 langues (FR + AR)

---

# 5. COMPARATIF DES VERSIONS

## 5.1 Tableau Comparatif Détaillé

| Fonctionnalité | Version Complète | Version Standard |
|----------------|:----------------:|:----------------:|
| **BACKEND** | | |
| Authentification JWT | ✅ | ✅ |
| Vérification email | ✅ | ❌ |
| Gestion utilisateurs | ✅ | ✅ |
| Catalogue produits | ✅ | ✅ |
| Panier & Commandes | ✅ | ✅ |
| Codes promo | ✅ | ❌ |
| Paiement CIB | ✅ | ✅ |
| Paiement Baridimob | ✅ | ✅ |
| Paiement COD | ✅ | ✅ |
| Notifications email | ✅ | ✅ |
| Notifications temps réel | ✅ | ❌ |
| Factures PDF | ✅ | ✅ (simple) |
| Rapports avancés | ✅ | ❌ |
| **Sync ERP/WMS** | ✅ | ✅ |
| **FRONTEND WEB** | | |
| Pages principales | ✅ | ✅ |
| Filtres & recherche | ✅ | ✅ |
| Wishlist | ✅ | ❌ |
| Code promo | ✅ | ❌ |
| Quick view | ✅ | ❌ |
| Infinite scroll | ✅ | ❌ (pagination) |
| Image zoom/lightbox | ✅ | ❌ |
| Produits similaires | ✅ | ❌ |
| SSR/SSG (SEO) | ✅ (SSR+SSG) | ✅ (SSR) |
| RTL complet | ✅ | ✅ |
| **BACK-OFFICE** | | |
| Dashboard KPIs | ✅ | ✅ (texte) |
| Graphiques (Charts) | ✅ | ❌ |
| Gestion produits | ✅ | ✅ |
| Gestion commandes | ✅ | ✅ |
| Gestion clients | ✅ | ✅ (simplifié) |
| Rapports PDF avancés | ✅ | ❌ |
| Permissions granulaires | ✅ | ❌ |
| Config ERP/WMS | ✅ | ✅ |
| **MOBILE** | | |
| **Application iOS** | ✅ | ✅ |
| **Application Android** | ✅ | ✅ |
| Publication stores | ✅ | ✅ |
| Wishlist | ✅ | ❌ |
| Code promo | ✅ | ❌ |
| Infinite scroll | ✅ | ❌ (pagination) |
| Pinch-to-zoom | ✅ | ❌ |
| Produits similaires | ✅ | ❌ |

---

# 6. LIVRABLES

## 6.1 Livrables Communs (Les Deux Versions)

### Backend API
- Code source (repository Git)
- Base de données PostgreSQL (scripts migration)
- API GraphQL documentée (Playground)
- Documentation technique
- Module synchronisation ERP/WMS

### Frontend Web
- Code source (repository Git)
- Application web déployée
- Build optimisé (production)
- Documentation technique

### Back-Office Admin
- Code source (repository Git)
- Application admin déployée
- Guide utilisateur administrateur

### Application Mobile
- Code source (repository Git)
- Build iOS (.ipa) + certificats
- Build Android (.apk/.aab)
- Apps soumises aux stores
- Documentation technique

### Documentation
- Architecture globale (schémas)
- Schéma base de données
- Documentation API GraphQL
- Guide d'installation et déploiement
- Guide utilisateur

### Formation
- Formation Administrateurs (gestion produits, commandes, ERP/WMS)

---

## 6.2 Livrables Additionnels Version Complète

- Tests unitaires & intégration
- GraphQL Voyager (documentation visuelle)
- Configuration multilingue 3 langues (AR/FR/EN)
- Module notifications temps réel
- Module codes promo
- Module wishlist
- Dashboard avec graphiques (MUI X Charts)
- Rapports PDF avancés

---

# 7. GARANTIES ET SUPPORT

## 7.1 Standards de Qualité

**Code**:
- Code review systématique
- Conventions de codage respectées
- Documentation inline

**Performance**:
- API: Temps de réponse < 500ms
- Web: Temps de chargement < 3s
- Mobile: Interface fluide

**Sécurité**:
- HTTPS obligatoire
- JWT sécurisé
- Sanitisation des entrées

**Compatibilité**:
- Web: Chrome, Firefox, Safari, Edge (2 dernières versions)
- Mobile iOS: iOS 13+
- Mobile Android: Android 8+
- Responsive: Desktop, tablet, mobile

## 7.2 Support Post-Livraison

**Inclus**:
- Corrections bugs critiques
- Assistance déploiement production
- Support questions techniques
- Ajustements mineurs configuration

## 7.3 Exclusions

**Non couvert**:
- Modifications du code par le client
- Infrastructure production (serveurs, domaines, SSL)
- Contenu (photos produits, descriptions)
- Formation supplémentaire
- Nouvelles fonctionnalités
- Évolutions fonctionnelles

---

# 8. RESPONSABILITÉS CLIENT

## Avant le Démarrage
- Validation des spécifications fonctionnelles
- Fourniture de la charte graphique et logo
- Accès à l'API ERP/WMS (documentation + credentials test)

## Pendant le Projet
- Disponibilité pour réunions
- Validation des jalons
- Fourniture du contenu (photos, descriptions, textes)
- Obtention credentials paiement (CIB, Baridimob)
- Comptes développeur Apple + Google (pour publication apps)

## Après Livraison
- Fourniture infrastructure production
- Mise en place monitoring
- Signature PV de recette

---

# 9. PROCHAINES ÉTAPES

1. **Choix de la version** (Complète ou Standard)
2. **Établissement du devis final**
3. **Signature du contrat**
4. **Démarrage du projet**

---

**FIN DU DOCUMENT**

---

*Ce document constitue une proposition commerciale et technique pour le développement de la plateforme e-commerce OSCAR Fashion.*

**Date de création**: Novembre 2025
**Version**: 2.0
**Référence**: PROP-OSCAR-2025-002
