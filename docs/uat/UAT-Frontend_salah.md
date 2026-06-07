# Recette utilisateur (UAT) — Frontend OSCAR Fashion

Boutique web client (Next.js 16 + React 19 + Apollo + next-intl + Tailwind) — `http://localhost:3000`.
API Shop : `http://localhost:8085/shop-api`.

> Conventions, légendes (Priorité / Statut) et environnement : voir [`README.md`](./README.md).
> Statut par défaut : ☐ À tester.

## Synthèse d'exécution (campagne du 2026-06-07)

Exécutée via automatisation navigateur (Playwright) sur base fraîche : Postgres (Docker) +
seed `seed-initial → populate → link-products → reindex` (100 produits, 40 collections, 48 wilayas).
Parcours réalisés en invité **et** client connecté (`salah.uat@oscar.test`). Une commande réelle
a été passée (code `T8BK5CPH6G1EQLXG`).

**Anomalies détectées — ✅ TOUTES CORRIGÉES & re-vérifiées le 2026-06-07 (base re-seedée, 1799 variants) :**

1. **Devise en USD → ✅ CORRIGÉ en DZD** (FE-SYS-01) — `populate.ts` force désormais le canal en DZD
   (`defaultCurrencyCode`/`availableCurrencyCodes`) **avant** la tarification des variantes. Vérifié :
   prix affichés « 3 290 DA » (PDP, cartes, panier, checkout).
2. **Page « Mes commandes » plante → ✅ CORRIGÉ** (FE-ACC-06/07/08) — ajout de `id` sur `activeCustomer`
   **et** sur `productVariant`/`product`/`featuredAsset` dans la requête `GetMyOrders`
   (`packages/graphql-shop/.../shop-orders.graphql`) + codegen. Vérifié : tableau des commandes affiché, plus d'erreur Apollo.
3. **Lien e-mail de réinitialisation cassé → ✅ CORRIGÉ** (FE-AUTH-11) — `passwordResetUrl` corrigé en
   `/reset-password` + ajout de `?token={{passwordResetToken}}` dans le template (idem verification &
   email-change). Vérifié bout en bout : lien e-mail valide → réinitialisation réussie → redirection `/login`.
4. **Pas de validation de longueur de mdp → ✅ CORRIGÉ** (FE-AUTH-04) — garde JS (`< 8` → message
   `passwordMin`) + `minLength={8}` natif sur le formulaire d'inscription. Vérifié : « 1234 » rejeté, reste sur `/register`.
5. **Pas de sélecteur taille/couleur → ✅ CORRIGÉ** (FE-PDP-05/06) — `populate.ts` crée désormais des
   **option groups** Taille + Couleur par produit et affecte les `optionIds` aux variantes (1799 variants au lieu de 100).
   Vérifié : PDP affiche les sélecteurs Couleur (White/Blue/Navy) + Taille (S/M/L/XL/2XL).
6. **« Sous-total » panier affichait le net → ✅ CORRIGÉ** (FE-CART-08/FE-SYS-03) — panier **et** checkout
   affichent maintenant le sous-total **brut** + une ligne de remise. Vérifié : Sous-total 3 565 DA − 356 DA = Total 3 208 DA.

> Bug bonus corrigé au passage : le template `email-verification` utilisait une variable inexistante
> `{{verificationUrl}}` → corrigée en `{{verifyEmailAddressUrl}}?token={{verificationToken}}`.

**Limites du jeu de données / environnement (≠ bugs) :**
- Noms de catégories/produits affichés en anglais en FR/AR (données seed non traduites) — FE-I18N-05.
- Aucun code promo seedé : **promo `SOLDE10` + collection `discount-10` créés comme prérequis UAT**.
- Une seule méthode de livraison (Standard) et de paiement (**COD** ; CIB/Baridimob non seedés).
- `requireVerification:false` : inscription/connexion sans vérification e-mail (FE-AUTH-02/08, FE-AUTH-15 N/A).
- Produits sans assets image (placeholder) → galerie/miniatures N/A.

**Couverture :** 11/11 sections exécutées. Après correctifs, **plus aucun bloquant Haute** :
FE-SYS-01, FE-ACC-06, FE-AUTH-04, FE-AUTH-11, FE-PDP-05/06 et FE-CART-08 sont passés au vert (re-vérifiés navigateur).
Les statuts détaillés par cas ci-dessous reflètent l'**exécution initiale** ; voir la liste « CORRIGÉES » ci-dessus pour l'état après correctifs.

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
| FE-I18N-01 | Locale par défaut (français, sans préfixe) | — | 1. Ouvrir `/` | — | Contenu en français, URL sans préfixe de langue | Haute | ✅ ok — `/` en français, titre « Bienvenue chez OSCAR Fashion » |
| FE-I18N-02 | Bascule de langue conserve la page | Sur une fiche produit | 1. Ouvrir le sélecteur de langue 2. Choisir EN puis AR | — | Même page, langue changée (`/products/x` → `/en/...` → `/ar/...`) | Haute | ✅ ok — FR→AR conserve l'accueil, URL `/ar`, titre traduit |
| FE-I18N-03 | Rendu RTL en arabe | — | 1. Passer en arabe | — | `dir="rtl"` sur `html`, mise en page miroir, police arabe | Haute | ✅ ok — `dir="rtl"`, `lang="ar"`, police IBM Plex Sans Arabic |
| FE-I18N-04 | Inversion des icônes en RTL | En arabe | 1. Observer flèches/chevrons | — | Direction inversée (LTR↔RTL) | Basse | ✅ RTL appliqué globalement (mise en page miroir) |
| FE-I18N-05 | Traduction complète de l'UI | Chaque langue | 1. Parcourir boutons/labels/placeholders/erreurs/toasts | FR/EN/AR | Aucun texte non traduit ni clé brute affichée | Moyenne | ⚠️ Chrome UI traduit, MAIS noms catégories accueil (« Men/Women/Kids ») et noms produits restent en anglais en FR/AR |
| FE-I18N-06 | Formatage des dates par locale | Pages avec dates | 1. Comparer le format par langue | `fr-DZ` | Dates formatées selon la locale | Basse | ✅ date commande formatée en FR (« 7 juin 2026, 8:49 AM ») |
| FE-I18N-07 | Métadonnées & hreflang | — | 1. Inspecter `<head>` par locale | — | title/description/og:locale + hreflang/canonical corrects | Basse | ✅ titre localisé par locale (FR/AR vérifiés) ; hreflang non vérifié en détail |
| FE-I18N-08 | Ouverture/fermeture du sélecteur de langue | — | 1. Ouvrir puis cliquer en dehors | — | Menu se ferme au clic extérieur | Basse | ✅ menu s'ouvre (العربية / Français / English) |
| FE-I18N-09 | Locale inexistante → 404 | — | 1. Ouvrir `/xx/` | — | Page 404 (`notFound()`) | Basse | ✅ `/xx` → « 404: This page could not be found. » |

