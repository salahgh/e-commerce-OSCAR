# Recette utilisateur (UAT) — Application mobile OSCAR Fashion

Application mobile client (Expo / React Native, Expo Router + Apollo + i18next).
Lancement : `cd apps/mobile && npx expo start` (Expo Go ou build de développement).
API Shop : `http://localhost:8085/shop-api`.

> Conventions, légendes (Priorité / Statut) et environnement : voir [`README.md`](./README.md).
> Statut par défaut : ☐ À tester.

## Périmètre

Splash & onboarding, authentification & gestion de session (récupération de session
désynchronisée), navigation (tabs/stacks), accueil, catalogue/explore/recherche, page produit
& variantes, panier/coupons/MiniCart, tunnel de commande (adresses sauvegardées, wilaya,
paiement, revue), confirmation, commandes & **réapprovisionnement (reorder)**, profil,
adresses, paramètres (langue/thème), wishlist & récemment consultés, et transverses
(i18n/RTL, thème, réseau/offline, états, validations, toasts).

## Prérequis spécifiques

- Tester sur **iOS et Android** (au moins un de chaque si possible) + au moins un appareil
  avec **encoche** (safe area).
- Comptes : client vérifié (avec **adresses sauvegardées** et **commandes passées**), client
  non vérifié, et possibilité de commander en invité.
- Catalogue : produits avec variantes, produit en rupture, produit en promotion, collection
  « banners » peuplée pour le carrousel d'accueil.
- Au moins une commande contenant un article qui deviendra **indisponible** (pour tester le
  reorder partiel).
- Lien profond (deep link) de réinitialisation de mot de passe et de vérification e-mail.

---

## 1. Splash & Onboarding — `MOB-ONB`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| MOB-ONB-01 | Écran splash animé | Premier lancement | 1. Lancer l'app | — | Logo animé (fade + scale), maintien ~3 s | Moyenne | ☐ |
| MOB-ONB-02 | Redirection vers onboarding (1ʳᵉ fois) | Flag onboarding absent | 1. Lancer l'app neuve | — | Affichage de l'onboarding | Haute | ☐ |
| MOB-ONB-03 | Slides swipeables (4) | Onboarding affiché | 1. Balayer les 4 slides | — | Transitions animées, pagination (points dynamiques) | Moyenne | ☐ |
| MOB-ONB-04 | Bouton « Suivant » (slides 1–3) | — | 1. Cliquer « Suivant » | — | Passage au slide suivant | Basse | ☐ |
| MOB-ONB-05 | Bouton « Commencer » (slide 4) | — | 1. Cliquer « Commencer » | — | Flag enregistré (AsyncStorage), accès aux tabs | Haute | ☐ |
| MOB-ONB-06 | « Passer » (Skip) | — | 1. Cliquer « Passer » | — | Onboarding ignoré, accès aux tabs | Moyenne | ☐ |
| MOB-ONB-07 | Onboarding non rejoué | Flag présent | 1. Relancer l'app | — | Splash → tabs directement (pas d'onboarding) | Haute | ☐ |
| MOB-ONB-08 | Textes localisés | Langue ≠ FR | 1. Changer la langue puis relancer | EN / AR | Onboarding traduit | Basse | ☐ |

