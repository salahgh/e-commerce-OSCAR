# Recette utilisateur (UAT) — Application mobile OSCAR Fashion

Application mobile client (Expo / React Native, Expo Router + Apollo + i18next).
Lancement : `cd apps/mobile && npx expo start` (Expo Go ou build de développement).
API Shop : `http://localhost:8085/shop-api`.

> Conventions, légendes (Priorité / Statut) et environnement : voir [`README.md`](./README.md).
> Statut par défaut : ☐ À tester.

## Synthèse d'exécution (campagne du 2026-06-07 — via Expo Web)

**Méthode :** l'app étant Expo SDK 55 + `react-native-web`, elle a été lancée en **mode web**
(`EXPO_PUBLIC_GRAPHQL_URL=http://localhost:8085/shop-api npx expo start --web --port 3002`) et
pilotée par automatisation navigateur (Playwright), comme le frontend. C'est la seule voie
d'exécution **automatisée et live** dans cet environnement (Windows, sans émulateur).

**2 correctifs nécessaires pour rendre l'UAT web possible (appliqués) :**
1. **CORS** — le backend n'autorise pas l'origine Expo `:8090` → lancé sur **`:3002`** (déjà
   dans la liste CORS). *(Alternative : ajouter le port à la config CORS du backend.)*
2. **`SecureStore` natif** — `AuthContext.tsx` lisait/supprimait le token via `expo-secure-store`
   brut (indisponible sur web → « Error loading auth state: TypeError »). Corrigé pour passer par
   le wrapper `SecureStorage` (fallback `localStorage` sur web), cohérent avec l'apollo client.

**Cas vérifiés OK (cœur de parcours) :** onboarding (slides FR + Passer→tabs), accueil (5 onglets,
badge panier, barre de recherche, onglets catégories, « Nouvel arrivage », **« Vus récemment »**),
PDP (nom/prix DZD/stock, **sélecteurs Taille+Couleur**, quantité, produits associés), ajout au panier
→ **MiniCart**, prix en **DZD**. La session panier est partagée avec le frontend (cookie).

**Anomalies relevées :**
1. **⚠️ i18n — noms en anglais** : noms produits/catégories (« Cotton Scarf », « Men/Women/Kids »)
   et certains libellés UI (« Select Size », « Select Color ») restent en **anglais** en FR — **même
   cause que le frontend** : l'apollo client mobile n'envoie pas `?languageCode=` à Vendure.
2. **⚠️ MiniCart — prix non formatés** : montants bruts (« 3290 ») sans suffixe « DZD » ni séparateur.
3. **⚠️ Libellé bouton login** : « Cliquez ici pour continuer » au lieu de « Se connecter ».
4. **ℹ️ Limite web** : `/login` redirige parfois vers l'accueil (quirk de routage expo-router web).

**Couverture :** parcours cœur validé sur web (≈ onboarding/home/PDP/cart). L'infrastructure web est
prête pour exécuter le reste des 162 cas — **mais voir le SIGN-OFF ci-dessous** : la fidélité native
exige un appareil/émulateur réel.

---

## Synthèse — 2ᵉ passe approfondie (2026-06-07, Expo Web :3002 + Playwright)

**Méthode :** parcours complet **authentifié** piloté par Playwright sur le build web (`:3002`, backend
Vendure local `:8085`). Compte de test créé via l'app (`mobuat1@oscar.test`), **commande COD réelle
passée** (n° `UMH7XF9EDJP1TD5U`), parcours profil/adresses/commandes exercé. Backend **inchangé**
(périmètre mobile-only).

### Bilan
- ✅ **107/107 tests Jest** verts (21 suites) après corrections — aucune régression.
- ✅ **0 nouvelle erreur TypeScript** introduite (baseline pré-existante ~154 inchangée ; CI type-check non bloquant).
- ✅ Parcours d'achat **de bout en bout validé** : inscription → auto-login → PDP variantes → panier →
  checkout (adresse sauvegardée + wilaya + livraison + COD + revue) → **commande passée** → confirmation
  → détail commande.