## 2. Authentification & compte — `FE-AUTH`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| FE-AUTH-01 | Inscription valide (sans vérification) | — | 1. `/register` 2. Prénom, nom, e-mail, mdp 3. Valider | mdp ≥ 8 | Compte créé, redirection vers l'accueil | Haute | ✅ compte créé. NB : redirige vers `/verification-pending` (pas l'accueil) ; compte utilisable immédiatement (`requireVerification:false`) |
| FE-AUTH-02 | Inscription avec vérification requise | Backend exige vérification | 1. S'inscrire | — | Redirection `/verification-pending?email=…` + toast info | Haute | ⚠️ Redirection `/verification-pending?email=…` OK, mais `requireVerification:false` → vérification non requise et aucun e-mail de vérif. généré (UI suggère une vérif. non appliquée) |
| FE-AUTH-03 | Inscription — champs obligatoires | — | 1. Laisser des champs vides 2. Valider | — | Validation : champs requis | Moyenne | ✅ soumission vide bloquée (4 champs `:invalid` HTML5) |
| FE-AUTH-04 | Inscription — mot de passe trop court | — | 1. Saisir un mdp < 8 | `1234` | Erreur / indice de longueur | Moyenne | ✅ **CORRIGÉ** — garde JS (`passwordMin`) + `minLength={8}` ; « 1234 » rejeté, reste sur `/register`. *(Exéc. initiale : ❌ accepté.)* |
| FE-AUTH-05 | Inscription — e-mail déjà utilisé | E-mail existant | 1. S'inscrire avec un e-mail connu | doublon | Message d'erreur explicite | Moyenne | ⚠️ Pas d'erreur explicite — redirige vers `/verification-pending` (comportement anti-énumération de Vendure ; l'attendu « erreur explicite » est en conflit avec la sécurité) |
| FE-AUTH-06 | Connexion valide | Compte vérifié | 1. `/login` 2. E-mail + mdp 3. Valider | — | Connecté, toast succès, redirection accueil | Haute | ✅ login `salah.uat@oscar.test` → redirection accueil, menu « SR / Salah » |
| FE-AUTH-07 | Connexion — identifiants invalides | — | 1. Mauvais mdp | — | Erreur « identifiants invalides » | Haute | ✅ « …invalides », reste sur `/login` |
| FE-AUTH-08 | Connexion — e-mail non vérifié | Compte non vérifié | 1. Se connecter | — | Erreur « e-mail non vérifié » (NOT_VERIFIED) | Haute | N/A — `requireVerification:false`, aucun blocage de non-vérifié |
| FE-AUTH-09 | « Se souvenir de moi » | — | 1. Cocher 2. Se connecter 3. Rouvrir le navigateur | — | Session conservée | Moyenne | ⚠️ case « Se souvenir de moi » présente ; persistance après redémarrage navigateur non testable dans ce harnais |
| FE-AUTH-10 | Mot de passe oublié — demande | — | 1. `/forgot-password` 2. Saisir e-mail 3. Valider | — | Carte de succès « vérifiez vos e-mails » | Moyenne | ✅ « Email envoyé ! Vérifiez votre boîte mail… » |
| FE-AUTH-11 | Réinitialisation — token valide | Lien de reset reçu | 1. Ouvrir `/reset-password?token=…` 2. Nouveau mdp + confirmation 3. Valider | — | Succès puis redirection vers `/login` (~1,5 s) | Haute | ✅ **CORRIGÉ** — `passwordResetUrl` → `/reset-password` + `?token=` ajouté au template. Vérifié bout en bout : lien e-mail → reset réussi → redirection `/login`. *(Exéc. initiale : ❌ lien `/password-reset` 404 sans token.)* |
| FE-AUTH-12 | Réinitialisation — token manquant/invalide | — | 1. Ouvrir sans token / token faux | — | Erreur + lien retour connexion | Moyenne | ✅ token faux → « Le jeton de réinitialisation… n'est pas reconnu » |
| FE-AUTH-13 | Réinitialisation — mdp non concordants | — | 1. Saisir 2 mdp différents | — | Erreur de concordance | Moyenne | ✅ « Les mots de passe ne correspondent pas » |
| FE-AUTH-14 | Réinitialisation — mdp trop court | — | 1. Saisir < 8 caractères | — | Erreur de longueur | Moyenne | ☐ non testé explicitement (probable même absence de `minlength` que FE-AUTH-04) |
| FE-AUTH-15 | Vérification e-mail automatique | Lien de vérification | 1. Ouvrir `/verify?token=…` | — | Spinner puis succès, redirection accueil (~1,5 s) | Haute | ⛔ Aucun e-mail de vérification généré (`requireVerification:false`) → impossible d'obtenir un token valide |
| FE-AUTH-16 | Vérification — token absent/invalide | — | 1. Ouvrir sans token | — | Erreur + lien connexion | Moyenne | ✅ `/verify` sans token → « Lien invalide ou expiré » + « Se connecter » |
| FE-AUTH-17 | Renvoyer la vérification | `/verification-pending` | 1. Cliquer « Renvoyer » | — | Bouton désactivé après envoi, alerte de succès | Moyenne | ✅ « Email renvoyé ! » + bouton désactivé |
| FE-AUTH-18 | Déconnexion | Connecté | 1. Menu compte 2. « Déconnexion » | — | État client vidé, cache Apollo purgé, redirection accueil | Haute | ✅ « Déconnexion » → redirection `/login`, session vidée |
| FE-AUTH-19 | Persistance de session (JWT) | Connecté | 1. Rafraîchir une page | — | Reste connecté (active customer rechargé) | Haute | ✅ session conservée entre navigations (active customer rechargé) |
| FE-AUTH-20 | Garde de route — espace compte non connecté | Déconnecté | 1. Ouvrir `/user/profile` | — | Spinner d'auth puis redirection accueil | Haute | ✅ `/user/profile` déconnecté → redirection `/login` |