## 2. Authentification & gestion de session — `MOB-AUTH`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| MOB-AUTH-01 | Connexion valide | Compte existant | 1. `(auth)/login` 2. E-mail/téléphone + mdp 3. Valider | — | Connecté, accès aux tabs | Haute | ☐ |
| MOB-AUTH-02 | Affichage/masquage du mot de passe | — | 1. Cliquer l'icône œil | — | Bascule visible/masqué | Basse | ☐ |
| MOB-AUTH-03 | Validation Yup (login) | — | 1. E-mail vide / mdp < 6 | — | Erreurs de validation affichées | Moyenne | ☐ |
| MOB-AUTH-04 | Identifiants invalides | — | 1. Mauvais mdp | — | Bannière d'erreur (icône alerte) | Haute | ☐ |
| MOB-AUTH-05 | Inscription valide | — | 1. `(auth)/register` 2. Nom complet, e-mail, téléphone, mdp + confirmation 3. Valider | tél 10 chiffres | Compte créé | Haute | ☐ |
| MOB-AUTH-06 | Auto-connexion après inscription | Vérification non requise | 1. S'inscrire | — | Connecté automatiquement | Moyenne | ☐ |
| MOB-AUTH-07 | Repli vers register-success | Auto-login échoue/ vérif requise | 1. S'inscrire | — | Écran « inscription réussie » | Moyenne | ☐ |
| MOB-AUTH-08 | Validation téléphone (10 chiffres) | — | 1. Téléphone invalide | `12345` | Erreur de validation | Moyenne | ☐ |
| MOB-AUTH-09 | Confirmation de mot de passe | — | 1. mdp ≠ confirmation | — | Erreur de concordance | Moyenne | ☐ |
| MOB-AUTH-10 | Mot de passe oublié — demande | — | 1. `(auth)/forgot-password` 2. E-mail 3. Envoyer | — | État de succès (e-mail affiché, icône animée) | Moyenne | ☐ |
| MOB-AUTH-11 | Renvoyer l'e-mail de reset | État succès | 1. Cliquer « Renvoyer » | — | E-mail renvoyé | Basse | ☐ |
| MOB-AUTH-12 | Réinitialisation via deep link | Lien de reset | 1. Ouvrir `(auth)/reset-password?token=…` 2. Nouveau mdp | — | Mot de passe réinitialisé | Haute | ☐ |
| MOB-AUTH-13 | Vérification e-mail via deep link | Lien de vérif | 1. Ouvrir `(auth)/verify-email?token=…` | — | Compte vérifié | Haute | ☐ |
| MOB-AUTH-14 | Persistance de session (SecureStore) | Connecté | 1. Tuer puis relancer l'app | — | Toujours connecté (token restauré, active customer rechargé) | Haute | ☐ |
| MOB-AUTH-15 | Déconnexion | Connecté | 1. Profil 2. « Déconnexion » 3. Confirmer | — | SecureStore + AsyncStorage + cache Apollo purgés, retour login | Haute | ☐ |
| MOB-AUTH-16 | Session désynchronisée (stale) au checkout | Session résiduelle | 1. Tenter de définir l'adresse en invité | — | Alerte « session désynchronisée — reconnectez-vous » | Haute | ☐ |
| MOB-AUTH-17 | Récupération « Se reconnecter » | Alerte stale affichée | 1. Choisir « Se reconnecter » | — | Déconnexion + redirection login | Haute | ☐ |
| MOB-AUTH-18 | Annuler la récupération de session | Alerte stale affichée | 1. Choisir « Annuler » | — | Alerte fermée, état inchangé | Moyenne | ☐ |
| MOB-AUTH-19 | Redirection routes protégées | Déconnecté | 1. Ouvrir checkout/orders/profile/payment | — | Redirection vers `(auth)/login` | Haute | ☐ |
| MOB-AUTH-20 | Routes auth bloquées si connecté | Connecté | 1. Ouvrir un écran `(auth)` | — | Redirection vers les tabs | Moyenne | ☐ |
| MOB-AUTH-21 | Évitement du clavier | iOS/Android | 1. Focus sur un champ | — | Le formulaire reste visible (KeyboardAvoidingView) | Basse | ☐ |

