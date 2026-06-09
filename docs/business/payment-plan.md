# OSCAR Fashion - Plan de Paiement Détaillé
## Version Révisée avec Backoffice

---

## Résumé Exécutif

| Élément | Montant |
|---------|---------|
| **Budget Total** | **700,000 DZD** |
| **Déjà payé** | 340,000 DZD |
| **Facturé (en attente de paiement)** | 280,000 DZD |
| **Restant à facturer** | 80,000 DZD |
| **Nombre de jalons** | 6 |

---

## Répartition par Composant

| Composant | Allocation | % du Total |
|-----------|------------|------------|
| Backend (Vendure) | 180,000 DZD | 26% |
| Frontend (Next.js) | 200,000 DZD | 29% |
| Backoffice (React) | 150,000 DZD | 21% |
| Mobile (Expo) | 120,000 DZD | 17% |
| Support & Déploiement | 50,000 DZD | 7% |
| **TOTAL** | **700,000 DZD** | **100%** |

---

## Plan de Paiement Détaillé

### Phase 0: Acompte ✅ PAYÉ

| Détail | Montant |
|--------|---------|
| **Signature du contrat** | **50,000 DZD** |
| **Statut** | ✅ Payé |

**Livrables:**
- ✅ Contrat signé
- ✅ Spécifications techniques validées
- ✅ Architecture approuvée
- ✅ Setup environnements de développement

---

### Jalon 1: Backend Auth + Produits ✅ PAYÉ

| Détail | Montant |
|--------|---------|
| **Backend fonctionnel (Auth + Catalogue)** | **150,000 DZD** |
| **Statut** | ✅ Payé |

**Livrables Backend (Vendure):**
- ✅ Installation et configuration Vendure
- ✅ Base de données PostgreSQL/MariaDB configurée
- ✅ Authentification Admin et Shop API
- ✅ Gestion des produits (CRUD complet)
- ✅ Gestion des catégories/collections
- ✅ Gestion des attributs (tailles, couleurs)
- ✅ Upload et gestion des images produits
- ✅ Champs personnalisés (nameFr, nameAr, etc.)
- ✅ API GraphQL Shop & Admin fonctionnelles
- ✅ Plugin OSCAR (custom fields, handlers)

**Critères d'acceptation:**
- ✅ GraphQL Playground accessible
- ✅ Création/modification produits via Admin API
- ✅ Récupération produits via Shop API
- ✅ Images uploadées et servies correctement

---

### Jalon 2: Backoffice Complet (React) ✅ PAYÉ

| Détail | Montant |
|--------|---------|
| **Backoffice admin complet** | **140,000 DZD** |
| **Statut** | ✅ Payé |

**Livrables:**
- [x] **Setup & Infrastructure**
  - [x] Setup projet (Vite + Tailwind + Apollo)
  - [x] Layout principal (Sidebar, TopBar)
  - [x] Authentification admin (Login/Logout)
  - [x] Gestion rôles et permissions (120+ permissions Vendure)
- [x] **Dashboard**
  - [x] KPIs (commandes, CA, clients, stock faible)
  - [x] Graphiques (ventes, catégories, top produits)
  - [x] Liste commandes récentes
  - [x] Alertes stock faible
- [x] **Gestion Produits**
  - [x] Liste produits (DataGrid avec filtres)
  - [x] Création produit (formulaire multi-étapes)
  - [x] Modification produit
  - [x] Upload images (drag & drop, 5 max)
  - [x] Gestion catégories (drag & drop sorting)
  - [x] Import/Export CSV
  - [x] Gestion variantes (taille, couleur, SKU)
- [x] **Gestion Commandes**
  - [x] Liste commandes (filtres par statut, date, wilaya)
  - [x] Détail commande complet
  - [x] Modification statut commande (transitions)
  - [x] Timeline historique
  - [x] Notes admin
  - [x] Impression bon de livraison (PDF)
- [x] **Gestion Clients**
  - [x] Liste clients avec filtres
  - [x] Détail client (infos, historique)
  - [x] Statistiques client (commandes, CA, dernière commande)
- [x] **Rapports & Statistiques**
  - [x] Rapport ventes (jour/semaine/mois)
  - [x] Top produits vendus
  - [x] Analyse par wilaya (58 wilayas)
  - [x] Export PDF/CSV
- [x] **Paramètres**
  - [x] Configuration générale
  - [x] Gestion utilisateurs admin
  - [x] Configuration emails (SMTP)
  - [x] Gestion promotions

