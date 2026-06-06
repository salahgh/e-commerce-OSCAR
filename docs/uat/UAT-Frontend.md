# Recette utilisateur (UAT) — Frontend OSCAR Fashion

Boutique web client (Next.js 16 + React 19 + Apollo + next-intl + Tailwind) — `http://localhost:3000`.
API Shop : `http://localhost:8085/shop-api`.

> Conventions, légendes (Priorité / Statut) et environnement : voir [`README.md`](./README.md).
> Statut par défaut : ☐ À tester.

## Périmètre

i18n / RTL & navigation globale, authentification & compte, accueil & catalogue, page produit
& variantes, recherche à facettes, panier & coupons, tunnel de commande (checkout), espace
compte (profil, commandes, wishlist), pages statiques, en-tête/pied, devise & prix, états
vides/erreur/chargement, responsive et accessibilité.

## Prérequis spécifiques

- Catalogue peuplé : produits avec variantes (taille + couleur), produit en rupture, produit
  en promotion, collections/catégories avec sous-catégories.
- Un compte client **vérifié** et un compte **non vérifié**.
- Au moins un **code promo valide** et un **invalide/expiré**.
- Adresses couvrant des **zones de livraison différentes** (wilayas zones 1–4).
- Méthodes de paiement actives (CIB, Baridimob, COD) configurées côté back-office.

---

## 1. Internationalisation (i18n), RTL & navigation globale — `FE-I18N`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| FE-I18N-01 | Locale par défaut (français, sans préfixe) | — | 1. Ouvrir `/` | — | Contenu en français, URL sans préfixe de langue | Haute | ☐ |
| FE-I18N-02 | Bascule de langue conserve la page | Sur une fiche produit | 1. Ouvrir le sélecteur de langue 2. Choisir EN puis AR | — | Même page, langue changée (`/products/x` → `/en/...` → `/ar/...`) | Haute | ☐ |
| FE-I18N-03 | Rendu RTL en arabe | — | 1. Passer en arabe | — | `dir="rtl"` sur `html`, mise en page miroir, police arabe | Haute | ☐ |
| FE-I18N-04 | Inversion des icônes en RTL | En arabe | 1. Observer flèches/chevrons | — | Direction inversée (LTR↔RTL) | Basse | ☐ |
| FE-I18N-05 | Traduction complète de l'UI | Chaque langue | 1. Parcourir boutons/labels/placeholders/erreurs/toasts | FR/EN/AR | Aucun texte non traduit ni clé brute affichée | Moyenne | ☐ |
| FE-I18N-06 | Formatage des dates par locale | Pages avec dates | 1. Comparer le format par langue | `fr-DZ` | Dates formatées selon la locale | Basse | ☐ |
| FE-I18N-07 | Métadonnées & hreflang | — | 1. Inspecter `<head>` par locale | — | title/description/og:locale + hreflang/canonical corrects | Basse | ☐ |
| FE-I18N-08 | Ouverture/fermeture du sélecteur de langue | — | 1. Ouvrir puis cliquer en dehors | — | Menu se ferme au clic extérieur | Basse | ☐ |
| FE-I18N-09 | Locale inexistante → 404 | — | 1. Ouvrir `/xx/` | — | Page 404 (`notFound()`) | Basse | ☐ |

