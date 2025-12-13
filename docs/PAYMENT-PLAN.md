# OSCAR Fashion - Plan de Paiement Détaillé
## Version Révisée avec Backoffice

---

## Résumé Exécutif

| Élément | Montant |
|---------|---------|
| **Budget Total** | **700,000 DZD** |
| **Acompte reçu** | 50,000 DZD |
| **Restant à payer** | 650,000 DZD |
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

### Jalon 2: Frontend Catalogue + Backoffice Setup

| Composant | Détail | Montant |
|-----------|--------|---------|
| Frontend | Catalogue produits complet | 80,000 DZD |
| Backoffice | Setup + Dashboard + Auth | 50,000 DZD |
| Mobile | Setup + Navigation de base | 20,000 DZD |
| **TOTAL JALON 2** | | **150,000 DZD** |

**Livrables Frontend (Next.js):**
- [ ] Page d'accueil avec produits vedettes
- [ ] Page catalogue avec filtres (catégorie, taille, couleur, prix)
- [ ] Page détail produit complète
- [ ] Recherche produits
- [ ] Pagination et tri
- [ ] Responsive design (mobile-first)
- [ ] Support RTL (Arabe)
- [ ] i18n (FR/AR/EN)

**Livrables Backoffice (React):**
- [ ] Setup projet (Vite + Tailwind + Apollo)
- [ ] Layout principal (Sidebar, TopBar)
- [ ] Authentification admin (Login/Logout)
- [ ] Dashboard avec KPIs
  - [ ] Nombre de commandes
  - [ ] Chiffre d'affaires
  - [ ] Nouveaux clients
  - [ ] Produits en stock faible
- [ ] Graphiques (ventes, catégories)
- [ ] Liste commandes récentes

**Livrables Mobile (Expo):**
- [ ] Setup projet Expo
- [ ] Configuration Apollo Client
- [ ] Navigation (tabs + stack)
- [ ] Écran d'accueil basique
- [ ] Liste produits (squelette)

**Critères d'acceptation:**
- [ ] Navigation catalogue fluide sur web
- [ ] Filtres fonctionnels
- [ ] Dashboard backoffice avec données réelles
- [ ] App mobile démarre sans erreur

---

### Jalon 3: Panier + Gestion Commandes Backoffice

| Composant | Détail | Montant |
|-----------|--------|---------|
| Frontend | Panier + Checkout (sans paiement) | 60,000 DZD |
| Backoffice | Gestion Produits + Commandes | 50,000 DZD |
| Mobile | Catalogue + Panier | 40,000 DZD |
| **TOTAL JALON 3** | | **150,000 DZD** |

**Livrables Frontend:**
- [ ] Panier (ajout, modification, suppression)
- [ ] Persistance panier (localStorage + API)
- [ ] Page récapitulatif panier
- [ ] Processus checkout (étapes 1-3)
  - [ ] Informations client
  - [ ] Adresse de livraison (wilayas)
  - [ ] Récapitulatif commande
- [ ] Authentification client (inscription/connexion)
- [ ] Espace client (profil, historique)

**Livrables Backoffice:**
- [ ] **Gestion Produits**
  - [ ] Liste produits (DataGrid avec filtres)
  - [ ] Création produit (formulaire complet)
  - [ ] Modification produit
  - [ ] Upload images (drag & drop)
  - [ ] Gestion catégories
  - [ ] Import/Export CSV
- [ ] **Gestion Commandes**
  - [ ] Liste commandes (filtres par statut, date)
  - [ ] Détail commande
  - [ ] Modification statut commande
  - [ ] Timeline historique
  - [ ] Notes admin

**Livrables Mobile:**
- [ ] Catalogue produits complet
- [ ] Filtres et recherche
- [ ] Page détail produit
- [ ] Panier fonctionnel
- [ ] Authentification client

**Critères d'acceptation:**
- [ ] Passage de commande complet (hors paiement)
- [ ] Modification statut commande depuis backoffice
- [ ] Panier mobile synchronisé

---

### Jalon 4: Paiements Intégrés (Sandbox)

| Composant | Détail | Montant |
|-----------|--------|---------|
| Backend | Intégration passerelles paiement | 40,000 DZD |
| Frontend | UI paiement + confirmation | 30,000 DZD |
| Mobile | Paiement mobile | 30,000 DZD |
| **TOTAL JALON 4** | | **100,000 DZD** |

**Livrables Backend:**
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