**Critères d'acceptation:**
- [x] Dashboard avec données réelles
- [x] CRUD produits fonctionnel
- [x] Gestion commandes complète
- [x] Rapports exportables
- [x] Interface responsive

---

### Jalon 3: Frontend Complet (Next.js) — ✅ LIVRÉ & FACTURÉ

| Détail | Montant |
|--------|---------|
| **Frontend e-commerce complet** | **180,000 DZD** |
| **Statut** | 🧾 Livré — Facturé (FAC-OSCAR-2026-003) |

**Livrables:**
- [x] **Catalogue & Navigation**
  - [x] Page d'accueil avec produits vedettes
  - [x] Page catalogue avec filtres (catégorie, taille, couleur, prix)
  - [x] Page détail produit complète
  - [x] Recherche produits
  - [x] Pagination et tri (infinite scroll)
- [x] **Panier & Checkout**
  - [x] Panier (ajout, modification, suppression)
  - [x] Persistance panier (API backend)
  - [x] Page récapitulatif panier
  - [x] Processus checkout complet (4 étapes)
    - [x] Informations client
    - [x] Adresse de livraison (wilayas)
    - [x] Sélection mode de paiement
    - [x] Récapitulatif commande
  - [x] Page confirmation commande
- [x] **Authentification & Compte Client**
  - [x] Inscription / Connexion
  - [x] Espace client (profil, historique commandes)
  - [x] Gestion adresses
  - [x] Vérification email
- [x] **Paiement UI**
  - [x] Formulaire carte CIB
  - [x] Intégration Baridimob
  - [x] Option Cash on Delivery
- [x] **i18n & Accessibilité**
  - [x] Support multilingue (FR/AR/EN)
  - [x] Support RTL (Arabe)
  - [x] Responsive design (mobile-first)
- [x] **SEO & Performance**
  - [x] SEO optimisé (meta, sitemap, robots.txt)
  - [x] Performance (lazy loading, images optimisées)
  - [x] JSON-LD structured data
  - _(Finalisation PWA → déplacée au Jalon 5)_
- [x] **Pages Statiques**
  - [x] Page contact
  - [x] Pages légales (CGV, CGU, confidentialité)
  - [x] FAQ
  - [x] Guide des tailles
  - [x] À propos

**Critères d'acceptation:**
- [x] Navigation catalogue fluide
- [x] Filtres fonctionnels
- [x] Passage de commande complet
- [x] Responsive sur tous appareils
- _(Vérification Lighthouse > 80 → déplacée au Jalon 5)_

---

### Jalon 4: Mobile Complet (Expo/React Native) — ✅ LIVRÉ & FACTURÉ

| Détail | Montant |
|--------|---------|
| **Application mobile complète** | **100,000 DZD** |
| **Statut** | 🧾 Livré — Facturé (FAC-OSCAR-2026-004) |

**Livrables:**
- [x] **Setup & Navigation**
  - [x] Setup projet Expo (SDK 54)
  - [x] Configuration Apollo Client
  - [x] Navigation (tabs + stack via expo-router)
  - [x] Splash screen animé & icônes
- [x] **Catalogue**
  - [x] Écran d'accueil (hero, catégories, produits vedettes)
  - [x] Liste produits (infinite scroll)
  - [x] Filtres et recherche (debounced, historique)
  - [x] Page détail produit (carousel, variantes)
- [x] **Panier & Checkout**
  - [x] Panier fonctionnel (coupon codes)
  - [x] Processus checkout (4 étapes)
  - [x] Sélection adresse livraison
  - [x] Récapitulatif commande
- [x] **Authentification & Compte**
  - [x] Inscription / Connexion
  - [x] Profil utilisateur
  - [x] Historique commandes
  - [x] Gestion adresses
- [x] **Paiement**
  - [x] Écran paiement UI (CIB, Baridimob, COD)
  - [x] Confirmation commande (animation)
  - _(Deep linking retour paiement → déplacé au Jalon 5)_
- [x] **i18n**
  - [x] Support multilingue (FR/AR/EN)
  - [x] Support RTL (I18nManager)
- [x] **Build & Distribution**
  - [x] Build iOS configuré
  - [x] Build Android configuré (adaptive icons)
  - [x] Performance optimisée