## 2. Authentification & compte — `FE-AUTH`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| FE-AUTH-01 | Inscription valide (sans vérification) | — | 1. `/register` 2. Prénom, nom, e-mail, mdp 3. Valider | mdp ≥ 8 | Compte créé, redirection vers l'accueil | Haute | ☐ |
| FE-AUTH-02 | Inscription avec vérification requise | Backend exige vérification | 1. S'inscrire | — | Redirection `/verification-pending?email=…` + toast info | Haute | ☐ |
| FE-AUTH-03 | Inscription — champs obligatoires | — | 1. Laisser des champs vides 2. Valider | — | Validation : champs requis | Moyenne | ☐ |
| FE-AUTH-04 | Inscription — mot de passe trop court | — | 1. Saisir un mdp < 8 | `1234` | Erreur / indice de longueur | Moyenne | ☐ |
| FE-AUTH-05 | Inscription — e-mail déjà utilisé | E-mail existant | 1. S'inscrire avec un e-mail connu | doublon | Message d'erreur explicite | Moyenne | ☐ |
| FE-AUTH-06 | Connexion valide | Compte vérifié | 1. `/login` 2. E-mail + mdp 3. Valider | — | Connecté, toast succès, redirection accueil | Haute | ☐ |
| FE-AUTH-07 | Connexion — identifiants invalides | — | 1. Mauvais mdp | — | Erreur « identifiants invalides » | Haute | ☐ |
| FE-AUTH-08 | Connexion — e-mail non vérifié | Compte non vérifié | 1. Se connecter | — | Erreur « e-mail non vérifié » (NOT_VERIFIED) | Haute | ☐ |
| FE-AUTH-09 | « Se souvenir de moi » | — | 1. Cocher 2. Se connecter 3. Rouvrir le navigateur | — | Session conservée | Moyenne | ☐ |
| FE-AUTH-10 | Mot de passe oublié — demande | — | 1. `/forgot-password` 2. Saisir e-mail 3. Valider | — | Carte de succès « vérifiez vos e-mails » | Moyenne | ☐ |
| FE-AUTH-11 | Réinitialisation — token valide | Lien de reset reçu | 1. Ouvrir `/reset-password?token=…` 2. Nouveau mdp + confirmation 3. Valider | — | Succès puis redirection vers `/login` (~1,5 s) | Haute | ☐ |
| FE-AUTH-12 | Réinitialisation — token manquant/invalide | — | 1. Ouvrir sans token / token faux | — | Erreur + lien retour connexion | Moyenne | ☐ |
| FE-AUTH-13 | Réinitialisation — mdp non concordants | — | 1. Saisir 2 mdp différents | — | Erreur de concordance | Moyenne | ☐ |
| FE-AUTH-14 | Réinitialisation — mdp trop court | — | 1. Saisir < 8 caractères | — | Erreur de longueur | Moyenne | ☐ |
| FE-AUTH-15 | Vérification e-mail automatique | Lien de vérification | 1. Ouvrir `/verify?token=…` | — | Spinner puis succès, redirection accueil (~1,5 s) | Haute | ☐ |
| FE-AUTH-16 | Vérification — token absent/invalide | — | 1. Ouvrir sans token | — | Erreur + lien connexion | Moyenne | ☐ |
| FE-AUTH-17 | Renvoyer la vérification | `/verification-pending` | 1. Cliquer « Renvoyer » | — | Bouton désactivé après envoi, alerte de succès | Moyenne | ☐ |
| FE-AUTH-18 | Déconnexion | Connecté | 1. Menu compte 2. « Déconnexion » | — | État client vidé, cache Apollo purgé, redirection accueil | Haute | ☐ |
| FE-AUTH-19 | Persistance de session (JWT) | Connecté | 1. Rafraîchir une page | — | Reste connecté (active customer rechargé) | Haute | ☐ |
| FE-AUTH-20 | Garde de route — espace compte non connecté | Déconnecté | 1. Ouvrir `/user/profile` | — | Spinner d'auth puis redirection accueil | Haute | ☐ |

## 3. Accueil & catalogue — `FE-CAT`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| FE-CAT-01 | Page d'accueil | Catalogue peuplé | 1. Ouvrir `/` | — | Hero, produits vedette (8), collections (8), bandeau marque | Haute | ☐ |
| FE-CAT-02 | CTA du hero | — | 1. Cliquer « Boutique » / « Catégories » | — | Navigation correcte | Basse | ☐ |
| FE-CAT-03 | Survol collection | — | 1. Survoler une collection | — | Effet de zoom + overlay avec nom | Basse | ☐ |
| FE-CAT-04 | Erreur de chargement des vedettes | Couper l'API | 1. Recharger l'accueil | — | Alerte d'erreur affichée | Moyenne | ☐ |
| FE-CAT-05 | Liste produits — affichage | — | 1. Ouvrir `/products` | — | Grille (12/page), fil d'Ariane, compteur d'articles | Haute | ☐ |
| FE-CAT-06 | Tri (Nom A-Z / Z-A) | — | 1. Changer le tri | — | Ordre mis à jour | Moyenne | ☐ |
| FE-CAT-07 | Pagination produits | > 12 produits | 1. Naviguer entre pages | — | Page mise à jour (URL `p`) | Moyenne | ☐ |
| FE-CAT-08 | Squelettes de chargement | — | 1. Observer pendant le fetch | — | Skeletons affichés | Basse | ☐ |
| FE-CAT-09 | Liste vide | Aucun produit | 1. Filtrer sans résultat | — | Message « aucun produit » | Moyenne | ☐ |
| FE-CAT-10 | Page catégories (racines) | — | 1. Ouvrir `/categories` | — | Grille de collections racines (12/page) | Moyenne | ☐ |
| FE-CAT-11 | Détail catégorie + sous-catégories | Catégorie avec enfants | 1. Ouvrir `/categories/[slug]` | — | Fil d'Ariane, sous-catégories, produits (12/page) | Haute | ☐ |
| FE-CAT-12 | Catégorie sans produit | — | 1. Ouvrir une catégorie vide | — | État vide | Basse | ☐ |
| FE-CAT-13 | Carte produit | — | 1. Cliquer une carte | — | Image, nom, prix (1ʳᵉ variante) ; clic → fiche produit | Moyenne | ☐ |