## 3. Navigation & Accueil — `MOB-HOME`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| MOB-HOME-01 | Barre d'onglets (5 tabs) | — | 1. Parcourir Accueil/Explore/Commandes/Panier/Profil | — | Navigation correcte, onglet actif teinté | Haute | ☐ |
| MOB-HOME-02 | Badge panier sur l'onglet | Articles au panier | 1. Ajouter des articles | — | Badge rouge avec compteur (max « 99+ ») | Moyenne | ☐ |
| MOB-HOME-03 | En-tête de recherche | — | 1. Toucher la barre | — | Navigation vers `/search` | Moyenne | ☐ |
| MOB-HOME-04 | Onglets de catégories dynamiques | Collection « banners » peuplée | 1. Observer les CategoryTabs | — | Catégories chargées (hors « banners ») | Moyenne | ☐ |
| MOB-HOME-05 | Carrousel de bannières | Bannières présentes | 1. Balayer le carrousel | — | Paging + points dynamiques | Moyenne | ☐ |
| MOB-HOME-06 | Tap bannière | — | 1. Toucher une bannière | — | Navigation `/products?category={slug}` | Moyenne | ☐ |
| MOB-HOME-07 | Section « Nouveautés » + « Voir tout » | — | 1. Cliquer « Voir tout » | — | Navigation `/products?sort=newest` | Basse | ☐ |
| MOB-HOME-08 | Rangée « Récemment consultés » | Produits déjà ouverts | 1. Observer la rangée | — | Produits récents affichés | Basse | ☐ |
| MOB-HOME-09 | Pull-to-refresh | — | 1. Tirer vers le bas | — | Rechargement des 3 requêtes (bannières, vedettes, nouveautés) | Moyenne | ☐ |
| MOB-HOME-10 | Safe area (encoche) | Appareil avec encoche | 1. Observer le haut d'écran | — | Padding correct (notch) | Basse | ☐ |

## 4. Catalogue / Explore / Recherche — `MOB-BR`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| MOB-BR-01 | Liste produits | — | 1. Ouvrir `/products` | — | Grille 2 colonnes, compteur d'articles | Haute | ☐ |
| MOB-BR-02 | Filtre par catégorie (URL) | — | 1. Ouvrir `/products?category={slug}` | — | Produits de la collection | Moyenne | ☐ |
| MOB-BR-03 | Tri (prix asc/desc, récent) | — | 1. Ouvrir SortSheet 2. Choisir un tri | — | Liste triée | Moyenne | ☐ |
| MOB-BR-04 | Filtre fourchette de prix | — | 1. Ouvrir PriceSheet 2. Min/max | 1000–5000 | Filtrage (client) appliqué | Moyenne | ☐ |
| MOB-BR-05 | Filtre taille | Tailles dispo | 1. Ouvrir SizeSheet 2. Sélectionner | — | Filtrage par taille | Basse | ☐ |
| MOB-BR-06 | Chips de filtres actifs + « Réinitialiser » | Filtres actifs | 1. Observer/réinitialiser | — | Chips colorés, reset fonctionnel | Basse | ☐ |
| MOB-BR-07 | Pull-to-refresh liste | — | 1. Tirer vers le bas | — | Rechargement | Basse | ☐ |
| MOB-BR-08 | Liste vide | Aucun résultat | 1. Filtrer sans résultat | — | EmptyState | Moyenne | ☐ |
| MOB-BR-09 | Explore — collections racines | — | 1. Ouvrir l'onglet Explore | — | Sidebar collections (hors « banners ») | Moyenne | ☐ |
| MOB-BR-10 | Explore — sous-catégories | — | 1. Toucher une collection | — | Sous-catégories dans le panneau droit | Moyenne | ☐ |
| MOB-BR-11 | Explore — « Voir tout » | — | 1. Cliquer « Voir tout » | — | Navigation vers les produits de la collection | Basse | ☐ |
| MOB-BR-12 | Recherche — auto-focus & debounce | — | 1. Ouvrir `/search` 2. Taper | « robe » | Champ auto-focus, requête debouncée (300 ms), min 2 caractères | Moyenne | ☐ |
| MOB-BR-13 | Historique de recherche | Recherches précédentes | 1. Observer l'historique 2. Toucher un item | — | 10 derniers conservés (AsyncStorage), re-recherche | Basse | ☐ |
| MOB-BR-14 | Effacer l'historique | Historique présent | 1. Cliquer « Effacer » | — | Historique vidé | Basse | ☐ |
| MOB-BR-15 | Recherches populaires | — | 1. Toucher une suggestion | « Pantalon » | Recherche lancée | Basse | ☐ |
| MOB-BR-16 | Résultats de recherche | — | 1. Rechercher un terme | — | Cartes produits affichées | Moyenne | ☐ |