### Bugs trouvés ET corrigés (cette passe)

| # | Sévérité | Problème | Correctif |
|---|----------|----------|-----------|
| 1 | Moyenne | **Messages de validation Yup en anglais** (login, register, reset, profil, adresse, checkout) dans une app FR | `src/utils/validation.ts` réécrit : messages résolus via i18n **au moment de la validation** (clés `validation.*` ajoutées en fr/en/ar) — suivent la langue active |
| 2 | Moyenne | **Libellés du formulaire d'adresse en anglais** ("Full Name", "Phone Number", "Address", "City", "Postal Code") — clés `checkout.*` manquantes (fallback EN) | Clés `checkout.fullName/phoneNumber/address/city/postalCode/...` ajoutées (fr/en/ar) — corrige aussi le checkout |
| 3 | Faible | **Prix sans séparateur de milliers** : « Vus récemment » / produits associés (`3150 DZD` au lieu de `3 150 DZD`) | `HorizontalProductRow.tsx` → `toLocaleString()` |
| 4 | Faible | **Prix PDP non formaté** (`3395 DZD`) | `app/products/[slug].tsx` → `toLocaleString()` |
| 5 | Faible | **Libellés PDP « Select Taille » / « Select Couleur »** ("Select" jamais traduit — clé dynamique impossible) | Clé interpolée `products.selectOption` (`{{option}}`) en fr/en/ar |
| 6 | Moyenne | **Prix panier non formatés** (lignes, Total, Total après réduction) | `app/(tabs)/cart.tsx` → `toLocaleString()` partout |
| 7 | Faible | **Coupon non normalisé** : `solde10` envoyé tel quel (devrait être MAJUSCULES) | `cart.tsx` → `.trim().toUpperCase()` |
| 8 | **Haute** | **Crash potentiel natif** : `{method.description && (…)}` rend un nœud texte si `description === ""` → « Unexpected text node … in `<View>` » (erreur dure sur natif) | `checkout/index.tsx` (livraison + paiement + éligibilité) et `[slug].tsx` (description) → ternaires `? … : null` |
| 9 | Moyenne | **Revue checkout (`OrderSummary`)** : prix ligne **vide** (lisait `item.subtotal` au lieu de `linePrice`), libellés EN ("Order Summary", "Qty:", "Size/Color"), format `6790.00` | `OrderSummary.tsx` corrigé (champ `linePrice`/`imageUrl`/`variantName`, `toLocaleString`, clés `checkout.orderSummary/subtotal/total/qty/size/color`) + `CartItem.tsx` (type étendu) |
| 10 | Moyenne | **Écran confirmation partiellement EN** ("Thank you for your order", "You can track…", "Go to Home") — clés manquantes | Clés `checkout.orderPlacedMessage/trackingInfo/goHome` ajoutées |
| 11 | **Haute** | **Liste + détail des commandes massivement en anglais** : statuts ("Payment Authorized"), « X orders », « X items », "Shipping/Payment Information", "Order Items/Summary", "Subtotal/Shipping/Total", "Qty:", "Last updated", "Paid on" + prix non formatés | `app/(tabs)/orders.tsx` & `app/orders/[id].tsx` : `getOrderStateInfo` localisé via `t` ; clés `orders.*` + `orders.states.*` (fr/en/ar) ; `toLocaleString()` partout |
| 12 | Faible | **Écran Paramètres** : "Select your preferred language", "Order Updates", "Promotions & Offers" en EN | Clés `profile.languageDesc/orderUpdates/promotions/newsletter` |
| 13 | Moyenne | **Écran Recherche entièrement en anglais** (anomalie A1 de la passe natif du 06-06) : "Search products…", "Recent/Popular Searches", "N results for …" + "for" codé en dur | Namespace `search.*` complet (fr/en/ar) + `common.clearAll` ; ligne résultats → `search.resultsFor` interpolée (`{{count}}`, `{{query}}`) |
| 14 | Faible | **Faute FR** « Tout les articles » (Explore) | `explore.allItems` → « Tous les articles » |
| 15 | Faible | **Prix wishlist non formaté** (`1598 DZD`) | `app/profile/wishlist.tsx` → `toLocaleString()` |