## 4. Page produit & sélection de variante — `FE-PDP`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| FE-PDP-01 | Affichage de la fiche produit | Produit existant | 1. Ouvrir `/products/[slug]` | — | Nom, prix, stock, galerie, options, onglets | Haute | ☐ |
| FE-PDP-02 | Galerie — miniatures | ≥ 2 images | 1. Cliquer une miniature | — | Image principale mise à jour | Moyenne | ☐ |
| FE-PDP-03 | Zoom plein écran | — | 1. Cliquer l'image principale | — | Modale de zoom ouverte | Basse | ☐ |
| FE-PDP-04 | Indicateur de stock | Variantes variées | 1. Observer le badge | En stock / Rupture / Faible | Statut correct | Moyenne | ☐ |
| FE-PDP-05 | Sélection de couleur | Produit avec couleurs | 1. Choisir une couleur | Rouge | Couleur sélectionnée (swatch actif) | Haute | ☐ |
| FE-PDP-06 | Sélection de taille | Produit avec tailles | 1. Choisir une taille | M | Taille sélectionnée | Haute | ☐ |
| FE-PDP-07 | Guide des tailles | — | 1. Ouvrir « Guide des tailles » | — | Modale/lien avec tableau de tailles | Basse | ☐ |
| FE-PDP-08 | Sélecteur de quantité (1–10) | — | 1. Incrémenter/décrémenter | — | Bornes respectées | Moyenne | ☐ |
| FE-PDP-09 | Ajout au panier — variante complète | Couleur + taille requises | 1. Choisir options 2. « Ajouter au panier » | — | Article ajouté, toast succès, compteur panier +1 | Haute | ☐ |
| FE-PDP-10 | Ajout sans option requise | Option non choisie | 1. Cliquer « Ajouter » sans choisir | — | Toast d'erreur (option requise), pas d'ajout | Haute | ☐ |
| FE-PDP-11 | Onglets Description/Détails/Livraison | — | 1. Parcourir les onglets | — | Contenu correct (description, facettes/SKU, livraison) | Basse | ☐ |
| FE-PDP-12 | Produits associés | Produit dans une collection | 1. Observer la section | — | ≤ 4 produits, hors produit courant, dédupliqués | Basse | ☐ |
| FE-PDP-13 | Produit introuvable | slug invalide | 1. Ouvrir un slug inexistant | — | Alerte d'erreur + lien retour | Moyenne | ☐ |
| FE-PDP-14 | Données structurées (JSON-LD) | — | 1. Inspecter la source | — | productSchema + breadcrumbSchema présents | Basse | ☐ |
| FE-PDP-15 | Partage | — | 1. Cliquer « Partager » | — | Action de partage déclenchée | Basse | ☐ |