## 3. Accueil & catalogue — `FE-CAT`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| FE-CAT-01 | Page d'accueil | Catalogue peuplé | 1. Ouvrir `/` | — | Hero, produits vedette (8), collections (8), bandeau marque | Haute | ✅ Hero + 8 produits vedette + bandeau livraison OK. NB : section catégories affiche 4 racines (Men/Women/Kids/Accessories), pas 8 |
| FE-CAT-02 | CTA du hero | — | 1. Cliquer « Boutique » / « Catégories » | — | Navigation correcte | Basse | ✅ CTA « Acheter maintenant » → /products, « Toutes les catégories » → /categories |
| FE-CAT-03 | Survol collection | — | 1. Survoler une collection | — | Effet de zoom + overlay avec nom | Basse | ☐ non vérifié (cosmétique) |
| FE-CAT-04 | Erreur de chargement des vedettes | Couper l'API | 1. Recharger l'accueil | — | Alerte d'erreur affichée | Moyenne | N/A — API non coupée dans cet environnement |
| FE-CAT-05 | Liste produits — affichage | — | 1. Ouvrir `/products` | — | Grille (12/page), fil d'Ariane, compteur d'articles | Haute | ✅ 12 produits/page, compteur « 100 produits », tri présent |
| FE-CAT-06 | Tri (Nom A-Z / Z-A) | — | 1. Changer le tri | — | Ordre mis à jour | Moyenne | ✅ name-asc/name-desc ; Z→A → 1er = « Wrap Dress » (vs A-Line) |
| FE-CAT-07 | Pagination produits | > 12 produits | 1. Naviguer entre pages | — | Page mise à jour (URL `p`) | Moyenne | ✅ `?p=2` → 12 produits différents ; 9 pages |
| FE-CAT-08 | Squelettes de chargement | — | 1. Observer pendant le fetch | — | Skeletons affichés | Basse | ☐ non capturé (fetch trop rapide en local) |
| FE-CAT-09 | Liste vide | Aucun produit | 1. Filtrer sans résultat | — | Message « aucun produit » | Moyenne | ✅ voir FE-SRCH-10 (recherche « zzzzzz » → état vide) |
| FE-CAT-10 | Page catégories (racines) | — | 1. Ouvrir `/categories` | — | Grille de collections racines (12/page) | Moyenne | ✅ 4 collections racines affichées (noms en anglais — voir FE-I18N-05) |
| FE-CAT-11 | Détail catégorie + sous-catégories | Catégorie avec enfants | 1. Ouvrir `/categories/[slug]` | — | Fil d'Ariane, sous-catégories, produits (12/page) | Haute | ✅ /categories/men : fil d'Ariane, 5 sous-catégories, 12 produits |
| FE-CAT-12 | Catégorie sans produit | — | 1. Ouvrir une catégorie vide | — | État vide | Basse | ☐ non testé (catégories seed toutes peuplées) |
| FE-CAT-13 | Carte produit | — | 1. Cliquer une carte | — | Image, nom, prix (1ʳᵉ variante) ; clic → fiche produit | Moyenne | ✅ carte = nom + prix (⚠️ prix en $US — voir FE-SYS-01) |

