# Back-Office (Admin Panel) - Spécifications Détaillées
## OSCAR Fashion E-commerce Platform

---

## 1. Vue d'ensemble

Le back-office est l'interface d'administration permettant de gérer l'ensemble de la plateforme e-commerce OSCAR Fashion. Il offre aux administrateurs les outils nécessaires pour gérer les produits, commandes, clients, statistiques et configurations.

### Objectifs Principaux
- Fournir une interface d'administration complète et intuitive
- Centraliser la gestion de tous les aspects de la plateforme
- Offrir des tableaux de bord et statistiques en temps réel
- Permettre la génération de rapports et documents (PDF)
- Gérer les utilisateurs et les permissions
- Faciliter la configuration de la plateforme

---

## 2. Stack Technique

### Core Framework
- **Bibliothèque**: React.js 18+
- **Build Tool**: Vite
- **Langage**: TypeScript
- **Package Manager**: npm ou yarn

### UI & Styling
- **Component Library**: Material-UI (MUI) v5
- **Admin Template**: MUI-X (optionnel, ou développement custom)
- **Styling**: Emotion (MUI default)
- **Icônes**: Material Icons
- **Charts**: MUI X Charts (pour les graphiques)

### State Management
- **Global State**: Redux Toolkit ou Zustand
- **Server State**: React Query (TanStack Query)

### Routing
- **Router**: React Router v6
- **Layout**: Sidebar + Topbar layout

### Forms & Validation
- **Formulaires**: React Hook Form
- **Validation**: Yup ou Zod
- **Rich Text Editor**: TinyMCE ou Draft.js (descriptions produits)

### Data Visualization
- **Charts**: MUI X Charts, Recharts, ou Chart.js
- **Tables**: MUI DataGrid (avec pagination, tri, filtrage)
- **Export**: Export CSV/Excel

### API & Communication
- **HTTP Client**: Axios
- **API Integration**: React Query

### Testing
- **Unit Tests**: Jest + React Testing Library
- **Coverage**: > 70%

---

## 3. Architecture Back-Office

### Structure du Projet

```
oscar-backoffice/
├── public/
│   └── index.html
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/         # Composants réutilisables
│   │   ├── layout/         # Sidebar, Topbar, Layout
│   │   ├── charts/         # Graphiques
│   │   └── tables/         # Tables de données
│   ├── features/
│   │   ├── dashboard/      # Tableau de bord
│   │   ├── products/       # Gestion produits
│   │   ├── orders/         # Gestion commandes
│   │   ├── customers/      # Gestion clients
│   │   ├── users/          # Gestion utilisateurs admin
│   │   ├── reports/        # Rapports et stats
│   │   ├── settings/       # Configuration
│   │   └── auth/           # Authentification admin
│   ├── pages/
│   ├── hooks/
│   ├── services/           # API calls
│   ├── store/
│   ├── routes/
│   ├── utils/
│   ├── constants/
│   ├── theme/
│   ├── types/
│   ├── App.tsx
│   └── index.tsx
├── .env.development
├── .env.production
└── package.json
```

---

## 4. Modules & Fonctionnalités

### 4.1 Authentification Admin

#### Pages
- **Login**: Connexion administrateur
- **Forgot Password**: Récupération mot de passe

#### Fonctionnalités
- Connexion sécurisée (email + mot de passe)
- Authentification JWT
- Sessions sécurisées
- Déconnexion
- Protection des routes admin

#### Sécurité
- Authentification 2FA (optionnel)
- Rate limiting
- Logs de connexion
- Permissions basées sur rôles (ADMIN, SUPER_ADMIN)

---

### 4.2 Dashboard (Tableau de Bord)

#### Vue d'ensemble

Page principale affichant les métriques clés en temps réel.

#### Widgets & Statistiques

