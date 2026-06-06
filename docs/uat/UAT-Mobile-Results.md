# Résultats UAT — Application mobile OSCAR Fashion

> Référentiel des cas : [`UAT-Mobile.md`](./UAT-Mobile.md).
> Ce document consigne les **résultats d'exécution** d'une passe de recette pilotée sur appareil réel.

## Environnement d'exécution

| Élément | Valeur |
|---------|--------|
| Date | 2026-06-06 |
| Appareil | OnePlus **PLC110** (Ace), Android — appareil physique |
| Type de build | **Dev client** (`expo run:android`), Expo SDK 55, RN 0.83.2 |
| Connexion Metro | USB (`adb reverse tcp:8081`) + Wi-Fi `192.168.100.52:8081` |
| Backend | Vendure local sur PC, joint via `adb reverse tcp:8085` → `http://localhost:8085/shop-api` |
| Données | Catalogue seedé (**101 produits**), **sans images** (voir anomalie A2) |
| Langue/Thème pendant la passe | **Arabe (RTL)**, thème **sombre** |
| Pilote de test | Automatisé (Claude Code via `adb` : taps + captures d'écran + dumps `uiautomator`) |
| Plateforme iOS | **Non disponible** (Android uniquement) |

### Légende des statuts

| Statut | Signification |
|--------|---------------|
| ✅ Réussi | Exécuté et conforme au résultat attendu |
| ❌ Échec | Exécuté, comportement non conforme |
| ⚠️ Partiel | Écran/élément observé et correct, mais interaction non exercée intégralement |
| ⛔ Bloqué | Non exécutable (précondition/donnée/plateforme indisponible) |
| ⏳ Non testé | Hors périmètre de cette passe (compte requis / effet de bord / non atteint) |

---

## Pré-requis corrigés avant la recette

Deux blocages empêchaient toute recette ; corrigés au cours de la session :

1. **Crash au démarrage** — `useThemeMode must be used inside <ThemeProvider>`. Cause : `LoadingSpinner`
   (styles thématisés) rendu hors du `ThemeProvider` dans le early-return de `app/_layout.tsx` ;
   l'error boundary expo-router crashait de la même façon. Correctif : `ThemeProvider` enveloppe
   désormais l'état de chargement.
2. **Aucun produit affiché** — l'app pointait vers l'URL placeholder `YOUR-RAILWAY-BACKEND.up.railway.app`
   (`app.json > extra.graphqlUrl`). Correctif : `apps/mobile/.env` (gitignoré) avec
   `EXPO_PUBLIC_GRAPHQL_URL=http://localhost:8085/shop-api` + tunnel `adb reverse tcp:8085`.

---

## Anomalies relevées pendant la passe

| Réf | Sévérité | Description | Cas impactés |
|-----|----------|-------------|--------------|
| **A1** | Moyenne | **Écran de recherche non localisé** : « Search products… », « Recent Searches », « Popular Searches », « Clear All », « N results for "…" » s'affichent en **anglais** alors que l'app est en arabe. Le reste (Accueil, PDP, MiniCart, Login) est bien traduit. | MOB-SYS-01, MOB-BR-12/16 |
| **A2** | Moyenne | **Images produits absentes** : cartes d'accueil en placeholder (blurhash), PDP avec icône « image cassée ». Les produits seedés semblent ne pas avoir d'asset (ou URL d'asset non résolue). | MOB-PDP-01/02, MOB-HOME, MOB-BR |
| **A3** | Faible (à confirmer) | **Error boundary fragile** : `AppErrorBoundary` dépend du `ThemeProvider` que expo-router monte *au-dessus* de lui → l'UI de repli peut elle-même crasher. Correctif recommandé (résoudre la couleur via `useColorScheme`/palette statique). | MOB-SYS-11 |

---

## Résultats par section

### 1. Splash & Onboarding — `MOB-ONB`

| ID | Statut | Observations |
|----|--------|--------------|
| MOB-ONB-01 | ⏳ Non testé | Splash traversé trop vite (animations désactivées pour la passe) ; non chronométré. |
| MOB-ONB-02..08 | ⛔ Bloqué | Onboarding non atteint : routes onboarding commentées dans `app/_layout.tsx` (`initialRouteName: 'splash'`, redirections ignorant l'onboarding). À reconfirmer si l'onboarding doit être actif. |

### 2. Authentification & gestion de session — `MOB-AUTH`

| ID | Statut | Observations |
|----|--------|--------------|
| MOB-AUTH-01 | ⚠️ Partiel | Écran login rendu et localisé (email/téléphone, mot de passe, « انقر هنا للاستمرار »). Connexion réelle non effectuée (pas de compte de test). |
| MOB-AUTH-02 | ⚠️ Partiel | Icône œil présente sur le champ mot de passe ; bascule non exercée. |
| MOB-AUTH-19 | ✅ Réussi | Tentative de checkout (non connecté) → **redirection vers `(auth)/login`**. |
| MOB-AUTH-03..18, 20, 21 | ⏳ Non testé | Nécessitent saisies/compte/deep links ; non exécutés (création de données / pas de compte vérifié provisionné). |
| MOB-AUTH-12, 13 | ⛔ Bloqué | Deep links reset/vérif e-mail : aucun token disponible. |

### 3. Navigation & Accueil — `MOB-HOME`

| ID | Statut | Observations |
|----|--------|--------------|
| MOB-HOME-01 | ✅ Réussi | 5 onglets (الرئيسية/الفئات/الطلبات/السلة/الملف), onglet actif teinté. |
| MOB-HOME-02 | ⏳ Non testé | Badge panier non vérifié explicitement après ajout. |
| MOB-HOME-03 | ✅ Réussi | Tap barre de recherche → écran `/search`. |
| MOB-HOME-04 | ✅ Réussi | CategoryTabs dynamiques chargés : `enfant`, `man`, `woman`, `الكل` (hors « banners »). |
| MOB-HOME-05 | ⛔ Bloqué | Pas de carrousel visible — collection « banners » apparemment vide. |
| MOB-HOME-06 | ⛔ Bloqué | Idem (aucune bannière à toucher). |
| MOB-HOME-07 | ⚠️ Partiel | Section « وصل حديثًا » (Nouveautés) + « عرض الكل » (Voir tout) présents ; cible de navigation non vérifiée. |
| MOB-HOME-08 | ✅ Réussi | Rangée « شوهدت مؤخرًا » (Récemment consultés) affichée (ex. *Midi Dress* 4 414 DZD). |
| MOB-HOME-09 | ⏳ Non testé | Pull-to-refresh non exercé. |
| MOB-HOME-10 | ⚠️ Partiel | Safe area correcte en haut (pas de chevauchement status bar) sur cet appareil. |

### 4. Catalogue / Explore / Recherche — `MOB-BR`

| ID | Statut | Observations |
|----|--------|--------------|
| MOB-BR-09 | ✅ Réussi | Explore : sidebar collections racines (`woman`, `man`, `enfant`, hors « banners »). |
| MOB-BR-10 | ⚠️ Partiel | « لا توجد فئات فرعية » (aucune sous-catégorie) affiché pour la collection sélectionnée — état vide correct. |
| MOB-BR-12 | ✅ Réussi | `/search` : auto-focus + clavier, requête debouncée. ⚠️ libellés en anglais (A1). |
| MOB-BR-13 | ✅ Réussi | Historique « Recent Searches » présent (ex. *Chemise*). |
| MOB-BR-15 | ✅ Réussi | « Popular Searches » : Veste/Pantalon/Chemise/Robe/Bijoux/Sac/Chaussures/Accessoires. |
| MOB-BR-16 | ✅ Réussi | « 2 results for "scarf" » → *Cashmere Scarf* (2 730 DZD), *Wool Scarf* (1 890 DZD). |
| MOB-BR-14 | ⚠️ Partiel | Bouton « Clear All » présent ; action non exercée. |
| MOB-BR-01..08, 11 | ⏳ Non testé | Liste `/products`, tris, filtres (prix/taille), chips, EmptyState : non exercés cette passe. |

### 5. Page produit & variantes — `MOB-PDP`

| ID | Statut | Observations |
|----|--------|--------------|
| MOB-PDP-01 | ✅ Réussi | Fiche *Cashmere Scarf* : nom, SKU (`SCARF-3-OS-GRA`), prix (2730 DZD), description, stock, quantité, CTA. UI bien localisée (arabe). |
| MOB-PDP-04 | ✅ Réussi | Statut stock « متوفر » (disponible) en vert. |
| MOB-PDP-06 | ⚠️ Partiel | Sélecteur quantité présent (qty=1, +/-) ; incrément non exercé. |
| MOB-PDP-07 | ✅ Réussi | « أضف إلى السلة » → MiniCart (article ajouté). |
| MOB-PDP-02 | ⛔ Bloqué | Pas de carrousel : aucune image (A2, icône image cassée). |
| MOB-PDP-05 | ⛔ Bloqué | Produit mono-variante (One Size / Gray) — pas d'options taille/couleur à tester. |
| MOB-PDP-03 | ⏳ Non testé | Nécessite un produit en promotion. |
| MOB-PDP-08, 09, 10, 12 | ⏳ Non testé | Wishlist, partage, guide tailles, produits associés : non exercés. |
| MOB-PDP-11 | ✅ Réussi | Suivi « récemment consultés » confirmé via MOB-HOME-08. |

### 6. Panier, coupons & MiniCart — `MOB-CART`

| ID | Statut | Observations |
|----|--------|--------------|
| MOB-CART-01 | ✅ Réussi | MiniCart : « تمت إضافة إلى السلة (1) », ligne « Cashmere Scarf — One Size / Gray ×1 », sous-total « المجموع الفرعي » 2730, boutons « تأكيد الطلب » / « عرض السلة ». |
| MOB-CART-02..12 | ⏳ Non testé | Écran panier plein non atteint (le bouton de confirmation mène au checkout → login en invité). Quantité/coupons/retrait non exercés. |

### 7. Tunnel de commande (checkout) — `MOB-CHK`

| ID | Statut | Observations |
|----|--------|--------------|
| MOB-CHK-01..26 | ⏳ Non testé | Requiert authentification ; le checkout en invité redirige vers login. **Place une commande réelle** → non exécuté sans autorisation explicite (effet de bord). |

### 8. Confirmation de commande — `MOB-CONF`

| ID | Statut | Observations |
|----|--------|--------------|
| MOB-CONF-01..06 | ⏳ Non testé | Dépend du passage effectif d'une commande (cf. MOB-CHK). |

### 9. Commandes & Réapprovisionnement — `MOB-ORD` / `MOB-REORD`

| ID | Statut | Observations |
|----|--------|--------------|
| MOB-ORD-01 | ⚠️ Partiel | Garde d'auth cohérente avec la redirection observée (MOB-AUTH-19) ; invite « Se connecter » non capturée directement. |
| MOB-ORD-02..11, MOB-REORD-01..04 | ⏳ Non testé | Requièrent compte connecté + commandes existantes. |

### 10. Profil, Adresses & Paramètres — `MOB-PROF`

| ID | Statut | Observations |
|----|--------|--------------|
| MOB-PROF-01 | ⏳ Non testé | Onglet Profil non connecté non capturé (attendu : invite de connexion). |
| MOB-PROF-02..17 | ⏳ Non testé | Requièrent authentification. |

### 11. Wishlist & Récemment consultés — `MOB-WL`

| ID | Statut | Observations |
|----|--------|--------------|
| MOB-WL-06 | ✅ Réussi | Récemment consultés OK (cf. MOB-HOME-08). |
| MOB-WL-01..05 | ⏳ Non testé | Wishlist non exercée (toggle cœur disponible mais non testé cette passe). |

### 12. Transverses — `MOB-SYS`

| ID | Statut | Observations |
|----|--------|--------------|
| MOB-SYS-01 | ⚠️ Partiel | App en arabe, majoritairement traduite — **sauf l'écran de recherche en anglais (A1)**. Polices arabes OK. |
| MOB-SYS-02 | ✅ Réussi | RTL : mises en page en miroir (recherche, en-têtes, listes, nav). |
| MOB-SYS-06 | ✅ Réussi | Devise DZD cohérente (2 730 / 1 890 / 4 414 DZD…). |
| MOB-SYS-10 | ⚠️ Partiel | Toast d'ajout au panier observé (via MiniCart) ; autres types non déclenchés. |
| MOB-SYS-11 | ❌ Échec | Error boundary global **défaillant** (UI de repli crashe — A3). Le crash initial venait de là ; correctif partiel appliqué (trigger), durcissement de l'`AppErrorBoundary` recommandé. |
| MOB-SYS-12 | ⚠️ Partiel | Retour matériel fonctionne dans l'app ; depuis un écran racine il sort de l'app (comportement à vérifier vs `canGoBack`). |
| MOB-SYS-03, 04, 05 | ⏳ Non testé | Persistance langue/thème & thème système : non exercés (relance après changement). Thème sombre actif observé. |
| MOB-SYS-07, 08, 09, 13 | ⏳ Non testé | EmptyState exhaustifs, erreurs réseau/offline, gestes : non exercés. |

---

## Synthèse

- **Exécutés & conformes (✅) :** parcours cœur sans authentification — Accueil, navigation onglets,
  Explore/collections, Recherche (+ historique/populaires/résultats), PDP, **ajout panier → MiniCart**,
  récemment consultés, redirection route protégée, RTL, devise DZD.
- **Anomalies :** A1 (recherche non localisée), A2 (images produits absentes), A3 (error boundary fragile).
- **Non couvert cette passe :** tout le périmètre **authentifié** (panier détaillé, checkout, confirmation,
  commandes/reorder, profil, adresses, wishlist), onboarding, deep links, iOS, et les scénarios
  réseau/persistance.

### Pour aller plus loin (passe suivante)
1. Fournir un **compte de test vérifié** (avec adresses sauvegardées + commandes) ou autoriser la
   **création de compte / passage de commande COD** → débloque MOB-AUTH/CHK/CONF/ORD/PROF/WL.
2. **Seeder des images** produit (et/ou un produit multi-variantes + un produit en promo) → débloque
   MOB-PDP-02/03/05 et lève A2.
3. **Peupler la collection « banners »** → débloque MOB-HOME-05/06.
4. Corriger **A1** (i18n écran recherche) et **A3** (durcir `AppErrorBoundary`).
