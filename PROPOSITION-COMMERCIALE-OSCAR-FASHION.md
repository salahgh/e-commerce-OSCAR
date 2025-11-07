# PROPOSITION COMMERCIALE ET TECHNIQUE
## Plateforme E-commerce OSCAR Fashion

---

**Date**: Novembre 2025

---

# TABLE DES MATIÈRES

1. [Résumé Exécutif](#1-résumé-exécutif)
2. [Vue d'ensemble du Projet](#2-vue-densemble-du-projet)
3. [Architecture Technique](#3-architecture-technique)
4. [Composants du Projet](#4-composants-du-projet)
   - 4.1 [Backend API](#41-backend-api)
   - 4.2 [Frontend Web](#42-frontend-web)
   - 4.3 [Back-Office Admin](#43-back-office-admin)
   - 4.4 [Application Mobile](#44-application-mobile)
5. [Planning Global](#5-planning-global)
6. [Budget Détaillé](#6-budget-détaillé)
7. [Livrables](#7-livrables)
8. [Plan de Paiement](#8-plan-de-paiement)
9. [Garanties et Support](#9-garanties-et-support)
10. [Conditions Contractuelles](#10-conditions-contractuelles)
11. [Signatures](#11-signatures)

---

# 1. RÉSUMÉ EXÉCUTIF

## 1.1 Présentation

OSCAR Fashion souhaite développer une **solution e-commerce complète et moderne** comprenant:
- Une plateforme web responsive (desktop et mobile)
- Des applications mobiles natives (iOS et Android)
- Un back-office d'administration complet
- Une API backend robuste et sécurisée

## 1.2 Chiffres Clés

| Métrique | Valeur                         |
|----------|--------------------------------|
| **Durée totale** | 26 semaines (6.5 mois)         |
| **Heures estimées** | 5,520 heures                   |
| **Budget total** | **1,150,000 DZD**              |
| **Plateformes** | Web, iOS, Android              |
| **Langues** | Arabe (RTL), Français, Anglais |

## 1.3 Technologies Principales

- **Backend**: Spring Boot + GraphQL (SPQR)
- **Frontend Web**: Next.js 15 + Tailwind CSS
- **Back-Office**: React.js + Tailwind CSS + Redux
- **Mobile**: React Native
- **Base de données**: PostgreSQL
- **Paiements**: CIB, Baridimob, Cash on Delivery

---

# 2. VUE D'ENSEMBLE DU PROJET

## 2.1 Objectifs

### Objectifs Business
- Digitaliser l'activité de vente OSCAR Fashion
- Offrir une expérience client moderne et fluide
- Augmenter la portée commerciale (web + mobile)
- Faciliter la gestion administrative via back-office
- Intégrer les moyens de paiement algériens

### Objectifs Techniques
- Architecture moderne et scalable
- Performance optimale
- Sécurité renforcée (HTTPS, JWT)
- Support multilingue avec RTL pour l'arabe
- Synchronisation temps réel avec systèmes existants (ERP/WMS)

## 2.2 Périmètre Fonctionnel

### Fonctionnalités Principales

#### Pour les Clients
✅ Catalogue produits avec recherche et filtres avancés
✅ Gestion de panier et wishlist
✅ Tunnel de commande sécurisé
✅ Profil utilisateur et historique des commandes
✅ Paiement en ligne (CIB, Baridimob) et à la livraison
✅ Suivi de commande en temps réel
✅ Notifications (Email)
✅ Support multilingue (AR, FR, EN)

#### Pour les Administrateurs
✅ Dashboard avec KPIs et statistiques en temps réel
✅ Gestion complète des produits (CRUD, import, export)
✅ Gestion des commandes et statuts
✅ Gestion des clients
✅ Génération de rapports (PDF)
✅ Gestion des utilisateurs administrateurs

#### Intégrations
✅ Passerelles de paiement (CIB, Baridimob)
✅ Synchronisation ERP/WMS
✅ Service d'emailing (SMTP)

---

# 3. ARCHITECTURE TECHNIQUE

## 3.1 Architecture Globale

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
│  │ (Email/SMS)  │  │  (iText PDF) │  │                │ │
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

## 3.2 Stack Technique Détaillée

### Backend (API GraphQL)
- **Framework**: Spring Boot 3.x (Java 17+)
- **API**: GraphQL avec SPQR
- **Base de données**: PostgreSQL 14+
- **Sécurité**: Spring Security + JWT
- **PDF**: iText 7
- **Documentation**: GraphQL Playground + Voyager

### Frontend Web (Next.js)
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI**: Tailwind CSS
- **Data**: Apollo Client + GraphQL Code Generation
- **Forms**: Formik + Yup
- **i18n**: next-intl (avec support RTL)

### Back-Office (React)
- **Framework**: React.js 18 + Vite
- **Language**: TypeScript
- **UI**: Tailwind CSS + MUI X Charts (analytics)
- **State**: Redux Toolkit
- **Data**: Apollo Client + GraphQL Code Generation
- **Forms**: Formik + Yup

### Mobile (React Native)
- **Framework**: React Native
- **Language**: TypeScript
- **Data**: Apollo Client + GraphQL Code Generation
- **Forms**: Formik + Yup
- **Plateformes**: iOS et Android

---

# 4. COMPOSANTS DU PROJET

## 4.1 BACKEND API

### 4.1.1 Description

Le backend constitue le cœur de la plateforme. Il expose une **API GraphQL unique** qui sert tous les clients (web, mobile, back-office).

### 4.1.2 Fonctionnalités Détaillées

#### Module Authentification & Utilisateurs
- Inscription et connexion (JWT)
- Gestion de profil utilisateur
- Gestion des adresses de livraison
- Récupération de mot de passe (email)
- Rôles et permissions (CUSTOMER, ADMIN, SUPER_ADMIN)

#### Module Produits & Catalogue
- CRUD produits avec support multilingue
- Gestion des catégories (hiérarchiques)
- Gestion des attributs (taille, couleur, matière)
- Gestion du stock
- Recherche avancée et filtrage
- Synchronisation avec ERP/WMS

#### Module Panier & Commandes
- Gestion de panier (persistant pour utilisateurs connectés)
- Création et gestion de commandes
- Calcul automatique des frais de livraison
- Workflow de statuts (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
- Historique des commandes

#### Module Paiements
- Intégration passerelle CIB
- Intégration passerelle Baridimob
- Paiement à la livraison (COD)
- Gestion des callbacks et vérifications
- Logs de transactions sécurisés

#### Module Notifications
- Emails transactionnels (confirmation, suivi)
- Notifications en temps réel (WebSocket/GraphQL Subscriptions)

#### Module Reporting
- Statistiques de ventes (jour, semaine, mois, année)
- Produits les plus vendus
- Analyse des revenus
- Rapports clients
- Génération de factures PDF (iText)

#### Module Synchronisation ERP/WMS
- Synchronisation produits (bidirectionnelle)
- Synchronisation stocks en temps réel
- Transmission des commandes
- Mise à jour des statuts de livraison
- Logs et gestion des erreurs

### 4.1.3 Schéma GraphQL (Exemples)

### 4.1.4 Calendrier Backend

**Durée**: 16 semaines
**Heures**: 1,920 heures

| Phase | Semaines | Livrables |
|-------|----------|-----------|
| **Phase 1: Setup & Sécurité** | 1-2 | Architecture, BD, JWT, GraphQL configuré |
| **Phase 2: Utilisateurs** | 3-4 | Auth complète, profils, adresses |
| **Phase 3: Catalogue** | 5-7 | Produits, catégories, API CRUD, sync |
| **Phase 4: Commandes** | 8-10 | Panier, commandes, workflow statuts |
| **Phase 5: Paiements** | 11-13 | CIB, Baridimob, COD, remboursements |
| **Phase 6: Notifications & Reports** | 14-15 | Emails, SMS, PDF (iText), stats |
| **Phase 7: Synchronisation ERP** | 16 | Intégration ERP/WMS complète |

### 4.1.5 Budget Backend

| Catégorie | Montant (DZD) |
|-----------|---------------|
| Développement (RH) | 355,200 |
| Infrastructure & Outils | 10,500 |
| Contingence (10%) | 36,570 |
| **TOTAL BACKEND** | **402,270** |

---

## 4.2 FRONTEND WEB

### 4.2.1 Description

Application web moderne développée avec **Next.js 15** et **Tailwind CSS**, offrant une expérience utilisateur fluide avec rendu côté serveur (SSR) et génération statique (SSG) pour un SEO optimal.

### 4.2.2 Fonctionnalités Détaillées

#### Pages Principales

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
- SSR pour SEO

**Détail Produit**
- Galerie d'images (zoom, lightbox)
- Informations détaillées
- Sélection de variantes (taille, couleur)
- Quantity selector
- Add to cart avec animation
- Produits similaires
- SSG pour performance

**Panier**
- Liste des articles
- Modification quantité
- Suppression d'articles
- Code promo
- Récapitulatif (sous-total, livraison, total)
- Persistance (localStorage + backend)

**Checkout (4 étapes)**
1. Adresse de livraison
2. Méthode de livraison
3. Méthode de paiement
4. Confirmation

**Profil Utilisateur**
- Informations personnelles
- Mes adresses
- Historique des commandes
- Téléchargement factures PDF

**Authentification**
- Login / Register
- Forgot / Reset password
- Email verification

#### Fonctionnalités Techniques

- **SSR/SSG**: Performance et SEO optimaux avec Next.js
- **GraphQL**: Apollo Client avec code generation
- **Tailwind CSS**: Design moderne et responsive
- **i18n**: Support AR (RTL) / FR / EN avec next-intl
- **Formik + Yup**: Validation de formulaires
- **SEO**: Meta tags dynamiques, sitemap, structured data
- **Performance**: Lighthouse score > 90

### 4.2.3 Calendrier Frontend

**Durée**: 12 semaines
**Heures**: 1,440 heures

| Phase | Semaines | Livrables |
|-------|----------|-----------|
| **Phase 1: Setup & Layout** | 1-2 | Next.js configuré, layout, navigation |
| **Phase 2: Auth & Profil** | 3-4 | Authentification, profil complet |
| **Phase 3: Catalogue & Produits** | 5-7 | Catalogue, recherche, détail produit |
| **Phase 4: Panier & Checkout** | 8-10 | Panier, tunnel commande complet |
| **Phase 5: Home & Optimisation** | 11-12 | Homepage, SEO, i18n, tests |

### 4.2.4 Budget Frontend

| Catégorie | Montant (DZD) |
|-----------|---------------|
| Développement (RH) | 266,400       |
| Infrastructure & Outils | 0             |
| Contingence (10%) | 26,690        |
| **TOTAL FRONTEND** | **293,590**   |

---

## 4.3 BACK-OFFICE ADMIN

### 4.3.1 Description

Interface d'administration développée en **React.js** avec **Tailwind CSS** et **MUI X Charts** pour les graphiques, permettant de gérer l'ensemble de la plateforme.

### 4.3.2 Fonctionnalités Détaillées

#### Dashboard
- KPIs en temps réel (revenus, commandes, clients, conversion)
- Graphique évolution des ventes (Line Chart)
- Répartition ventes par catégorie (Pie Chart)
- Top 10 produits (Bar Chart)
- Dernières commandes
- Alertes stock faible

#### Gestion Produits
- Liste produits (table avec pagination, tri, filtres)
- Formulaire produit (multilingue AR/FR/EN)
- Upload et gestion d'images (drag & drop)
- Gestion catégories (hiérarchique)
- Gestion attributs (taille, couleur, matière)

#### Gestion Commandes
- Liste commandes (filtres par statut, date, montant)
- Détail commande complet
- Modification de statut
- Génération facture PDF
- Annulation et remboursement

#### Gestion Clients
- Liste clients
- Détail client (commandes, stats)
- Gestion adresses
- Bloquer/débloquer client

#### Rapports & Statistiques
- Rapport des ventes (période personnalisée)
- Top produits
- Rapport clients
- Rapport revenus
- Export PDF

#### Gestion Utilisateurs Admin
- Liste administrateurs
- Création/modification admin
- Gestion des rôles (ADMIN, SUPER_ADMIN, MANAGER)
- Permissions granulaires

#### Paramètres
- Informations boutique
- Configuration emails (SMTP)
- Configuration paiements (CIB, Baridimob)
- Configuration livraison
- Synchronisation ERP/WMS

### 4.3.3 Calendrier Back-Office

**Durée**: 8 semaines
**Heures**: 960 heures

| Phase | Semaines | Livrables |
|-------|----------|-----------|
| **Phase 1: Setup & Dashboard** | 1-2 | Layout, dashboard avec charts |
| **Phase 2: Gestion Produits** | 3-4 | CRUD produits, catégories |
| **Phase 3: Gestion Commandes** | 5-6 | Liste, détail, gestion statuts, PDF |
| **Phase 4: Clients & Finitions** | 7-8 | Clients, rapports, paramètres, sync |

### 4.3.4 Budget Back-Office

| Catégorie | Montant (DZD) |
|-----------|---------------|
| Développement (RH) | 177,600 |
| Infrastructure & Outils | 0 |
| Contingence (10%) | 17,760 |
| **TOTAL BACK-OFFICE** | **195,360** |

---

## 4.4 APPLICATION MOBILE

### 4.4.1 Description

Applications mobiles natives pour **iOS** et **Android** développées avec **React Native**, offrant une expérience d'achat optimisée pour mobile.

### 4.4.2 Fonctionnalités Détaillées

#### Écrans Principaux

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

**Panier**
- Liste articles
- Modification quantité
- Swipe-to-delete
- Code promo
- Récapitulatif
- Badge sur tab navigation

**Checkout (4 étapes)**
1. Adresse de livraison
2. Méthode de livraison
3. Paiement (WebView pour CIB/Baridimob)
4. Confirmation

**Profil**
- Informations personnelles
- Mes adresses
- Historique commandes
- Paramètres (langue, notifications)

**Authentification**
- Login / Register
- Forgot password
- Email verification

#### Fonctionnalités Techniques

- **Expo**: Développement et déploiement simplifiés
- **GraphQL**: Apollo Client avec code generation
- **Navigation**: React Navigation (Stack, Tab, Drawer)
- **Forms**: Formik + Yup
- **i18n**: Support AR (RTL) / FR / EN
- **Performance**: FlatList optimisée, lazy loading

### 4.4.3 Calendrier Mobile

**Durée**: 10 semaines
**Heures**: 1,200 heures

| Phase | Semaines | Livrables |
|-------|----------|-----------|
| **Phase 1: Setup & Auth** | 1-2 | Expo configuré, navigation, auth |
| **Phase 2: Catalogue & Produits** | 3-5 | Home, catalogue, recherche, détail |
| **Phase 3: Panier & Checkout** | 6-8 | Panier, checkout, paiements WebView |
| **Phase 4: Profil & Finitions** | 9-10 | Profil, commandes, i18n, optimisation |

### 4.4.4 Budget Mobile

| Catégorie | Montant (DZD) |
|-----------|---------------|
| Développement (RH) | 222,000 |
| Comptes développeur (Apple + Google) | 15,000 |
| Services & Outils | 0 |
| Contingence (10%) | 23,700 |
| **TOTAL MOBILE** | **260,700** |

---

# 5. PLANNING GLOBAL

## 5.1 Timeline Consolidée

**Durée totale**: 26 semaines (6.5 mois)

```
Semaines:  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17-26
─────────────────────────────────────────────────────────────────
Backend:   ████████████████████████████████████████████████
Frontend:              ████████████████████████████████████
Mobile:                    ████████████████████████████████
BackOffice:                        ████████████████████████
─────────────────────────────────────────────────────────────────
           │Phase 1│  Phase 2  │  Phase 3  │  Phase 4  │Tests│
```

## 5.2 Phases Principales

### Phase 1: Découverte & Conception (Semaines 1-4)
**Objectif**: Finaliser architecture, design et spécifications

**Activités**:
- Ateliers de cadrage avec OSCAR Fashion
- Finalisation spécifications fonctionnelles
- Conception architecture technique (schéma BD, API GraphQL)
- Conception UX/UI (wireframes, maquettes, prototype Figma)
- Validation parcours utilisateurs
- Setup environnements de développement

**Livrables**:
- Document spécifications validé
- Schéma base de données (ERD)
- Contrat API GraphQL (schéma)
- Maquettes UI/UX validées
- Prototype interactif (Figma)
- Environnements dev configurés

---

### Phase 2: Fondations Backend (Semaines 5-10)
**Objectif**: Développer le socle technique et l'API

**Activités**:
- Développement backend GraphQL (SPQR)
- Authentification & gestion utilisateurs
- API Produits & Catalogue
- API Panier & début Commandes
- Synchronisation de base avec ERP/WMS

**Livrables**:
- API GraphQL Auth fonctionnelle
- API GraphQL Produits & Catégories
- API GraphQL Panier
- GraphQL Playground accessible
- Tests unitaires & intégration
- Documentation API

---

### Phase 3: Développement Frontend/Mobile (Semaines 11-16)
**Objectif**: Construire les interfaces utilisateurs

**Activités Parallèles**:

**Frontend Web (Next.js)**:
- Catalogue produits et recherche
- Détail produit
- Panier et checkout
- Profil utilisateur
- Homepage et SEO

**Back-Office (React)**:
- Dashboard avec charts
- Gestion produits
- Gestion commandes
- Gestion clients

**Mobile (Expo)**:
- Catalogue et recherche
- Détail produit
- Panier et checkout
- Profil et commandes

**Backend (continué)**:
- Paiements (CIB, Baridimob)
- Notifications (Email, SMS)
- Reporting & PDF (iText)
- Finalisation sync ERP/WMS

**Livrables**:
- Frontend web complet (SSR/SSG)
- Back-office admin complet
- Apps mobiles iOS + Android
- Backend API complète
- Intégrations paiements fonctionnelles

---

### Phase 4: Intégrations & Optimisation (Semaines 17-22)
**Objectif**: Finaliser intégrations et optimiser

**Activités**:
- Tests d'intégration paiements (CIB, Baridimob sandbox)
- Optimisation performance (frontend, mobile)
- Support multilingue complet (AR RTL, FR, EN)
- Génération PDF (factures, bons de livraison)
- Tests de synchronisation ERP/WMS
- Optimisation SEO web
- Tests cross-browser / cross-device

**Livrables**:
- Paiements CIB & Baridimob validés
- Multilingue complet avec RTL
- Performance optimisée (Lighthouse > 90)
- PDF fonctionnels
- Sync ERP/WMS testée

---

### Phase 5: Tests, Recette & Déploiement (Semaines 23-26)
**Objectif**: Assurer qualité et déployer

**Semaines 23-24: QA (Quality Assurance)**
- Tests fonctionnels (tous parcours)
- Tests transactions paiement (sandbox)
- Tests synchronisation temps réel
- Tests performance (< 3s)
- Tests responsive (devices)
- Tests multilingue (AR RTL)

**Semaine 25: UAT & Sécurité**
- Recette client (User Acceptance Testing)
- Corrections retours UAT
- Tests de sécurité (OWASP basics)
- Audit basique pénétration

**Semaine 26: Déploiement**
- Mise en production backend + web
- Soumission App Store (iOS)
- Soumission Google Play (Android)
- Formation administrateurs (2 jours)
- Documentation finale
- Handover

**Livrables**:
- Plateforme déployée en production
- Apps mobiles soumises aux stores
- Documentation utilisateur et technique
- Formation effectuée
- PV de recette signé

---

## 5.3 Jalons Majeurs (Milestones)

| Semaine | Jalon | Validation |
|---------|-------|------------|
| **Semaine 4** | Architecture & Design finalisés | ✓ Client |
| **Semaine 10** | Backend API core fonctionnel | ✓ Tests techniques |
| **Semaine 13** | Paiements intégrés (sandbox) | ✓ Client + Tests |
| **Semaine 16** | Tous composants développés | ✓ Tests techniques |
| **Semaine 22** | Intégrations complètes | ✓ Tests intégration |
| **Semaine 25** | UAT validée | ✓ Client |
| **Semaine 26** | **LIVRAISON FINALE** | ✓ PV recette |

---

# 6. BUDGET DÉTAILLÉ

## 6.1 Récapitulatif Global

| Composant | Heures | Coût Base (DZD) | Contingence 10% | **Total (DZD)** |
|-----------|--------|-----------------|-----------------|-----------------|
| **Backend API** | 1,920 | 365,700 | 36,570 | **402,270** |
| **Frontend Web** | 1,440 | 266,900 | 26,690 | **293,590** |
| **Back-Office** | 960 | 177,600 | 17,760 | **195,360** |
| **Mobile (iOS+Android)** | 1,200 | 237,000 | 23,700 | **260,700** |
| **TOTAL PROJET** | **5,520** | **1,047,200** | **104,720** | **1,151,920** |

## 6.2 Répartition Budgétaire

```
Backend:     37% ████████████████████████
Frontend:    26% ████████████████
BackOffice:  16% ██████████
Mobile:      21% █████████████
```

## 6.3 Détail par Catégorie

### Contingence (10%)

**Montant**: 104,720 D
**Couvre**:
- Complexité technique imprévue
- Retards dépendances externes (CIB, Baridimob)
- Modifications mineures de scope
- Bugs critiques
- Tests supplémentaires

### Exclusions (Non Inclus)

❌ **Infrastructure Production**:
- Serveurs production
- Noms de domaine
- Certificats SSL
- CDN production
- Hébergement cloud (AWS, Azure, etc.)

❌ **Contenu**:
- Photos produits professionnelles
- Descriptions produits
- Shooting photo
- Import données existantes

❌ **Maintenance Long Terme**:
- Support au-delà de 2 semaines
- Évolutions fonctionnelles
- Nouvelles intégrations

---

# 7. LIVRABLES

## 7.1 Livrables Techniques

### Backend API
✅ Code source (repository Git)
✅ Base de données PostgreSQL (scripts migration)
✅ API GraphQL documentée (Playground + Voyager)
✅ Tests unitaires & intégration
✅ Documentation technique (architecture, déploiement)
✅ Configuration Docker
✅ Variables d'environnement (.env.example)

### Frontend Web (Next.js)
✅ Code source (repository Git)
✅ Application web déployée
✅ Build optimisé (production)
✅ Documentation technique
✅ Guide de déploiement
✅ Configuration multilingue (AR/FR/EN)

### Back-Office Admin
✅ Code source (repository Git)
✅ Application admin déployée
✅ Build optimisé (production)
✅ Documentation technique
✅ Guide utilisateur administrateur (PDF)
✅ Vidéos tutoriels (optionnel)

### Application Mobile
✅ Code source (repository Git)
✅ Build iOS (.ipa) + certificats
✅ Build Android (.apk/.aab)
✅ App soumise sur App Store
✅ App soumise sur Google Play Store
✅ Documentation technique
✅ Guide de build et déploiement

## 7.2 Livrables Documentaires

### Documentation Technique
✅ Architecture globale (schémas)
✅ Schéma base de données (ERD)
✅ Documentation API GraphQL (auto-générée)
✅ Guide d'installation (dev & prod)
✅ Guide de déploiement (étape par étape)
✅ Configuration serveurs
✅ Variables d'environnement requises

### Documentation Utilisateur
✅ Guide utilisateur client (web & mobile)
✅ Guide administrateur (back-office)
✅ FAQ

### Documentation Projet
✅ Spécifications fonctionnelles finales
✅ Spécifications techniques
✅ Comptes-rendus des réunions
✅ Cahier de recette (test plan)

## 7.3 Formation

✅ **Formation Administrateurs** (2 jours)
   - Gestion des produits
   - Gestion des commandes
   - Reporting
   - Configuration système
   - Synchronisation ERP/WMS

## 7.4 Support Post-Livraison

✅ **Support Inclus** (2 semaines)
   - Assistance déploiement production
   - Corrections bugs critiques
   - Réponses questions techniques
   - Hotfixes si nécessaire

---

# 8. PLAN DE PAIEMENT

## 8.1 Échéancier Recommandé

| Phase | Jalon / Événement | % | Montant (DZD) | Date Estimée |
|-------|-------------------|---|---------------|--------------|
| **Acompte** | Signature du contrat | 20% | 230,384 | Semaine 0 |
| **Jalon 1** | Backend Auth + Produits fonctionnels | 20% | 230,384 | Semaine 8 |
| **Jalon 2** | Frontend/Mobile Catalogue OK | 20% | 230,384 | Semaine 12 |
| **Jalon 3** | Paiements intégrés (sandbox validé) | 20% | 230,384 | Semaine 14 |
| **Jalon 4** | Livraison finale (tests UAT validés) | 15% | 172,788 | Semaine 26 |
| **Jalon 5** | Support post-livraison (2 semaines) | 5% | 57,596 | Semaine 28 |
| **TOTAL** | | **100%** | **1,151,920** | |

## 8.2 Conditions de Paiement

### Modalités
- Délai de paiement: **15 jours** après réception facture
- Facture émise à chaque jalon validé

### Validation des Jalons
- **Validation technique**: Tests passent + code review
- **Validation client**: Démonstration + tests acceptance
- **Sans retour**: Jalon considéré validé après 5 jours

## 8.3 Paiements Optionnels (Hors Forfait)

### Changements de Scope
- **Change Request**: Évaluation impact (3 jours)
- **Tarif**: 185 DZD/heure développement
- **Validation**: Avenant signé avant mise en œuvre

# 9. GARANTIES ET SUPPORT

## 9.1 Garantie Qualité

### Standards de Qualité

✅ **Code**:
- Code review systématique
- Conventions de codage respectées
- Documentation inline

✅ **Performance**:
- API: Temps de réponse < 500ms (90% requêtes)
- Web: Temps de chargement < 3s
- Mobile: Interface fluide (60 fps)
- Lighthouse score > 90 (web)

✅ **Sécurité**:
- HTTPS obligatoire
- JWT sécurisé (durées adaptées)
- Sanitisation des entrées

✅ **Compatibilité**:
- **Web**: Chrome, Firefox, Safari, Edge (2 dernières versions)
- **Mobile iOS**: iOS 13+
- **Mobile Android**: Android 8+ (API 26+)
- **Responsive**: Desktop, tablet, mobile

## 9.2 Support Post-Livraison (Inclus)

### Période de Garantie: 2 Semaines

**Inclus**:
✅ Corrections bugs critiques (bloquants)
✅ Assistance déploiement production
✅ Support questions techniques
✅ Hotfixes si nécessaire
✅ Ajustements mineurs configuration

## 9.3 Exclusions de Garantie

❌ Bugs causés par:
- Modifications du code par le client
- Infrastructure inadéquate
- Utilisation non conforme
- Intégrations tierces défaillantes

❌ Non couvert:
- Formation supplémentaire
- Nouvelles fonctionnalités
- Modifications de design
- Évolutions fonctionnelles

---

# 10. CONDITIONS CONTRACTUELLES

## 10.1 Durée du Contrat

- **Durée**: 26 semaines à partir de la signature
- **Date début**: À définir lors de la signature
- **Date fin estimée**: Livraison finale + 2 semaines support
- **Extension**: Possible via avenant si retards justifiés

## 10.2 Responsabilités du Client (OSCAR Fashion)

### Avant le Démarrage
✅ Validation des spécifications fonctionnelles
✅ Fourniture de la charte graphique
✅ Fourniture du logo et assets visuels
✅ Accès à l'API ERP/WMS (documentation + credentials test)

### Pendant le Projet
✅ Disponibilité pour réunions hebdomadaires
✅ Validation des jalons sous **3 jours ouvrables**
✅ Fourniture du contenu:
   - Photos produits haute résolution
   - Descriptions produits (AR, FR, EN)
   - Textes marketing homepage
   - Informations légales (CGV, politique confidentialité)

✅ Obtention credentials paiement:
   - CIB: Merchant ID, clés API (sandbox + prod)
   - Baridimob: Merchant ID, clés API (sandbox + prod)

✅ Configuration services:
   - Serveur SMTP (emails)
   - Gateway SMS algérien

✅ Tests UAT (User Acceptance Testing)
✅ Formation des administrateurs (présence requise)

### Après Livraison
✅ Fourniture infrastructure production:
   - Serveurs (backend, frontend, BDD)
   - Noms de domaine + SSL
   - Hébergement (ou accord sur cloud provider)

✅ Mise en place monitoring production
✅ Signature PV de recette

## 10.3 Responsabilités du Prestataire

### Développement
✅ Développement selon spécifications validées
✅ Respect des standards de qualité
✅ Code reviews systématiques
✅ Documentation technique complète
✅ Tests (unitaires, intégration)

### Communication
✅ Réunions hebdomadaires (status, risques)
✅ Rapports d'avancement hebdomadaires
✅ Alertes immédiates si blocages
✅ Transparence sur l'avancement

### Livraison
✅ Respect des délais (sauf cas de force majeure)
✅ Code source complet et documenté
✅ Applications déployées
✅ Formation administrateurs (2 jours)
✅ Support 2 semaines post-livraison

## 10.4 Gestion des Changements (Change Requests)

### Processus
1. **Demande formelle** du client (email ou formulaire)
2. **Analyse d'impact** par le prestataire (délais, coûts) - **3 jours**
3. **Devis avenant** si approuvé
4. **Signature avenant** avant mise en œuvre
5. **Ajustement planning** si impact > 1 semaine

### Tarification
- **Changements mineurs** (< 2h dev): Budget contingence (si disponible)
- **Changements majeurs**: Avenant avec nouveau budget et planning

### Exclusions
❌ Changements impactant architecture globale
❌ Changements de stack technique
❌ Ajout de fonctionnalités hors scope initial
(Nécessitent renégociation complète)

## 10.5 Propriété Intellectuelle

### Code Source
- **Propriété**: Transférée au client après **paiement intégral**
- **Licence**: MIT ou équivalent (à définir)
- **Repository**: Transféré au client à la livraison

### Composants Tiers
- **Licences open-source**: Respectives (MIT, Apache, etc.)
- **Dépendances**: Listées dans documentation

### Documentation
- **Propriété**: Client après paiement intégral

### Exclusions
❌ Frameworks et bibliothèques open-source (propriété respective)
❌ Outils de développement du prestataire

## 10.6 Confidentialité

### Engagement de Confidentialité
- **NDA**: Accord de confidentialité signé
- **Données sensibles**: Protection et non-divulgation
- **Credentials**: Stockage sécurisé, suppression post-projet
- **Code**: Pas de réutilisation pour autres clients sans accord

### Données Client
- **Protection**: Conformité RGPD (si applicable)
- **Accès**: Limité à l'équipe projet
- **Suppression**: Données de dev supprimées post-projet

## 10.7 Cas de Force Majeure

### Événements Couverts
- Catastrophes naturelles
- Guerres, émeutes
- Pandémies
- Défaillance infrastructure critique (Internet, électricité)
- Grèves générales

### Conséquences
- **Suspension** des obligations sans pénalités
- **Prolongation** du délai de livraison
- **Notification** immédiate à l'autre partie

## 10.8 Résiliation

### Résiliation par le Client
- **Notification**: 30 jours préavis
- **Paiement dû**: Travaux réalisés + frais engagés
- **Livraison**: Code source état actuel

### Résiliation par le Prestataire
- **Motifs**: Défaut paiement > 60 jours, non-respect obligations client
- **Notification**: 30 jours préavis
- **Travaux en cours**: Arrêtés, non livrés

## 10.9 Litiges

### Résolution Amiable
- **Tentative**: Négociation amiable (30 jours)
- **Médiation**: Si échec négociation

### Juridiction
- **Loi applicable**: Droit algérien
- **Tribunal compétent**: [Ville, Algérie]

---

# 11. SIGNATURES

## 11.1 Acceptation de la Proposition

En signant ce document, les parties acceptent les termes et conditions de cette proposition commerciale et technique pour le développement de la plateforme e-commerce OSCAR Fashion.

### Pour le Client (OSCAR Fashion)

**Nom**: ________________________________

**Fonction**: ________________________________

**Signature**: ________________________________

**Date**: ______ / ______ / 20______

**Cachet de l'entreprise**:

---

### Pour le Prestataire

**Nom**: ________________________________

**Fonction**: ________________________________

**Signature**: ________________________________

**Date**: ______ / ______ / 20______

**Cachet de l'entreprise**:

---

## 11.2 Coordonnées

### Client - OSCAR Fashion
**Adresse**: ________________________________
**Téléphone**: ________________________________
**Email**: ________________________________
**RC**: ________________________________
**NIF**: ________________________________

### Prestataire
**Nom de l'entreprise**: ________________________________
**Adresse**: ________________________________
**Téléphone**: ________________________________
**Email**: ________________________________
**Site web**: ________________________________
**RC**: ________________________________
**NIF**: ________________________________

---

# ANNEXES

## Annexe A: Glossaire Technique

| Terme | Définition |
|-------|------------|
| **API** | Application Programming Interface - Interface de programmation |
| **GraphQL** | Langage de requête pour API, alternative à REST |
| **SPQR** | GraphQL Java library pour génération schéma automatique |
| **JWT** | JSON Web Token - Standard d'authentification |
| **SSR** | Server-Side Rendering - Rendu côté serveur |
| **SSG** | Static Site Generation - Génération statique |
| **RTL** | Right-to-Left - Sens de lecture droite à gauche (arabe) |
| **PWA** | Progressive Web App - Application web progressive |
| **SEO** | Search Engine Optimization - Optimisation moteurs de recherche |
| **CRUD** | Create, Read, Update, Delete - Opérations de base |
| **ERP** | Enterprise Resource Planning - Progiciel de gestion intégré |
| **WMS** | Warehouse Management System - Système gestion entrepôt |
| **COD** | Cash On Delivery - Paiement à la livraison |
| **UAT** | User Acceptance Testing - Tests de recette utilisateur |

## Annexe B: Technologies Détaillées

### Backend
- Spring Boot 3.x
- GraphQL SPQR 0.0.6
- PostgreSQL 14+
- iText 7.2.5
- Spring Security
- JWT (jjwt 0.11.5)

### Frontend Web
- Next.js 14.0
- React 18.2
- TypeScript 5.2
- Tailwind CSS 3.3
- Apollo Client 3.8
- Formik 2.4 + Yup 1.3
- next-intl 3.0

### Back-Office
- React 18.2
- Vite 5.0
- TypeScript 5.2
- Tailwind CSS 3.3
- Apollo Client 3.8
- Redux Toolkit 1.9
- MUI X Charts 6.18
- Formik 2.4 + Yup 1.3

### Mobile
- React Native 0.72
- Expo 49.0
- TypeScript 5.2
- Apollo Client 3.8
- React Navigation 6.0
- Formik 2.4 + Yup 1.3

## Annexe C: Matrice des Risques

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| API ERP non disponible | Moyenne | Élevé | Développer mocks, planifier buffer 2 sem |
| Retard intégration CIB/Baridimob | Élevée | Élevé | Contact précoce banques, tests sandbox tôt |
| Retard validation client | Moyenne | Moyen | SLA validation 3 jours, relances proactives |
| Changements de scope | Élevée | Élevé | Processus CR strict, avenants formels |
| Turn-over équipe | Faible | Élevé | Documentation continue, pair programming |
| Problèmes performance | Moyenne | Moyen | Tests de charge dès sem 10, optimisation continue |
| Rejection App Store/Play | Faible | Élevé | Respect guidelines, tests approfondis, privacy policy |
| Retard contenu client | Élevée | Moyen | Deadlines claires, placeholders, communication |

## Annexe D: Contacts Projet

### Équipe Prestataire

**Chef de Projet**
Nom: ________________________________
Email: ________________________________
Téléphone: ________________________________

**Architecte Technique**
Nom: ________________________________
Email: ________________________________
Téléphone: ________________________________

**Contact Commercial**
Nom: ________________________________
Email: ________________________________
Téléphone: ________________________________

### Équipe Client (OSCAR Fashion)

**Product Owner**
Nom: ________________________________
Email: ________________________________
Téléphone: ________________________________

**Référent Technique**
Nom: ________________________________
Email: ________________________________
Téléphone: ________________________________

**Référent Métier**
Nom: ________________________________
Email: ________________________________
Téléphone: ________________________________

---

**FIN DU DOCUMENT**

---

*Ce document constitue une proposition commerciale et technique pour le développement de la plateforme e-commerce OSCAR Fashion. Il engage le prestataire sur la base des spécifications et conditions décrites, sous réserve de la signature des deux parties et du respect des obligations respectives.*

**Date de création**: Novembre 2025
**Version**: 2.0
**Nombre de pages**: [Auto-généré]
**Référence**: PROP-OSCAR-2025-001