**Critères d'acceptation:**
- [x] App démarre sans erreur
- [x] Panier synchronisé avec backend
- [x] Builds iOS et Android prêts
- _(Validation paiements en sandbox → déplacée au Jalon 5)_

---

### Jalon 5: Intégration & Déploiement

| Détail | Montant |
|--------|---------|
| **Backend Paiements + Tests + Déploiement** | **50,000 DZD** |

**Livrables Backend (Paiements):**
- [ ] Handler CIB (carte bancaire Algérie)
  - [ ] Intégration API SATIM
  - [ ] Vérification signature
  - [ ] Callback de confirmation
- [ ] Handler Baridimob
  - [ ] Intégration API Baridimob
  - [ ] QR Code génération
  - [ ] Vérification paiement
- [ ] Handler Cash on Delivery (COD)
- [ ] Gestion des remboursements
- [ ] Logs transactions

**Livrables Intégration:**
- [ ] Déploiement VPS (Vendure + Next.js + Backoffice)
- [ ] Configuration Nginx + SSL
- [ ] Tests E2E complets
- [ ] Documentation technique
- [ ] Guide utilisateur admin
- [ ] Finalisation PWA frontend (service worker, installabilité) — _reporté du Jalon 3_
- [ ] Vérification performance Lighthouse > 80 (web) — _reporté du Jalon 3_
- [ ] Deep linking retour paiement mobile (URLs réelles) — _reporté du Jalon 4_
- [ ] Validation paiements en sandbox (CIB/Baridimob) puis production — _reporté du Jalon 4_

**Critères d'acceptation:**
- [ ] Paiement CIB fonctionnel (sandbox puis production)
- [ ] Paiement Baridimob fonctionnel
- [ ] COD fonctionnel
- [ ] Emails envoyés après commande
- [ ] Tous les services déployés et accessibles

---

### Jalon 6: Support Post-Livraison

| Détail | Montant |
|--------|---------|
| **Support 2 semaines après mise en production** | **30,000 DZD** |

**Inclus:**
- [ ] Surveillance active de la production
- [ ] Correction bugs découverts post-lancement
- [ ] Optimisations mineures
- [ ] Support technique (email/téléphone)
- [ ] Accompagnement paiements production (CIB/Baridimob)
- [ ] Formation équipe admin (2 sessions)
- [ ] Documentation FAQ

**Critères de clôture:**
- [ ] 2 semaines écoulées sans bug critique
- [ ] Équipe formée et autonome
- [ ] Paiements en production validés
- [ ] Transfert complet des accès

---

## Calendrier de Paiement

| Phase | Jalon | Montant | Statut | Implémentation |
|-------|-------|---------|--------|----------------|
| 0 | Acompte (Signature contrat) | 50,000 DZD | ✅ Payé | - |
| 1 | Backend Complet | 150,000 DZD | ✅ Payé | ✅ 100% |
| 2 | **Backoffice Complet (React)** | 140,000 DZD | ✅ Payé | ✅ 100% |
| 3 | Frontend Complet (Next.js) | 180,000 DZD | 🧾 Facturé | ✅ 100% |
| 4 | Mobile Complet (Expo) | 100,000 DZD | 🧾 Facturé | ✅ 100% |
| 5 | Intégration & Déploiement | 50,000 DZD | 🔜 À venir | 🔜 Pending |
| 6 | Support Post-Livraison | 30,000 DZD | 🔜 À venir | 🔜 Pending |
| | **TOTAL** | **700,000 DZD** | | |

---

## Récapitulatif Financier

### Paiements Reçus
| Date | Description | Montant |
|------|-------------|---------|
| - | Acompte signature | 50,000 DZD |
| - | Jalon 1 - Backend Complet | 150,000 DZD |
| - | Jalon 2 - Backoffice Complet | 140,000 DZD |
| | **Total Reçu** | **340,000 DZD** |

### Facturé — En attente de paiement
| Facture | Jalon | Description | Montant |
|---------|-------|-------------|---------|
| FAC-OSCAR-2026-003 | Jalon 3 | Frontend Complet (Next.js) | 180,000 DZD |
| FAC-OSCAR-2026-004 | Jalon 4 | Mobile Complet (Expo) | 100,000 DZD |
| | | **Total Facturé** | **280,000 DZD** |

### Paiements Restants (à venir)
| Jalon | Description | Montant | Statut |
|-------|-------------|---------|--------|
| Jalon 5 | Intégration & Déploiement (paiements réels, déploiement) | 50,000 DZD | Pending |
| Jalon 6 | Support Post-Livraison | 30,000 DZD | Pending |
| | **Total Restant** | **80,000 DZD** | |

