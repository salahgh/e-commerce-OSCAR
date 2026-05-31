# Back-Office (Admin Panel) - Calendrier de Développement
## OSCAR Fashion E-commerce Platform

---

## Vue d'ensemble

**Durée totale**: 8 semaines
**Heures estimées**: 960 heures
**Équipe requise**:
- 2 Développeurs Frontend Senior (React)
- 1 QA/Test Engineer (temps partiel)

---

## Phase 1: Setup & Dashboard (Semaines 1-2)

### Semaine 1: Initialisation & Layout

#### Tâches
- [x] Setup projet React (Vite)
- [x] Configuration TypeScript
- [x] Installation dépendances (MUI, MUI X Charts, React Router)
- [x] Configuration ESLint + Prettier
- [x] Setup Git hooks
- [x] Configuration CI/CD
- [x] Structure de dossiers
- [x] Configuration Redux Toolkit / Zustand
- [x] Configuration React Query
- [x] Setup MUI theme (admin colors)
- [x] Layout principal
  - TopBar (logo, search, notifications, user menu)
  - Sidebar navigation
  - Content area
  - Footer
- [x] Routing configuration
- [x] Protected routes

#### Livrables
- Projet initialisé
- Layout admin complet et responsive
- Navigation fonctionnelle

**Temps estimé**: 120 heures

---

### Semaine 2: Authentification & Dashboard

#### Tâches
- [x] Service API auth
- [x] Page Login admin
  - Formulaire login
  - Validation
  - Gestion erreurs
  - Intégration API
- [x] Gestion JWT (stockage, refresh)
- [x] Protected routes configuration
- [x] **Page Dashboard**
  - Layout dashboard
  - KPI Cards (revenus, commandes, clients, conversion)
  - Graphique évolution ventes (Line Chart)
  - Graphique répartition ventes par catégorie (Pie Chart)
  - Graphique commandes par statut (Bar Chart)
  - Liste dernières commandes
  - Liste produits faibles en stock
  - Widget notifications
- [x] Service Stats API
- [x] Tests dashboard

#### Livrables
- Authentification admin fonctionnelle
- Dashboard complet avec stats et graphiques
- Tests

**Temps estimé**: 120 heures

---

## Phase 2: Gestion Produits (Semaines 3-4)

### Semaine 3: Liste & CRUD Produits

#### Tâches
- [x] Service Products API
- [x] **Page Liste Produits**
  - MUI DataGrid configuration
  - Colonnes (image, nom, SKU, catégorie, prix, stock, statut)
  - Pagination serveur
  - Tri par colonne
  - Filtres (catégorie, statut, prix)
  - Recherche (nom, SKU)
  - Sélection multiple
  - Actions en masse (activer/désactiver, supprimer)
  - Export CSV/Excel
- [x] Modal/Page Détail Produit (lecture seule)
- [x] Skeleton loading states
- [x] Empty states
- [x] Tests liste produits

#### Livrables
- Liste produits complète avec DataGrid
- Filtres et recherche opérationnels
- Tests

**Temps estimé**: 120 heures

---

### Semaine 4: Formulaire Produit & Catégories

#### Tâches
- [x] **Page Formulaire Produit** (Add/Edit)
  - Section Informations générales
    - Nom (multilingue AR/FR/EN)
    - SKU
    - Description courte
    - Description détaillée (Rich Text Editor - TinyMCE)
    - Slug
  - Section Tarification
    - Prix de base
    - Prix promotionnel
    - Dates promotion
  - Section Catégories & Attributs
    - Sélection catégorie
    - Sélection attributs (taille, couleur)
  - Section Stock
    - Quantité
    - Seuil d'alerte
  - Section Images
    - Upload multiple (drag & drop)
    - Réorganisation images
    - Image principale
    - Preview
  - Section SEO
    - Meta title, description, keywords
  - Section Statut
    - Actif/Brouillon/Inactif
  - Validation complète
  - Intégration API
- [x] **Page Gestion Catégories**
  - Liste hiérarchique (tree view)
  - Ajout/modification catégorie
  - Upload image catégorie
- [x] Tests formulaire produit

#### Livrables
- Formulaire produit complet
- Gestion catégories fonctionnelle
- Tests

**Temps estimé**: 120 heures

---

## Phase 3: Gestion Commandes (Semaines 5-6)

### Semaine 5: Liste Commandes

#### Tâches
- [x] Service Orders API
- [x] **Page Liste Commandes**
  - MUI DataGrid
  - Colonnes (numéro, date, client, statut, total, paiement, actions)
  - Filtres
    - Statut (Pending, Confirmed, Shipped, Delivered, Cancelled)
    - Date (date range picker)
    - Montant (min-max)
    - Mode paiement
  - Recherche (numéro commande, client)
  - Badges visuels pour statuts
  - Export CSV/Excel
- [x] Actions rapides
  - Voir détails
  - Modifier statut (dropdown)
  - Imprimer facture
- [x] Loading states
- [x] Tests liste commandes

#### Livrables
- Liste commandes complète
- Filtres et recherche opérationnels
- Tests

**Temps estimé**: 120 heures

---

### Semaine 6: Détail & Gestion Commande

#### Tâches
- [x] **Page Détail Commande**
  - Section informations client
    - Nom, email, téléphone
    - Adresse livraison
    - Adresse facturation
  - Section articles commandés
    - Table produits (image, nom, quantité, prix, total)
    - Sous-total
  - Section récapitulatif
    - Sous-total, frais livraison, réduction, total
  - Section paiement
    - Méthode, statut, transaction ID
  - Section livraison
    - Méthode, tracking number
  - Section historique statuts
    - Timeline changements statut
    - Commentaires