## 5. Page produit & variantes — `MOB-PDP`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| MOB-PDP-01 | Affichage de la fiche | Produit existant | 1. Ouvrir `/products/[slug]` | — | Nom, prix, carrousel d'images, options | Haute | ☐ |
| MOB-PDP-02 | Carrousel d'images | ≥ 2 images | 1. Balayer | — | Pagination horizontale | Moyenne | ☐ |
| MOB-PDP-03 | Prix soldé + badge remise | Produit en promo | 1. Observer | — | Prix barré + % de remise | Moyenne | ☐ |
| MOB-PDP-04 | Statut de stock | Variantes variées | 1. Observer | rupture | Indicateur « rupture » correct | Moyenne | ☐ |
| MOB-PDP-05 | Sélection des options (taille/couleur) | Produit à variantes | 1. Choisir chaque option | M / Rouge | Variante correspondante auto-sélectionnée | Haute | ☐ |
| MOB-PDP-06 | Sélecteur de quantité | — | 1. +/− | — | Quantité ajustée (min 1) | Moyenne | ☐ |
| MOB-PDP-07 | Ajout au panier | Options choisies | 1. « Ajouter au panier » | — | État de chargement, toast succès, MiniCart | Haute | ☐ |
| MOB-PDP-08 | Toggle favori (wishlist) | — | 1. Toucher le cœur | — | Cœur rempli/vidé, produit ajouté/retiré | Moyenne | ☐ |
| MOB-PDP-09 | Partage natif | — | 1. Toucher « Partager » | — | Feuille de partage (nom, URL, prix) | Basse | ☐ |
| MOB-PDP-10 | Guide des tailles | — | 1. Ouvrir SizeGuideModal | — | Modale guide des tailles | Basse | ☐ |
| MOB-PDP-11 | Suivi « Récemment consultés » | — | 1. Ouvrir une fiche 2. Revenir à l'accueil | — | Produit ajouté à la rangée récente | Basse | ☐ |
| MOB-PDP-12 | Produits associés | — | 1. Observer la section | — | Suggestions affichées | Basse | ☐ |

## 6. Panier, coupons & MiniCart — `MOB-CART`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| MOB-CART-01 | MiniCart après ajout | Ajout depuis PDP | 1. Ajouter au panier | — | Bottom sheet : récap + « Continuer »/« Voir le panier » | Moyenne | ☐ |
| MOB-CART-02 | Onglet Panier — affichage | Articles présents | 1. Ouvrir l'onglet Panier | — | Liste articles + récap | Haute | ☐ |
| MOB-CART-03 | Panier vide | Aucun article | 1. Ouvrir l'onglet | — | État vide + « Commencer mes achats » → tabs | Moyenne | ☐ |
| MOB-CART-04 | Modifier la quantité | Article présent | 1. +/− | — | Quantité/total mis à jour | Moyenne | ☐ |
| MOB-CART-05 | Quantité min = 1 | Quantité à 1 | 1. Appuyer « − » | — | Bouton « − » désactivé | Basse | ☐ |
| MOB-CART-06 | Retirer un article | — | 1. Toucher « X » | — | Article retiré (mutation + refetch) | Moyenne | ☐ |
| MOB-CART-07 | Appliquer un coupon valide | Code valide | 1. Saisir + « Appliquer » | `SOLDE10` | Réduction appliquée, listée dans couponCodes | Haute | ☐ |
| MOB-CART-08 | Coupon invalide | Code faux | 1. Saisir + « Appliquer » | `FAUX` | Message d'erreur inline | Moyenne | ☐ |
| MOB-CART-09 | Auto-majuscule / trim du code | — | 1. Saisir `  solde10 ` | espaces/min. | Normalisé en `SOLDE10` | Basse | ☐ |
| MOB-CART-10 | Récap (sous-total/réduction/total) | Coupon appliqué | 1. Vérifier les montants | — | Réduction affichée si > 0, total correct | Moyenne | ☐ |
| MOB-CART-11 | Pull-to-refresh panier | — | 1. Tirer vers le bas | — | Rechargement du panier | Basse | ☐ |
| MOB-CART-12 | Bouton « Continuer » → checkout | Panier non vide | 1. Cliquer « Continuer » | — | Navigation `/checkout` | Haute | ☐ |