## 5. Recherche & filtres à facettes — `FE-SRCH`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| FE-SRCH-01 | Recherche depuis l'en-tête | — | 1. Saisir un terme + Entrée | « robe » | Redirection `/search?q=robe`, résultats affichés | Haute | ☐ |
| FE-SRCH-02 | Recherche sans terme | — | 1. Ouvrir `/search` sans `q` | — | Message « saisir un terme » | Basse | ☐ |
| FE-SRCH-03 | Compteur de résultats | Résultats présents | 1. Observer « X résultats pour … » | — | Compteur correct | Basse | ☐ |
| FE-SRCH-04 | Filtres à facettes — cases à cocher | Facettes dispo | 1. Cocher une valeur | — | Liste filtrée, compteur par facette | Haute | ☐ |
| FE-SRCH-05 | Filtre couleur (swatch) | Facette couleur | 1. Choisir une couleur | — | Filtrage par couleur | Moyenne | ☐ |
| FE-SRCH-06 | Filtre taille (boutons) | Facette taille | 1. Choisir une taille | — | Filtrage par taille | Moyenne | ☐ |
| FE-SRCH-07 | Filtres multiples cumulés | — | 1. Combiner plusieurs facettes | couleur + taille | Résultats cohérents | Moyenne | ☐ |
| FE-SRCH-08 | Persistance des filtres en URL | Filtres actifs | 1. Copier l'URL 2. Recharger | `q`, `f`, `p` | État restauré depuis l'URL | Moyenne | ☐ |
| FE-SRCH-09 | Effacer les filtres | Filtres actifs | 1. Cliquer « Effacer » | — | Filtres réinitialisés, page = 1 | Basse | ☐ |
| FE-SRCH-10 | Aucun résultat | Terme improbable | 1. Rechercher « zzzzzz » | — | État vide « aucun résultat » | Moyenne | ☐ |
| FE-SRCH-11 | Pagination des résultats | > 12 résultats | 1. Naviguer | — | Pages correctes | Moyenne | ☐ |
| FE-SRCH-12 | Erreur de recherche | Couper l'API | 1. Rechercher | — | Alerte d'erreur | Basse | ☐ |

## 6. Panier & coupons — `FE-CART`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| FE-CART-01 | Mini-panier (drawer) | Article au panier | 1. Cliquer l'icône panier | — | Drawer latéral avec articles + badge compteur | Haute | ☐ |
| FE-CART-02 | Mini-panier vide | Panier vide | 1. Ouvrir le drawer | — | Message + « Continuer mes achats » | Moyenne | ☐ |
| FE-CART-03 | Modifier la quantité (mini-panier) | Article présent | 1. +/− sur un article | — | Quantité et prix ligne mis à jour | Moyenne | ☐ |
| FE-CART-04 | Retirer un article (mini-panier) | — | 1. Cliquer « Retirer » | — | Article supprimé | Moyenne | ☐ |
| FE-CART-05 | Page panier — affichage | Articles présents | 1. Ouvrir `/cart` | — | Liste articles + récap (sous-total, total) | Haute | ☐ |
| FE-CART-06 | Modifier la quantité (page, 1–99) | — | 1. Ajuster la quantité | — | Total recalculé, bornes respectées | Moyenne | ☐ |
| FE-CART-07 | Retirer un article (page) | — | 1. Cliquer « Retirer » | — | Article supprimé, total mis à jour | Moyenne | ☐ |
| FE-CART-08 | Appliquer un coupon valide | Code valide | 1. Saisir le code 2. « Appliquer » | `SOLDE10` | Code appliqué (badge), remise affichée | Haute | ☐ |
| FE-CART-09 | Appliquer un coupon invalide | Code invalide | 1. Saisir un code faux | `FAUX` | Message d'erreur, aucune remise | Moyenne | ☐ |
| FE-CART-10 | Retirer un coupon | Coupon appliqué | 1. Cliquer le « X » du badge | — | Coupon retiré, total recalculé | Moyenne | ☐ |
| FE-CART-11 | Plusieurs coupons | Codes multiples valides | 1. Appliquer 2 codes | — | Les deux apparaissent, remises cumulées | Basse | ☐ |
| FE-CART-12 | Panier vide | Aucun article | 1. Ouvrir `/cart` | — | État vide + « Parcourir les produits » | Moyenne | ☐ |
| FE-CART-13 | Persistance du panier | Article ajouté | 1. Rafraîchir / revenir plus tard | — | Panier conservé (active order serveur) | Haute | ☐ |
| FE-CART-14 | Toasts d'ajout/suppression | — | 1. Ajouter/supprimer | — | Notifications affichées | Basse | ☐ |

