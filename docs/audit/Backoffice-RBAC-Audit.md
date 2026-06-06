# Audit RBAC — Back-Office OSCAR

Audit des **privilèges (permissions) et rôles** : sont-ils tous câblés ? Toutes les actions
sont-elles protégées par une permission ? Et conformité à la règle **« désactiver, ne pas masquer »**.

> Date : 2026-06-06 · Périmètre : `apps/backoffice/src` · Méthode : lecture du code + cartographie
> (routes, `PermissionGate`, `usePermissions`, `useMutation`) sur les 31 fichiers de `pages/`.

## Note importante sur la sécurité des données
Toutes les mutations passent par l'**Admin API Vendure**, où chaque resolver est protégé par `@Allow`.
**Les données sont donc protégées côté serveur** quoi qu'il arrive : un utilisateur sans droit qui
clique sur une action reçoit `FORBIDDEN`. Cet audit porte sur la couche **UI** — éviter de présenter
des actions actives qui échoueront, et garantir une **désactivation** cohérente.

---

## Architecture des permissions (4 couches)

| Couche | Fichier | État |
|--------|---------|------|
| Type `Permission` (union) | `config/permissions.config.ts` | ⚠️ manque `CreateSettings`/`DeleteSettings` (présents dans l'enum Vendure) |
| Garde de **route/vue** : `PAGE_PERMISSIONS` + `<ProtectedRoute autoDetect>` | `permissions.config.ts`, `ProtectedRoute.tsx`, `App.tsx` | ✅ complète (voir Finding 1) |
| Garde d'**action** : `<PermissionGate>` / `<CrudPermissionGate>` | `components/auth/PermissionGate.tsx` | ❌ quasi inutilisée (voir Finding 2) |
| Hooks/Sélecteurs : `usePermissions`, `selectCurrentPermissions` | `hooks/usePermissions.ts`, `store/slices/authSlice.ts` | ✅ corrects (OR logic, SuperAdmin) |

---

## Finding 1 — Garde de **vue** (accès aux pages) : ✅ COMPLÈTE
Chaque route déclarée dans `App.tsx` possède une entrée dans `PAGE_PERMISSIONS`, et le parent
`<ProtectedRoute autoDetect>` la ré-évalue à chaque navigation. Un utilisateur sans droit de **voir**
une page est correctement redirigé vers `/access-denied`.

⚠️ Sous-réserve (Finding 4) : certaines routes de **formulaire d'édition** n'exigent que le droit
`Read` au lieu de `Update`.

---

## Finding 2 — Garde d'**action** : ❌ LARGEMENT ABSENTE (problème principal)

Sur **31 fichiers** de pages, seulement **4** protègent leurs boutons d'action par une permission :
`ProductList`, `AssetList`, `FacetList`, `RoleList` (toutes en `disableMode` — ✅ conforme).
**~20 fichiers déclenchent des mutations sans aucun contrôle de permission UI.**

### Pages dont les actions NE SONT PAS protégées

| Page | Actions non gardées (mutations) | Permission attendue |
|------|--------------------------------|---------------------|
| `orders/OrderDetail.tsx` | transition état, annuler, régler/annuler paiement, régler remboursement, note | `UpdateOrder` |
| `orders/OrderActionDialogs.tsx` | remboursement, paiement manuel, **modifier la commande** | `UpdateOrder` |
| `orders/FulfillmentDialog.tsx` | créer une expédition | `UpdateOrder` |
| `customers/CustomerDetail.tsx` | modifier/supprimer client, adresses, notes | `UpdateCustomer` / `DeleteCustomer` |
| `customers/CustomerList.tsx` | supprimer client | `DeleteCustomer` |
| `customers/CustomerDialogs.tsx` | créer client, créer/modifier adresse | `CreateCustomer` / `UpdateCustomer` |
| `categories/CategoryList.tsx` | supprimer (+ en masse), modifier collection | `Delete/UpdateCollection` |
| `categories/CategoryDetail.tsx` | créer/modifier/déplacer/dupliquer collection | `Create/UpdateCollection` |
| `facets/FacetDetail.tsx` | créer/modifier facette + valeurs, supprimer valeurs | `Create/Update/DeleteFacet` |
| `promotions/PromotionList.tsx` | supprimer, (dés)activer promotion | `Delete/UpdatePromotion` |
| `settings/Settings.tsx` | maj paiement/livraison, **reindex**, jobs | `Update*` / `UpdateSettings` |
| `settings/sections/ChannelSettings.tsx` | créer/modifier/supprimer canal | `Create/Update/DeleteChannel` |
| `settings/sections/ZoneSettings.tsx` | créer/modifier/supprimer zone, membres | `Create/Update/DeleteZone` |
| `settings/sections/TaxSettings.tsx` | créer/modifier/supprimer taux & catégories de taxe | `*TaxRate` / `*TaxCategory` |
| `settings/sections/PaymentMethodCreateModal.tsx` | créer méthode de paiement | `CreatePaymentMethod` |
| `settings/sections/ShippingMethodCreateModal.tsx` | créer méthode de livraison | `CreateShippingMethod` |
| `users/UserList.tsx` | supprimer administrateur | `DeleteAdministrator` |
| `users/UserDetail.tsx` | supprimer administrateur | `DeleteAdministrator` |
| `assets/AssetDetail.tsx` | modifier/supprimer ressource | `Update/DeleteAsset` |

> Conséquence : un utilisateur ayant seulement `ReadOrder` ouvre une commande et voit **tous** les
> boutons d'action actifs ; au clic → erreur `FORBIDDEN`. (Avant le correctif récent de l'error-link,
> cela le **déconnectait** ; désormais cela échoue silencieusement — mais l'UI reste trompeuse.)

### Pages protégées au niveau **route** (donc OK sans garde d'action séparée)
`ProductCreate` (`/products/new` → `CreateCatalog`), `ProductEdit` (`/products/:id/edit` →
`UpdateCatalog`), `UserForm`, `RoleForm` : l'accès au formulaire exige déjà la bonne permission, donc
le bouton « Enregistrer » est implicitement protégé. ⚠️ exceptions au Finding 4.

---

## Finding 3 — Permissions **incohérentes** dans les pages déjà gardées

| Page | Garde actuelle | Devrait être |
|------|----------------|--------------|
| `assets/AssetList.tsx` | `CreateCatalog` / `UpdateCatalog` / `DeleteCatalog` | `anyOf [Create/Update/DeleteAsset, *Catalog]` — la route exige `ReadAsset` ; un admin `CreateAsset` (sans `Catalog`) voit le bouton **désactivé à tort** |
| `facets/FacetList.tsx` | `Create/Update/DeleteCatalog` | `anyOf [*Facet, *Catalog]` — route = `ReadFacet` |
| `products/ProductList.tsx` | `Create/Update/DeleteCatalog` | OK en pratique, mais idéalement `anyOf [*Product, *Catalog]` |

(Même classe de bug que le menu latéral « Médias » corrigé précédemment : la garde UI utilise une
permission différente de l'opération réelle.)

---

## Finding 4 — Routes de **formulaire d'édition** sous-protégées (`Read` au lieu de `Update`)

| Route | Exige aujourd'hui | Devrait exiger (édition) |
|-------|-------------------|--------------------------|
| `/promotions/:id` (PromotionForm = édition) | `ReadPromotion` | `UpdatePromotion` |
| `/categories/:id` (CategoryDetail = édition) | `ReadCollection` | `UpdateCollection` |
| `/facets/:id` (FacetDetail = édition) | `ReadFacet` | `UpdateFacet` |

De plus, sur `ProductEdit`/`BulkOperations`, la route exige `UpdateCatalog` mais ces pages contiennent
aussi **supprimer** (`DeleteCatalog`) et **importer** (`CreateCatalog`) — ces boutons précis ne sont pas
re-gardés.

---

## Finding 5 — Rôles : tous les privilèges ne sont PAS attribuables via l'UI

`pages/users/RoleForm.tsx` définit **sa propre** liste de catégories (codée en dur), ≠ la liste
**complète** `PERMISSION_CATEGORIES` de `permissions.config.ts`.

**Permissions impossibles à accorder à un rôle via le formulaire** (absentes de RoleForm) :
`Channel`, `Country`, `Zone`, `Seller`, `StockLocation`, `System`, `Tag`, `TaxCategory`, `TaxRate`.

➡️ Paradoxe : les pages **Paramètres** permettent de gérer Zones / Taxes / Canaux / Paiements /
Livraison — qui exigent justement ces permissions — mais **aucun rôle non-SuperAdmin ne peut les
recevoir** depuis l'interface. Le `PERMISSION_CATEGORIES` complet existe déjà dans le config mais
RoleForm ne l'utilise pas.

---

## Finding 6 — Config morte / incomplète

- **`SIDEBAR_PERMISSIONS`** (`permissions.config.ts`) : **plus utilisé** (le Sidebar dérive désormais
  de `canAccessRoute`) et était incomplet → à supprimer.
- **`CRUD_PERMISSIONS`** : ne couvre que 7 entités (products, orders, customers, administrators,
  settings, promotions, assets). Manquent collections, facets, customerGroups, zones, taxes, etc.
  → `CrudPermissionGate` / `canCreate(entity)` sont **inopérants** pour ces entités. (À noter :
  `CrudPermissionGate` n'est **utilisé nulle part** actuellement.)
- **Type `Permission`** : manque `CreateSettings` / `DeleteSettings` (présents dans l'enum Vendure).

---

## Finding 7 — « Désactiver, ne pas masquer »

| Endroit | Comportement actuel | Conforme ? |
|---------|---------------------|-----------|
| `PermissionGate` (4 pages gardées) | `disableMode` → désactive + tooltip | ✅ |
| Sidebar (items) | désactive + tooltip (après correctif récent) | ✅ |
| Sidebar **Dashboard** | `hideWhenNoAccess: true` → **masqué** | ❌ à passer en désactivé |
| `RoleList` (rôles **système**) | boutons édit/suppr **masqués** (`!isSystemRole`) | ❌ à passer en désactivé (avec tooltip « rôle système ») |
| `PermissionGate` par défaut | `disableMode=false` → **masque** | ⚠️ tout nouvel usage doit passer `disableMode` |

---

## Plan de remédiation (priorisé)

**P1 — Protéger les actions manquantes (Finding 2), en `disableMode`.** Envelopper chaque bouton
create/update/delete des ~20 pages dans `<PermissionGate permission="…" disableMode>` avec la bonne
permission (cf. tableau). Plus gros chantier ; sans risque (purement additif côté UI).

**P2 — Corriger les incohérences (Finding 3)** : `AssetList`→Asset, `FacetList`→Facet (via `anyOf`
incluant l'umbrella Catalog).

**P3 — Câbler tous les privilèges dans les rôles (Finding 5)** : faire consommer à `RoleForm` le
`PERMISSION_CATEGORIES` + `PERMISSION_DESCRIPTIONS` du config (source unique). Débloque l'attribution
de toutes les permissions.

**P4 — Durcir les routes d'édition (Finding 4)** : `/…/:id` d'édition → permission `Update*`.

**P5 — Nettoyage (Finding 6)** : supprimer `SIDEBAR_PERMISSIONS` ; compléter `CRUD_PERMISSIONS` ;
aligner le type `Permission`.

**P6 — Conformité masquer→désactiver (Finding 7)** : Dashboard sidebar + rôles système.

**Défense en profondeur (optionnel)** : un wrapper `useGuardedMutation` qui bloque l'appel si la
permission manque, pour ne pas dépendre uniquement du gating visuel.