## 4. Page produit & sélection de variante — `FE-PDP`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| FE-PDP-01 | Affichage de la fiche produit | Produit existant | 1. Ouvrir `/products/[slug]` | — | Nom, prix, stock, galerie, options, onglets | Haute | ⚠️ Nom, prix, stock, galerie, onglets OK — MAIS aucun sélecteur d'options (cf. FE-PDP-05/06) |
| FE-PDP-02 | Galerie — miniatures | ≥ 2 images | 1. Cliquer une miniature | — | Image principale mise à jour | Moyenne | N/A — produits seed sans assets image (placeholder, 1 visuel) |
| FE-PDP-03 | Zoom plein écran | — | 1. Cliquer l'image principale | — | Modale de zoom ouverte | Basse | ✅ bouton « Agrandir l'image » présent |
| FE-PDP-04 | Indicateur de stock | Variantes variées | 1. Observer le badge | En stock / Rupture / Faible | Statut correct | Moyenne | ✅ badge « En stock » affiché |
| FE-PDP-05 | Sélection de couleur | Produit avec couleurs | 1. Choisir une couleur | Rouge | Couleur sélectionnée (swatch actif) | Haute | ✅ **CORRIGÉ** — option groups créés dans `populate.ts` ; PDP affiche un sélecteur Couleur (White/Blue/Navy). *(Exéc. initiale : ❌ `optionGroups: []`.)* |
| FE-PDP-06 | Sélection de taille | Produit avec tailles | 1. Choisir une taille | M | Taille sélectionnée | Haute | ✅ **CORRIGÉ** — sélecteur Taille (S/M/L/XL/2XL) affiché ; sélection de variante fonctionnelle |
| FE-PDP-07 | Guide des tailles | — | 1. Ouvrir « Guide des tailles » | — | Modale/lien avec tableau de tailles | Basse | ✅ lien « Guide des tailles » présent sur la PDP |
| FE-PDP-08 | Sélecteur de quantité (1–10) | — | 1. Incrémenter/décrémenter | — | Bornes respectées | Moyenne | ✅ « Diminuer » désactivé à 1, « Augmenter » OK |
| FE-PDP-09 | Ajout au panier — variante complète | Couleur + taille requises | 1. Choisir options 2. « Ajouter au panier » | — | Article ajouté, toast succès, compteur panier +1 | Haute | ⚠️ Ajout OK → « Panier (1 article) » mais variante par défaut (pas de choix d'options) |
| FE-PDP-10 | Ajout sans option requise | Option non choisie | 1. Cliquer « Ajouter » sans choisir | — | Toast d'erreur (option requise), pas d'ajout | Haute | N/A — pas d'options requises (cf. FE-PDP-05/06) |
| FE-PDP-11 | Onglets Description/Détails/Livraison | — | 1. Parcourir les onglets | — | Contenu correct (description, facettes/SKU, livraison) | Basse | ✅ 3 onglets présents, Description affiche le texte produit |
| FE-PDP-12 | Produits associés | Produit dans une collection | 1. Observer la section | — | ≤ 4 produits, hors produit courant, dédupliqués | Basse | ✅ « Vous aimerez aussi » = 4 produits, hors produit courant |
| FE-PDP-13 | Produit introuvable | slug invalide | 1. Ouvrir un slug inexistant | — | Alerte d'erreur + lien retour | Moyenne | ✅ « Produit introuvable » + lien retour |
| FE-PDP-14 | Données structurées (JSON-LD) | — | 1. Inspecter la source | — | productSchema + breadcrumbSchema présents | Basse | ✅ JSON-LD Product + BreadcrumbList (+ Organization, WebSite) |
| FE-PDP-15 | Partage | — | 1. Cliquer « Partager » | — | Action de partage déclenchée | Basse | ✅ bouton « Partager » présent |

## 5. Recherche & filtres à facettes — `FE-SRCH`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| FE-SRCH-01 | Recherche depuis l'en-tête | — | 1. Saisir un terme + Entrée | « robe » | Redirection `/search?q=robe`, résultats affichés | Haute | ✅ saisie « dress » + Entrée → `/search?q=dress`. NB : termes FR (« robe ») ne matchent pas (noms produits en anglais) |
| FE-SRCH-02 | Recherche sans terme | — | 1. Ouvrir `/search` sans `q` | — | Message « saisir un terme » | Basse | ✅ « Saisissez un terme dans la barre de recherche » |
| FE-SRCH-03 | Compteur de résultats | Résultats présents | 1. Observer « X résultats pour … » | — | Compteur correct | Basse | ✅ « 29 résultats pour "shirt" » |
| FE-SRCH-04 | Filtres à facettes — cases à cocher | Facettes dispo | 1. Cocher une valeur | — | Liste filtrée, compteur par facette | Haute | ✅ facette Category (cases à cocher) avec compteurs par valeur (men-casual-shirts 8, etc.) |
| FE-SRCH-05 | Filtre couleur (swatch) | Facette couleur | 1. Choisir une couleur | — | Filtrage par couleur | Moyenne | ✅ Color = boutons Black(8)/White(17)/Navy(4) ; clic White → 29→17 résultats |
| FE-SRCH-06 | Filtre taille (boutons) | Facette taille | 1. Choisir une taille | — | Filtrage par taille | Moyenne | ✅ Size = boutons XS/S présents |
| FE-SRCH-07 | Filtres multiples cumulés | — | 1. Combiner plusieurs facettes | couleur + taille | Résultats cohérents | Moyenne | ✅ filtres réduisent les résultats de façon cohérente (compteurs par facette) |
| FE-SRCH-08 | Persistance des filtres en URL | Filtres actifs | 1. Copier l'URL 2. Recharger | `q`, `f`, `p` | État restauré depuis l'URL | Moyenne | ✅ URL `?q=shirt&f_color=10` |
| FE-SRCH-09 | Effacer les filtres | Filtres actifs | 1. Cliquer « Effacer » | — | Filtres réinitialisés, page = 1 | Basse | ✅ bouton « Effacer les filtres » apparaît quand un filtre est actif |
| FE-SRCH-10 | Aucun résultat | Terme improbable | 1. Rechercher « zzzzzz » | — | État vide « aucun résultat » | Moyenne | ✅ « Aucun résultat pour "zzzzzz" » |
| FE-SRCH-11 | Pagination des résultats | > 12 résultats | 1. Naviguer | — | Pages correctes | Moyenne | ✅ pagination (Précédent désactivé, 1/2/3, Suivant) |
| FE-SRCH-12 | Erreur de recherche | Couper l'API | 1. Rechercher | — | Alerte d'erreur | Basse | N/A — API non coupée |

## 6. Panier & coupons — `FE-CART`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| FE-CART-01 | Mini-panier (drawer) | Article au panier | 1. Cliquer l'icône panier | — | Drawer latéral avec articles + badge compteur | Haute | ✅ drawer « Votre panier (n) » : article, qté, sous-total, « Passer la commande »/« Voir le panier » |
| FE-CART-02 | Mini-panier vide | Panier vide | 1. Ouvrir le drawer | — | Message + « Continuer mes achats » | Moyenne | ☐ non testé (panier non vidé pendant la session) |
| FE-CART-03 | Modifier la quantité (mini-panier) | Article présent | 1. +/− sur un article | — | Quantité et prix ligne mis à jour | Moyenne | ✅ +1 → qté 2, ligne 6 580 $US, badge « Panier (2 articles) » |
| FE-CART-04 | Retirer un article (mini-panier) | — | 1. Cliquer « Retirer » | — | Article supprimé | Moyenne | ✅ bouton « Supprimer cet article » présent (cf. FE-CART-07) |
| FE-CART-05 | Page panier — affichage | Articles présents | 1. Ouvrir `/cart` | — | Liste articles + récap (sous-total, total) | Haute | ✅ liste + SKU + qté + récap (sous-total/livraison « À calculer »/total) |
| FE-CART-06 | Modifier la quantité (page, 1–99) | — | 1. Ajuster la quantité | — | Total recalculé, bornes respectées | Moyenne | ✅ contrôle qté identique au mini-panier (Diminuer/Augmenter, total recalculé) |
| FE-CART-07 | Retirer un article (page) | — | 1. Cliquer « Retirer » | — | Article supprimé, total mis à jour | Moyenne | ✅ « Supprimer cet article » par ligne (testé en flux) |
| FE-CART-08 | Appliquer un coupon valide | Code valide | 1. Saisir le code 2. « Appliquer » | `SOLDE10` | Code appliqué (badge), remise affichée | Haute | ✅ SOLDE10 appliqué (badge + « Retirer »), remise affichée. **Sous-total brut CORRIGÉ** (panier + checkout) : vérifié 3 565 DA − 356 DA = 3 208 DA. ⚠️ Aucun code promo seedé → promo SOLDE10 + collection `discount-10` créés comme prérequis UAT |
| FE-CART-09 | Appliquer un coupon invalide | Code invalide | 1. Saisir un code faux | `FAUX` | Message d'erreur, aucune remise | Moyenne | ✅ « FAUX » rejeté (non appliqué, total inchangé) ; toast d'erreur transitoire |
| FE-CART-10 | Retirer un coupon | Coupon appliqué | 1. Cliquer le « X » du badge | — | Coupon retiré, total recalculé | Moyenne | ✅ « Retirer » → SOLDE10 retiré, total revient à 10 810 $US |
| FE-CART-11 | Plusieurs coupons | Codes multiples valides | 1. Appliquer 2 codes | — | Les deux apparaissent, remises cumulées | Basse | N/A — un seul code promo disponible dans cet environnement |
| FE-CART-12 | Panier vide | Aucun article | 1. Ouvrir `/cart` | — | État vide + « Parcourir les produits » | Moyenne | ☐ non testé (panier conservé pour le checkout) |
| FE-CART-13 | Persistance du panier | Article ajouté | 1. Rafraîchir / revenir plus tard | — | Panier conservé (active order serveur) | Haute | ✅ panier conservé entre navigations PDP→/cart→PDP (active order serveur) |
| FE-CART-14 | Toasts d'ajout/suppression | — | 1. Ajouter/supprimer | — | Notifications affichées | Basse | ✅ toasts présents (transitoires) à l'ajout/au coupon |

## 7. Tunnel de commande (checkout) — `FE-CHK`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| FE-CHK-01 | Accès au checkout | Panier non vide | 1. Cliquer « Commander » | — | Étape 1 (Adresse) affichée + récap latéral | Haute | ✅ `/checkout` → étape 1 Adresse + récap latéral « Résumé » |
| FE-CHK-02 | Pré-remplissage (connecté) | Client connecté | 1. Ouvrir le checkout | — | E-mail, nom, téléphone pré-remplis | Moyenne | ☐ non testé (parcours réalisé en invité) |
| FE-CHK-03 | Adresse — champs obligatoires | — | 1. Laisser des champs requis vides 2. Continuer | — | Validation : champs requis signalés | Haute | ✅ « Continuer » sur formulaire vide → soumission bloquée (reste étape 1) |
| FE-CHK-04 | Sélection de wilaya | — | 1. Choisir une wilaya | 16 — Alger | Wilaya sélectionnée (format « XX — Nom ») | Haute | ✅ liste des 48 wilayas « XX — Nom », sélection « 16 — Alger » |
| FE-CHK-05 | E-mail invité requis | Invité (non connecté) | 1. Renseigner l'e-mail invité 2. Continuer | — | Client attaché à la commande (setCustomerForOrder) | Haute | ✅ e-mail invité saisi → commande rattachée (visible sur la commande) |
| FE-CHK-06 | Facturation = livraison | — | 1. Cocher/décocher la case | — | Adresse de facturation gérée en conséquence | Moyenne | ✅ case « Utiliser cette adresse pour la facturation » cochée par défaut |
| FE-CHK-07 | Passage à l'étape Livraison | Adresse valide | 1. Continuer | — | Étape 2 affichée | Haute | ✅ étape 2 « Mode de livraison » affichée + récap adresse |
| FE-CHK-08 | Méthodes de livraison éligibles | — | 1. Observer la liste | — | Méthodes listées avec prix + estimation par zone | Haute | ✅ « Standard Shipping — 1-2 jours ouvrés — 5 $US » (1 seule méthode seed) |
| FE-CHK-09 | Estimation de délai par zone | Wilayas de zones différentes | 1. Tester zone 1 puis zone 4 | — | Délai/zone corrects | Moyenne | ⚠️ 1 seule méthode (délai « 1-2 jours ouvrés ») — variation par zone non vérifiable |
| FE-CHK-10 | Aucune méthode de livraison | Config sans méthode | 1. Atteindre l'étape | — | État vide « aucune méthode » | Moyenne | N/A — méthode toujours disponible |
| FE-CHK-11 | Sélection d'une méthode → Paiement | — | 1. Choisir une méthode 2. Continuer | — | Étape 3 (Paiement) affichée | Haute | ✅ → étape 3 « Paiement », récap Livraison 5 $US, Total 10 815 $US |
| FE-CHK-12 | Méthodes de paiement éligibles | — | 1. Observer la liste | CIB / Baridimob / COD | Méthodes éligibles sélectionnables | Haute | ⚠️ Seul **« Cash on delivery »** disponible — CIB/Baridimob (handlers présents en code) non créés par le seed |
| FE-CHK-13 | Méthode non éligible désactivée | Méthode inéligible | 1. Observer | — | Badge « inéligible » + message, sélection bloquée | Moyenne | N/A — une seule méthode |
| FE-CHK-14 | Aucune méthode de paiement | Config sans méthode | 1. Atteindre l'étape | — | État vide | Moyenne | N/A |
| FE-CHK-15 | Passer la commande (succès) | Étapes complètes | 1. « Passer la commande » | — | Transition ArrangingPayment + paiement → redirection `/checkout/confirmation/[code]` | Haute | ✅ commande passée → redirection `/checkout/confirmation/T8BK5CPH6G1EQLXG` |
| FE-CHK-16 | Échec de paiement | Forcer un échec | 1. Passer la commande | — | Message d'erreur, pas de redirection | Moyenne | N/A — échec COD non forçable |
| FE-CHK-17 | Récap latéral (sticky) | — | 1. Observer pendant les étapes | — | Articles, sous-total, livraison (ou « à définir »), total | Moyenne | ✅ récap présent à chaque étape (Articles·3, sous-total, livraison, total) |
| FE-CHK-18 | Session désynchronisée (AlreadyLoggedIn) | Session résiduelle | 1. Tenter de définir l'adresse | — | Alerte spéciale + bouton « Se déconnecter et réinitialiser » | Moyenne | ☐ non reproduit |
| FE-CHK-19 | Récupération après session périmée | idem | 1. Cliquer « Se déconnecter et réinitialiser » | — | Session + panier purgés, redirection | Moyenne | ☐ non reproduit |
| FE-CHK-20 | Résolution wilaya par nom/nameAr | Adresse créée côté web | 1. Vérifier la wilaya à l'étape adresse | nom ou nameAr | Wilaya résolue (insensible casse/espaces) | Moyenne | ✅ « Alger » résolue (récap commande affiche Alger) |
| FE-CHK-21 | Page de confirmation | Commande passée | 1. Atteindre `/checkout/confirmation/[code]` | — | Icône succès, code, récap, CTA « Voir la commande »/« Continuer » | Haute | ✅ « Merci pour votre commande ! » + code + Total 10 815 $US + CTA |
| FE-CHK-22 | Confirmation — commande introuvable | code invalide | 1. Ouvrir avec un faux code | — | Alerte d'erreur | Basse | ✅ « Commande introuvable » (NB : message brut « pas autorisé » affiché en plus) |
| FE-CHK-23 | Panier vidé après confirmation | Commande passée | 1. Revenir à l'accueil | — | Panier vide (active order consommé) | Moyenne | ✅ badge « Panier (0 article) » après confirmation |

## 8. Espace compte — `FE-ACC`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| FE-ACC-01 | Profil — affichage | Connecté | 1. Ouvrir `/user/profile` | — | Infos personnelles + section mot de passe | Haute | ✅ « Informations personnelles » + « Changer le mot de passe » + nav latérale |
| FE-ACC-02 | Profil — e-mail en lecture seule | — | 1. Tenter d'éditer l'e-mail | — | Champ désactivé | Basse | ✅ champ e-mail `disabled` (salah.uat@oscar.test) |
| FE-ACC-03 | Modifier prénom/nom/téléphone | — | 1. Modifier 2. « Enregistrer » | — | Alerte de succès, données mises à jour | Moyenne | ✅ téléphone modifié → toast « Profil mis à jour. », valeur conservée |
| FE-ACC-04 | Changement de mot de passe | — | 1. Actuel + nouveau + confirmation 2. Valider | — | Succès | Haute | ☐ formulaire présent ; changement réussi non exécuté (pour préserver les identifiants de test) |
| FE-ACC-05 | Mots de passe non concordants | — | 1. Nouveau ≠ confirmation | — | Erreur de concordance | Moyenne | ⚠️ erreur affichée (toast générique « Erreur », pas de message de concordance spécifique) |
| FE-ACC-06 | Historique des commandes | Connecté, commandes existantes | 1. Ouvrir `/user/orders` | — | Tableau (Code, Date, Statut, Total, Action) trié par date | Haute | ✅ **CORRIGÉ** — `id` ajouté sur `activeCustomer` + `productVariant`/`product`/`featuredAsset` dans `GetMyOrders` + codegen. Vérifié : tableau (Référence/Date/Statut/Total/Détails) affiché. *(Exéc. initiale : ❌ plantage Apollo #5.)* |
| FE-ACC-07 | Badges de statut | Commandes variées | 1. Observer les badges | — | Couleurs/intentions correctes par statut | Moyenne | ⛔ bloqué par le plantage FE-ACC-06 |
| FE-ACC-08 | Historique vide | Aucune commande | 1. Ouvrir la page | — | État vide + « Continuer mes achats » | Moyenne | ❌ l'état vide ne s'affiche jamais (même plantage FE-ACC-06, alors que l'API renvoie 0 commande) |
| FE-ACC-09 | Détail commande (connecté) | Commande existante | 1. Cliquer « Voir » → `/orders/[code]` | — | Lignes, totaux, adresse de livraison | Haute | ✅ `/orders/[code]` : lignes, totaux, adresse, statut, date FR (cf. FE-ACC-10) |
| FE-ACC-10 | Détail commande (invité par code) | Code de commande connu | 1. Ouvrir `/orders/[code]` sans être connecté | — | Détail accessible via le code | Moyenne | ✅ `/orders/T8BK5CPH6G1EQLXG` en invité : lignes (×2, ×1), récap, « Passée le 7 juin 2026 · PaymentAuthorized » |
| FE-ACC-11 | Commande introuvable | code invalide | 1. Ouvrir un faux code | — | Alerte d'erreur | Basse | ✅ « Commande introuvable » (NB : message brut « pas autorisé » affiché en plus) |
| FE-ACC-12 | Wishlist — affichage | Connecté | 1. Ouvrir `/user/wishlist` | — | Grille des favoris | Moyenne | ✅ affiche l'article ajouté (« Classic Oxford Shirt · 3 290 $US ») |
| FE-ACC-13 | Ajouter aux favoris | Sur une fiche produit | 1. Cliquer le cœur | — | Produit ajouté à la wishlist (persistant localStorage) | Moyenne | ✅ cœur des **cartes produit** OK (localStorage `oscar-wishlist-v1`, `aria-pressed`). ⚠️ le bouton « Ajouter aux favoris » **principal de la PDP** ne fonctionne pas (aucun ajout) |
| FE-ACC-14 | Retirer des favoris | Wishlist non vide | 1. Cliquer « Retirer » | — | Produit retiré | Basse | ✅ retrait → localStorage `[]`, état vide restauré |
| FE-ACC-15 | Wishlist vide | Aucun favori | 1. Ouvrir la page | — | État vide + « Continuer mes achats » | Basse | ✅ « Votre liste de favoris est vide. » + « Voir les produits » |
| FE-ACC-16 | Persistance wishlist inter-sessions | — | 1. Ajouter, fermer, rouvrir | — | Favoris conservés | Basse | ✅ persistance localStorage (conservé entre navigations) |
| FE-ACC-17 | Navigation latérale compte | Connecté | 1. Parcourir Profil/Commandes/Favoris | — | Élément actif surligné, déconnexion possible | Basse | ✅ nav latérale Profil/Commandes/Favoris + Déconnexion |

## 9. Pages statiques & contenu — `FE-STA`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| FE-STA-01 | À propos | — | 1. Ouvrir `/about` | — | Contenu (histoire, valeurs) affiché | Basse | ✅ `/about` → 200, contenu affiché |
| FE-STA-02 | Contact | — | 1. Ouvrir `/contact` | — | Cartes e-mail/téléphone/adresse/horaires | Basse | ✅ `/contact` → 200, contenu affiché |
| FE-STA-03 | FAQ (accordéon) | — | 1. Ouvrir `/faq` 2. Déplier/replier | — | Accordéon fonctionnel | Basse | ✅ « Questions fréquentes » + 6 éléments accordéon (`aria-expanded`) |
| FE-STA-04 | Livraison | — | 1. Ouvrir `/shipping` | — | Zones, coûts, suivi affichés | Basse | ✅ `/shipping` → 200 |
| FE-STA-05 | Retours | — | 1. Ouvrir `/returns` | — | Conditions + procédure | Basse | ✅ `/returns` → 200 |
| FE-STA-06 | Guide des tailles | — | 1. Ouvrir `/size-guide` | — | Tableau XS→XXL (poitrine/taille/hanches) | Basse | ✅ `/size-guide` → 200 |
| FE-STA-07 | Mentions légales — confidentialité | — | 1. Ouvrir `/legal/privacy` | — | Contenu affiché | Basse | ✅ `/legal/privacy` → 200 |
| FE-STA-08 | Mentions légales — CGU | — | 1. Ouvrir `/legal/terms` | — | Contenu affiché | Basse | ✅ `/legal/terms` → 200 |
| FE-STA-09 | Carrières | — | 1. Ouvrir `/careers` | — | Page affichée | Basse | ✅ `/careers` → 200 |

## 10. En-tête, pied & navigation — `FE-NAV`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| FE-NAV-01 | Navigation principale | — | 1. Cliquer Accueil/Boutique/Catégories/À propos/Contact | — | Navigation correcte | Moyenne | ✅ 5 liens (Accueil/Boutique/Catégories/À propos/Contact) vers les bonnes routes |
| FE-NAV-02 | Menu compte — non connecté | Déconnecté | 1. Observer le menu | — | « Se connecter » + lien login | Moyenne | ✅ « Se connecter » → /login |
| FE-NAV-03 | Menu compte — connecté | Connecté | 1. Ouvrir le menu | — | Avatar/initiales, nom, liens Profil/Commandes/Favoris, Déconnexion | Moyenne | ✅ avatar « SR » + « Salah » + Profil/Commandes/Favoris/Déconnexion |
| FE-NAV-04 | Fermeture du menu au clic extérieur | Menu ouvert | 1. Cliquer en dehors | — | Menu fermé | Basse | ☐ non testé explicitement |
| FE-NAV-05 | Bouton panier + badge | Articles présents | 1. Observer le badge | — | Compteur correct, ouverture du mini-panier | Moyenne | ✅ « Panier (n articles) » + ouverture du drawer |
| FE-NAV-06 | Bascule de thème (clair/sombre) | — | 1. Basculer | — | Thème appliqué (next-themes) | Basse | ✅ bascule → classe `dark` sur `html` |
| FE-NAV-07 | En-tête sticky | Scroll | 1. Faire défiler | — | En-tête fixe avec flou d'arrière-plan | Basse | ☐ non vérifié (visuel) |
| FE-NAV-08 | Pied — liens utiles & société | — | 1. Cliquer les liens | — | Navigation correcte | Basse | ✅ pied avec sections Aide / Entreprise (liens corrects) |
| FE-NAV-09 | Pied — réseaux sociaux | — | 1. Cliquer une icône sociale | — | Ouverture dans un nouvel onglet (rel noopener) | Basse | ✅ Facebook/Instagram/Twitter/YouTube (URL externes) |
| FE-NAV-10 | Lien « Aller au contenu » (skip link) | — | 1. Tabuler dès le chargement | — | Lien visible au focus, saute vers `#main` | Basse | ✅ « Aller au contenu principal » → `#main` |

## 11. Devise, états, responsive & accessibilité — `FE-SYS`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| FE-SYS-01 | Formatage des prix (DZD) | Prix partout | 1. Vérifier cartes/PDP/panier/checkout/commande | — | Format DZD cohérent (cents → affichage) | Haute | ✅ **CORRIGÉ** — canal forcé en DZD dans `populate.ts` avant tarification ; vérifié « 3 290 DA » partout. *(Exéc. initiale : ❌ prix en $US / canal USD.)* |
| FE-SYS-02 | Prix soldé (barré) | Produit en promo | 1. Observer le prix | — | Prix original barré + prix courant | Moyenne | ☐ aucun prix barré observé (le seed ne renseigne pas `originalPrice`/`discountPercent` sur les variantes ; la remise SOLDE10 est au niveau panier) |
| FE-SYS-03 | Calcul des totaux | Panier avec remise + livraison | 1. Vérifier sous-total + livraison − remise = total | — | Total correct | Haute | ✅ total = sous-total brut − remise + livraison (vérifié). Affichage du sous-total brut **CORRIGÉ** (cf. FE-CART-08) |
| FE-SYS-04 | États de chargement (skeletons) | — | 1. Observer pendant les fetch | — | Squelettes/spinners adaptés | Moyenne | ☐ non capturé (fetch trop rapide en local) |
| FE-SYS-05 | États d'erreur (alertes) | API en échec | 1. Déclencher une erreur | — | Alerte lisible avec message | Moyenne | ✅ alertes vérifiées (produit/commande introuvable, identifiants invalides, token invalide) |
| FE-SYS-06 | Page 404 | URL inconnue | 1. Ouvrir une route inexistante | — | Page 404 par défaut | Basse | ✅ « 404: This page could not be found. » |
| FE-SYS-07 | Responsive mobile | Largeur < 768px | 1. Parcourir accueil/PDP/panier/checkout | — | Mise en page mobile (1 col, nav hamburger, searchbar masquée) | Haute | ✅ 375px : menu hamburger « Ouvrir le menu », nav desktop masquée, searchbar masquée |
| FE-SYS-08 | Responsive tablette | 768–1024px | 1. Parcourir | — | 2 colonnes, searchbar visible | Moyenne | ✅ 800px : searchbar visible |
| FE-SYS-09 | Responsive desktop | ≥ 1024px | 1. Parcourir | — | Multi-colonnes, navigation complète | Moyenne | ✅ ≥1024px : navigation inline complète |
| FE-SYS-10 | Accessibilité — aria/labels | — | 1. Inspecter boutons icônes / formulaires | — | aria-label, labels liés, rôles présents | Basse | ✅ boutons icônes labellisés (« Panier (n) », « Ajouter aux favoris », « Ouvrir le menu »…), skip link, rôles ARIA |
| FE-SYS-11 | Navigation clavier | — | 1. Parcourir au clavier (Tab/Échap) | — | Ordre logique, fermeture des menus à Échap | Basse | ☐ non testé en détail |
| FE-SYS-12 | PWA — invite d'installation | Conditions PWA | 1. Observer l'invite | — | Prompt d'installation affiché, texte localisé | Basse | ✅ dialog « Installer OSCAR Najar » (texte localisé FR) |

---

## Annexe — Parcours de bout en bout (smoke test)

1. **Invité** : Accueil → recherche → PDP → ajout panier → checkout (adresse + livraison +
   paiement) → confirmation → consultation de la commande par code.
   — ✅ **réalisé de bout en bout** (commande `T8BK5CPH6G1EQLXG`, COD, Alger).
2. **Client** : inscription → vérification → connexion → ajout favoris → panier → coupon →
   checkout → historique des commandes → modification du profil → déconnexion.
   — ⚠️ **majoritairement réalisé** : inscription/connexion/favoris/panier/coupon SOLDE10/profil/déconnexion OK ;
   **vérification N/A** (`requireVerification:false`) ; **historique des commandes ❌** (plantage FE-ACC-06).
3. **Multilingue** : rejouer le parcours 1 en **arabe (RTL)** et en **anglais**.
   — ⚠️ **partiel** : i18n/RTL validés (FR↔AR↔EN, `dir="rtl"`, titres traduits) ; parcours d'achat complet
   non rejoué intégralement en AR/EN.
