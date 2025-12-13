# SPECIFICATIONS TECHNIQUES ET FONCTIONNELLES
## Plateforme E-commerce OSCAR Fashion

---

**Version**: 1.0
**Date**: Novembre 2025
**Référence**: SPEC-OSCAR-2025-001

---

# TABLE DES MATIERES

1. [Vue d'ensemble du Projet](#1-vue-densemble-du-projet)
2. [Architecture Technique](#2-architecture-technique)
3. [Spécifications Fonctionnelles](#3-specifications-fonctionnelles)
4. [Exigences Non Fonctionnelles](#4-exigences-non-fonctionnelles)
5. [Design et Expérience Utilisateur](#5-design-et-experience-utilisateur)
6. [Livrables Designer](#6-livrables-designer)
7. [Livrables Développeur](#7-livrables-developpeur)
8. [Planning des Livrables](#8-planning-des-livrables)

---

# 1. VUE D'ENSEMBLE DU PROJET

## 1.1 Présentation

OSCAR Fashion développe une **solution e-commerce complète et moderne** comprenant:
- Une plateforme web responsive (desktop et mobile)
- Des applications mobiles natives (iOS et Android)
- Un back-office d'administration complet
- Une API backend robuste et sécurisée

## 1.2 Objectifs du Projet

### Objectifs Business
- Digitaliser l'activité de vente OSCAR Fashion
- Offrir une expérience client moderne et fluide
- Augmenter la portée commerciale (web + mobile)
- Faciliter la gestion administrative via back-office
- Intégrer les moyens de paiement algériens (CIB, Baridimob, COD)

### Objectifs Techniques
- Architecture moderne et scalable
- Performance optimale (< 3 secondes de chargement)
- Sécurité renforcée (HTTPS, JWT)
- Support multilingue avec RTL pour l'arabe
- Synchronisation temps réel avec systèmes existants (ERP/WMS)

## 1.3 Périmètre du Projet

### Composants à Développer

| Composant | Description | Heures Estimées |
|-----------|-------------|-----------------|
| **Backend API** | API GraphQL avec Spring Boot | 1,920 h |
| **Frontend Web** | Application Next.js 15 | 1,440 h |
| **Back-Office** | Interface admin React.js | 960 h |
| **Mobile** | Applications iOS et Android (Expo) | 1,200 h |
| **TOTAL** | | **5,520 h** |

### Langues Supportées
- Arabe (avec support RTL complet)
- Français
- Anglais

---

# 2. ARCHITECTURE TECHNIQUE

## 2.1 Architecture Globale

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENTS / UTILISATEURS                       │
│                                                                 │
│   [Web Desktop]  [Web Mobile]  [App iOS]  [App Android]         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTPS / GraphQL
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                   API BACKEND (GraphQL)                         │
│               Spring Boot + PostgreSQL                          │
│                                                                 │
│   ┌─────────────┐  ┌──────────────┐  ┌────────────────┐         │
│   │   Auth &    │  │   Products   │  │    Orders &    │         │
│   │   Users     │  │  & Catalog   │  │   Payments     │         │
│   └─────────────┘  └──────────────┘  └────────────────┘         │
│                                                                 │
│   ┌──────────────┐  ┌──────────────┐  ┌────────────────┐        │
│   │ Notifications│  │  Reporting   │  │  ERP/WMS Sync  │        │
│   │ (Email)      │  │  (iText PDF) │  │                │        │
│   └──────────────┘  └──────────────┘  └────────────────┘        │
└─────────────────────────────────────────────────────────────────┘
                         │
                         │ API REST
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                   SYSTEMES EXTERNES                             │
│                                                                 │
│   [ERP]  [WMS]  [CIB]  [Baridimob]  [SMTP]                     │
└─────────────────────────────────────────────────────────────────┘
```

## 2.2 Stack Technique Détaillée

### 2.2.1 Backend (API GraphQL)

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Spring Boot** | 3.x | Framework principal |
| **Java** | 17+ | Langage de programmation |
| **GraphQL SPQR** | 0.0.6 | API GraphQL auto-générée |
| **PostgreSQL** | 14+ | Base de données relationnelle |
| **Spring Security** | 6.x | Sécurité et authentification |
| **JWT (jjwt)** | 0.11.5 | Tokens d'authentification |
| **iText** | 7.2.5 | Génération de PDF |
| **GraphQL Playground** | - | Documentation interactive |
| **GraphQL Voyager** | - | Visualisation du schéma |

### 2.2.2 Frontend Web (Next.js)

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Next.js** | 15 | Framework React avec SSR/SSG |
| **React** | 18.2 | Bibliothèque UI |
| **TypeScript** | 5.2 | Typage statique |
| **Tailwind CSS** | 3.3 | Framework CSS utilitaire |
| **Apollo Client** | 3.8 | Client GraphQL |
| **GraphQL Code Generator** | - | Génération de types |
| **Formik** | 2.4 | Gestion des formulaires |
| **Yup** | 1.3 | Validation des schémas |
| **next-intl** | 3.0 | Internationalisation (i18n + RTL) |

### 2.2.3 Back-Office (React)

| Technologie | Version | Usage |
|-------------|---------|-------|
| **React** | 18.2 | Bibliothèque UI |
| **Vite** | 5.0 | Build tool |
| **TypeScript** | 5.2 | Typage statique |
| **Tailwind CSS** | 3.3 | Framework CSS utilitaire |
| **Apollo Client** | 3.8 | Client GraphQL |
| **Redux Toolkit** | 1.9 | Gestion d'état |
| **MUI X Charts** | 6.18 | Graphiques et visualisations |
| **Formik** | 2.4 | Gestion des formulaires |
| **Yup** | 1.3 | Validation des schémas |

### 2.2.4 Mobile (React Native)

| Technologie | Version | Usage |
|-------------|---------|-------|
| **React Native** | 0.72 | Framework mobile |
| **Expo** | 49.0 | Plateforme de développement |
| **TypeScript** | 5.2 | Typage statique |
| **Apollo Client** | 3.8 | Client GraphQL |
| **React Navigation** | 6.0 | Navigation (Stack, Tab, Drawer) |
| **Formik** | 2.4 | Gestion des formulaires |
| **Yup** | 1.3 | Validation des schémas |

---

# 3. SPECIFICATIONS FONCTIONNELLES

## 3.1 Module Authentification & Utilisateurs

### 3.1.1 Fonctionnalités

| Fonctionnalité | Description | Priorité |
|----------------|-------------|----------|
| **Inscription** | Email/mot de passe avec validation email | Haute |
| **Connexion** | JWT avec refresh token | Haute |
| **Déconnexion** | Invalidation du token | Haute |
| **Profil utilisateur** | Consultation et modification des informations | Haute |
| **Gestion des adresses** | CRUD adresses de livraison (multiple) | Haute |
| **Mot de passe oublié** | Reset via email sécurisé | Haute |
| **Historique commandes** | Liste complète avec détails | Moyenne |

### 3.1.2 Rôles et Permissions

| Rôle | Permissions |
|------|-------------|
| **CUSTOMER** | Achats, profil, commandes personnelles |
| **ADMIN** | Gestion produits, commandes, clients |
| **SUPER_ADMIN** | Toutes les permissions + gestion admins |
| **MANAGER** | Rapports, statistiques, consultation |

### 3.1.3 Sécurité Authentification

- JWT avec expiration configurable
- Refresh tokens pour sessions longues
- Hachage mot de passe (BCrypt)
- Rate limiting sur les tentatives de connexion
- Validation email obligatoire

---

## 3.2 Module Catalogue Produits

### 3.2.1 Gestion des Produits

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

### 3.2.2 Gestion des Catégories

| Fonctionnalité | Description |
|----------------|-------------|
| **Hiérarchie** | Catégories et sous-catégories (3 niveaux max) |
| **Multilingue** | Noms en AR/FR/EN |
| **Images** | Image de catégorie pour affichage |
| **Ordre d'affichage** | Position personnalisable |
| **Slug SEO** | URL friendly automatique |

### 3.2.3 Attributs Produits

| Attribut | Type | Valeurs |
|----------|------|---------|
| **Taille** | Liste | XS, S, M, L, XL, XXL, etc. |
| **Couleur** | Liste + Code hex | Noir (#000), Blanc (#FFF), etc. |
| **Matière** | Liste | Coton, Polyester, Lin, etc. |
| **Genre** | Liste | Homme, Femme, Enfant, Unisexe |

### 3.2.4 Recherche et Filtrage

| Fonctionnalité | Description |
|----------------|-------------|
| **Recherche textuelle** | Full-text search sur titre, description |
| **Filtres multiples** | Catégorie, prix, taille, couleur, disponibilité |
| **Tri** | Pertinence, prix (asc/desc), nouveauté, popularité |
| **Pagination** | Offset ou cursor-based |
| **Auto-complétion** | Suggestions de recherche |

---

## 3.3 Module Panier & Commandes

### 3.3.1 Panier d'Achat

| Fonctionnalité | Description |
|----------------|-------------|
| **Ajout au panier** | Produit + variante + quantité |
| **Modification quantité** | Incrémentation/décrémentation |
| **Suppression article** | Retrait individuel |
| **Persistance** | LocalStorage (guest) + Backend (connecté) |
| **Fusion panier** | Merge à la connexion |
| **Code promo** | Application et validation |
| **Calcul automatique** | Sous-total, remise, livraison, total |

### 3.3.2 Processus de Commande (Checkout)

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

### 3.3.3 Workflow Commandes

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

### 3.3.4 Notifications Commandes

| Événement | Canal | Destinataire |
|-----------|-------|--------------|
| Commande créée | Email | Client |
| Paiement confirmé | Email | Client |
| Commande expédiée | Email | Client |
| Commande livrée | Email | Client |
| Nouvelle commande | Email | Admin |

---

## 3.4 Module Paiements

### 3.4.1 Passerelles Intégrées

| Passerelle | Type | Flux |
|------------|------|------|
| **CIB** | Carte bancaire | Redirection vers page sécurisée CIB |
| **Baridimob** | Mobile wallet | QR Code ou transfert direct |
| **COD** | Cash | Paiement à la livraison |

### 3.4.2 Flux de Paiement CIB

1. Client sélectionne CIB
2. Redirection vers page de paiement CIB
3. Client saisit informations carte
4. Validation par la banque
5. Callback vers notre backend
6. Vérification signature
7. Mise à jour statut commande
8. Email de confirmation

### 3.4.3 Flux de Paiement Baridimob

1. Client sélectionne Baridimob
2. Affichage QR Code ou instructions transfert
3. Client effectue le paiement via app Baridimob
4. Webhook de confirmation
5. Vérification du paiement
6. Mise à jour statut commande
7. Email de confirmation

### 3.4.4 Sécurité Paiements

- HTTPS obligatoire
- Aucune donnée carte stockée
- Logs de transactions sécurisés
- Vérification des callbacks (signature)
- Timeout sur transactions en attente

---

## 3.5 Module Notifications

### 3.5.1 Types de Notifications

| Type | Canal | Trigger |
|------|-------|---------|
| **Confirmation inscription** | Email | Inscription |
| **Réinitialisation mot de passe** | Email | Demande reset |
| **Confirmation commande** | Email | Nouvelle commande |
| **Mise à jour statut** | Email | Changement statut |
| **Promotions** | Email | Campagne marketing |

### 3.5.2 Templates Email

- Confirmation d'inscription
- Vérification email
- Réinitialisation mot de passe
- Confirmation de commande
- Commande expédiée
- Commande livrée
- Facture

---

## 3.6 Module Reporting & PDF

### 3.6.1 Rapports Disponibles

| Rapport | Description | Format |
|---------|-------------|--------|
| **Ventes journalières** | Résumé des ventes du jour | Dashboard + PDF |
| **Ventes période** | Ventes sur période personnalisée | Dashboard + PDF |
| **Top produits** | Produits les plus vendus | Dashboard + PDF |
| **Clients actifs** | Analyse comportement clients | Dashboard |
| **Stock faible** | Alertes rupture de stock | Dashboard |

### 3.6.2 Documents PDF Générés

| Document | Contenu | Déclencheur |
|----------|---------|-------------|
| **Facture** | Détails commande, TVA, total | Commande confirmée |
| **Bon de livraison** | Adresse, articles, quantités | Expédition |
| **Rapport ventes** | Statistiques période | Export admin |

---

## 3.7 Module Synchronisation ERP/WMS

### 3.7.1 Flux de Synchronisation

| Direction | Données | Fréquence |
|-----------|---------|-----------|
| **ERP → Plateforme** | Produits, stocks, prix | Temps réel / Batch |
| **Plateforme → ERP** | Commandes | Temps réel |
| **WMS → Plateforme** | Stocks, statuts expédition | Temps réel |

### 3.7.2 API d'Intégration

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/sync/products` | POST | Synchronisation produits |
| `/sync/stock` | POST | Mise à jour stocks |
| `/sync/orders` | GET | Récupération nouvelles commandes |
| `/sync/status` | POST | Mise à jour statut commande |

### 3.7.3 Gestion des Erreurs

- Retry automatique (3 tentatives)
- Queue de messages pour les échecs
- Logs détaillés
- Alertes admin en cas d'échec critique

---

## 3.8 Fonctionnalités par Plateforme

### 3.8.1 Frontend Web (Next.js)

#### Pages et Fonctionnalités

| Page | Fonctionnalités | Rendu |
|------|-----------------|-------|
| **Accueil** | Hero slider, featured products, catégories, promotions | SSG |
| **Catalogue** | Grille produits, filtres, tri, pagination | SSR |
| **Produit** | Galerie, variantes, add to cart, produits similaires | SSG |
| **Panier** | Liste articles, modification, code promo, récap | CSR |
| **Checkout** | 4 étapes, formulaires, paiement | CSR |
| **Profil** | Informations, adresses, commandes | CSR |
| **Connexion/Inscription** | Formulaires auth | CSR |
| **Contact** | Formulaire, carte | SSG |
| **Pages légales** | CGV, confidentialité | SSG |

#### Fonctionnalités Techniques

- Server-Side Rendering (SSR) pour SEO
- Static Site Generation (SSG) pour performance
- Image optimization (next/image)
- Code splitting automatique
- Prefetching des liens
- PWA-ready (manifest, service worker)

### 3.8.2 Back-Office (React)

#### Modules et Fonctionnalités

| Module | Fonctionnalités |
|--------|-----------------|
| **Dashboard** | KPIs temps réel, graphiques ventes, alertes |
| **Produits** | CRUD, import/export, gestion images |
| **Catégories** | Gestion hiérarchique, drag & drop |
| **Commandes** | Liste, détail, changement statut, PDF |
| **Clients** | Liste, détail, historique, blocage |
| **Promotions** | CRUD codes promo, validité |
| **Rapports** | Génération, export PDF |
| **Utilisateurs** | CRUD admins, rôles, permissions |
| **Paramètres** | Configuration système, intégrations |

#### Dashboard - KPIs Affichés

- Chiffre d'affaires (jour/semaine/mois)
- Nombre de commandes
- Panier moyen
- Nouveaux clients
- Taux de conversion
- Produits en rupture

### 3.8.3 Application Mobile (Expo)

#### Écrans et Fonctionnalités

| Écran | Fonctionnalités |
|-------|-----------------|
| **Home** | Hero slider, featured, catégories, pull-to-refresh |
| **Catalogue** | Grille 2 colonnes, filtres bottom sheet, infinite scroll |
| **Produit** | Galerie swipe, zoom, variantes, add to cart |
| **Panier** | Liste, swipe-to-delete, code promo |
| **Checkout** | 4 étapes, WebView paiement |
| **Profil** | Infos, adresses, commandes, paramètres |
| **Recherche** | Barre de recherche, historique, suggestions |

#### Navigation

- **Stack Navigator**: Auth flow, checkout
- **Tab Navigator**: Home, Catalogue, Panier, Profil
- **Drawer Navigator**: Catégories, paramètres

---

# 4. EXIGENCES NON FONCTIONNELLES

## 4.1 Performance

| Métrique | Objectif |
|----------|----------|
| **Temps de chargement page** | < 3 secondes |
| **Time to First Byte (TTFB)** | < 500ms |
| **First Contentful Paint (FCP)** | < 1.5s |
| **Largest Contentful Paint (LCP)** | < 2.5s |
| **Cumulative Layout Shift (CLS)** | < 0.1 |
| **Temps réponse API** | < 500ms (90% requêtes) |
| **Lighthouse Score** | > 90 (Performance, SEO) |
| **Mobile FPS** | 60 fps |

## 4.2 Scalabilité

- Architecture stateless pour scaling horizontal
- Cache Redis pour sessions (si nécessaire)
- CDN pour assets statiques
- Optimisation requêtes base de données
- Pagination côté serveur

## 4.3 Sécurité

| Mesure | Description |
|--------|-------------|
| **HTTPS** | Obligatoire partout |
| **JWT** | Tokens signés, expiration courte |
| **CORS** | Configuration stricte des origines |
| **Rate Limiting** | Protection contre les attaques |
| **Input Validation** | Sanitisation de toutes les entrées |
| **SQL Injection** | Requêtes préparées |
| **XSS** | Échappement des sorties |
| **CSRF** | Protection des formulaires |

## 4.4 Compatibilité

### Navigateurs Web

| Navigateur | Versions Supportées |
|------------|---------------------|
| Chrome | 2 dernières versions |
| Firefox | 2 dernières versions |
| Safari | 2 dernières versions |
| Edge | 2 dernières versions |

### Mobile

| Plateforme | Version Minimum |
|------------|-----------------|
| iOS | 13+ |
| Android | 8+ (API 26+) |

### Responsive

| Breakpoint | Taille |
|------------|--------|
| Mobile | 320px - 639px |
| Tablet | 640px - 1023px |
| Desktop | 1024px+ |

## 4.5 Accessibilité

- Conformité WCAG 2.1 niveau AA
- Navigation au clavier
- Lecteurs d'écran (ARIA labels)
- Contraste couleurs suffisant
- Texte alternatif pour images
- Focus visible

## 4.6 Internationalisation

| Langue | Direction | Locale |
|--------|-----------|--------|
| Arabe | RTL | ar-DZ |
| Français | LTR | fr-FR |
| Anglais | LTR | en-US |

---

# 5. DESIGN ET EXPERIENCE UTILISATEUR

## 5.1 Identité Visuelle

### 5.1.1 Palette de Couleurs

| Type | Couleur | Hex | Usage |
|------|---------|-----|-------|
| **Primaire** | Blanc | #FFFFFF | Fond principal |
| **Primaire** | Gris clair | #F5F5F5 | Fond secondaire |
| **Primaire** | Beige | #F5F0E8 | Accent doux |
| **Accent** | Bleu atténué | #5B7B9A | Liens, éléments interactifs |
| **Accent** | Pastel doux | #E8D5C4 | Highlights |
| **CTA** | Noir | #1A1A1A | Boutons principaux |
| **CTA** | Bleu marine | #1E3A5F | Titres importants |
| **Succès** | Vert | #4CAF50 | Confirmations |
| **Erreur** | Rouge | #F44336 | Messages d'erreur |
| **Alerte** | Orange | #FF9800 | Avertissements |

### 5.1.2 Typographie

| Usage | Police | Poids | Taille |
|-------|--------|-------|--------|
| **H1** | Open Sans | 700 | 32px |
| **H2** | Open Sans | 600 | 24px |
| **H3** | Open Sans | 600 | 20px |
| **Body** | Lato | 400 | 16px |
| **Small** | Lato | 400 | 14px |
| **Button** | Open Sans | 600 | 16px |

### 5.1.3 Typographie Arabe

| Usage | Police | Poids |
|-------|--------|-------|
| **Titres** | Cairo | 700 |
| **Body** | Cairo | 400 |

## 5.2 Composants UI

### 5.2.1 Boutons

| Type | Style | Usage |
|------|-------|-------|
| **Primary** | Fond noir, texte blanc | Actions principales |
| **Secondary** | Fond blanc, bordure noire | Actions secondaires |
| **Ghost** | Transparent, texte noir | Actions tertiaires |
| **Danger** | Fond rouge, texte blanc | Actions destructives |
| **Disabled** | Fond gris, texte gris clair | Non disponible |

### 5.2.2 Formulaires

- Labels au-dessus des champs
- Placeholder gris clair
- Bordure grise, focus bleu
- Messages d'erreur en rouge sous le champ
- Icônes dans les champs (optionnel)

### 5.2.3 Cards Produits

- Image ratio 4:3 ou 1:1
- Titre tronqué (2 lignes max)
- Prix (barré si promo)
- Badge promotion/nouveauté
- Bouton quick add (hover)
- Wishlist icon (coin supérieur droit)

## 5.3 Animations et Interactions

| Interaction | Animation |
|-------------|-----------|
| **Hover bouton** | Scale 1.02, transition 200ms |
| **Hover card** | Shadow elevation, transition 300ms |
| **Add to cart** | Bounce icon panier |
| **Page transition** | Fade in/out 200ms |
| **Skeleton loading** | Pulse animation |
| **Pull to refresh** | Spinner rotation |

## 5.4 Iconographie

- Style: Outlined / Light
- Bibliothèque: Heroicons ou Lucide
- Taille standard: 24px
- Taille small: 16px
- Taille large: 32px

---

# 6. LIVRABLES DESIGNER

## 6.1 Phase Découverte

### 6.1.1 Recherche UX

| Livrable | Description | Format |
|----------|-------------|--------|
| **Analyse concurrentielle** | Étude de 5 concurrents e-commerce mode | Document PDF |
| **Personas utilisateurs** | 3-4 profils types clients OSCAR Fashion | Document PDF |
| **User journey maps** | Parcours client complet (découverte → achat) | Figma |
| **Architecture information** | Structure du site et navigation | Figma/Miro |

### 6.1.2 Wireframes Basse Fidélité

| Écran | Plateforme | Quantité |
|-------|------------|----------|
| **Homepage** | Web + Mobile | 2 |
| **Catalogue** | Web + Mobile | 2 |
| **Page produit** | Web + Mobile | 2 |
| **Panier** | Web + Mobile | 2 |
| **Checkout (4 étapes)** | Web + Mobile | 8 |
| **Profil utilisateur** | Web + Mobile | 2 |
| **Login/Register** | Web + Mobile | 4 |
| **Dashboard admin** | Web | 1 |
| **Gestion produits** | Web | 2 |
| **Gestion commandes** | Web | 2 |
| **TOTAL** | | **27 wireframes** |

## 6.2 Phase Design

### 6.2.1 Design System

| Composant | Description | Format |
|-----------|-------------|--------|
| **Style Guide** | Couleurs, typographie, spacing, grilles | Figma |
| **Component Library** | Tous les composants UI réutilisables | Figma |
| **Icon Set** | Icônes personnalisées/sélectionnées | Figma + SVG |
| **Brand Guidelines** | Application de la marque OSCAR | Document PDF |

### 6.2.2 Composants UI à Designer

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

### 6.2.3 Maquettes Haute Fidélité - Frontend Web

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
| **CGV** | Default | Desktop, Tablet, Mobile |
| **404** | Default | Desktop, Tablet, Mobile |

**Total estimé: ~60 écrans (Desktop + Tablet + Mobile)**

### 6.2.4 Maquettes Haute Fidélité - Back-Office

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

### 6.2.5 Maquettes Haute Fidélité - Mobile

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

### 6.2.6 Prototype Interactif

| Livrable | Description |
|----------|-------------|
| **Prototype Web** | Navigation complète, micro-interactions |
| **Prototype Mobile** | Navigation complète, gestures |
| **Animations specs** | Documentation des animations |

## 6.3 Phase Handoff

### 6.3.1 Export et Spécifications

| Livrable | Format | Description |
|----------|--------|-------------|
| **Assets images** | PNG, SVG, WebP | Toutes les images optimisées |
| **Icons** | SVG | Set complet d'icônes |
| **Specs développeurs** | Figma | Inspect mode activé, mesures, couleurs |
| **Documentation composants** | Notion/Confluence | Guide d'utilisation des composants |

### 6.3.2 Assets à Exporter

| Type | Formats | Résolutions |
|------|---------|-------------|
| **Logo** | SVG, PNG | 1x, 2x, 3x |
| **Favicon** | ICO, PNG | 16, 32, 180, 192, 512 |
| **OG Images** | PNG, JPG | 1200x630 |
| **App Icons** | PNG | iOS: toutes tailles, Android: toutes tailles |
| **Splash screens** | PNG | iOS: toutes tailles, Android: toutes tailles |
| **Illustrations** | SVG, PNG | 1x, 2x |
| **Placeholders** | PNG | Product, Avatar, Category |

## 6.4 Récapitulatif Livrables Designer

| Phase | Livrable | Quantité |
|-------|----------|----------|
| **Découverte** | Documents recherche UX | 4 |
| **Découverte** | Wireframes basse fidélité | 27 |
| **Design** | Design System complet | 1 |
| **Design** | Maquettes Web HD | ~60 |
| **Design** | Maquettes Back-Office HD | ~25 |
| **Design** | Maquettes Mobile HD | ~35 |
| **Design** | Prototypes interactifs | 2 |
| **Handoff** | Package assets | 1 |
| **Handoff** | Documentation | 1 |

---

# 7. LIVRABLES DEVELOPPEUR

## 7.1 Backend API

### 7.1.1 Code Source

| Livrable | Description |
|----------|-------------|
| **Repository Git** | Code source complet, historique git |
| **Structure projet** | Architecture Spring Boot standard |
| **Configuration** | Fichiers properties/yaml pour tous environnements |
| **Docker** | Dockerfile + docker-compose.yml |
| **Scripts SQL** | Migrations et seeds |

### 7.1.2 Modules à Développer

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

### 7.1.3 API Documentation

| Livrable | Description |
|----------|-------------|
| **GraphQL Playground** | Interface interactive de test |
| **GraphQL Voyager** | Visualisation du schéma |
| **Schema SDL** | Export du schéma GraphQL |
| **Postman Collection** | Pour tests manuels (webhooks) |

### 7.1.4 Tests

| Type | Couverture Cible |
|------|------------------|
| **Tests unitaires** | > 70% |
| **Tests intégration** | Tous les modules critiques |
| **Tests API** | Tous les endpoints |

### 7.1.5 Documentation Technique

| Document | Contenu |
|----------|---------|
| **README.md** | Setup, configuration, démarrage |
| **ARCHITECTURE.md** | Structure, patterns, décisions |
| **API.md** | Documentation endpoints |
| **DEPLOYMENT.md** | Guide déploiement |
| **ENV.example** | Variables d'environnement requises |

---

## 7.2 Frontend Web (Next.js)

### 7.2.1 Code Source

| Livrable | Description |
|----------|-------------|
| **Repository Git** | Code source complet |
| **Structure Next.js** | App Router, pages, components |
| **Configuration** | next.config.js, tailwind.config.js |
| **Types GraphQL** | Générés automatiquement |

### 7.2.2 Pages à Développer

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

### 7.2.3 Composants Réutilisables

| Catégorie | Composants |
|-----------|------------|
| **Layout** | Header, Footer, Navigation, MobileMenu, Breadcrumb |
| **Products** | ProductCard, ProductGrid, QuickView, VariantSelector |
| **Cart** | CartIcon, CartDrawer, CartItem, PriceSummary |
| **Forms** | Input, Select, Checkbox, Button, FormError |
| **UI** | Modal, Toast, Spinner, Skeleton, Badge |
| **SEO** | MetaTags, JsonLd, Sitemap |

### 7.2.4 Fonctionnalités Techniques

| Fonctionnalité | Implementation |
|----------------|----------------|
| **SSR/SSG** | getStaticProps, getServerSideProps |
| **GraphQL** | Apollo Client, Code Generator |
| **i18n** | next-intl avec RTL |
| **Auth** | JWT cookies, middleware |
| **Forms** | Formik + Yup |
| **State** | Apollo Cache + React Context |

### 7.2.5 Tests et Qualité

| Type | Outil |
|------|-------|
| **Linting** | Prettier |
| **Type checking** | TypeScript strict |
| **Build** | Vérification CI |

### 7.2.6 Documentation

| Document | Contenu |
|----------|---------|
| **README.md** | Setup, scripts, déploiement |
| **COMPONENTS.md** | Documentation composants |
| **STRUCTURE.md** | Architecture projet |

---

## 7.3 Back-Office (React)

### 7.3.1 Code Source

| Livrable | Description |
|----------|-------------|
| **Repository Git** | Code source complet |
| **Structure Vite** | src/, components/, pages/, store/ |
| **Configuration** | vite.config.ts, tailwind.config.js |

### 7.3.2 Pages à Développer

| Route | Composants Principaux |
|-------|----------------------|
| `/login` | AdminLoginForm |
| `/dashboard` | StatsCards, SalesChart, RecentOrders, LowStockAlert |
| `/products` | ProductsTable, ProductFilters |
| `/products/new` | ProductForm |
| `/products/:id/edit` | ProductForm (edit mode) |
| `/categories` | CategoriesTree, CategoryForm |
| `/orders` | OrdersTable, OrderFilters |
| `/orders/:id` | OrderDetail, StatusUpdater, PDFGenerator |
| `/customers` | CustomersTable |
| `/customers/:id` | CustomerDetail, OrderHistory |
| `/promotions` | PromosTable, PromoForm |
| `/reports` | ReportsFilters, ChartsDisplay, PDFExport |
| `/users` | AdminsTable, AdminForm |
| `/settings` | SettingsTabs (Store, SMTP, Payments, Sync) |

### 7.3.3 Composants Réutilisables

| Catégorie | Composants |
|-----------|------------|
| **Layout** | AdminLayout, Sidebar, Header, Breadcrumb |
| **Data Display** | DataTable, Pagination, Filters, SearchBar |
| **Forms** | FormField, ImageUpload, RichTextEditor, MultiLangInput |
| **Charts** | LineChart, BarChart, PieChart, StatsCard |
| **Actions** | ConfirmModal, StatusBadge, ActionMenu |

### 7.3.4 State Management (Redux)

| Slice | State |
|-------|-------|
| **auth** | user, token, permissions |
| **products** | list, filters, pagination |
| **orders** | list, filters, selectedOrder |
| **ui** | sidebar, modals, notifications |

### 7.3.5 Documentation

| Document | Contenu |
|----------|---------|
| **README.md** | Setup, scripts |
| **USER_GUIDE.md** | Guide utilisateur admin |

---

## 7.4 Application Mobile (Expo)

### 7.4.1 Code Source

| Livrable | Description |
|----------|-------------|
| **Repository Git** | Code source complet |
| **Structure Expo** | app/, components/, hooks/, navigation/ |
| **Configuration** | app.json, eas.json |

### 7.4.2 Écrans à Développer

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

### 7.4.3 Navigation Structure

```
RootNavigator
├── AuthStack
│   ├── Login
│   ├── Register
│   ├── ForgotPassword
│   └── Onboarding
├── MainTabs
│   ├── Home
│   ├── Catalog
│   ├── Cart (avec badge)
│   └── Profile
└── Modals
    ├── ProductQuickView
    ├── Filters
    └── Search
```

### 7.4.4 Composants Réutilisables

| Catégorie | Composants |
|-----------|------------|
| **Navigation** | TabBar, Header, BackButton |
| **Products** | ProductCard, ProductGrid, ImageGallery |
| **Cart** | CartItem, QuantitySelector, SwipeableRow |
| **Forms** | Input, Select, Button, ErrorMessage |
| **UI** | Loading, EmptyState, Toast, BottomSheet |

### 7.4.5 Builds et Déploiement

| Livrable | Format | Description |
|----------|--------|-------------|
| **iOS Build** | .ipa | Archive pour App Store |
| **iOS Certificates** | .p12, .mobileprovision | Certificats de distribution |
| **Android Build** | .aab | Bundle pour Play Store |
| **Android Keystore** | .keystore | Clé de signature |

### 7.4.6 Store Submission

| Store | Livrables |
|-------|-----------|
| **App Store** | Screenshots (6.7", 5.5"), App Preview, Metadata |
| **Play Store** | Screenshots (phone, tablet), Feature graphic, Metadata |

### 7.4.7 Documentation

| Document | Contenu |
|----------|---------|
| **README.md** | Setup, développement local |
| **BUILD.md** | Instructions de build iOS/Android |
| **STORE_SUBMISSION.md** | Guide soumission stores |

---

## 7.5 Documentation Globale

### 7.5.1 Documentation Technique

| Document | Contenu |
|----------|---------|
| **Architecture Overview** | Vue d'ensemble système complet |
| **Database Schema** | ERD, relations, indexes |
| **API Reference** | Documentation GraphQL complète |
| **Deployment Guide** | Guide déploiement tous composants |
| **Security Guidelines** | Pratiques de sécurité |

### 7.5.2 Documentation Utilisateur

| Document | Audience |
|----------|----------|
| **Guide Utilisateur Client** | Clients web et mobile |
| **Guide Administrateur** | Équipe back-office |
| **FAQ** | Questions fréquentes |

### 7.5.3 Documentation Projet

| Document | Contenu |
|----------|---------|
| **Spécifications Fonctionnelles** | Ce document |
| **Cahier de Recette** | Plan de tests |
| **PV de Recette** | Validation finale |

---

## 7.6 Récapitulatif Livrables Développeur

| Composant | Livrables Code | Livrables Documentation |
|-----------|----------------|-------------------------|
| **Backend** | Repository, Docker, Scripts SQL | README, API docs, Architecture |
| **Frontend Web** | Repository, Build production | README, Components docs |
| **Back-Office** | Repository, Build production | README, User guide |
| **Mobile** | Repository, Builds iOS/Android | README, Build guide, Store assets |
| **Global** | - | Architecture, Database, Deployment |

---

# 8. PLANNING DES LIVRABLES

## 8.1 Phase 1: Découverte & Conception (Semaines 1-4)

### Designer
| Semaine | Livrables |
|---------|-----------|
| 1-2 | Recherche UX, Personas, User journeys |
| 2-3 | Wireframes basse fidélité (tous) |
| 3-4 | Design System (v1), Composants UI |
| 4 | Validation wireframes et design system |

### Développeur
| Semaine | Livrables |
|---------|-----------|
| 1-2 | Setup environnements, Architecture BD |
| 2-3 | Schéma GraphQL, Structure projets |
| 3-4 | Backend Auth module (base) |

## 8.2 Phase 2: Fondations (Semaines 5-10)

### Designer
| Semaine | Livrables |
|---------|-----------|
| 5-6 | Maquettes HD Web (Homepage, Catalogue, Produit) |
| 7-8 | Maquettes HD Web (Cart, Checkout, Profile) |
| 9-10 | Maquettes HD Back-Office (Dashboard, Products, Orders) |

### Développeur
| Semaine | Livrables |
|---------|-----------|
| 5-6 | Backend Auth complet, Users module |
| 7-8 | Backend Products, Categories, Search |
| 9-10 | Backend Cart, début Orders |

## 8.3 Phase 3: Développement Principal (Semaines 11-16)

### Designer
| Semaine | Livrables |
|---------|-----------|
| 11-12 | Maquettes HD Mobile (tous écrans) |
| 13-14 | Prototypes interactifs Web + Mobile |
| 15-16 | Finalisation, Handoff assets |

### Développeur
| Semaine | Livrables |
|---------|-----------|
| 11-12 | Backend Orders, Payments (CIB, Baridimob) |
| 11-14 | Frontend Web (Catalogue, Produit, Cart, Checkout) |
| 13-16 | Back-Office (Dashboard, Products, Orders, Customers) |
| 13-16 | Mobile (Home, Catalogue, Cart, Checkout) |
| 15-16 | Backend Notifications, Reports, PDF |

## 8.4 Phase 4: Intégrations & Optimisation (Semaines 17-22)

### Designer
| Semaine | Livrables |
|---------|-----------|
| 17-18 | Ajustements suite retours tests |
| 19-20 | Documentation finale composants |

### Développeur
| Semaine | Livrables |
|---------|-----------|
| 17-18 | Intégration paiements (tests sandbox) |
| 18-20 | Frontend Web (Home, SEO, i18n RTL) |
| 19-20 | Back-Office (Reports, Settings, Sync) |
| 20-22 | Mobile (Profile, i18n, optimisation) |
| 21-22 | Backend Sync ERP/WMS |

## 8.5 Phase 5: Tests & Déploiement (Semaines 23-26)

### Designer
| Semaine | Livrables |
|---------|-----------|
| 23-24 | Support QA (ajustements visuels) |
| 25-26 | Assets stores (screenshots, graphics) |

### Développeur
| Semaine | Livrables |
|---------|-----------|
| 23-24 | Tests complets, corrections bugs |
| 25 | UAT, corrections retours |
| 26 | Déploiement production, soumission stores |
| 26 | Documentation finale, handover |

---

## 8.6 Jalons de Validation

| Semaine | Jalon | Validation Requise |
|---------|-------|-------------------|
| 4 | Design System + Wireframes validés | Client |
| 10 | Backend API core fonctionnel | Tests techniques |
| 14 | Maquettes HD complètes validées | Client |
| 16 | Tous composants développés | Tests techniques |
| 22 | Intégrations complètes | Tests intégration |
| 25 | UAT validée | Client |
| 26 | **LIVRAISON FINALE** | PV de recette |

---

**FIN DU DOCUMENT**

---

*Ce document constitue les spécifications techniques et fonctionnelles pour le développement de la plateforme e-commerce OSCAR Fashion. Il détaille l'ensemble des livrables attendus du designer et du développeur.*

**Version**: 1.0
**Date de création**: Novembre 2025
**Référence**: SPEC-OSCAR-2025-001
