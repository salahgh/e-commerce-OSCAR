# Recette utilisateur (UAT) — OSCAR Fashion

> **UAT = User Acceptance Testing / Recette utilisateur.** Cette documentation décrit, de
> manière exhaustive, les scénarios à exécuter manuellement pour valider que la plateforme
> OSCAR Fashion répond aux besoins métier avant mise en production.

OSCAR Fashion est une plateforme e-commerce pour le marché de la mode algérien. La recette
couvre les **trois applications** du produit :

| Application | Fichier de recette | Public cible |
|-------------|--------------------|--------------|
| Back-office (administration) | [`UAT-Backoffice.md`](./UAT-Backoffice.md) | Administrateurs, gestionnaires |
| Frontend (boutique web) | [`UAT-Frontend.md`](./UAT-Frontend.md) | Clients web |
| Application mobile (Expo / React Native) | [`UAT-Mobile.md`](./UAT-Mobile.md) | Clients mobiles (iOS / Android) |

---

## 1. Objet et portée

- **Objectif** : confirmer, du point de vue de l'utilisateur final, que chaque fonctionnalité
  se comporte conformément aux attentes métier (parcours nominaux, cas d'erreur, cas limites,
  permissions, internationalisation et RTL).
- **Hors périmètre** : tests unitaires, tests de charge/performance détaillés, audit de
  sécurité approfondi, tests d'intégration GraphQL bas niveau. (Quelques vérifications
  transverses de performance et d'accessibilité sont néanmoins incluses.)
- **Type de tests** : recette **manuelle**. Chaque cas est conçu pour être rejoué par un
  testeur humain et coché.

## 2. Conventions

### Identifiants des cas de test

Format : `<APP>-<MODULE>-<NN>`

- Préfixe application : `BO` (Back-office), `FE` (Frontend), `MOB` (Mobile)
- Code module (ex. `AUTH`, `PROD`, `CHK`, `ORD`, `REORD`…)
- Numéro séquentiel à deux chiffres

Exemples : `BO-AUTH-01`, `FE-CHK-07`, `MOB-REORD-03`.

### Colonnes des tableaux de cas

| Colonne | Signification |
|---------|---------------|
| **ID** | Identifiant unique du cas |
| **Titre** | Résumé du scénario |
| **Préconditions** | État requis avant exécution |
| **Étapes** | Actions à réaliser, numérotées |
| **Données de test** | Jeux de valeurs à utiliser |
| **Résultat attendu** | Comportement attendu (critère de succès) |
| **Priorité** | Haute / Moyenne / Basse |
| **Statut** | Résultat constaté lors de l'exécution |

### Légende — Priorité

- **Haute** : fonctionnalité critique, bloque la mise en production si défaillante.
- **Moyenne** : fonctionnalité importante, contournement possible.
- **Basse** : confort, cosmétique ou cas rare.

### Légende — Statut (à renseigner pendant l'exécution)

| Symbole | Signification |
|---------|---------------|
| ☐ | À tester (non exécuté) |
| ✅ | Réussi |
| ❌ | Échoué (ouvrir une anomalie) |
| ⛔ | Bloqué (impossible à exécuter — dépendance/anomalie amont) |
| N/A | Non applicable dans cet environnement |

## 3. Environnement de recette

| Élément | Valeur de référence |
|---------|---------------------|
| Back-office (Vite) | `http://localhost:5173` |
| Frontend (Next.js) | `http://localhost:3000` |
| API Shop (clients) | `http://localhost:8085/shop-api` |
| API Admin (back-office) | `http://localhost:8085/admin-api` |
| Application mobile | Expo Go / build de dev (`cd apps/mobile && npx expo start`) |
| Devise | DZD (Dinar algérien) |
| Langues | Français (défaut), Arabe (RTL), Anglais |

> Adapter les URL aux environnements de recette/préproduction réels le cas échéant.

## 4. Comptes et données de test recommandés

| Rôle / type | Identifiant exemple | Usage |
|-------------|---------------------|-------|
| Super Admin | `superadmin` / `superadmin123` | Tous les tests back-office |
| Admin à permissions limitées | à créer pendant la recette (module Utilisateurs & Rôles) | Tests RBAC |
| Client vérifié | `client.recette@oscar.test` | Parcours connecté web & mobile |
| Client non vérifié | à créer via inscription | Tests de vérification e-mail |
| Invité (guest) | aucun compte | Commande sans compte |

Jeux de données produits requis : au moins un produit **avec variantes (taille + couleur)**,
un produit **en rupture de stock**, un produit **en stock faible**, un produit **en
promotion**, et plusieurs collections/catégories peuplées. Prévoir au moins un **code promo
valide** et un **code promo invalide/expiré**.

Wilayas : prévoir des adresses couvrant des **zones de livraison différentes** (zones 1 à 4)
pour valider les frais et délais.

## 5. Matrice de couverture (chapitres par application)

| # | Back-office | Frontend | Mobile |
|---|-------------|----------|--------|
| 1 | Authentification & RBAC | i18n / RTL & navigation globale | Splash & Onboarding |
| 2 | Tableau de bord & Rapports | Authentification & compte | Authentification & gestion de session |
| 3 | Produits (CRUD, wizard, variantes) | Accueil & catalogue | Navigation & Accueil |
| 4 | Catégories / Collections | Page produit & sélection de variante | Catalogue / Explore / Recherche |
| 5 | Facettes (attributs) | Recherche & filtres à facettes | Page produit & variantes |
| 6 | Commandes | Panier & coupons | Panier, coupons & MiniCart |
| 7 | Clients (+ opérations en masse) | Tunnel de commande (checkout) | Tunnel de commande (checkout) |
| 8 | Médias / Assets | Espace compte (profil, commandes, wishlist) | Confirmation de commande |
| 9 | Promotions | Pages statiques & contenu | Commandes & Réapprovisionnement (reorder) |
| 10 | Utilisateurs & Rôles | En-tête, pied & navigation | Profil, Adresses & Paramètres |
| 11 | Profil admin & Paramètres système | Devise, états, responsive, accessibilité | Wishlist & Récemment consultés |
| 12 | Composants transverses | — | Transverses (i18n, thème, réseau, validations) |

## 6. Suivi d'exécution

Pour chaque campagne de recette, dupliquer les fichiers (ou exporter en tableur) et
renseigner la colonne **Statut**. Consigner pour chaque ❌ : navigateur/appareil, version,
étapes de reproduction, capture d'écran, et lien vers l'anomalie ouverte.

| Indicateur | Formule |
|------------|---------|
| Taux de réussite | `✅ / (✅ + ❌ + ⛔)` |
| Couverture exécutée | `(✅ + ❌ + ⛔) / total des cas` |
| Cas bloquants restants | nombre de ❌/⛔ de priorité **Haute** |

**Critère de sortie (Go/No-Go)** recommandé : 0 cas **Haute** en ❌/⛔, et ≥ 95 % de réussite
globale.