## 7. Tunnel de commande (checkout) — `FE-CHK`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| FE-CHK-01 | Accès au checkout | Panier non vide | 1. Cliquer « Commander » | — | Étape 1 (Adresse) affichée + récap latéral | Haute | ☐ |
| FE-CHK-02 | Pré-remplissage (connecté) | Client connecté | 1. Ouvrir le checkout | — | E-mail, nom, téléphone pré-remplis | Moyenne | ☐ |
| FE-CHK-03 | Adresse — champs obligatoires | — | 1. Laisser des champs requis vides 2. Continuer | — | Validation : champs requis signalés | Haute | ☐ |
| FE-CHK-04 | Sélection de wilaya | — | 1. Choisir une wilaya | 16 — Alger | Wilaya sélectionnée (format « XX — Nom ») | Haute | ☐ |
| FE-CHK-05 | E-mail invité requis | Invité (non connecté) | 1. Renseigner l'e-mail invité 2. Continuer | — | Client attaché à la commande (setCustomerForOrder) | Haute | ☐ |
| FE-CHK-06 | Facturation = livraison | — | 1. Cocher/décocher la case | — | Adresse de facturation gérée en conséquence | Moyenne | ☐ |
| FE-CHK-07 | Passage à l'étape Livraison | Adresse valide | 1. Continuer | — | Étape 2 affichée | Haute | ☐ |
| FE-CHK-08 | Méthodes de livraison éligibles | — | 1. Observer la liste | — | Méthodes listées avec prix + estimation par zone | Haute | ☐ |
| FE-CHK-09 | Estimation de délai par zone | Wilayas de zones différentes | 1. Tester zone 1 puis zone 4 | — | Délai/zone corrects | Moyenne | ☐ |
| FE-CHK-10 | Aucune méthode de livraison | Config sans méthode | 1. Atteindre l'étape | — | État vide « aucune méthode » | Moyenne | ☐ |
| FE-CHK-11 | Sélection d'une méthode → Paiement | — | 1. Choisir une méthode 2. Continuer | — | Étape 3 (Paiement) affichée | Haute | ☐ |
| FE-CHK-12 | Méthodes de paiement éligibles | — | 1. Observer la liste | CIB / Baridimob / COD | Méthodes éligibles sélectionnables | Haute | ☐ |
| FE-CHK-13 | Méthode non éligible désactivée | Méthode inéligible | 1. Observer | — | Badge « inéligible » + message, sélection bloquée | Moyenne | ☐ |
| FE-CHK-14 | Aucune méthode de paiement | Config sans méthode | 1. Atteindre l'étape | — | État vide | Moyenne | ☐ |
| FE-CHK-15 | Passer la commande (succès) | Étapes complètes | 1. « Passer la commande » | — | Transition ArrangingPayment + paiement → redirection `/checkout/confirmation/[code]` | Haute | ☐ |
| FE-CHK-16 | Échec de paiement | Forcer un échec | 1. Passer la commande | — | Message d'erreur, pas de redirection | Moyenne | ☐ |
| FE-CHK-17 | Récap latéral (sticky) | — | 1. Observer pendant les étapes | — | Articles, sous-total, livraison (ou « à définir »), total | Moyenne | ☐ |
| FE-CHK-18 | Session désynchronisée (AlreadyLoggedIn) | Session résiduelle | 1. Tenter de définir l'adresse | — | Alerte spéciale + bouton « Se déconnecter et réinitialiser » | Moyenne | ☐ |
| FE-CHK-19 | Récupération après session périmée | idem | 1. Cliquer « Se déconnecter et réinitialiser » | — | Session + panier purgés, redirection | Moyenne | ☐ |
| FE-CHK-20 | Résolution wilaya par nom/nameAr | Adresse créée côté web | 1. Vérifier la wilaya à l'étape adresse | nom ou nameAr | Wilaya résolue (insensible casse/espaces) | Moyenne | ☐ |
| FE-CHK-21 | Page de confirmation | Commande passée | 1. Atteindre `/checkout/confirmation/[code]` | — | Icône succès, code, récap, CTA « Voir la commande »/« Continuer » | Haute | ☐ |
| FE-CHK-22 | Confirmation — commande introuvable | code invalide | 1. Ouvrir avec un faux code | — | Alerte d'erreur | Basse | ☐ |
| FE-CHK-23 | Panier vidé après confirmation | Commande passée | 1. Revenir à l'accueil | — | Panier vide (active order consommé) | Moyenne | ☐ |