- [x] Actions commande
  - Modifier statut (avec modal confirmation)
  - Ajouter numéro tracking
  - Envoyer notification client
  - Imprimer facture PDF (téléchargement)
  - Imprimer bon de livraison PDF
  - Annuler commande (avec raison)
  - Rembourser
- [x] Integration PDF generation API
- [x] Tests détail commande

#### Livrables
- Page détail commande complète
- Actions gestion commande fonctionnelles
- Génération PDF fonctionnelle
- Tests

**Temps estimé**: 120 heures

---

## Phase 4: Gestion Clients & Rapports (Semaines 7-8)

### Semaine 7: Clients & Rapports

#### Tâches
- [x] Service Customers API
- [x] **Page Liste Clients**
  - MUI DataGrid
  - Colonnes (nom, email, téléphone, commandes, total dépensé, date inscription)
  - Filtres (date inscription, nb commandes, total dépensé)
  - Recherche (nom, email)
  - Export CSV
- [x] **Page Détail Client**
  - Informations personnelles
  - Liste adresses
  - Statistiques (commandes, dépenses)
  - Historique commandes
  - Actions (modifier, bloquer/débloquer)
- [x] Service Reports API
- [x] **Page Rapports**
  - Sélecteur de type de rapport
  - Date range picker
  - Rapport Ventes
    - Graphique évolution
    - Tableau récapitulatif
  - Rapport Top Produits
    - Tableau produits les plus vendus
  - Rapport Clients
    - Nouveaux clients
    - Clients actifs
  - Export PDF/CSV
- [x] Tests clients & rapports

#### Livrables
- Gestion clients complète
- Module rapports fonctionnel
- Tests

**Temps estimé**: 120 heures

---

### Semaine 8: Utilisateurs Admin, Paramètres & Finitions

#### Tâches
- [x] Service Users API
- [x] **Page Gestion Utilisateurs Admin**
  - Liste administrateurs (DataGrid)
  - Formulaire ajout/modification admin
  - Gestion rôles (SUPER_ADMIN, ADMIN, MANAGER, SUPPORT)
  - Bloquer/Débloquer admin
- [x] **Page Paramètres**
  - Section Informations boutique
    - Nom, email, téléphone, adresse
    - Upload logo
  - Section Régionaux (langue, devise, format date)
  - Section Emails (SMTP config)
  - Section Paiement (config CIB, Baridimob)
  - Section Livraison (frais, zones)
  - Sauvegarde paramètres
- [x] **Page Synchronisation ERP/WMS**
  - Configuration endpoints
  - Test connexion
  - Trigger synchronisation manuelle
  - Logs de synchronisation
  - Statut dernière sync
- [x] **Centre de Notifications**
  - Dropdown notifications (header)
  - Liste notifications
  - Marquer comme lu
  - Notifications temps réel (WebSocket)
- [x] Permissions & rôles (implémentation)
- [x] Tests finaux
  - Tests E2E (parcours complets)
  - Tests responsive
  - Tests cross-browser
- [x] Documentation
  - Guide utilisateur admin
  - Documentation technique

#### Livrables
- Gestion utilisateurs admin
- Paramètres de configuration
- Synchronisation ERP/WMS
- Notifications temps réel
- Tests complets
- Documentation

**Temps estimé**: 120 heures

---

## Récapitulatif par Semaine

| Semaine | Phase | Heures | Cumul |
|---------|-------|--------|-------|
| 1 | Setup & Layout | 120 | 120 |
| 2 | Auth & Dashboard | 120 | 240 |
| 3 | Liste produits | 120 | 360 |
| 4 | Formulaire produit & catégories | 120 | 480 |
| 5 | Liste commandes | 120 | 600 |
| 6 | Détail & gestion commande | 120 | 720 |
| 7 | Clients & Rapports | 120 | 840 |
| 8 | Admins, paramètres & finitions | 120 | 960 |

**Total: 960 heures**

---

## Dépendances Critiques

### Dépendances Backend (API)
- **Semaine 2**: API Auth & Stats fonctionnelles
- **Semaine 3**: API Products fonctionnelle
- **Semaine 4**: API Categories fonctionnelle
- **Semaine 5**: API Orders fonctionnelle
- **Semaine 6**: API PDF generation (Jasper Reports) fonctionnelle
- **Semaine 7**: API Customers & Reports fonctionnelles
- **Semaine 8**: API Users, Settings, Sync fonctionnelles

**Impact retard backend**: Développement avec mocks possible, mais intégration retardée.

---

## Jalons (Milestones)

- **Semaine 2**: Dashboard opérationnel avec stats ✓
- **Semaine 4**: Gestion produits complète ✓
- **Semaine 6**: Gestion commandes complète ✓
- **Semaine 8**: Back-office complet et prêt pour production ✓

---

## Risques & Mitigation

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| Retard API backend | Élevé | Moyen | Développer avec mocks, API contract-first |
| Complexité DataGrid | Moyen | Faible | Utiliser MUI X DataGrid (robuste) |
| Performance graphiques | Moyen | Faible | Optimiser requêtes, cache avec React Query |
| Problèmes PDF generation | Moyen | Moyen | Tests précoces avec backend (semaine 6) |

---

## Activités Continues (Semaines 1-8)

### Tests (Intégré)
- Tests unitaires: chaque composant
- Tests d'intégration: chaque feature
- Tests E2E: parcours critiques
- Couverture > 70%

### Code Review
- Revue de code systématique
- Respect des conventions

### Documentation
- README maintenu
- Documentation technique

---

**Version**: 1.0
**Date**: Novembre 2025
**Statut**: Planning détaillé
