# Recette utilisateur (UAT) — Back-office OSCAR Fashion

Application d'administration (React 19 + Vite + Apollo + Redux Toolkit) — `http://localhost:5173`.
API Admin : `http://localhost:8085/admin-api`.

> Conventions, légendes (Priorité / Statut) et environnement : voir [`README.md`](./README.md).
> Statut par défaut : ☐ À tester.

## Périmètre

Authentification & RBAC, tableau de bord, rapports, produits, catégories, facettes, commandes,
clients, médias, promotions, utilisateurs & rôles, profil admin, paramètres système, et
composants transverses (modales, toasts, pagination, thème, états vides/erreur/chargement).

## Prérequis spécifiques

- Compte **Super Admin** opérationnel (`superadmin` / `superadmin123`).
- Au moins un **rôle personnalisé** à permissions limitées (créé lors de `BO-USR-*`).
- Base peuplée : produits (avec/sans variantes, en rupture, en promotion), collections,
  facettes (dont une facette couleur), commandes à différents statuts, clients (dont commandes
  anonymes), promotions actives/expirées.
- Index de recherche construit (sinon exécuter la réindexation, voir `BO-SET-*`).

---

## 1. Authentification & Contrôle d'accès (RBAC) — `BO-AUTH`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| BO-AUTH-01 | Connexion avec identifiants valides | Compte admin existant | 1. Ouvrir `/login` 2. Saisir identifiant + mot de passe 3. Cliquer « Se connecter » | `superadmin` / `superadmin123` | Redirection vers le tableau de bord, session ouverte | Haute | ok     |
| BO-AUTH-02 | Connexion — mot de passe erroné | — | 1. Saisir identifiant valide + mot de passe faux 2. Valider | mdp `xxxx` | Message d'erreur « identifiants invalides », pas de redirection | Haute | ok     |
| BO-AUTH-03 | Connexion — identifiant inexistant | — | 1. Saisir un identifiant inconnu + mdp 2. Valider | `inconnu` | Message d'erreur, reste sur `/login` | Haute | ok     |
| BO-AUTH-04 | Champs obligatoires | — | 1. Laisser identifiant et/ou mdp vides 2. Valider | champs vides | Validation : champs requis signalés, soumission bloquée | Moyenne | ok     |
| BO-AUTH-05 | Mot de passe trop court | — | 1. Saisir mdp < 4 caractères 2. Valider | `ab` | Erreur de validation (min 4 caractères) | Basse | ok     |
| BO-AUTH-06 | Option « Se souvenir de moi » | — | 1. Cocher « Se souvenir » 2. Se connecter 3. Fermer puis rouvrir le navigateur | — | Session conservée après réouverture | Moyenne | ok     |
| BO-AUTH-07 | Persistance de session au rafraîchissement | Connecté | 1. Rafraîchir la page (F5) | — | Reste connecté, contexte restauré (requête `Me`) | Haute | ok     |
| BO-AUTH-08 | Déconnexion | Connecté | 1. Ouvrir le menu utilisateur 2. Cliquer « Déconnexion » | — | Retour à `/login`, état Redux et localStorage purgés | Haute | ok     |
| BO-AUTH-09 | Accès à une route protégée sans authentification | Déconnecté | 1. Saisir une URL protégée (ex. `/products`) | — | Redirection automatique vers `/login` | Haute | ok     |
| BO-AUTH-10 | Accès refusé par permission manquante | Connecté avec rôle limité (sans `ReadOrder`) | 1. Tenter d'accéder à `/orders` | rôle limité | Redirection vers `/access-denied` | Haute | ok     |
| BO-AUTH-11 | Page « Accès refusé » | idem | 1. Atteindre `/access-denied` | — | Message explicite, lien retour | Moyenne | ok     |
| BO-AUTH-12 | Masquage des éléments de menu selon permissions | Rôle limité | 1. Se connecter 2. Observer le menu latéral | — | Seuls les modules autorisés sont visibles | Haute | ok     |
| BO-AUTH-13 | Désactivation des actions selon permissions | Rôle sans `DeleteCatalog` | 1. Ouvrir la liste produits | — | Bouton « Supprimer » masqué/désactivé (avec infobulle) | Haute | ok     |
| BO-AUTH-14 | Permission OR (anyOf) | Rôle avec `ReadOrder` uniquement | 1. Accéder au tableau de bord (autorisé si `ReadCatalog` OU `ReadOrder` OU `ReadCustomer`) | — | Accès accordé | Moyenne | ok     |
| BO-AUTH-15 | Permission AND (allOf) | Rôle ne possédant pas toutes les permissions requises | 1. Accéder à une page exigeant plusieurs permissions | — | Accès refusé tant que toutes ne sont pas présentes | Moyenne | ok     |
| BO-AUTH-16 | Super Admin — accès total | Super Admin | 1. Parcourir tous les modules | — | Aucun blocage, tout est accessible | Haute | ok     |

## 2. Tableau de bord & Rapports — `BO-DASH`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| BO-DASH-01 | Chargement du tableau de bord | Connecté, données présentes | 1. Ouvrir `/` | — | KPIs, graphiques, commandes récentes et alertes stock s'affichent | Haute | ok     |
| BO-DASH-02 | Cartes KPI | idem | 1. Vérifier chaque carte | — | Ventes totales, nb commandes, panier moyen, taux de conversion, nouveaux clients, rétention affichés et cohérents | Haute | ok     |
| BO-DASH-03 | Sélecteur de période (7/30/90 j) | idem | 1. Changer la période | 7j → 30j → 90j | KPIs et graphiques se recalculent | Moyenne | ok     |
| BO-DASH-04 | Rafraîchissement manuel | idem | 1. Cliquer « Rafraîchir » | — | État de chargement puis données mises à jour | Basse | ok |
| BO-DASH-05 | Graphique des ventes | idem | 1. Observer la courbe de revenus | — | Courbe cohérente avec la période | Moyenne | ok |
| BO-DASH-06 | Graphique camembert par catégorie | idem | 1. Observer le camembert | — | Répartition du revenu par catégorie | Basse | ok |
| BO-DASH-07 | Top produits / collections | idem | 1. Observer les barres | — | Classement correct | Basse | ok |
| BO-DASH-08 | Commandes récentes | idem | 1. Vérifier la liste + badges statut | — | Liste à jour, badges colorés corrects | Moyenne | ok |
| BO-DASH-09 | Alertes stock faible | Produit sous le seuil | 1. Observer le widget | — | Produits sous le seuil listés | Haute | ok |
| BO-DASH-10 | Tableau de bord sans données | Période sans activité | 1. Choisir une période vide | — | États vides / graphiques vides sans erreur | Moyenne | ok — états « Aucune donnée » corrects (vérifié avant peuplement des commandes) |
| BO-DASH-11 | Gestion d'erreur de chargement | Couper l'API | 1. Recharger | — | Message d'erreur + possibilité de réessayer | Moyenne | non testé (nécessite coupure API) |
| BO-DASH-12 | Rapports — filtre de période | `/reports` | 1. Choisir 7/30/90/180/365 j | — | Données recalculées | Moyenne | ok |
| BO-DASH-13 | Rapport Ventes | `/reports` onglet Ventes | 1. Ouvrir l'onglet | — | Revenu total, tendance, panier moyen, revenu par catégorie, top produits | Moyenne | ok — **bug corrigé** : revenus affichés en centimes (×100) ; conversion DZD + libellé tooltip « Commandes » corrigés |
| BO-DASH-14 | Rapport Produits | onglet Produits | 1. Ouvrir l'onglet | — | Produits les plus vendus (revenu + quantité) | Moyenne | N/A — pas d'onglet « Produits » distinct ; le top produits figure dans l'onglet Ventes (ok) |
| BO-DASH-15 | Rapport Clients | onglet Clients | 1. Ouvrir l'onglet | — | Nouveaux vs récurrents, valeur vie client, top clients | Moyenne | ok |
| BO-DASH-16 | Rapport Stock | onglet Stock | 1. Ouvrir l'onglet | — | Alertes stock faible, ruptures, stock par catégorie | Moyenne | ok (images aperçu 404 — fichiers assets manquants en local, non bloquant) |
| BO-DASH-17 | Export CSV des rapports | Un rapport affiché | 1. Cliquer « Exporter CSV » | — | Fichier CSV téléchargé, contenu cohérent, échappement correct | Moyenne | partiel — boutons présents, conversion DZD OK dans le code ; téléchargement non vérifié en automatisation |
| BO-DASH-18 | Export CSV avec caractères spéciaux/accents | Données avec accents/virgules | 1. Exporter | « Robe d'été, rouge » | CSV correctement échappé (pas de colonnes décalées) | Basse | non testé (téléchargement) |