## 8. Espace compte — `FE-ACC`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| FE-ACC-01 | Profil — affichage | Connecté | 1. Ouvrir `/user/profile` | — | Infos personnelles + section mot de passe | Haute | ☐ |
| FE-ACC-02 | Profil — e-mail en lecture seule | — | 1. Tenter d'éditer l'e-mail | — | Champ désactivé | Basse | ☐ |
| FE-ACC-03 | Modifier prénom/nom/téléphone | — | 1. Modifier 2. « Enregistrer » | — | Alerte de succès, données mises à jour | Moyenne | ☐ |
| FE-ACC-04 | Changement de mot de passe | — | 1. Actuel + nouveau + confirmation 2. Valider | — | Succès | Haute | ☐ |
| FE-ACC-05 | Mots de passe non concordants | — | 1. Nouveau ≠ confirmation | — | Erreur de concordance | Moyenne | ☐ |
| FE-ACC-06 | Historique des commandes | Connecté, commandes existantes | 1. Ouvrir `/user/orders` | — | Tableau (Code, Date, Statut, Total, Action) trié par date | Haute | ☐ |
| FE-ACC-07 | Badges de statut | Commandes variées | 1. Observer les badges | — | Couleurs/intentions correctes par statut | Moyenne | ☐ |
| FE-ACC-08 | Historique vide | Aucune commande | 1. Ouvrir la page | — | État vide + « Continuer mes achats » | Moyenne | ☐ |
| FE-ACC-09 | Détail commande (connecté) | Commande existante | 1. Cliquer « Voir » → `/orders/[code]` | — | Lignes, totaux, adresse de livraison | Haute | ☐ |
| FE-ACC-10 | Détail commande (invité par code) | Code de commande connu | 1. Ouvrir `/orders/[code]` sans être connecté | — | Détail accessible via le code | Moyenne | ☐ |
| FE-ACC-11 | Commande introuvable | code invalide | 1. Ouvrir un faux code | — | Alerte d'erreur | Basse | ☐ |
| FE-ACC-12 | Wishlist — affichage | Connecté | 1. Ouvrir `/user/wishlist` | — | Grille des favoris | Moyenne | ☐ |
| FE-ACC-13 | Ajouter aux favoris | Sur une fiche produit | 1. Cliquer le cœur | — | Produit ajouté à la wishlist (persistant localStorage) | Moyenne | ☐ |
| FE-ACC-14 | Retirer des favoris | Wishlist non vide | 1. Cliquer « Retirer » | — | Produit retiré | Basse | ☐ |
| FE-ACC-15 | Wishlist vide | Aucun favori | 1. Ouvrir la page | — | État vide + « Continuer mes achats » | Basse | ☐ |
| FE-ACC-16 | Persistance wishlist inter-sessions | — | 1. Ajouter, fermer, rouvrir | — | Favoris conservés | Basse | ☐ |
| FE-ACC-17 | Navigation latérale compte | Connecté | 1. Parcourir Profil/Commandes/Favoris | — | Élément actif surligné, déconnexion possible | Basse | ☐ |

## 9. Pages statiques & contenu — `FE-STA`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| FE-STA-01 | À propos | — | 1. Ouvrir `/about` | — | Contenu (histoire, valeurs) affiché | Basse | ☐ |
| FE-STA-02 | Contact | — | 1. Ouvrir `/contact` | — | Cartes e-mail/téléphone/adresse/horaires | Basse | ☐ |
| FE-STA-03 | FAQ (accordéon) | — | 1. Ouvrir `/faq` 2. Déplier/replier | — | Accordéon fonctionnel | Basse | ☐ |
| FE-STA-04 | Livraison | — | 1. Ouvrir `/shipping` | — | Zones, coûts, suivi affichés | Basse | ☐ |
| FE-STA-05 | Retours | — | 1. Ouvrir `/returns` | — | Conditions + procédure | Basse | ☐ |
| FE-STA-06 | Guide des tailles | — | 1. Ouvrir `/size-guide` | — | Tableau XS→XXL (poitrine/taille/hanches) | Basse | ☐ |
| FE-STA-07 | Mentions légales — confidentialité | — | 1. Ouvrir `/legal/privacy` | — | Contenu affiché | Basse | ☐ |
| FE-STA-08 | Mentions légales — CGU | — | 1. Ouvrir `/legal/terms` | — | Contenu affiché | Basse | ☐ |
| FE-STA-09 | Carrières | — | 1. Ouvrir `/careers` | — | Page affichée | Basse | ☐ |