### Cas vérifiés ✅ sur web (par section)
- **§2 Auth :** MOB-AUTH-01 (login), -03 (validation FR), -04 (identifiants invalides → bannière),
  -05 (inscription), -06 (auto-login), -19 (route protégée → login), -20.
- **§3 Accueil/§4 Catalogue :** MOB-HOME-01/02/03/04/07/08, MOB-BR-01/02 (grille, filtre catégorie),
  -09/-10 (Explore + sous-catégories), -12/-13/-15/-16 (recherche FR).
- **§5 PDP :** MOB-PDP-01/04/05 (variantes taille+couleur, SKU/prix mis à jour), -06, -07 (MiniCart), -11.
- **§6 Panier :** MOB-CART-01 (MiniCart DZD), -02, -03 (vide), -04 (qté), -08 (coupon invalide FR),
  -09 (normalisation), -12 (→ checkout).
- **§7 Checkout :** MOB-CHK-01..24 (étapes, adresse sauvegardée auto, wilaya, livraison, COD, CIB/Baridimob
  « Bientôt », revue avec wilaya, **commande passée**).
- **§8 Confirmation :** MOB-CONF-01/02/03 (n° commande, lien détail).
- **§9 Commandes :** MOB-ORD-01..04, -07/-08/-09 (détail, statut localisé, paiement).
- **§10 Profil/Adresses/Paramètres :** MOB-PROF-01/02/03/04 (édition), -06/-07/-08/-09 (adresses CRUD),
  -12 (validation FR), -13 (changement de langue FR↔AR↔EN en direct).
- **§11 Wishlist :** MOB-WL-01 (affichage), -02 (retrait), -03 (état vide), -06 (vus récemment).
- **§12 Transverse :** MOB-SYS-01 (i18n FR/AR/EN), -06 (DZD), -07 (états vides — panier/wishlist/commandes).

### Limites du harnais web (à exécuter sur appareil — voir SIGN-OFF)
- **`Alert.alert` est un no-op sur react-native-web** → confirmations non testables sur web :
  **reorder** (MOB-REORD-01..04), **déconnexion** (MOB-AUTH-15/17), **suppression d'adresse** (MOB-PROF-10).
  La logique sous-jacente (`handleReorder`/`summarizeReorder`, `clearAuth`, delete mutation) est correcte
  et couverte par les tests unitaires.
- **RTL (MOB-SYS-02)** : le texte AR s'affiche bien, mais `I18nManager.forceRTL` ne **bascule pas la
  mise en page** sans reload sur web (en dev). Le miroir RTL a été **confirmé sur natif** (passe du 06-06).
- **Persistance de session (MOB-AUTH-14)** : sur natif OK (SecureStore + header `vendure-token` lisible) ;
  sur web le header custom n'est pas exposé en CORS → non persisté après reload (limite harnais, pas un bug app).
- **Routage web** : un deep-link direct vers `/login` ou une route protégée redirige vers l'accueil
  (quirk expo-router web) — contourné en naviguant par l'UI.

### Restant data/natif (non couvert)
- **MOB-CART-07 (coupon valide)** : aucun code promo seedé → mécanisme validé via le chemin invalide.
- **Couleurs (White/Blue/Navy)** & noms de méthode (« Standard Shipping », « cash-on-delivery ») : valeurs
  d'option/back-office non traduites — nécessiterait une table de correspondance (hors périmètre mobile-only).
- Splash animé, onboarding (routes désactivées), deep links reset/verify, KeyboardAvoidingView,
  pull-to-refresh, safe-area/encoche, partage natif, offline/réseau, retour matériel Android, gestes,
  toasts/animations natifs, thème système OS.

---

## 🔒 SIGN-OFF — Exécution sur appareil physique + Maestro (requis avant release)