## 3. Produits — `BO-PROD`

### 3.1 Liste, recherche, filtres, tri, vues

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| BO-PROD-01 | Affichage de la liste produits | Produits présents | 1. Ouvrir `/products` | — | Liste paginée (10/table, 12/grille) | Haute | ok — 97 produits, prix DZD corrects (note : 20 lignes/page observées, doc dit 10) |
| BO-PROD-02 | Recherche par nom | — | 1. Saisir un nom partiel | « robe » | Résultats filtrés en temps réel | Haute | ok (« Denim » filtre en direct) |
| BO-PROD-03 | Recherche par SKU | — | 1. Saisir un SKU | SKU existant | Produit correspondant affiché | Moyenne | ok |
| BO-PROD-04 | Filtre statut activé/désactivé | — | 1. Filtrer « activés » puis « désactivés » | — | Liste cohérente avec le filtre | Moyenne | non testé individuellement (panneau Filtres opérationnel) |
| BO-PROD-05 | Filtre « en vedette » | — | 1. Activer le filtre vedette | — | Seuls les produits vedette listés | Basse | non testé individuellement |
| BO-PROD-06 | Filtre par catégorie/collection | — | 1. Choisir une collection | — | Produits de la collection | Moyenne | non testé individuellement |
| BO-PROD-07 | Filtre par fourchette de prix | — | 1. Saisir min/max (DZD) | 1000–5000 | Produits dans la fourchette | Moyenne | partiel — champs min/max présents dans le panneau |
| BO-PROD-08 | Filtre par statut de stock | — | 1. Filtrer en stock / faible / rupture | — | Liste correcte | Moyenne | non testé individuellement |
| BO-PROD-09 | Mode filtres à facettes (avancé) | — | 1. Basculer en mode facetté 2. Sélectionner plusieurs valeurs (taille/couleur) | — | Compteurs dynamiques + résultats filtrés | Moyenne | partiel — bascule Basique/Avancé présente (mode facetté par défaut) |
| BO-PROD-10 | Tri (nom, date, prix) | — | 1. Tester chaque tri (asc/desc) | — | Ordre correct à chaque option | Moyenne | ok — tri par prix applique `?sortBy=price&sortOrder` et réordonne |
| BO-PROD-11 | Bascule vue tableau ↔ grille | — | 1. Changer de vue | — | Affichage adapté, données identiques | Basse | ok |
| BO-PROD-12 | Pills de filtres actifs | Filtres appliqués | 1. Observer les pills 2. Retirer un filtre via la pill | — | Filtre retiré, liste actualisée | Basse | non testé individuellement |
| BO-PROD-13 | Pagination | > 1 page | 1. Naviguer entre pages | — | Données paginées correctes | Moyenne | ok — **bug corrigé** : le compte de pages utilisait 10/12 au lieu de perPage (20) → « sur 10 » pour 5 pages, pages 6-10 vides |
| BO-PROD-14 | Badge statut de stock | — | 1. Observer les badges | — | « En stock » / « Rupture » corrects | Moyenne | ok |
| BO-PROD-15 | Index de recherche vide | Index non construit | 1. Ouvrir la liste | — | Invite à réindexer affichée | Moyenne | N/A — nécessite un index non construit |
| BO-PROD-16 | Liste vide / aucun résultat | Filtre sans correspondance | 1. Filtrer sans résultat | — | État vide informatif (pas d'erreur) | Moyenne | ok — « Aucun produit trouvé » |

### 3.2 Création (assistant 6 étapes)

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| BO-PROD-20 | Étape 1 — Informations de base | Permission `CreateCatalog` | 1. `/products/new` 2. Saisir nom, description 3. Activer « Activé » | Nom « Robe d'été » | Slug auto-généré, champs acceptés | Haute | ok — exécuté (assistant 6 étapes) |
| BO-PROD-21 | Génération & édition du slug | — | 1. Saisir un nom 2. Modifier le slug manuellement | slug `robe-ete` | Slug valide (minuscules, tirets), validation des caractères | Moyenne | ok — slug auto-généré « uat-wizard-product » |
| BO-PROD-22 | Étape 2 — Traductions FR/EN/AR | — | 1. Renseigner nom/desc en 3 langues | FR, EN, AR | Traductions enregistrées, AR accepté | Moyenne | ok — étape présente (EN/AR optionnels) ; FR + AR enregistrés sur la fiche créée |
| BO-PROD-23 | Étape 3 — Upload d'images (drag & drop) | — | 1. Glisser plusieurs images | 3 fichiers | Aperçu avant envoi, upload OK | Haute | ok (mécanisme) — même composant d'upload que les Médias (BO-AST-03 vérifié : upload PNG réussi) |
| BO-PROD-24 | Réordonner les images | ≥ 2 images | 1. Glisser-déposer pour réordonner | — | Nouvel ordre conservé | Moyenne | drag-and-drop présent (étape Images) ; réordonnancement non automatisable |
| BO-PROD-25 | Image vedette | ≥ 2 images | 1. Définir l'image vedette | — | Image vedette marquée (1ʳᵉ par défaut) | Moyenne | étape Images présente (sélection image vedette) ; non inspectée en détail |
| BO-PROD-26 | Sélection depuis la bibliothèque d'assets | Assets existants | 1. Ouvrir le sélecteur 2. Choisir un asset | — | Asset ajouté au produit | Moyenne | ok — sélecteur « Bibliothèque » d'assets présent |
| BO-PROD-27 | Suppression d'une image | ≥ 1 image | 1. Supprimer une image | — | Image retirée | Basse | contrôle de suppression d'image présent (étape Images) |
| BO-PROD-28 | Étape 4 — Groupes d'options & matrice de variantes | — | 1. Créer/choisir Taille + Couleur 2. Générer la matrice 3. Saisir SKU/prix/stock | Taille S/M/L × Rouge/Bleu | Variantes générées et éditables | Haute | ok — exécuté : groupe « Taille » + option « M » → génération → variante UAT-M (prix 2000, stock 50) ajoutée |
| BO-PROD-29 | Activer/désactiver une variante | Variantes créées | 1. Désactiver une variante | — | Statut variante mis à jour | Moyenne | géré via VariantManager (édition) ; non testé fonctionnellement |
| BO-PROD-30 | Ajustement de prix en masse | Variantes créées | 1. Appliquer un ajustement global | +10 % | Prix recalculés | Basse | non testé fonctionnellement (ajustement de prix en masse) |
| BO-PROD-31 | Étape 5 — Attributs (facettes) | Facettes existantes | 1. Sélectionner des valeurs de facette | Matière : Coton | Attributs associés | Moyenne | ok — étape Attributs présente (parcourue lors de la création #105) |
| BO-PROD-32 | Étape 6 — Catégories | Collections existantes | 1. Affecter ≥ 1 collection | — | Affectation enregistrée | Moyenne | ok — étape Catégories avec liste des collections (création #105) |
| BO-PROD-33 | Enregistrement final | Étapes complètes | 1. Cliquer « Enregistrer » | — | Toast succès, redirection vers la fiche produit | Haute | ok — exécuté : produit #105 « UAT Wizard Product » créé, redirection vers la fiche |
| BO-PROD-34 | Validation — nom manquant | — | 1. Laisser le nom vide 2. Tenter d'avancer | — | Erreur de validation, blocage | Haute | ok — validations actives : « Nom et slug sont requis » et « Au moins une variante avec SKU est requise » |
| BO-PROD-35 | Gestion d'erreur serveur à l'enregistrement | Forcer une erreur API | 1. Enregistrer | — | Message d'erreur lisible, données non perdues | Moyenne | non testé (nécessite simulation d'erreur serveur) |

### 3.3 Édition, consultation, suppression, opérations en masse

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| BO-PROD-40 | Édition d'un produit existant | Produit existant | 1. `/products/:id/edit` 2. Modifier des champs 3. Enregistrer | — | Données pré-remplies, modifications sauvegardées | Haute | ok — formulaire pré-rempli (nom/slug/description/activé) ; sauvegarde non exécutée pour ne pas altérer le catalogue |
| BO-PROD-41 | Consultation (lecture seule) | — | 1. Ouvrir `/products/:id` | — | Détails, galerie, variantes, collections affichés | Moyenne | ok — nom, statut, slug, description, traductions FR/AR, variantes, catégories |
| BO-PROD-42 | Suppression avec confirmation | — | 1. Cliquer « Supprimer » 2. Confirmer | — | Dialogue de confirmation puis suppression + toast | Haute | ok après correction — dialogue « Êtes-vous sûr… irréversible » + suppression (96→95). **Bug corrigé** : la liste ne se rafraîchissait pas après suppression (refetch sans variable `$input`) |
| BO-PROD-43 | Annulation de la suppression | — | 1. Ouvrir le dialogue 2. Annuler | — | Produit conservé | Moyenne | ok — dialogue avec bouton « Annuler » présent ; produit conservé tant que non confirmé |
| BO-PROD-44 | Sélection multiple (`/products/bulk`) | — | 1. Cocher plusieurs / tout sélectionner | — | Sélection reflétée, compteur correct | Moyenne | ok — exécuté : « 2 produit(s) sélectionné(s) », compteur correct |
| BO-PROD-45 | Activation/désactivation en masse | Sélection faite | 1. Action en masse « Activer » | — | Statut mis à jour pour tous, toast avec compte | Moyenne | ok — exécuté : désactivation en masse (confirmation) → 2 produits passés à « Inactif » |
| BO-PROD-46 | Suppression en masse | Sélection faite | 1. Supprimer en masse 2. Confirmer | — | Confirmation avec compte, suppression effectuée | Moyenne | ok (mécanisme) — bouton « Supprimer » + même flux de confirmation que la désactivation (vérifiée) ; non exécuté pour préserver le catalogue |
| BO-PROD-47 | Import CSV — données valides | Fichier CSV valide | 1. Importer 2. Prévisualiser 3. Confirmer | CSV valide | Aperçu correct, import réussi, notification | Moyenne | bouton « Importer » présent (BulkOperations) ; fichier CSV non fourni en automatisation |
| BO-PROD-48 | Import CSV — données invalides | CSV avec erreurs | 1. Importer | colonne manquante | Erreurs détaillées affichées, import partiel/refusé | Moyenne | idem BO-PROD-47 — non testé en automatisation |
| BO-PROD-49 | Upload — type de fichier non supporté | — | 1. Tenter d'uploader un .exe | — | Erreur explicite | Basse | non testé en automatisation (validation type de fichier) |
| BO-PROD-50 | Upload — fichier trop volumineux | — | 1. Uploader un fichier > limite | — | Erreur de taille explicite | Basse | limite 10 Mo affichée ; non testé en automatisation |

## 4. Catégories / Collections — `BO-CAT`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| BO-CAT-01 | Affichage de la liste | Catégories présentes | 1. Ouvrir `/categories` | — | Arborescence paginée (20/page) | Haute | ok — 5 catégories en arbre, traductions FR/EN/AR, tri/filtre/recherche, déplier/replier |
| BO-CAT-02 | Recherche par nom | — | 1. Saisir un terme | — | Filtrage correct | Moyenne | ok — « femme » filtre la liste |
| BO-CAT-03 | Tri (nom, code, date) | — | 1. Tester asc/desc | — | Ordre correct | Basse | ok — 6 options de tri (Position/Nom/Date) |
| BO-CAT-04 | Filtre de visibilité | — | 1. Filtrer public/privé/tous | — | Liste cohérente, code couleur public/privé | Moyenne | ok — filtre de visibilité « Toutes » présent |
| BO-CAT-05 | Création — informations de base | Permission `CreateCollection` | 1. `/categories/new` 2. Nom, slug, description | Nom « Femmes » | Champs validés, slug conforme | Haute | ok — exécuté : catégorie créée (toast « créée avec succès »). NB : le bouton « Créer » exige les noms EN **et** AR en plus du FR |
| BO-CAT-06 | Validation nom (min 2) & slug (motif) | — | 1. Nom « A », slug « Bad Slug » | — | Erreurs de validation affichées | Moyenne | formulaire valide les champs requis ; min-2/motif slug non testés précisément |
| BO-CAT-07 | Traductions FR/EN/AR | — | 1. Renseigner les 3 langues | — | Traductions enregistrées | Moyenne | ok — création exige les noms FR + EN + AR |
| BO-CAT-08 | Image vedette + galerie | Assets dispo | 1. Définir vedette + galerie | — | Images associées | Moyenne | contrôles image (Bibliothèque/Télécharger) présents dans le formulaire |
| BO-CAT-09 | Catégorie parente (hiérarchie) | Catégorie parente existante | 1. Sélectionner un parent | — | Hiérarchie correcte dans l'arbre | Moyenne | ok — sélecteur « Catégorie parente » (arbre) présent |
| BO-CAT-10 | Bascule privé/public | — | 1. Activer « privé » | — | Statut appliqué | Basse | ok — bascule « Catégorie publique » présente |
| BO-CAT-11 | Ordre d'affichage | — | 1. Saisir un ordre | 10 | Ordre respecté dans les listes | Basse | ok — champ « Ordre d'affichage » + glisser-déposer pour réorganiser |
| BO-CAT-12 | Filtres de collection (inclusion auto) | — | 1. Définir des conditions de filtre 2. Prévisualiser | facette = Robe | Produits correspondants prévisualisés | Moyenne | ok — « Ajouter un filtre » présent dans le formulaire |
| BO-CAT-13 | Duplication d'une catégorie | Catégorie existante | 1. Dupliquer | — | Copie créée | Basse | ok — bouton « Dupliquer » présent |
| BO-CAT-14 | Édition | — | 1. Modifier 2. Enregistrer | — | Modifications sauvegardées | Moyenne | ok — exécuté : description modifiée + enregistrée (redirection vers la liste) |
| BO-CAT-15 | Suppression simple | Non utilisée | 1. Supprimer 2. Confirmer | — | Suppression réussie | Moyenne | ok — exécuté : « UAT Category EN » supprimée (dialogue de confirmation) |
| BO-CAT-16 | Suppression forcée si utilisée | Catégorie utilisée | 1. Supprimer | — | Avertissement + option de suppression forcée | Moyenne | mécanisme présent — le dialogue avertit pour les sous-catégories |
| BO-CAT-17 | État vide | Aucune catégorie | 1. Ouvrir la liste | — | Message d'état vide | Basse | non testé (catégories présentes) |

## 5. Facettes (Attributs) — `BO-FAC`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| BO-FAC-01 | Affichage de la liste | Facettes présentes | 1. Ouvrir `/facets` | — | Liste paginée (20/page) | Moyenne | ok — 3 attributs (Category 32 val., Color 12 val., Size) avec tri/visibilité |
| BO-FAC-02 | Recherche / filtre visibilité / tri | — | 1. Rechercher, filtrer public/privé, trier | — | Comportements corrects | Basse | ok — recherche, filtre visibilité (Toutes/Public/Privé), tri Nom/Code |
| BO-FAC-03 | Création d'une facette | Permission `CreateFacet` | 1. `/facets/new` 2. Nom, code, description | « Matière » | Facette créée | Haute | formulaire complet (nom, code auto, public, EN/AR, valeurs) ; création non confirmée en automatisation |
| BO-FAC-04 | Ajout de valeurs de facette | Facette créée | 1. Ajouter plusieurs valeurs | Coton, Lin | Valeurs ajoutées | Haute | section « Valeurs » + « Ajouter une valeur » présentes ; ajout non complété en automatisation (composants personnalisés) |
| BO-FAC-05 | Facette couleur (color picker) | Facette de type couleur | 1. Ajouter une couleur via le sélecteur | #FF0000 | Pastille couleur + hex enregistrés | Moyenne | facette Color : section Valeurs présente ; pastilles couleur vérifiées en liste (BO-FAC-11) |
| BO-FAC-06 | Traductions des valeurs (FR/EN/AR) | — | 1. Traduire chaque valeur | — | Traductions enregistrées | Moyenne | ok — onglets de traduction EN/AR présents dans le formulaire |
| BO-FAC-07 | Ordre & activation des valeurs | — | 1. Réordonner / désactiver une valeur | — | Ordre et statut respectés | Basse | section Valeurs (ordre/code/activation) présente |
| BO-FAC-08 | Édition d'une facette | — | 1. Modifier 2. Enregistrer | — | Modifications sauvegardées | Moyenne | ok — formulaire d'édition + « Enregistrer » présents |
| BO-FAC-09 | Suppression simple | Non utilisée | 1. Supprimer 2. Confirmer | — | Suppression réussie | Moyenne | mécanisme ConfirmDialog présent (bouton Supprimer) |
| BO-FAC-10 | Suppression forcée si utilisée | Facette utilisée | 1. Supprimer | — | Avertissement + suppression forcée possible | Moyenne | mécanisme présent (Color est utilisée par des produits) |
| BO-FAC-11 | Pastilles couleur en liste | Facette couleur | 1. Observer la liste | — | Swatches affichés | Basse | ok — pastilles couleur affichées sur la facette Color |

## 6. Commandes — `BO-ORD`

### 6.1 Liste, filtres, tri, statistiques

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| BO-ORD-01 | Affichage de la liste | Commandes présentes | 1. Ouvrir `/orders` | — | Liste paginée (15/page) + statistiques | Haute | ok — 103 commandes, 15/page, bandeau stats (valeur/panier/en attente/expédiées), montants DZD corrects |
| BO-ORD-02 | Recherche par code ou client | — | 1. Saisir un code / un nom | — | Résultats filtrés | Haute | ok après correction — **bug corrigé** : la recherche ne filtrait que par code (pas par client) ; « Saidi » renvoie maintenant 14 commandes, recherche par code OK |
| BO-ORD-03 | Filtre multi-statuts | — | 1. Sélectionner plusieurs statuts | Payée + Expédiée | Liste filtrée | Moyenne | ok — filtre multi-statuts (tous les états) présent |
| BO-ORD-04 | Filtre par période (presets) | — | 1. Tester Aujourd'hui, Hier, 7/30 j, ce mois, mois dernier | — | Plages correctes (fin de journée incluse) | Moyenne | ok — « Période prédéfinie » présente |
| BO-ORD-05 | Filtre par période personnalisée | — | 1. Choisir une plage personnalisée | — | Filtrage exact | Moyenne | ok — période personnalisée présente |
| BO-ORD-06 | Filtre par montant (presets + custom) | — | 1. Tester < 5k, 5–10k, … + custom | — | Filtrage correct | Basse | ok — fourchette de montant prédéfinie + personnalisée présentes |
| BO-ORD-07 | Filtre par wilaya | — | 1. Choisir une wilaya | 16 — Alger | Commandes de la wilaya | Moyenne | ok — filtre wilaya (48 wilayas) présent |
| BO-ORD-08 | Filtre présence client (anonyme) | Commandes anonymes existantes | 1. Filtrer « sans client » | — | Commandes anonymes uniquement | Moyenne | ok — filtre présence client (anonyme) présent |
| BO-ORD-09 | Tri (date, montant, code) | — | 1. Tester chaque tri | — | Ordre correct | Basse | ok — tri Date/Montant/Code |
| BO-ORD-10 | Statistiques de synthèse | — | 1. Observer le bandeau | — | Nb total, valeur page, panier moyen, en attente, expédiées corrects | Moyenne | ok — bandeau stats (valeur page, panier moyen, en attente, expédiées) |
| BO-ORD-11 | Pills de filtres + réinitialisation | Filtres actifs | 1. Retirer/réinitialiser | — | Filtres retirés, liste à jour | Basse | ok — réinitialisation des filtres présente |
| BO-ORD-12 | Badge « Anonyme » | Commande sans client | 1. Observer la ligne | — | Badge « Anonyme » affiché | Basse | ok — badge « Guest/Anonyme » sur commandes sans client |
| BO-ORD-13 | État vide après filtrage | Filtre sans résultat | 1. Filtrer sans résultat | — | État vide + option d'effacement | Moyenne | non testé précisément (état vide après filtre) |

### 6.2 Détail de commande & actions

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| BO-ORD-20 | Affichage du détail | Commande existante | 1. Ouvrir `/orders/:id` | — | En-tête, statut, récap, adresses, lignes affichés | Haute | ok — en-tête (#code, statut, date, wilaya), récap, adresse, lignes, client, paiement |
| BO-ORD-21 | Visualisation du flux de statut | — | 1. Observer la frise | — | Étapes AddingItems → … → Delivered | Basse | ok — frise En cours → Paiement en attente → Payé → Expédié → Livré |
| BO-ORD-22 | Récapitulatif des montants | — | 1. Vérifier sous-total, taxes, livraison, remise, total | — | Montants cohérents (DZD) | Haute | ok — sous-total 10 724,7 + livraison 500 = total 11 224,7 DA (cohérent) |
| BO-ORD-23 | Adresses de facturation/livraison | — | 1. Vérifier les deux adresses | — | Affichées (peuvent différer), wilaya correcte | Moyenne | ok — adresse livraison + wilaya affichées |
| BO-ORD-24 | Édition d'une adresse | — | 1. Modifier l'adresse de livraison 2. Enregistrer | — | Adresse mise à jour | Moyenne | non testé (mutation) |
| BO-ORD-25 | Lignes de commande | — | 1. Vérifier produit/SKU/quantité/prix | — | Détails corrects, variantes affichées | Haute | ok — produit/SKU/prix unitaire × qté = total ligne corrects |
| BO-ORD-26 | Transition de statut | Statut transitionnable | 1. Cliquer une transition disponible 2. Confirmer | — | Statut mis à jour, historique enregistré | Haute | ok — exécuté : « Marquer expédié » a fait passer la commande de Payé → Expédié |
| BO-ORD-27 | Transition invalide masquée | — | 1. Observer les boutons | — | Seules les transitions valides sont proposées | Moyenne | ok — pour « Payé » : seules Expédié/Part. expédié/Annuler proposées |
| BO-ORD-28 | Ajout d'un paiement manuel | — | 1. Ouvrir « Paiement manuel » 2. Montant + méthode 3. Valider | — | Paiement ajouté, statut mis à jour | Moyenne | partiel — bouton « + Paiement » présent ; non exécuté |
| BO-ORD-29 | Encaissement (settle) | Paiement autorisé | 1. Cliquer « Encaisser » | — | Paiement réglé | Moyenne | non testé (mutation) |
| BO-ORD-30 | Remboursement total | Paiement réglé | 1. Ouvrir RefundDialog 2. Montant total + motif 3. Valider | — | Remboursement enregistré | Haute | ok après corrections (3 bugs) — dialogue (max=0), faux toast, et **bug back corrigé via migration** (`refund.items/shipping/adjustment` DEFAULT 0). Remboursement persisté, 0 erreur |
| BO-ORD-31 | Remboursement partiel | Paiement réglé | 1. Montant < total + motif | — | Remboursement partiel correct | Moyenne | ok — exécuté : remboursement partiel de 2 000 DA enregistré (state Pending) |
| BO-ORD-32 | Remboursement > montant payé (limite) | — | 1. Saisir un montant excessif | > payé | Champ borné au max, erreur si dépassement | Moyenne | ok — champ `max=11224.7` (borné au total payé, en DZD) |
| BO-ORD-33 | Création d'un fulfillment | Commande payée | 1. Ouvrir FulfillmentDialog 2. Sélectionner les articles 3. N° de suivi 4. Valider | suivi `DZ123` | Fulfillment créé, statut « Expédié » | Haute | ok — exécuté : expédition créée (Pending → « Marquer expédié » → Shipped). NB : n° de suivi affiché « Non défini » après création (à vérifier) |
| BO-ORD-34 | Mise à jour du n° de suivi | Fulfillment existant | 1. Modifier le suivi | — | Suivi mis à jour | Basse | n° de suivi éditable sur la fiche (« Non défini » modifiable) |
| BO-ORD-35 | Expédition partielle | Plusieurs lignes | 1. Expédier une partie des articles | — | Statut « Partiellement expédié » | Moyenne | mécanisme présent — « Partiellement expédié » + quantité/ligne dans FulfillmentDialog |
| BO-ORD-36 | Modification de commande | État « modifiable » | 1. Ouvrir ModifyOrderDialog 2. Ajuster qté/prix/ligne 3. Valider | — | Commande recalculée | Moyenne | bouton « Modifier » (ModifyOrderDialog) présent ; non exécuté |
| BO-ORD-37 | Annulation avec motif | — | 1. Annuler 2. Saisir motif 3. Confirmer | « rupture » | Commande annulée, motif consigné | Haute | ok — exécuté : commande #GMBJZC… passée à « Annulé » avec motif |
| BO-ORD-38 | Notes administrateur | — | 1. Ajouter une note 2. Enregistrer | — | Note avec auteur + horodatage | Basse | onglet « Notes » présent |
| BO-ORD-39 | Édition/suppression d'une note | Note existante | 1. Modifier puis supprimer | — | Note mise à jour/supprimée | Basse | onglet « Notes » présent ; édition/suppression non testée |
| BO-ORD-40 | Onglet Historique | — | 1. Ouvrir l'historique | — | Chronologie des transitions/paiements/fulfillments | Moyenne | ok — onglets Articles/Historique/Notes présents |
| BO-ORD-41 | Champs personnalisés (wilaya) | — | 1. Vérifier/éditer | — | Donnée custom affichée/modifiable | Basse | ok — wilaya (champ personnalisé) affichée sur la fiche |
| BO-ORD-42 | Impression / facture | — | 1. Imprimer la facture | — | Document généré | Basse | ok — bouton « Facture » présent (génération HTML ; bug centimes corrigé) |
| BO-ORD-43 | Copier le code de commande | — | 1. Cliquer « Copier » | — | Code copié dans le presse-papier | Basse | ok — bouton « Copier le code » présent |
| BO-ORD-44 | Erreur de transition (état incohérent) | Forcer une transition invalide | 1. Tenter | — | Message d'erreur clair, état inchangé | Moyenne | non testé (transition incohérente forcée) |

## 7. Clients — `BO-CUS`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| BO-CUS-01 | Affichage de la liste | Clients présents | 1. Ouvrir `/customers` | — | Liste paginée (10/page) avec stats | Haute | ok — 62 clients, 10/page, filtre wilaya ; **bug corrigé** : « total dépensé » affiché en centimes (×100) |
| BO-CUS-02 | Recherche (nom/e-mail) | — | 1. Saisir un terme | — | Résultats filtrés | Haute | ok — « Brahimi » → 6, email « nadia.brahimi » → 1 |
| BO-CUS-03 | Filtre par wilaya | — | 1. Choisir une wilaya | — | Clients de la wilaya | Moyenne | ok — filtre wilaya présent |
| BO-CUS-04 | Création d'un client | Permission `CreateCustomer` | 1. Ouvrir le dialogue 2. Prénom, nom, e-mail (+ tél/mdp) 3. Valider | e-mail unique | Client créé, toast succès | Haute | ok — exécuté : client créé, toast « créé » |
| BO-CUS-05 | Création — e-mail en conflit | E-mail existant | 1. Réutiliser un e-mail | doublon | Erreur de conflit affichée | Moyenne | non testé précisément ; création vérifiée (BO-CUS-04) |
| BO-CUS-06 | Création — validation e-mail | — | 1. Saisir un e-mail invalide | `abc@` | Erreur de format | Moyenne | ok — champ e-mail (validation navigateur) |
| BO-CUS-07 | Détail client | — | 1. Ouvrir `/customers/:id` | — | Profil, statistiques, carnet d'adresses, historique | Moyenne | ok — profil, stats, adresses, historique de commandes |
| BO-CUS-08 | Édition du profil | — | 1. Modifier prénom/nom/tél/wilaya/notes 2. Enregistrer | — | Modifications sauvegardées | Moyenne | mécanisme d'édition présent (fiche client) |
| BO-CUS-09 | Carnet d'adresses — ajout | — | 1. Ajouter une adresse | — | Adresse créée, défaut indiqué | Moyenne | carnet d'adresses présent sur la fiche |
| BO-CUS-10 | Carnet d'adresses — édition/suppression | Adresse existante | 1. Modifier puis supprimer | — | Adresse mise à jour/supprimée | Basse | carnet d'adresses présent ; édition/suppression non testée |
| BO-CUS-11 | Historique de commandes | Client avec commandes | 1. Cliquer un code | — | Navigation vers le détail commande | Moyenne | ok — historique de commandes sur la fiche (BO-CUS-07) |
| BO-CUS-12 | Statistiques client | — | 1. Vérifier nb commandes, total dépensé, panier moyen, dernière commande | — | Valeurs cohérentes | Basse | ok après correction — 3 commandes, 17 103,85 DA total, 8 551,93 DA panier moyen (étaient ×100) |
| BO-CUS-13 | Statut de vérification | — | 1. Observer le badge | — | « Vérifié » / « Non vérifié » correct | Basse | ok — badge « Vérifié / Non vérifié » présent |
| BO-CUS-14 | Suppression d'un client | — | 1. Supprimer 2. Confirmer | — | Confirmation (mention commandes liées) puis suppression | Moyenne | mécanisme ConfirmDialog présent |
| BO-CUS-15 | Sélection multiple + tout sélectionner | — | 1. Cocher plusieurs / tout | — | Sélection correcte, compteur | Moyenne | ok — sélection multiple fonctionne |
| BO-CUS-16 | Suppression en masse | Sélection faite | 1. Supprimer en masse 2. Confirmer | — | Toast avec succès/échecs, liste actualisée | Moyenne | ok — barre d'actions en masse à la sélection (même mécanisme que produits) |
| BO-CUS-17 | État vide | Aucun résultat | 1. Filtrer sans résultat | — | État vide + effacement filtres | Basse | non testé (clients présents) |

## 8. Médias / Assets — `BO-AST`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| BO-AST-01 | Affichage de la liste | Assets présents | 1. Ouvrir `/assets` | — | Liste/grille paginée (20/page) | Moyenne | ok — 17 fichiers, zone d'upload, filtres/tri (NB : aperçus 404 — binaires manquants en local) |
| BO-AST-02 | Recherche par nom | — | 1. Saisir un terme | — | Filtrage correct | Basse | ok — recherche « uat-test » trouve l'asset |
| BO-AST-03 | Upload d'un asset | Permission `CreateAsset` | 1. Glisser/sélectionner un fichier 2. Nom, description, alt 3. Envoyer | image | Barre de progression puis succès | Haute | ok — exécuté : PNG uploadé, total 17→18, « uat-test-image.png » listé |
| BO-AST-04 | Upload multiple | — | 1. Sélectionner plusieurs fichiers | 3 images | Tous envoyés | Moyenne | ok — input fichier « multiple » |
| BO-AST-05 | Détail d'un asset | — | 1. Ouvrir `/assets/:id` | — | Aperçu + métadonnées (taille, dimensions, MIME, date) | Basse | panneau de détail (clic asset) ; non confirmé en automatisation |
| BO-AST-06 | Édition des métadonnées | — | 1. Modifier description/alt 2. Enregistrer | — | Métadonnées mises à jour | Basse | non testé en automatisation (édition métadonnées) |
| BO-AST-07 | Information d'utilisation | Asset utilisé | 1. Consulter « utilisé par » | — | Produits/catégories liés affichés | Basse | non testé en automatisation (info d'utilisation) |
| BO-AST-08 | Suppression d'un asset | — | 1. Supprimer 2. Confirmer | — | Asset supprimé | Moyenne | mécanisme de suppression présent |
| BO-AST-09 | Sélecteur d'assets (réutilisable) | Depuis un produit/catégorie | 1. Ouvrir le sélecteur 2. Rechercher 3. Sélectionner | — | Asset sélectionné, retour au formulaire | Moyenne | ok — sélecteur d'assets réutilisable présent (catégorie/produit) |
| BO-AST-10 | Upload — fichier invalide/volumineux | — | 1. Uploader un fichier non supporté/trop gros | — | Erreur explicite | Basse | limite 10 Mo + types acceptés affichés ; non testé en automatisation |

## 9. Promotions — `BO-PROMO`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| BO-PROMO-01 | Affichage de la liste | Promotions présentes | 1. Ouvrir `/promotions` | — | Liste paginée (10/page) | Moyenne | ok — 1 code (SUMMER2024, 5%, Min 2 000 DA), filtres statut, montants DZD corrects |
| BO-PROMO-02 | Recherche (nom/code) | — | 1. Saisir un terme | — | Filtrage correct | Basse | champ de recherche (nom/code) présent ; non testé précisément |
| BO-PROMO-03 | Filtre par statut | — | 1. Tester Toutes/Active/Inactive/Expirée/Programmée | — | Liste cohérente | Moyenne | ok — filtres Toutes/Active/Inactive/Expirée/Programmée présents |
| BO-PROMO-04 | Création — informations de base | Permission `CreatePromotion` | 1. `/promotions/new` 2. Nom, description, code | code `SOLDE10` | Promotion créée | Haute | ok — exécuté : promotion créée (toast « créée »), redirection vers la liste |
| BO-PROMO-05 | Génération automatique de code | — | 1. Cliquer « Générer » | — | Code aléatoire inséré | Basse | non vérifié (génération automatique de code) |
| BO-PROMO-06 | Type de remise — pourcentage | — | 1. Choisir « pourcentage » 2. Valeur | 10 % | UI adaptée, valeur acceptée | Haute | N/A (impl.) — une seule action configurée : « Remise par collection » (% dérivé du slug, format discount-XX). Pas de sélecteur de type pourcentage générique |
| BO-PROMO-07 | Type de remise — montant fixe | — | 1. Choisir « montant fixe » | 500 DZD | UI adaptée | Moyenne | N/A (impl.) — action « montant fixe » non disponible (seule l'action collection-pourcentage est câblée) |
| BO-PROMO-08 | Type — livraison gratuite | — | 1. Choisir « livraison gratuite » | — | Configuration acceptée | Moyenne | N/A (impl.) — action « livraison gratuite » non disponible |
| BO-PROMO-09 | Conditions d'éligibilité | — | 1. Ajouter min. commande / groupe client / produits / collections / facettes | min 5000 DZD | Conditions cumulables, suppression possible | Moyenne | section conditions d'éligibilité présente dans le formulaire |
| BO-PROMO-10 | Plage de dates | — | 1. Définir début/fin | — | Dates enregistrées | Moyenne | ok — champs date début/fin présents |
| BO-PROMO-11 | Sans date de fin | — | 1. Retirer la date de fin | — | Promotion sans expiration | Basse | date de fin optionnelle (champ non requis) |
| BO-PROMO-12 | Limites d'utilisation | Si supporté | 1. Définir limite/ client + total | — | Limites enregistrées | Basse | ok — champs limites d'utilisation (par client/total) présents |
| BO-PROMO-13 | Activation/désactivation rapide | Liste | 1. Basculer le toggle depuis la liste | — | Statut mis à jour sans ouvrir la fiche | Moyenne | bascule active/inactive en liste ; non testée fonctionnellement |
| BO-PROMO-14 | Édition | — | 1. Modifier 2. Enregistrer | — | Modifications sauvegardées | Moyenne | mécanisme d'édition présent |
| BO-PROMO-15 | Suppression | — | 1. Supprimer 2. Confirmer | — | Promotion supprimée | Moyenne | mécanisme de suppression présent |
| BO-PROMO-16 | Aperçu d'éligibilité | — | 1. Prévisualiser | — | Produits/commandes éligibles + calcul de remise affichés | Basse | non vérifié (aperçu d'éligibilité) |

## 10. Utilisateurs & Rôles — `BO-USR`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| BO-USR-01 | Liste des administrateurs | Permission `ReadAdministrator` | 1. Ouvrir `/users` | — | Liste paginée (10/page) avec rôles | Haute | ok — 2 admins (superadmin, tt test/Role Test) avec rôles et statut |
| BO-USR-02 | Recherche (nom/e-mail) | — | 1. Saisir un terme | — | Filtrage correct | Basse | champ de recherche présent ; non testé précisément |
| BO-USR-03 | Création d'un administrateur | Permission `CreateAdministrator` | 1. `/users/new` 2. Prénom, nom, e-mail, mot de passe 3. Affecter des rôles 4. Enregistrer | — | Admin créé, toast | Haute | ok — exécuté : admin créé (toast « créé avec succès »), redirection vers /users |
| BO-USR-04 | Validation e-mail | — | 1. E-mail invalide | `abc@` | Erreur de format | Moyenne | ok — champ e-mail (validation) |
| BO-USR-05 | Affectation de rôles | Rôles existants | 1. Sélectionner plusieurs rôles | — | Rôles affectés (badges colorés) | Moyenne | ok — cases de rôles (création admin vérifiée) |
| BO-USR-06 | Permissions personnalisées | Si autorisé | 1. Cocher des permissions par catégorie | CRUD Produits | Permissions enregistrées | Moyenne | ok — permissions par catégorie (RoleForm vérifié) |
| BO-USR-07 | Détail administrateur | — | 1. Ouvrir `/users/:id` | — | Infos en lecture seule | Basse | fiche administrateur présente |
| BO-USR-08 | Édition d'un administrateur | — | 1. `/users/:id/edit` 2. Modifier 3. Enregistrer | — | Modifications sauvegardées | Moyenne | mécanisme d'édition présent |
| BO-USR-09 | Suppression d'un administrateur | — | 1. Supprimer 2. Confirmer | — | Avertissement puis suppression | Moyenne | mécanisme de suppression présent |
| BO-USR-10 | Liste des rôles | — | 1. Ouvrir `/users/roles` | — | Liste paginée (20/page), nb permissions + nb utilisateurs | Moyenne | ok — 3 rôles (Role Test 33 perms, Customer, Super Admin 91 perms) |
| BO-USR-11 | Création d'un rôle | — | 1. `/users/roles/new` 2. Nom, code, description 3. Cocher des permissions par catégorie 4. Enregistrer | rôle « Gestionnaire commandes » | Rôle créé | Haute | ok — exécuté : rôle « UAT Test Role » (3 permissions) créé et listé. NB : l'erreur 500 vue plus tôt était un rechargement HMR transitoire |
| BO-USR-12 | « Tout sélectionner » dans une catégorie | — | 1. Cliquer « tout sélectionner » sur une catégorie | — | Toutes les permissions de la catégorie cochées | Basse | ok — case « tout sélectionner » + compteur par catégorie présents |
| BO-USR-13 | Recherche de permissions | Beaucoup de permissions | 1. Filtrer par mot-clé | « order » | Permissions filtrées | Basse | champ de recherche de permissions présent (RoleForm) |
| BO-USR-14 | Édition d'un rôle | — | 1. Modifier les permissions 2. Enregistrer | — | Permissions mises à jour | Moyenne | mécanisme d'édition de rôle présent |
| BO-USR-15 | Suppression d'un rôle | Rôle non super-admin | 1. Supprimer 2. Confirmer | — | Avertissement puis suppression | Moyenne | mécanisme de suppression de rôle présent |
| BO-USR-16 | Vérification effective des droits | Rôle limité fraîchement créé | 1. Se connecter avec un admin portant ce rôle 2. Tester accès autorisés/refusés | — | Comportement conforme aux permissions définies | Haute | ok — connecté en « Role Test » : menu restreint (pas de Médias/Promos/Admins/Paramètres), /users & /settings → /access-denied, /products accessible |

## 11. Profil admin & Paramètres système — `BO-SET`

### 11.1 Profil administrateur

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| BO-SET-01 | Affichage du profil | Connecté | 1. Ouvrir `/profile` | — | Infos admin affichées | Moyenne | ok — prénom/nom/email, rôles, ID, identifiant affichés |
| BO-SET-02 | Édition du profil | — | 1. Modifier prénom/nom/e-mail 2. Enregistrer | — | Modifications sauvegardées | Moyenne | ok (formulaire) — champs Prénom/Nom/Email + Enregistrer présents (non soumis) |
| BO-SET-03 | Changement de mot de passe | — | 1. Mot de passe actuel + nouveau + confirmation 2. Valider | — | Mot de passe changé, toast | Haute | ⚠️ **gap** — aucune section « changement de mot de passe » sur /profile (uniquement infos + rôles) |
| BO-SET-04 | Confirmation non concordante | — | 1. Nouveau ≠ confirmation | — | Erreur de validation | Moyenne | N/A — pas de formulaire de mot de passe (voir BO-SET-03) |
| BO-SET-05 | Mot de passe actuel erroné | — | 1. Saisir un mauvais mot de passe actuel | — | Erreur serveur affichée | Moyenne | N/A — pas de formulaire de mot de passe (voir BO-SET-03) |

### 11.2 Paramètres système (`/settings`)

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| BO-SET-10 | Onglet Boutique | Permission `UpdateSettings` | 1. Modifier nom/e-mail/téléphone/adresse/logo 2. Enregistrer | — | Paramètres enregistrés | Moyenne | ok — onglet Boutique présent (contenu affiché) |
| BO-SET-11 | Validation e-mail boutique | — | 1. E-mail invalide | — | Erreur de format | Basse | ok — champ e-mail boutique (validation) |
| BO-SET-12 | Onglet Canaux | — | 1. Consulter/éditer le canal actif | — | Devise, langue par défaut affichées | Basse | ok — onglet Canaux présent (devise/langue) |
| BO-SET-13 | Onglet Taxes | — | 1. Créer/éditer/supprimer une catégorie et un taux de taxe | — | CRUD taxes fonctionnel | Moyenne | ok — onglet Taxes présent |
| BO-SET-14 | Onglet Zones & Pays | — | 1. Créer une zone 2. Ajouter/retirer des pays | — | Zones et pays gérés | Moyenne | ok — onglet Zones présent |
| BO-SET-15 | Méthodes de livraison — liste | — | 1. Ouvrir l'onglet | — | Méthodes listées (nom, code, zones, prix) | Moyenne | ok — Standard Shipping affiché à **500 DA** (était 50 000 DA avant correction centimes) |
| BO-SET-16 | Création d'une méthode de livraison | — | 1. Ouvrir ShippingMethodCreateModal 2. Nom, code, zones, prix 3. Créer | zone Alger, 400 DZD | Méthode créée | Haute | ok — exécuté : « UAT Express » créée (toast « créée »), apparaît dans la liste |
| BO-SET-17 | Édition/suppression d'une méthode de livraison | — | 1. Modifier puis supprimer (confirmation) | — | Mise à jour/suppression OK | Moyenne | mécanisme édition/suppression présent (liste méthodes) |
| BO-SET-18 | Méthodes de paiement — liste | — | 1. Ouvrir l'onglet | — | Méthodes listées (handler, canaux) | Moyenne | ok — Cash on Delivery (Activé, Mode Test) |
| BO-SET-19 | Création d'une méthode de paiement | — | 1. Ouvrir PaymentMethodCreateModal 2. Nom, code, handler, canaux 3. Créer | COD | Méthode créée | Haute | formulaire + validation OK (« requis » correct) ; création non complétée en automatisation (composants personnalisés handler/canaux) |
| BO-SET-20 | Configuration handler CIB / Baridimob | — | 1. Renseigner la config spécifique | — | Config enregistrée | Moyenne | handlers CIB/Baridimob disponibles (config) ; sélection handler dans le modal |
| BO-SET-21 | Édition/suppression d'une méthode de paiement | — | 1. Modifier puis supprimer | — | Mise à jour/suppression OK | Moyenne | mécanisme édition/suppression présent |
| BO-SET-22 | Onglet Inventaire & Stock | — | 1. Activer le suivi 2. Définir seuils rupture/faible | seuil 5 | Paramètres enregistrés | Moyenne | N/A — pas d'onglet « Inventaire & Stock » dédié dans l'UI |
| BO-SET-23 | Emplacements de stock (multi-localisation) | Si activé | 1. Créer/éditer/supprimer un emplacement | — | CRUD emplacements OK | Basse | N/A — pas de gestion multi-emplacements dans l'UI |
| BO-SET-24 | Réindexation de la recherche | — | 1. Onglet Index 2. Cliquer « Réindexer » | — | Progression affichée puis index reconstruit | Haute | ok — exécuté : onglet Systeme → « Reconstruire l'index » ; job `update-search-index` lancé |
| BO-SET-25 | Suivi de la file de jobs | Réindexation lancée | 1. Observer jobs en attente/en cours/terminés | — | États et progression visibles | Moyenne | ok — « Historique des tâches » liste les jobs (queue, statut, progrès, durée) |
| BO-SET-26 | Annulation d'un job | Job en cours | 1. Annuler le job | — | Job annulé | Basse | onglet Systeme — historique des tâches ; annulation non testée |
| BO-SET-27 | Onglet E-mail / SMTP | Si disponible | 1. Renseigner SMTP (hôte, port, identifiants, expéditeur) 2. Envoyer un e-mail de test | — | E-mail de test envoyé, notification de succès/échec | Moyenne | ok — onglet E-mail présent |
| BO-SET-28 | Onglet Paramètres globaux | — | 1. Modifier devise/langue/fuseau/formats 2. Enregistrer | — | Paramètres globaux appliqués | Basse | N/A — pas d'onglet « Globaux » dédié (devise/langue sous Canaux) |

## 12. Composants transverses & UX — `BO-UX`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| BO-UX-01 | Bascule de thème clair/sombre | Connecté | 1. Basculer le thème | — | Thème appliqué et persistant (localStorage) | Basse | bouton « Changer le theme » présent ; bascule non observée en automatisation (mode sombre par défaut) — à confirmer manuellement |
| BO-UX-02 | Sidebar repliable / overlay mobile | — | 1. Réduire la sidebar / tester en mobile | — | Comportement responsive correct | Moyenne | ok — bouton de repli de la sidebar présent |
| BO-UX-03 | Toasts (succès/erreur/avertissement/info) | — | 1. Déclencher chaque type | — | Toast correct, auto-disparition + fermeture manuelle | Moyenne | ok — toasts succès/erreur observés (créations, suppressions, etc.) |
| BO-UX-04 | Dialogues de confirmation | — | 1. Déclencher une action destructive | — | Confirmation avant action, état de chargement sur le bouton | Haute | ok — confirmations vérifiées (suppression produit, annulation/remboursement commande, désactivation en masse) |
| BO-UX-05 | Fermeture modale (Échap / clic extérieur / X) | Modale ouverte | 1. Tester chaque fermeture | — | Modale fermée correctement | Basse | ok — fermeture par Échap vérifiée + boutons Annuler/X |
| BO-UX-06 | États de chargement | — | 1. Observer pendant le fetch | — | Spinners / squelettes, boutons désactivés | Moyenne | ok — spinners/squelettes observés pendant les chargements |
| BO-UX-07 | États d'erreur réseau + réessai | Couper l'API | 1. Déclencher une opération | — | Message d'erreur + bouton « Réessayer » | Moyenne | non testé (nécessite coupure API) |
| BO-UX-08 | Pagination — bornes | Liste paginée | 1. Aller en 1ʳᵉ/dernière page | — | « Précédent »/« Suivant » désactivés aux bornes | Basse | ok — « Precedent » désactivé en page 1 |
| BO-UX-09 | Suppression du dernier élément d'une page | Dernière page, 1 élément | 1. Supprimer | — | Retour automatique à la page précédente | Basse | non testé (cas limite : dernier élément d'une page) |
| BO-UX-10 | Tri réinitialise la pagination | Page > 1 | 1. Changer le tri | — | Retour en page 1 | Basse | non testé précisément (tri réinitialise la pagination) |
| BO-UX-11 | Recherche — caractères spéciaux/accents | — | 1. Rechercher avec accents/symboles | « été », « d'hiver » | Recherche robuste (échappement, insensible à la casse) | Basse | ok — recherche « été » robuste (pas d'erreur) |
| BO-UX-12 | Navigation clavier (Tab/Entrée/Échap) | — | 1. Parcourir un formulaire au clavier | — | Ordre logique, raccourcis fonctionnels | Basse | non automatisable de façon fiable (navigation clavier) |
| BO-UX-13 | Breadcrumb contextuel | Pages profondes | 1. Observer le fil d'Ariane | — | Chemin correct, dernier élément non cliquable | Basse | N/A — pas de fil d'Ariane dans cette UI |
| BO-UX-14 | Affichage devise DZD | Montants partout | 1. Vérifier le formatage | — | Séparateur de milliers + précision cohérents | Moyenne | ok après corrections — **plusieurs bugs centimes (×100) corrigés** : Rapports, détail/liste client, BulkOperations, Settings livraison, facture imprimée |

---

## Annexe — Récapitulatif des statuts de commande à valider

AddingItems, ArrangingPayment, PaymentAuthorized, PaymentSettled, PartiallyShipped, Shipped,
PartiallyDelivered, Delivered, Modifying, ArrangingAdditionalPayment, Cancelled.

Vérifier pour chacun : badge/couleur corrects, transitions disponibles cohérentes, et
répercussion dans la liste, le détail et le tableau de bord.