1. **KPIs (Indicateurs Clés)**
   - Revenus du jour/semaine/mois
   - Nombre de commandes (aujourd'hui, ce mois)
   - Nombre de clients actifs
   - Taux de conversion
   - Valeur moyenne du panier

2. **Graphiques**
   - **Évolution des ventes** (ligne, 30 derniers jours)
   - **Répartition des ventes par catégorie** (pie chart)
   - **Commandes par statut** (bar chart)
   - **Revenus par mois** (bar chart, 12 derniers mois)

3. **Listes Récentes**
   - **Dernières commandes** (5-10 dernières)
   - **Produits faibles en stock** (alertes)
   - **Nouveaux clients** (dernières inscriptions)

4. **Notifications**
   - Commandes en attente
   - Produits en rupture de stock
   - Retours/annulations à traiter

#### Filtres
- Période (aujourd'hui, cette semaine, ce mois, personnalisé)
- Comparaison période précédente

---

### 4.3 Gestion Produits

#### Liste des Produits

**Composants**:
- Table DataGrid (MUI) avec:
  - Colonnes: Image, Nom, SKU, Catégorie, Prix, Stock, Statut, Actions
  - Pagination
  - Tri par colonne
  - Filtres (catégorie, statut, prix)
  - Recherche (nom, SKU)
  - Sélection multiple (actions en masse)

**Actions**:
- Ajouter nouveau produit
- Modifier produit
- Supprimer produit(s)
- Activer/Désactiver produit
- Dupliquer produit
- Export CSV/Excel

---

#### Formulaire Produit (Ajout/Modification)

**Sections**:

1. **Informations Générales**
   - Nom (multilingue: AR, FR, EN)
   - SKU (auto-généré ou manuel)
   - Description courte
   - Description détaillée (Rich Text Editor)
   - Slug (URL-friendly)

2. **Tarification**
   - Prix de base
   - Prix promotionnel (optionnel)
   - Dates promotion (début/fin)

3. **Catégories & Attributs**
   - Catégorie principale
   - Catégories secondaires
   - Attributs (taille, couleur, matière)

4. **Stock**
   - Quantité en stock
   - Seuil d'alerte stock faible
   - Gestion stock activée/désactivée

5. **Images**
   - Upload multiple images
   - Drag & drop pour réorganiser
   - Définir image principale
   - Crop/resize

6. **SEO**
   - Meta title
   - Meta description
   - Keywords

7. **Statut**
   - Actif / Brouillon / Inactif
   - Visibilité (public/privé)

**Validation**:
- Champs obligatoires
- Format SKU unique
- Prix valides
- Images requises

---

#### Gestion Catégories

**Fonctionnalités**:
- Liste des catégories (hiérarchique/tree view)
- Ajouter catégorie/sous-catégorie
- Modifier catégorie
- Supprimer catégorie
- Réorganiser (drag & drop)
- Catégorie parente/enfant
- Image de catégorie
- Ordre d'affichage

---

#### Gestion Attributs

**Fonctionnalités**:
- Liste des attributs (Taille, Couleur, Matière, etc.)
- Ajouter attribut
- Gérer valeurs d'attribut (S, M, L, XL)
- Supprimer attribut

---

### 4.4 Gestion Commandes

#### Liste des Commandes

**Composants**:
- Table DataGrid avec:
  - Colonnes: Numéro, Date, Client, Statut, Total, Paiement, Actions
  - Filtres:
    - Statut (Pending, Confirmed, Shipped, Delivered, Cancelled)
    - Date (période personnalisée)
    - Montant (min-max)
    - Mode paiement
  - Recherche (numéro commande, nom client)
  - Export CSV/Excel

**Actions**:
- Voir détails commande
- Modifier statut
- Imprimer facture (PDF)
- Imprimer bon de livraison (PDF)
- Annuler commande
- Remboursement

---

#### Détail Commande

**Sections**:

1. **Informations Client**
   - Nom, email, téléphone
   - Adresse de livraison
   - Adresse de facturation

2. **Articles Commandés**
   - Liste des produits (image, nom, quantité, prix unitaire, total)
   - Sous-total

3. **Récapitulatif**
   - Sous-total
   - Frais de livraison
   - Réduction
   - Total

4. **Paiement**
   - Méthode de paiement
   - Statut paiement
   - Transaction ID
   - Date paiement

5. **Livraison**
   - Méthode de livraison
   - Numéro de tracking
   - Date d'expédition
   - Date de livraison estimée

6. **Historique Statuts**
   - Timeline des changements de statut
   - Commentaires

**Actions**:
- Modifier statut
- Ajouter numéro tracking
- Envoyer notification client
- Imprimer facture
- Imprimer bon de livraison
- Rembourser

---

### 4.5 Gestion Clients

#### Liste des Clients

**Composants**:
- Table DataGrid avec:
  - Colonnes: Nom, Email, Téléphone, Commandes, Total dépensé, Date inscription, Actions
  - Filtres:
    - Date d'inscription
    - Nombre de commandes (min-max)
    - Total dépensé (min-max)
  - Recherche (nom, email)
  - Export CSV/Excel

**Actions**:
- Voir détails client
- Modifier client
- Bloquer/Débloquer client
- Supprimer client
- Envoyer email

---

#### Détail Client

**Sections**:

1. **Informations Personnelles**
   - Nom, prénom
   - Email, téléphone
   - Date d'inscription
   - Statut (actif, inactif, bloqué)

2. **Adresses**
   - Liste des adresses
   - Adresse par défaut

3. **Statistiques**
   - Nombre total de commandes
   - Total dépensé
   - Panier moyen
   - Dernière commande

4. **Historique Commandes**
   - Liste des commandes du client
   - Liens vers détails commandes

**Actions**:
- Modifier informations
- Bloquer/Débloquer
- Réinitialiser mot de passe
- Envoyer email

---

### 4.6 Rapports & Statistiques

#### Rapports Disponibles

1. **Rapport des Ventes**
   - Période sélectionnable
   - Ventes par jour/semaine/mois
   - Évolution graphique
   - Comparaison période précédente
   - Export PDF/CSV

2. **Top Produits**
   - Produits les plus vendus
   - Par quantité ou revenus
   - Période sélectionnable
   - Export

3. **Rapport Clients**
   - Nouveaux clients (période)
   - Clients actifs/inactifs
   - Segmentation (dépenses)
   - Export

4. **Rapport Commandes**
   - Nombre de commandes (période)
   - Répartition par statut
   - Taux de conversion
   - Panier moyen
   - Export

5. **Rapport Stock**
   - Produits en stock
   - Produits faibles en stock
   - Produits en rupture
   - Valeur totale du stock
   - Export

6. **Rapport Revenus**
   - Revenus par période
   - Revenus par catégorie
   - Revenus par mode de paiement
   - Graphiques
   - Export

#### Génération PDF

**Fonctionnalités**:
- Génération de rapports en PDF (via backend Jasper Reports)
- Personnalisation de la période
- Inclusion de graphiques
- Logo et en-tête OSCAR
- Téléchargement direct

---

### 4.7 Gestion Utilisateurs (Administrateurs)

#### Liste Utilisateurs Admin

**Composants**:
- Table avec:
  - Colonnes: Nom, Email, Rôle, Statut, Dernière connexion, Actions
  - Filtres (rôle, statut)

**Rôles**:
- **SUPER_ADMIN**: Accès complet
- **ADMIN**: Accès gestion produits, commandes, clients
- **MANAGER**: Accès lecture seule + modification commandes
- **SUPPORT**: Accès lecture seule

**Actions**:
- Ajouter utilisateur admin
- Modifier utilisateur
- Changer rôle
- Bloquer/Débloquer
- Supprimer

---

#### Formulaire Utilisateur Admin

**Champs**:
- Prénom, nom
- Email
- Mot de passe (création)
- Rôle
- Statut (actif/inactif)
- Permissions spécifiques (optionnel)

---

### 4.8 Configuration & Paramètres

#### Paramètres Généraux

**Sections**:

1. **Informations Boutique**
   - Nom de la boutique
   - Email contact
   - Téléphone
   - Adresse physique
   - Logo
   - Favicon

2. **Paramètres Régionaux**
   - Langue par défaut
   - Devise (DZD)
   - Format date/heure
   - Fuseau horaire

3. **Emails**
   - Configuration SMTP
   - Email expéditeur
   - Templates emails
   - Test email

4. **Notifications**
   - Notifications email activées
   - Notifications SMS activées
   - Notifications push activées

5. **Paiement**
   - Configuration CIB (Merchant ID, API Key)
   - Configuration Baridimob
   - Paiement à la livraison (activé/désactivé)

6. **Livraison**
   - Frais de livraison standard
   - Frais de livraison express
   - Zones de livraison
   - Délais de livraison

7. **SEO**
   - Meta title site
   - Meta description
   - Google Analytics ID
   - Facebook Pixel

8. **Sécurité**
   - Force HTTPS
   - Durée session
   - Tentatives login max

**Actions**:
- Sauvegarder paramètres
- Réinitialiser valeurs par défaut

---

#### Synchronisation ERP/WMS

**Fonctionnalités**:
- Configuration endpoints ERP/WMS
- Credentials API
- Synchronisation manuelle (trigger)
- Synchronisation automatique (planification)
- Logs de synchronisation
- Statut synchronisation (dernière sync, succès/échec)
- Test de connexion

---

### 4.9 Notifications Admin

#### Centre de Notifications

**Fonctionnalités**:
- Liste des notifications
- Types:
  - Nouvelle commande
  - Commande annulée
  - Produit en rupture de stock
  - Nouveau client
  - Problème synchronisation
- Marquer comme lu
- Filtrer par type
- Notifications temps réel (WebSocket)

---

## 5. Layout & Navigation

### Layout Principal

```
┌─────────────────────────────────────────────┐
│ Top Bar (Logo, Search, Notifications, User)│
├──────────┬──────────────────────────────────┤
│          │                                  │
│ Sidebar  │                                  │
│          │        Content Area              │
│ Menu     │                                  │
│          │                                  │
│          │                                  │
└──────────┴──────────────────────────────────┘
```

### Sidebar Menu

- **Dashboard** (icône: dashboard)
- **Produits** (icône: inventory)
  - Liste des produits
  - Ajouter produit
  - Catégories
  - Attributs
- **Commandes** (icône: shopping_cart)
  - Toutes les commandes
  - En attente
  - En cours
  - Livrées
- **Clients** (icône: people)
  - Liste clients
- **Rapports** (icône: bar_chart)
  - Dashboard ventes
  - Top produits
  - Rapport clients
  - Rapport stock
- **Utilisateurs** (icône: admin_panel_settings)
  - Administrateurs
- **Paramètres** (icône: settings)
  - Général
  - Paiement
  - Livraison
  - Synchronisation
- **Déconnexion** (icône: logout)

---

## 6. Composants Communs

### 6.1 Data Table (MUI DataGrid)

**Fonctionnalités**:
- Pagination
- Tri par colonne
- Filtrage avancé
- Recherche
- Sélection multiple
- Actions en masse
- Export CSV/Excel
- Colonnes redimensionnables
- Responsive

---

### 6.2 Charts (MUI X Charts)

**Types de graphiques**:
- Line Chart (évolution dans le temps)
- Bar Chart (comparaisons)
- Pie Chart (répartitions)
- Area Chart (tendances)

**Fonctionnalités**:
- Responsive
- Tooltips
- Légendes
- Filtres de période
- Export image

---

### 6.3 Stats Cards

**Widget statistique**:
- Icône
- Titre (ex: "Revenus du mois")
- Valeur (ex: "1,250,000 DZD")
- Évolution (ex: "+12% vs mois dernier")
- Couleur indicateur (vert/rouge)

---

### 6.4 Formulaires

**Composants**:
- Text Input
- Select/Dropdown
- Date Picker
- File Upload (drag & drop)
- Rich Text Editor
- Switch/Toggle
- Checkbox
- Radio
- Multi-select

**Validation**:
- Temps réel
- Messages d'erreur clairs
- Indication champs obligatoires

---

## 7. Permissions & Rôles

### Matrice de Permissions

| Module | SUPER_ADMIN | ADMIN | MANAGER | SUPPORT |
|--------|-------------|-------|---------|---------|
| Dashboard | Lecture | Lecture | Lecture | Lecture |
| Produits | Tout | Tout | Lecture | Lecture |
| Commandes | Tout | Tout | Modifier statut | Lecture |
| Clients | Tout | Tout | Lecture | Lecture |
| Rapports | Tout | Lecture | Lecture | Lecture |
| Utilisateurs | Tout | - | - | - |
| Paramètres | Tout | Limité | - | - |

**Légende**:
- **Tout**: Création, lecture, modification, suppression
- **Lecture**: Consultation uniquement
- **Modifier**: Lecture + modification
- **-**: Pas d'accès

---

## 8. Sécurité

### Mesures de Sécurité

1. **Authentification**
   - JWT tokens
   - Session timeout (30 min inactivité)
   - Remember me (optionnel)

2. **Autorisation**
   - Vérification rôles
   - Permissions granulaires
   - Protection routes

3. **Audit Logs**
   - Logs des actions critiques:
     - Connexions admin
     - Modifications produits
     - Modifications commandes
     - Modifications paramètres
   - Traçabilité (qui, quoi, quand)

4. **Protection Données**
   - HTTPS obligatoire
   - Sanitisation inputs
   - Protection XSS
   - Protection CSRF

---

## 9. Performance & Optimisation

### Stratégies

1. **Lazy Loading**
   - Code splitting par route
   - Chargement différé des graphiques

2. **Caching**
   - React Query pour cache API
   - Cache des statistiques

3. **Pagination**
   - Pagination serveur (pas client)
   - Limite résultats (50-100 par page)

4. **Optimisation Images**
   - Thumbnails pour listes
   - Lazy loading

---

## 10. Responsive & Mobile

### Adaptation Mobile

- **Sidebar**: Transformée en drawer (menu hamburger)
- **Tables**: Scroll horizontal ou cartes empilées
- **Formulaires**: Layout adaptatif
- **Charts**: Responsive, tactile-friendly

### Breakpoints
- **Desktop**: > 1280px (sidebar toujours visible)
- **Tablet**: 768px - 1279px (sidebar collapsible)
- **Mobile**: < 768px (drawer menu)

---

## 11. Tests

### Types de Tests

1. **Tests Unitaires**
   - Composants
   - Hooks
   - Utilitaires
   - Couverture > 70%

2. **Tests d'Intégration**
   - Flows complets (création produit, gestion commande)
   - Intégration API

3. **Tests E2E**
   - Parcours critiques (connexion, ajout produit, traitement commande)

---

## 12. Documentation

### Livrables

- Guide d'utilisation administrateur
- Documentation technique
- Guide de déploiement
- FAQ

---

**Version**: 1.0
**Date**: Novembre 2025
**Statut**: Spécification technique détaillée