## 7. Tunnel de commande (checkout) — `MOB-CHK`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| MOB-CHK-01 | Indicateur d'étapes (4) | Panier non vide | 1. Ouvrir le checkout | — | 4 cercles (Livraison/Méthode/Paiement/Revue), étape active surlignée | Moyenne | ☐ |
| MOB-CHK-02 | Panier vide au checkout | Panier vide | 1. Ouvrir le checkout | — | État vide « panier vide » + « Commencer mes achats » | Moyenne | ☐ |
| MOB-CHK-03 | Sélecteur d'adresses sauvegardées | Connecté avec adresses | 1. Étape Livraison | — | Liste des adresses, auto-sélection (défaut/1ʳᵉ) | Haute | ☐ |
| MOB-CHK-04 | Chip « Nouvelle adresse » | Connecté avec adresses | 1. Toucher « Nouvelle adresse » | — | Bascule en saisie manuelle (pas de re-sélection auto) | Haute | ☐ |
| MOB-CHK-05 | Pré-remplissage (connecté) | Connecté | 1. Observer le formulaire | — | E-mail/nom/téléphone pré-remplis | Moyenne | ☐ |
| MOB-CHK-06 | E-mail invité requis | Invité | 1. Renseigner l'e-mail | — | setCustomerForOrder avant l'adresse | Haute | ☐ |
| MOB-CHK-07 | Champs d'adresse & validation | — | 1. Laisser des champs requis vides 2. Continuer | — | Erreurs de validation | Haute | ☐ |
| MOB-CHK-08 | Sélection de wilaya | — | 1. Choisir une wilaya | 16 — Alger | Wilaya sélectionnée | Haute | ☐ |
| MOB-CHK-09 | Résolution wilaya (nom/nameAr) | Adresse créée côté web | 1. Sélectionner une adresse sauvegardée avec wilaya en arabe/casse différente | nameAr | Wilaya résolue correctement (insensible casse/espaces) | Moyenne | ☐ |
| MOB-CHK-10 | Validation téléphone (10 chiffres) | — | 1. Téléphone invalide | `123` | Erreur de validation | Moyenne | ☐ |
| MOB-CHK-11 | Enregistrer comme adresse par défaut (invité) | Invité | 1. Cocher la case | — | Adresse sauvegardée par défaut | Basse | ☐ |
| MOB-CHK-12 | Soumission de l'adresse → étape 2 | Adresse valide | 1. Continuer | — | Passage à la sélection de livraison, refetch panier | Haute | ☐ |
| MOB-CHK-13 | Session désynchronisée à l'adresse | Session résiduelle | 1. Soumettre l'adresse | — | STALE_SESSION → alerte « Se reconnecter / Annuler » | Haute | ☐ |
| MOB-CHK-14 | Méthodes de livraison | — | 1. Observer la liste | — | Méthodes avec prix (« Gratuit » si 0) | Haute | ☐ |
| MOB-CHK-15 | Auto-sélection si unique méthode | 1 seule méthode | 1. Atteindre l'étape | — | Méthode pré-sélectionnée | Basse | ☐ |
| MOB-CHK-16 | Continuer vers Paiement | Méthode choisie | 1. « Continuer vers le paiement » | — | setOrderShippingMethod + étape 3 | Haute | ☐ |
| MOB-CHK-17 | Méthodes de paiement disponibles | — | 1. Observer | COD | COD sélectionnable, auto-sélection COD par défaut | Haute | ☐ |
| MOB-CHK-18 | Méthodes « Bientôt disponibles » (CIB/Baridimob) | — | 1. Observer la section | — | Cartes non sélectionnables + badge « Bientôt », note d'info | Moyenne | ☐ |
| MOB-CHK-19 | Méthode inéligible désactivée | Méthode inéligible | 1. Tenter de sélectionner | — | Grisée, message d'éligibilité | Moyenne | ☐ |
| MOB-CHK-20 | Continuer vers Revue | Paiement choisi | 1. « Continuer vers la revue » | — | Étape 4 (Revue) | Haute | ☐ |
| MOB-CHK-21 | Revue — adresse (wilaya affichée) | — | 1. Observer la section adresse | — | Adresse complète, **wilaya** affichée (code → nom) | Haute | ☐ |
| MOB-CHK-22 | Revue — éditer une section | — | 1. Cliquer « Modifier » sur adresse/livraison/paiement | — | Retour à l'étape correspondante | Moyenne | ☐ |
| MOB-CHK-23 | Revue — récap commande | — | 1. Vérifier articles/sous-total/livraison/total | — | Montants cohérents | Moyenne | ☐ |
| MOB-CHK-24 | Passer la commande | Étapes complètes | 1. « Passer la commande » | — | Transition ArrangingPayment + addPayment → confirmation (orderNumber, orderId) | Haute | ☐ |
| MOB-CHK-25 | États de chargement | Pendant les mutations | 1. Observer les boutons | — | Boutons désactivés pendant le traitement | Moyenne | ☐ |
| MOB-CHK-26 | Navigation arrière dans le tunnel | À une étape > 1 | 1. Bouton retour | — | Recule d'une étape (revue→paiement→livraison→adresse) | Moyenne | ☐ |