Cette campagne a été menée en **Expo Web** pour l'automatisation. **React Native Web ≠ natif** :
disposition, gestes, navigation par stack/tabs, et modules natifs peuvent différer. Les résultats
« OK » ci-dessus valident la **logique applicative et le câblage API**, **pas** le rendu/comportement
natif. **Avant toute mise en production, la recette mobile doit être rejouée sur appareil physique.**

**Cas NON couvrables sur web — à exécuter obligatoirement sur appareil/émulateur :**
`MOB-ONB-01` (splash animé), `MOB-AUTH-12/13` (deep links reset/verify), `MOB-AUTH-14` (persistance
`SecureStore` natif), `MOB-AUTH-21` (KeyboardAvoidingView), `MOB-HOME-09/10` (pull-to-refresh, safe
area/encoche), `MOB-PDP-09` (partage natif), `MOB-CART-11`, `MOB-SYS-08/09` (erreur réseau / mode
avion / offline), `MOB-SYS-12` (bouton retour matériel Android), `MOB-SYS-13` (gestes/swipe), et
toute vérification de **toasts natifs, animations, et safe-area**.

**Procédure de sign-off recommandée (appareil physique + Maestro) :**
1. **Appareils cibles** : ≥ 1 iOS + ≥ 1 Android, dont **un appareil à encoche** (safe area). Build
   de dev via EAS ou Expo Go (SDK 55).
2. **API** : pointer `EXPO_PUBLIC_GRAPHQL_URL` vers l'**IP LAN de l'hôte** (ex. `http://192.168.x.x:8085/shop-api`)
   — `localhost`/`10.0.2.2` selon device/émulateur ; ajouter cette origine au CORS backend.
3. **Maestro** (test E2E mobile natif) : installer Maestro, écrire des flows YAML pour les **3 smoke
   tests** de l'annexe (nouvel utilisateur, utilisateur fidèle + reorder, robustesse RTL/stale-session),
   exécutables sur simulateur **et** appareil. Maestro gère nativement les gestes, le clavier, les
   permissions et les états — ce que le web ne peut pas.
4. **Manuel ciblé** : exécuter à la main les cas natifs listés ci-dessus + un passage **RTL arabe**
   complet et le **reorder partiel** (article indisponible), sur device réel.
5. **Critère de sortie** : 0 cas **Haute** en ❌/⛔ sur appareil physique, smoke tests Maestro verts
   sur iOS **et** Android.

> En résumé : le web a permis de **dérisquer la logique** rapidement et de corriger 2 bugs de support
> web ; **la validation de release reste conditionnée à un passage Maestro + manuel sur appareils réels.**

## Synthèse — 3ᵉ passe : appareil/émulateur natif + Maestro (2026-06-08)