**Livrables Frontend:**
- [ ] Étape paiement checkout
- [ ] Sélection mode de paiement
- [ ] Formulaire carte CIB
- [ ] Intégration Baridimob
- [ ] Page confirmation commande
- [ ] Email confirmation (template)

**Livrables Mobile:**
- [ ] Écran paiement
- [ ] Deep linking retour paiement
- [ ] Confirmation commande

**Critères d'acceptation:**
- [ ] Paiement CIB fonctionnel (sandbox)
- [ ] Paiement Baridimob fonctionnel (sandbox)
- [ ] COD fonctionnel
- [ ] Emails envoyés après commande

---

### Jalon 5: Livraison Finale + UAT

| Composant | Détail | Montant |
|-----------|--------|---------|
| Backoffice | Clients, Rapports, Paramètres | 50,000 DZD |
| Frontend | Finitions + Optimisations | 40,000 DZD |
| Mobile | Finitions + Build | 30,000 DZD |
| Intégration | Tests E2E + Déploiement | 30,000 DZD |
| **TOTAL JALON 5** | | **150,000 DZD** |

**Livrables Backoffice:**
- [ ] **Gestion Clients**
  - [ ] Liste clients avec filtres
  - [ ] Détail client (infos, historique)
  - [ ] Statistiques client
- [ ] **Rapports & Statistiques**
  - [ ] Rapport ventes (jour/semaine/mois)
  - [ ] Top produits vendus
  - [ ] Analyse par wilaya
  - [ ] Export PDF/CSV
- [ ] **Paramètres**
  - [ ] Configuration générale
  - [ ] Gestion utilisateurs admin
  - [ ] Rôles et permissions
  - [ ] Configuration emails

**Livrables Frontend:**
- [ ] SEO optimisé (meta, sitemap)
- [ ] Performance (lazy loading, images optimisées)
- [ ] PWA capabilities
- [ ] Page contact
- [ ] Pages légales (CGV, CGU, confidentialité)
- [ ] Correction bugs UAT

**Livrables Mobile:**
- [ ] Build iOS (TestFlight)
- [ ] Build Android (APK/AAB)
- [ ] Performance optimisée
- [ ] Correction bugs UAT

**Livrables Intégration:**
- [ ] Déploiement VPS (Vendure + Next.js)
- [ ] Configuration Nginx + SSL
- [ ] Tests E2E complets
- [ ] Documentation technique
- [ ] Guide utilisateur admin

**Critères d'acceptation:**
- [ ] Tests UAT validés par le client
- [ ] Performance Lighthouse > 80
- [ ] Zéro bug critique
- [ ] Documentation complète livrée

---

### Jalon 6: Support Post-Livraison

| Détail | Montant |
|--------|---------|
| **Support 2 semaines après mise en production** | **100,000 DZD** |

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

| Phase | Jalon | Montant | Statut | Date Prévue |
|-------|-------|---------|--------|-------------|
| 0 | Acompte (Signature contrat) | 50,000 DZD | ✅ Payé | - |
| 1 | Backend Auth + Produits | 150,000 DZD | ✅ Payé | - |
| 2 | Frontend Catalogue + Backoffice Setup | 150,000 DZD | ⏳ En cours | Semaine 4 |
| 3 | Panier + Gestion Commandes | 150,000 DZD | 🔜 À venir | Semaine 8 |
| 4 | Paiements Intégrés (Sandbox) | 100,000 DZD | 🔜 À venir | Semaine 10 |
| 5 | Livraison Finale + UAT | 150,000 DZD | 🔜 À venir | Semaine 12 |
| 6 | Support Post-Livraison | 100,000 DZD | 🔜 À venir | Semaine 14 |
| | **TOTAL** | **700,000 DZD** | | |

---

## Récapitulatif Financier

### Paiements Reçus
| Date | Description | Montant |
|------|-------------|---------|
| - | Acompte signature | 50,000 DZD |
| - | Jalon 1 - Backend | 150,000 DZD |
| | **Total Reçu** | **200,000 DZD** |

### Paiements Restants
| Jalon | Montant |
|-------|---------|
| Jalon 2 | 150,000 DZD |
| Jalon 3 | 150,000 DZD |
| Jalon 4 | 100,000 DZD |
| Jalon 5 | 150,000 DZD |
| Jalon 6 | 100,000 DZD |
| **Total Restant** | **650,000 DZD** |

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

**Document généré le**: Décembre 2025
**Version**: 2.0
**Validité**: 30 jours