## 8. Confirmation de commande — `MOB-CONF`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| MOB-CONF-01 | Écran de confirmation | Commande passée | 1. Atteindre `/checkout/confirmation` | — | Animations (confettis, icône succès), numéro de commande | Haute | ☐ |
| MOB-CONF-02 | Numéro de commande affiché | — | 1. Observer la boîte | — | orderNumber correct | Moyenne | ☐ |
| MOB-CONF-03 | « Voir les détails de la commande » | orderId présent | 1. Cliquer | — | Navigation `/orders/{orderId}` | Moyenne | ☐ |
| MOB-CONF-04 | « Continuer mes achats » | — | 1. Cliquer | — | Navigation `/products` | Basse | ☐ |
| MOB-CONF-05 | « Aller à l'accueil » | — | 1. Cliquer | — | Navigation vers les tabs | Basse | ☐ |
| MOB-CONF-06 | Lien d'aide / support | — | 1. Cliquer « Contacter le support » | — | Accès au support | Basse | ☐ |

## 9. Commandes & Réapprovisionnement (reorder) — `MOB-ORD` / `MOB-REORD`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| MOB-ORD-01 | Garde d'authentification | Déconnecté | 1. Ouvrir l'onglet Commandes | — | Invite de connexion + « Se connecter » | Haute | ☐ |
| MOB-ORD-02 | Liste des commandes | Connecté, commandes existantes | 1. Ouvrir l'onglet | — | Cartes (numéro, date, badge statut, nb articles, total) | Haute | ☐ |
| MOB-ORD-03 | Sous-titre nombre de commandes | — | 1. Observer | — | « {{count}} commandes » correct | Basse | ☐ |
| MOB-ORD-04 | Filtrage AddingItems exclu | Panier en cours | 1. Observer la liste | — | Les brouillons « AddingItems » ne s'affichent pas | Moyenne | ☐ |
| MOB-ORD-05 | Pull-to-refresh | — | 1. Tirer vers le bas | — | Rechargement | Basse | ☐ |
| MOB-ORD-06 | Liste vide | Aucune commande | 1. Ouvrir l'onglet | — | « Aucune commande » + « Commencer mes achats » → Explore | Moyenne | ☐ |
| MOB-ORD-07 | Détail commande | Commande existante | 1. Toucher une commande | — | Statut, adresse, articles, récap, paiement, suivi | Haute | ☐ |
| MOB-ORD-08 | Badges/états de statut | Commandes variées | 1. Observer | — | Couleur + icône corrects pour chaque statut | Moyenne | ☐ |
| MOB-ORD-09 | Informations de paiement | — | 1. Observer la section paiement | — | Méthode, statut, date de règlement | Basse | ☐ |
| MOB-ORD-10 | Suivi / fulfillment | Commande expédiée | 1. Observer | — | Code de suivi affiché si disponible | Basse | ☐ |
| MOB-ORD-11 | Détail — chargement/erreur | — | 1. Couper le réseau puis ouvrir | — | LoadingSpinner / ErrorState avec « Réessayer » | Moyenne | ☐ |
| MOB-REORD-01 | Reorder — succès total | Commande dont tous les articles sont dispo | 1. Toucher « Recommander » | — | Tous ajoutés, toast « Articles ajoutés au panier », redirection panier | Haute | ☐ |
| MOB-REORD-02 | Reorder — succès partiel | Commande avec article indisponible | 1. « Recommander » | — | Toast « {{added}} ajoutés, {{failed}} indisponibles » (compte interpolé), redirection panier | Haute | ☐ |
| MOB-REORD-03 | Reorder — échec total | Tous les articles indisponibles | 1. « Recommander » | — | Toast « Impossible d'ajouter les articles », pas de redirection | Moyenne | ☐ |
| MOB-REORD-04 | Reorder — toasts localisés | Langue EN/AR | 1. Changer la langue 2. Recommander | EN / AR | Toasts traduits + interpolation correcte | Moyenne | ☐ |