---

## Détail Technique par Composant

### Backend (Vendure) - 180,000 DZD
| Module | Allocation |
|--------|------------|
| Setup + Configuration | 30,000 |
| Auth + Utilisateurs | 25,000 |
| Produits + Catalogue | 35,000 |
| Commandes | 30,000 |
| Paiements (CIB, Baridimob, COD) | 40,000 |
| Plugin OSCAR | 20,000 |

### Frontend (Next.js) - 200,000 DZD
| Module | Allocation |
|--------|------------|
| Setup + Layout | 20,000 |
| Catalogue + Filtres | 40,000 |
| Panier + Checkout | 50,000 |
| Auth + Compte client | 30,000 |
| Paiement UI | 30,000 |
| i18n + RTL | 15,000 |
| SEO + Performance | 15,000 |

### Backoffice (React) - 150,000 DZD
| Module | Allocation |
|--------|------------|
| Setup + Layout + Auth | 20,000 |
| Dashboard | 25,000 |
| Gestion Produits | 35,000 |
| Gestion Commandes | 30,000 |
| Gestion Clients | 15,000 |
| Rapports + Exports | 15,000 |
| Paramètres + Users | 10,000 |

### Mobile (Expo) - 120,000 DZD
| Module | Allocation |
|--------|------------|
| Setup + Navigation | 15,000 |
| Catalogue + Filtres | 30,000 |
| Panier + Checkout | 35,000 |
| Auth + Compte | 20,000 |
| Paiement | 20,000 |

### Support & Déploiement - 50,000 DZD
| Élément | Allocation |
|---------|------------|
| Déploiement VPS | 15,000 |
| Tests E2E | 10,000 |
| Documentation | 10,000 |
| Formation | 15,000 |

---

## Conditions de Paiement

1. **Modalités**: Virement bancaire ou espèces
2. **Délai**: Paiement sous 7 jours après validation du jalon
3. **Validation**: Démonstration des livrables + accord écrit du client
4. **Retards**: Le travail sur le jalon suivant ne démarre qu'après paiement

---

## Garanties

1. **Garantie de fonctionnement**: 30 jours après livraison finale
2. **Code source**: Livré intégralement au client
3. **Documentation**: Technique et utilisateur incluse
4. **Transfert de compétences**: Formation équipe admin

---

## Exclusions

Les éléments suivants ne sont **PAS** inclus dans ce budget:

- Hébergement production (VPS/Cloud) après déploiement initial
- Frais des passerelles de paiement (CIB, Baridimob)
- Certificat SSL (Let's Encrypt gratuit utilisé)
- Maintenance après la période de support
- Évolutions fonctionnelles non spécifiées
- Frais App Store / Google Play (pour mobile)
- Traductions professionnelles
- Design graphique additionnel

---

## Signatures

| Partie | Nom | Signature | Date |
|--------|-----|-----------|------|
| Client | | | |
| Prestataire | | | |

---

**Document généré le**: Janvier 2026
**Version**: 5.0 - Frontend & Mobile livrés et facturés
**Dernière mise à jour**: 9 Juin 2026
**Validité**: 30 jours

---

## Notes de Version 5.0

- **Jalon 2 (Backoffice)** : payé ✅ → Total reçu porté à **340 000 DZD**.
- **Jalon 3 (Frontend)** et **Jalon 4 (Mobile)** : considérés livrés à 100 % et **facturés** (FAC-OSCAR-2026-003 et FAC-OSCAR-2026-004) → **280 000 DZD** en attente de règlement.
- Éléments non finalisés **déplacés vers le Jalon 5 (Intégration & Déploiement)** : finalisation PWA et vérification Lighthouse (web), deep linking retour paiement (mobile), validation des paiements en sandbox/production (CIB/Baridimob).
- Reste à facturer après J3/J4 : **80 000 DZD** (Jalons 5 et 6).

## Notes de Version 4.0

- Réorganisation: Backoffice devient Jalon 2 (était Jalon 3)
- Vérification complète de l'implémentation de chaque module
- **Backoffice**: 100% implémenté - Prêt pour facturation
- **Frontend**: 95% implémenté - PWA à finaliser
- **Mobile**: 98% implémenté - Deep linking paiement à configurer