**Méthode :** exécution **native** réelle (pas web). Maestro 2.6.0 pilote l'app **dev-client**
`com.oscar.fashion`. L'appareil physique (OnePlus PLC110) **bloque le driver d'instrumentation
Maestro** (analyseur de risque d'installation OnePlus) → bascule sur **émulateur Android x86_64
(API 36)**. Backend Vendure local `:8085`, `adb reverse 8085/8081`, Metro dev-client.

> Note build : l'APK debug pré-existant ne contenait que `arm64-v8a` → **crash** sur émulateur
> x86_64 (`UnsatisfiedLinkError` dans `MainApplication.onCreate`). Recompilé en x86_64
> (`gradlew :app:assembleDebug -PreactNativeArchitectures=x86_64`).

### Audit i18n statique exhaustif — bugs trouvés ET corrigés (mobile)

Détection par scan automatisé : (a) toutes les clés `t('…')` utilisées dans le code vs présentes
dans `fr/ar/en.json` ; (b) littéraux codés en dur dans `<Text>`, `placeholder`, `title`, `label`.

| # | Sévérité | Problème | Correctif |
|---|----------|----------|-----------|
| 1 | **Haute** | **74 clés `t()` manquantes** dans les 3 locales → l'app affichait le **fallback anglais** en FR et AR. Modules entiers non traduits : **paiement** (namespace `payment` inexistant, ~25 clés), **timeline/cartes de commande** (~15), **changement de mot de passe** (~12), reset/verify, checkout (cas limites), descriptions de notifications, `common.yes/no/ok`. | +95 clés FR/AR/EN ajoutées (parité 560 = 560 = 560). Scan « clés manquantes » : **0**. |
| 2 | **Haute** | **`FilterBottomSheet` entièrement en anglais** (non traduit) : titres de sections (Filters, Sort By, Price Range, Size, Color, Other), libellés de tri (Newest First…), tranches de prix, cases « In Stock Only »/« On Sale », bouton « Apply Filters ». | Câblé sur `t()` (clés `filters.*` + interpolation des tranches de prix). |
| 3 | Moyenne | Littéraux codés en dur : « See All » (×2 home), « Delete » (swipe panier), « Out of Stock », « Pinch to zoom », « No options found » + placeholder « Search… »/« Select an option » (`Select`), titres d'en-tête auth. | Remplacés par `common.viewAll/delete/search`, `products.outOfStock/pinchToZoom`, etc. |
| 4 | **Haute** | **Changement de langue non persisté + RTL non appliqué** : `settings.tsx` appelait `i18n.changeLanguage()` **brut** (commentaire « // Optionally save to storage ») au lieu du wrapper `changeLanguage` de `src/i18n` qui écrit dans AsyncStorage **et** gère `forceRTL`+reload. La langue se réinitialisait au redémarrage et l'arabe ne basculait pas en RTL depuis les Paramètres. | `settings.tsx` utilise le wrapper ; le wrapper reload aussi en dev (`DevSettings.reload`) + `allowRTL`. |
| 5 | Moyenne | Messages `AuthContext` (succès/échec inscription, reset, vérif, renvoi) **codés en anglais** ; écrasaient le fallback localisé des écrans (`result.message ?? t(...)`). | Localisés via l'instance `i18n.t()`. |

> **Limite data connue (inchangée)** : noms de **produits** en anglais même en AR/FR — le client
> Apollo envoie pourtant `?languageCode=` ; c'est le **catalogue Vendure** qui n'a pas de traductions
> produit AR/FR (problème de seed, hors périmètre i18n UI). Les **catégories** sont traduites.

> **Note** : `FilterBottomSheet` (corrigé ci-dessus, bug #2) n'est **monté nulle part** dans les
> écrans (`<FilterBottomSheet` absent de `app/`) — c'est du code mort ; le filtre **réel** à l'écran
> est la barre de chips inline de `app/products/index.tsx` (`filters.classement/prix/taille`),
> déjà traduite. Le correctif reste valable si le composant est un jour monté.

### Résultats exécution émulateur (Maestro 2.6.0 + captures)

- ✅ **107/107 tests Jest** verts (21 suites) après tous les correctifs i18n — **0 régression**.
- ✅ Scans statiques : **0 clé `t()` manquante**, **0 littéral codé en dur**, parité locales 560=560=560.
- ✅ **Rendu natif vérifié (FR)** : onboarding (4 slides traduits + « Commencer »), accueil
  (« Rechercher dans OSCAR », « Nouvel arrivage », **« Voir tout »** = correctif #3, chips catégories
  « Tout/femme/homme/enfant »), **prix DZD formatés** (« 2 730 DZD »), écran login **intégralement
  traduit** y compris le message d'erreur d'identifiants. Logo OSCAR stylisé = branding (pas un bug).
- ⏳ **Device-pending** (vérifié statiquement, non rejoué visuellement) : écrans **authentifiés**
  (paramètres/langue, paiement, commandes, changement de mot de passe) et **passage RTL arabe** —
  bloqués par (a) l'analyseur de risque OnePlus qui empêche le driver Maestro sur l'appareil physique,
  (b) la corruption de `inputText` Maestro sur les `TextInput` RN (login non automatisable de façon
  fiable). Les clés AR existent (parité) ; `forceRTL` validé précédemment sur appareil physique.

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
| MOB-ONB-08 | Textes localisés | Langue ≠ FR | 1. Changer la langue puis relancer | EN / AR | Onboarding traduit | Basse | ✅ FR vérifié (4 slides : Découvrez la mode / Paiement sécurisé / Livraison rapide + « Commencer ») ; EN/AR ⏳ |

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
| MOB-HOME-01 | Barre d'onglets (5 tabs) | — | 1. Parcourir Accueil/Explore/Commandes/Panier/Profil | — | Navigation correcte, onglet actif teinté | Haute | ✅ 5 onglets (Accueil/Catégorie/Commandes/Panier/Profil), actif teinté |
| MOB-HOME-02 | Badge panier sur l'onglet | Articles au panier | 1. Ajouter des articles | — | Badge rouge avec compteur (max « 99+ ») | Moyenne | ✅ badge passe à 1 puis 2 après ajout |
| MOB-HOME-03 | En-tête de recherche | — | 1. Toucher la barre | — | Navigation vers `/search` | Moyenne | ✅ barre « Rechercher dans OSCAR » présente |
| MOB-HOME-04 | Onglets de catégories dynamiques | Collection « banners » peuplée | 1. Observer les CategoryTabs | — | Catégories chargées (hors « banners ») | Moyenne | ⚠️ chargées (Tout/Men/Women/Kids/Accessories) mais **noms en anglais** (cf. i18n) |
| MOB-HOME-05 | Carrousel de bannières | Bannières présentes | 1. Balayer le carrousel | — | Paging + points dynamiques | Moyenne | ☐ |
| MOB-HOME-06 | Tap bannière | — | 1. Toucher une bannière | — | Navigation `/products?category={slug}` | Moyenne | ☐ |
| MOB-HOME-07 | Section « Nouveautés » + « Voir tout » | — | 1. Cliquer « Voir tout » | — | Navigation `/products?sort=newest` | Basse | ✅ section « Nouvel arrivage » + « Voir tout » présents |
| MOB-HOME-08 | Rangée « Récemment consultés » | Produits déjà ouverts | 1. Observer la rangée | — | Produits récents affichés | Basse | ✅ « Vus récemment » affiche le produit ouvert (Cotton Scarf) |
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
| MOB-PDP-01 | Affichage de la fiche | Produit existant | 1. Ouvrir `/products/[slug]` | — | Nom, prix, carrousel d'images, options | Haute | ✅ nom, prix DZD, SKU, « En stock », description, options, related (noms en anglais — cf. i18n) |
| MOB-PDP-02 | Carrousel d'images | ≥ 2 images | 1. Balayer | — | Pagination horizontale | Moyenne | ☐ |
| MOB-PDP-03 | Prix soldé + badge remise | Produit en promo | 1. Observer | — | Prix barré + % de remise | Moyenne | ☐ |
| MOB-PDP-04 | Statut de stock | Variantes variées | 1. Observer | rupture | Indicateur « rupture » correct | Moyenne | ☐ |
| MOB-PDP-05 | Sélection des options (taille/couleur) | Produit à variantes | 1. Choisir chaque option | M / Rouge | Variante correspondante auto-sélectionnée | Haute | ✅ « Select Size » (One Size) + « Select Color » (Gray/Navy/Beige/Red/Black) ; bouton activé après sélection |
| MOB-PDP-06 | Sélecteur de quantité | — | 1. +/− | — | Quantité ajustée (min 1) | Moyenne | ✅ sélecteur quantité présent (1, +/−) |
| MOB-PDP-07 | Ajout au panier | Options choisies | 1. « Ajouter au panier » | — | État de chargement, toast succès, MiniCart | Haute | ✅ ajout → **MiniCart** « Ajouté au panier (2) » avec récap |
| MOB-PDP-08 | Toggle favori (wishlist) | — | 1. Toucher le cœur | — | Cœur rempli/vidé, produit ajouté/retiré | Moyenne | ☐ |
| MOB-PDP-09 | Partage natif | — | 1. Toucher « Partager » | — | Feuille de partage (nom, URL, prix) | Basse | ☐ |
| MOB-PDP-10 | Guide des tailles | — | 1. Ouvrir SizeGuideModal | — | Modale guide des tailles | Basse | ☐ |
| MOB-PDP-11 | Suivi « Récemment consultés » | — | 1. Ouvrir une fiche 2. Revenir à l'accueil | — | Produit ajouté à la rangée récente | Basse | ☐ |
| MOB-PDP-12 | Produits associés | — | 1. Observer la section | — | Suggestions affichées | Basse | ☐ |

## 6. Panier, coupons & MiniCart — `MOB-CART`

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| MOB-CART-01 | MiniCart après ajout | Ajout depuis PDP | 1. Ajouter au panier | — | Bottom sheet : récap + « Continuer »/« Voir le panier » | Moyenne | ✅ bottom sheet « Ajouté au panier (2) » : articles, sous-total, « Passer la commande »/« Voir le panier ». ⚠️ prix non formatés (« 3290 » sans DZD) |
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

## 13. i18n granulaire par écran (FR/AR/EN) & UI/UX natif — `MOB-I18N` / `MOB-UX`

> Nouvelle section (passe 2026-06-08). Cible : **complétude i18n par écran dans les 3 langues**
> et **fidélité UI/UX native** (RTL miroir, formatage, états, safe-area). Exécution : émulateur
> + Maestro (captures comparées) sauf mention « manuel ».

### 13.1 Complétude i18n par écran — aucune chaîne anglaise codée en dur (FR & AR)

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| MOB-I18N-01 | Accueil — « Voir tout » traduit | Langue FR puis AR | 1. Ouvrir l'accueil 2. Observer les en-têtes de sections | FR / AR | « Voir tout » / « عرض الكل » (jamais « See All ») | Haute | ✅ FR (émulateur, capture `t01-home-fr`) ; AR ⏳ |
| MOB-I18N-02 | Filtres — panneau 100 % traduit | Écran Explore/Produits | 1. Ouvrir le panneau Filtres 2. Parcourir toutes les sections | FR / AR | Titres, options de tri, tranches de prix, « En stock uniquement », « En promotion », bouton Appliquer — tous traduits | Haute | ☐ |
| MOB-I18N-03 | PDP — « Rupture de stock » / « Pincez pour zoomer » | Produit en rupture / galerie | 1. Ouvrir un PDP 2. Zoomer la galerie | FR / AR | Libellés traduits (pas « Out of Stock »/« Pinch to zoom ») | Moyenne | ☐ |
| MOB-I18N-04 | Panier — swipe « Supprimer » traduit | Panier non vide | 1. Balayer un article | FR / AR | « Supprimer » / « حذف » | Moyenne | ☐ |
| MOB-I18N-05 | Paiement — écrans statut/passerelle traduits | Tunnel paiement CIB/Baridimob | 1. Lancer un paiement 2. Parcourir succès/échec/annulé | FR / AR | Titres et boutons (« Réessayer », « Voir la commande »…) traduits (namespace `payment`) | Haute | ☐ |
| MOB-I18N-06 | Commandes — timeline & cartes traduites | Commande existante | 1. Ouvrir le détail d'une commande | FR / AR | « Suivi de la commande », étapes (Passée/Confirmée/Expédiée/Livrée), « Voir les détails » traduits | Haute | ☐ |
| MOB-I18N-07 | Changement de mot de passe — formulaire traduit | Connecté | 1. Profil → Changer le mot de passe | FR / AR | Tous les libellés/placeholders + règles traduits | Moyenne | ☐ |
| MOB-I18N-08 | Paramètres — descriptions notifications traduites | Connecté | 1. Profil → Paramètres | FR / AR | « Mises à jour de commande », « Promotions », « Newsletter » + descriptions traduites | Basse | ☐ |
| MOB-I18N-09 | Sélecteur de paiement — descriptions traduites | Checkout, étape paiement | 1. Observer CIB/BaridiMob/COD | FR / AR | Descriptions traduites (`checkout.*Description`) | Moyenne | ☐ |
| MOB-I18N-10 | Auth — titres/messages d'erreur traduits | Déconnecté | 1. Reset/verify avec token invalide | FR / AR | Messages localisés (pas « Invalid or expired link »/« Verification failed ») | Moyenne | ☐ |

### 13.2 Changement de langue & RTL

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| MOB-I18N-11 | Bascule de langue depuis Paramètres | Connecté | 1. Paramètres 2. Choisir EN puis AR puis FR | — | UI re-rendue dans la langue ; passage AR ⇄ LTR déclenche un reload | Haute | ☐ |
| MOB-I18N-12 | **Persistance** de la langue au redémarrage | Langue changée vers AR | 1. Changer en AR 2. Tuer + relancer l'app | — | App **rouvre en AR** (régression du bug #4 corrigé) | Haute | ☐ |
| MOB-I18N-13 | RTL — miroir de mise en page | Langue AR | 1. Parcourir accueil/PDP/panier/profil | — | Alignements, nav, chevrons, marges **inversés** ; pas de texte tronqué/chevauché | Haute | ☐ |
| MOB-I18N-14 | RTL — barre d'onglets inversée | Langue AR | 1. Observer la tab bar | — | Ordre des onglets miroir (Accueil à droite) | Moyenne | ☐ |

### 13.3 UI/UX natif (formatage, états, safe-area, gestes)

| ID | Titre | Préconditions | Étapes | Données de test | Résultat attendu | Priorité | Statut |
|----|-------|---------------|--------|-----------------|------------------|----------|--------|
| MOB-UX-01 | Prix DZD formatés partout | — | 1. Accueil, PDP, panier, MiniCart, checkout, commandes | — | Séparateur de milliers + « DZD » cohérent (pas « 3290 ») | Haute | ✅ accueil FR (« 2 730 DZD », « 1 890 DZD ») ; autres écrans ⏳ |
| MOB-UX-02 | États vides (panier/commandes/wishlist) | Listes vides | 1. Ouvrir chaque liste vide | — | EmptyState illustré + CTA | Moyenne | ☐ |
| MOB-UX-03 | Skeletons de chargement | Réseau lent | 1. Ouvrir accueil/PDP | — | Skeletons puis contenu (pas d'écran vide) | Basse | ☐ |
| MOB-UX-04 | Safe-area / encoche | Émulateur sans barre matérielle | 1. Vérifier en-têtes & tab bar | — | Pas de contenu sous la barre d'état / gestes | Moyenne | ☐ |
| MOB-UX-05 | Bouton retour matériel Android | Android | 1. Naviguer puis « retour » | — | Retour cohérent (canGoBack) | Moyenne | ☐ |
| MOB-UX-06 | Logo OSCAR sur écrans auth | Écran login | 1. Observer le logo | — | Logo rendu correctement (pas de lettres chevauchées) | Basse | ☐ |
| MOB-UX-07 | Saisie clavier (login/checkout) | Formulaires | 1. Focus champs | — | KeyboardAvoidingView, pas de champ masqué | Moyenne | ☐ |

---

## Annexe — Parcours de bout en bout (smoke test mobile)

1. **Nouvel utilisateur** : Splash → Onboarding → inscription → accueil → recherche → PDP →
   variante → ajout panier (MiniCart) → checkout (nouvelle adresse + wilaya + livraison +
   COD + revue) → confirmation → détail commande.
2. **Utilisateur fidèle** : connexion → onglet Commandes → ouvrir une commande → **Recommander
   (reorder)** → panier → checkout avec **adresse sauvegardée** → confirmation.
3. **Robustesse** : rejouer le parcours 1 en **arabe (RTL)**, tester **stale session** au
   checkout, et le **reorder partiel** (article indisponible).