## 10. Profil, Adresses & Paramètres — `MOB-PROF`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| MOB-PROF-01 | Profil — non connecté | Déconnecté | 1. Ouvrir l'onglet Profil | — | « Connectez-vous » + bouton « Se connecter » | Haute | ☐ |
| MOB-PROF-02 | Profil — connecté | Connecté | 1. Ouvrir l'onglet | — | Avatar, nom, téléphone, menu | Moyenne | ☐ |
| MOB-PROF-03 | Navigation du menu | — | 1. Toucher chaque entrée (Infos, Adresses, Commandes, Wishlist, Paramètres, Info, Support) | — | Navigation correcte | Moyenne | ☐ |
| MOB-PROF-04 | Éditer le profil | — | 1. `/profile/edit` 2. Modifier prénom/nom/e-mail/téléphone 3. Enregistrer | — | Toast succès, données mises à jour | Moyenne | ☐ |
| MOB-PROF-05 | Validation édition profil | — | 1. Champs invalides (nom < 2, e-mail, tél) | — | Erreurs de validation (Yup) | Moyenne | ☐ |
| MOB-PROF-06 | Adresses — liste | Connecté | 1. `/profile/addresses` | — | Cartes d'adresses (défaut indiqué) | Moyenne | ☐ |
| MOB-PROF-07 | Adresses — liste vide | Aucune adresse | 1. Ouvrir | — | « Aucune adresse » + « Ajouter une adresse » | Basse | ☐ |
| MOB-PROF-08 | Ajouter une adresse | — | 1. Remplir le formulaire (wilaya incluse) 2. Enregistrer | — | Adresse créée, refetch, toast « Adresse ajoutée » | Haute | ☐ |
| MOB-PROF-09 | Éditer une adresse | Adresse existante | 1. « Modifier » 2. Enregistrer | — | Adresse mise à jour, toast | Moyenne | ☐ |
| MOB-PROF-10 | Supprimer une adresse | Adresse existante | 1. « Supprimer » 2. Confirmer | — | Confirmation puis suppression, toast « Adresse supprimée » | Moyenne | ☐ |
| MOB-PROF-11 | Définir adresse par défaut | ≥ 2 adresses | 1. « Définir par défaut » | — | Adresse par défaut mise à jour, refetch | Moyenne | ☐ |
| MOB-PROF-12 | Validation formulaire adresse | — | 1. Champs invalides | — | Erreurs de validation | Moyenne | ☐ |
| MOB-PROF-13 | Paramètres — changement de langue | — | 1. `/profile/settings` 2. Choisir Français/English/العربية | AR | Langue changée (i18n), RTL en arabe, persistance | Haute | ☐ |
| MOB-PROF-14 | Paramètres — changement de thème | — | 1. Choisir Système/Clair/Sombre | Sombre | Thème appliqué (ThemeProvider), persistance | Moyenne | ☐ |
| MOB-PROF-15 | Paramètres — notifications (TODO) | — | 1. Basculer les interrupteurs | — | État visuel on/off (non fonctionnel — à vérifier comme tel) | Basse | ☐ |
| MOB-PROF-16 | Support / Aide | — | 1. Ouvrir `/profile/support` | — | Ressources/contact affichés | Basse | ☐ |
| MOB-PROF-17 | Déconnexion depuis le profil | Connecté | 1. « Déconnexion » 2. Confirmer | — | Auth purgée, retour login | Haute | ☐ |