## 10. En-tête, pied & navigation — `FE-NAV`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| FE-NAV-01 | Navigation principale | — | 1. Cliquer Accueil/Boutique/Catégories/À propos/Contact | — | Navigation correcte | Moyenne | ☐ |
| FE-NAV-02 | Menu compte — non connecté | Déconnecté | 1. Observer le menu | — | « Se connecter » + lien login | Moyenne | ☐ |
| FE-NAV-03 | Menu compte — connecté | Connecté | 1. Ouvrir le menu | — | Avatar/initiales, nom, liens Profil/Commandes/Favoris, Déconnexion | Moyenne | ☐ |
| FE-NAV-04 | Fermeture du menu au clic extérieur | Menu ouvert | 1. Cliquer en dehors | — | Menu fermé | Basse | ☐ |
| FE-NAV-05 | Bouton panier + badge | Articles présents | 1. Observer le badge | — | Compteur correct, ouverture du mini-panier | Moyenne | ☐ |
| FE-NAV-06 | Bascule de thème (clair/sombre) | — | 1. Basculer | — | Thème appliqué (next-themes) | Basse | ☐ |
| FE-NAV-07 | En-tête sticky | Scroll | 1. Faire défiler | — | En-tête fixe avec flou d'arrière-plan | Basse | ☐ |
| FE-NAV-08 | Pied — liens utiles & société | — | 1. Cliquer les liens | — | Navigation correcte | Basse | ☐ |
| FE-NAV-09 | Pied — réseaux sociaux | — | 1. Cliquer une icône sociale | — | Ouverture dans un nouvel onglet (rel noopener) | Basse | ☐ |
| FE-NAV-10 | Lien « Aller au contenu » (skip link) | — | 1. Tabuler dès le chargement | — | Lien visible au focus, saute vers `#main` | Basse | ☐ |

## 11. Devise, états, responsive & accessibilité — `FE-SYS`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| FE-SYS-01 | Formatage des prix (DZD) | Prix partout | 1. Vérifier cartes/PDP/panier/checkout/commande | — | Format DZD cohérent (cents → affichage) | Haute | ☐ |
| FE-SYS-02 | Prix soldé (barré) | Produit en promo | 1. Observer le prix | — | Prix original barré + prix courant | Moyenne | ☐ |
| FE-SYS-03 | Calcul des totaux | Panier avec remise + livraison | 1. Vérifier sous-total + livraison − remise = total | — | Total correct | Haute | ☐ |
| FE-SYS-04 | États de chargement (skeletons) | — | 1. Observer pendant les fetch | — | Squelettes/spinners adaptés | Moyenne | ☐ |
| FE-SYS-05 | États d'erreur (alertes) | API en échec | 1. Déclencher une erreur | — | Alerte lisible avec message | Moyenne | ☐ |
| FE-SYS-06 | Page 404 | URL inconnue | 1. Ouvrir une route inexistante | — | Page 404 par défaut | Basse | ☐ |
| FE-SYS-07 | Responsive mobile | Largeur < 768px | 1. Parcourir accueil/PDP/panier/checkout | — | Mise en page mobile (1 col, nav hamburger, searchbar masquée) | Haute | ☐ |
| FE-SYS-08 | Responsive tablette | 768–1024px | 1. Parcourir | — | 2 colonnes, searchbar visible | Moyenne | ☐ |
| FE-SYS-09 | Responsive desktop | ≥ 1024px | 1. Parcourir | — | Multi-colonnes, navigation complète | Moyenne | ☐ |
| FE-SYS-10 | Accessibilité — aria/labels | — | 1. Inspecter boutons icônes / formulaires | — | aria-label, labels liés, rôles présents | Basse | ☐ |
| FE-SYS-11 | Navigation clavier | — | 1. Parcourir au clavier (Tab/Échap) | — | Ordre logique, fermeture des menus à Échap | Basse | ☐ |
| FE-SYS-12 | PWA — invite d'installation | Conditions PWA | 1. Observer l'invite | — | Prompt d'installation affiché, texte localisé | Basse | ☐ |

---

## Annexe — Parcours de bout en bout (smoke test)

1. **Invité** : Accueil → recherche → PDP → ajout panier → checkout (adresse + livraison +
   paiement) → confirmation → consultation de la commande par code.
2. **Client** : inscription → vérification → connexion → ajout favoris → panier → coupon →
   checkout → historique des commandes → modification du profil → déconnexion.
3. **Multilingue** : rejouer le parcours 1 en **arabe (RTL)** et en **anglais**.