## 11. Wishlist & Récemment consultés — `MOB-WL`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| MOB-WL-01 | Wishlist — affichage | Favoris présents | 1. `/profile/wishlist` | — | Liste (image, nom, prix, retirer) | Moyenne | ☐ |
| MOB-WL-02 | Retirer un favori | — | 1. Toucher « Retirer » | — | Produit retiré | Basse | ☐ |
| MOB-WL-03 | Wishlist vide | Aucun favori | 1. Ouvrir | — | « Aucun favori » | Basse | ☐ |
| MOB-WL-04 | Pull-to-refresh wishlist | — | 1. Tirer vers le bas | — | Rechargement | Basse | ☐ |
| MOB-WL-05 | Ajout/retrait synchronisé avec la PDP | — | 1. Ajouter depuis la PDP 2. Vérifier la wishlist | — | Cohérence cœur PDP ↔ liste | Basse | ☐ |
| MOB-WL-06 | Récemment consultés | Produits ouverts | 1. Ouvrir plusieurs fiches 2. Accueil | — | Rangée mise à jour | Basse | ☐ |

## 12. Transverses (i18n/RTL, thème, réseau, états, toasts) — `MOB-SYS`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| MOB-SYS-01 | i18n — 3 langues | — | 1. Basculer FR/EN/AR | — | UI traduite intégralement, polices adaptées (Gabarito / IBM Plex Arabic) | Haute | ☐ |
| MOB-SYS-02 | RTL en arabe | Langue AR | 1. Parcourir les écrans | — | Mise en page miroir, alignements/marges inversés | Haute | ☐ |
| MOB-SYS-03 | Persistance de la langue | Langue changée | 1. Relancer l'app | — | Langue restaurée (loadSavedLanguage) | Moyenne | ☐ |
| MOB-SYS-04 | Persistance du thème | Thème changé | 1. Relancer l'app | — | Thème restauré (AsyncStorage) | Moyenne | ☐ |
| MOB-SYS-05 | Thème système | Mode « Système » | 1. Changer le thème de l'OS | — | App suit le thème système | Basse | ☐ |
| MOB-SYS-06 | Devise DZD | Montants partout | 1. Vérifier le formatage | — | DZD cohérent | Moyenne | ☐ |
| MOB-SYS-07 | États vides (EmptyState) | Listes vides | 1. Parcourir panier/commandes/wishlist/adresses vides | — | EmptyState approprié | Moyenne | ☐ |
| MOB-SYS-08 | États d'erreur + réessai | Couper le réseau | 1. Déclencher un fetch | — | ErrorState avec « Réessayer » | Moyenne | ☐ |
| MOB-SYS-09 | Mode hors-ligne (cache) | Données déjà chargées | 1. Activer le mode avion 2. Reparcourir | — | Données en cache servies (Apollo), pas de crash | Moyenne | ☐ |
| MOB-SYS-10 | Toasts (succès/erreur/avertissement) | — | 1. Déclencher chaque type | — | Toast correct, auto-disparition | Basse | ☐ |
| MOB-SYS-11 | Error boundary global | Forcer une erreur composant | 1. Déclencher | — | UI de repli + « Réessayer » (AppErrorBoundary) | Basse | ☐ |
| MOB-SYS-12 | Bouton retour matériel (Android) | Android | 1. Appuyer « retour » à divers endroits | — | Comportement cohérent (canGoBack avant back) | Moyenne | ☐ |
| MOB-SYS-13 | Gestes (swipe carrousels) | — | 1. Balayer onboarding/images produit | — | Gestes fluides (gesture-handler) | Basse | ☐ |

---

## Annexe — Parcours de bout en bout (smoke test mobile)

1. **Nouvel utilisateur** : Splash → Onboarding → inscription → accueil → recherche → PDP →
   variante → ajout panier (MiniCart) → checkout (nouvelle adresse + wilaya + livraison +
   COD + revue) → confirmation → détail commande.
2. **Utilisateur fidèle** : connexion → onglet Commandes → ouvrir une commande → **Recommander
   (reorder)** → panier → checkout avec **adresse sauvegardée** → confirmation.
3. **Robustesse** : rejouer le parcours 1 en **arabe (RTL)**, tester **stale session** au
   checkout, et le **reorder partiel** (article indisponible).
