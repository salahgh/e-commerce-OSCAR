# Backend - Budget Détaillé
## OSCAR Fashion E-commerce Platform

---

## 1. Résumé Exécutif

**Durée**: 16 semaines (4 mois)
**Heures totales**: 1,920 heures
**Taux horaire moyen**: 185 DZD/heure
**Coût total**: 355,200 DZD

---

## 2. Composition de l'Équipe

### 2.1 Ressources Humaines

| Rôle | Nombre | Taux/heure | Allocation | Heures | Coût |
|------|--------|------------|------------|--------|------|
| Tech Lead Junior | 1 | 185 | 25% | 160 | 29,600 |
| Développeur Backend Mid-Level | 2 | 185 | 100% | 1,280 | 236,800 |
| Développeur Backend Junior | 1 | 185 | 50% | 320 | 59,200 |
| DevOps Junior | 1 | 185 | 15% | 96 | 17,760 |
| Testeur | 1 | 185 | 20% | 128 | 23,680 |

**Sous-total RH**: 367,040 DZD

### 2.2 Répartition Moyenne

Nous utilisons une **équipe junior/mid-level** avec un taux uniforme de **185 DZD/heure**, permettant un budget optimisé tout en garantissant la qualité du livrable.

---

## 3. Détail par Phase

### Phase 1: Initialisation & Sécurité (Semaines 1-2)

| Activité | Heures | Coût |
|----------|--------|------|
| Architecture & Setup (Semaine 1) | 120 | 22,200 |
| - Validation architecture | 24 | 4,440 |
| - Conception BD | 32 | 5,920 |
| - Setup environnements | 24 | 4,440 |
| - Configuration CI/CD | 24 | 4,440 |
| - Documentation | 16 | 2,960 |
| | | |
| Initialisation Projet & Sécurité (Semaine 2) | 120 | 22,200 |
| - Setup Spring Boot | 16 | 2,960 |
| - Configuration BD | 16 | 2,960 |
| - Implémentation JWT | 40 | 7,400 |
| - Configuration CORS & sécurité | 24 | 4,440 |
| - Setup Swagger | 16 | 2,960 |
| - Tests | 8 | 1,480 |

**Total Phase 1**: 240 heures = **44,400 DZD**

---

### Phase 2: Gestion Utilisateurs (Semaines 3-4)

| Activité | Heures | Coût |
|----------|--------|------|
| Authentification (Semaine 3) | 120 | 22,200 |
| - Entités & repositories | 16 | 2,960 |
| - Services auth (register, login) | 32 | 5,920 |
| - Validation & sécurité | 24 | 4,440 |
| - API endpoints | 24 | 4,440 |
| - Tests | 24 | 4,440 |
| | | |
| Profil & Récupération MDP (Semaine 4) | 120 | 22,200 |
| - Service récupération MDP | 24 | 4,440 |
| - Configuration emails | 24 | 4,440 |
| - Gestion adresses | 32 | 5,920 |
| - API endpoints | 24 | 4,440 |
| - Tests | 16 | 2,960 |

**Total Phase 2**: 240 heures = **44,400 DZD**

---

### Phase 3: Catalogue Produits (Semaines 5-7)

| Activité | Heures | Coût |
|----------|--------|------|
| Entités & Repository (Semaine 5) | 120 | 22,200 |
| - Modèle de données | 40 | 7,400 |
| - Relations JPA | 24 | 4,440 |
| - Support multilingue | 24 | 4,440 |
| - Migrations BD | 16 | 2,960 |
| - Seeding données | 16 | 2,960 |
| | | |
| API CRUD Produits (Semaine 6) | 120 | 22,200 |
| - Services métier | 32 | 5,920 |
| - DTOs & validation | 16 | 2,960 |
| - API publique | 40 | 7,400 |
| - Recherche & filtrage | 24 | 4,440 |
| - Tests | 8 | 1,480 |
| | | |
| Admin Produits & Stock (Semaine 7) | 120 | 22,200 |
| - API admin CRUD | 32 | 5,920 |
| - Upload images | 24 | 4,440 |
| - Gestion stock | 24 | 4,440 |
| - Autorisation | 16 | 2,960 |
| - Tests | 24 | 4,440 |

**Total Phase 3**: 360 heures = **66,600 DZD**

---

### Phase 4: Panier & Commandes (Semaines 8-10)

| Activité | Heures | Coût |
|----------|--------|------|
| Module Panier (Semaine 8) | 120 | 22,200 |
| - Entités & repositories | 16 | 2,960 |
| - Logique panier | 32 | 5,920 |
| - Gestion invités | 24 | 4,440 |
| - API endpoints | 32 | 5,920 |
| - Tests | 16 | 2,960 |
| | | |
| Module Commandes (Semaine 9) | 120 | 22,200 |
| - Entités & repositories | 20 | 3,700 |
| - Logique création commande | 40 | 7,400 |
| - Gestion statuts | 24 | 4,440 |
| - API endpoints | 24 | 4,440 |
| - Tests | 12 | 2,220 |
| | | |
| Admin Commandes (Semaine 10) | 120 | 22,200 |
| - API admin | 32 | 5,920 |
| - Gestion annulation | 24 | 4,440 |
| - Notifications | 24 | 4,440 |
| - Logs & historique | 24 | 4,440 |
| - Tests | 16 | 2,960 |

**Total Phase 4**: 360 heures = **66,600 DZD**

---

### Phase 5: Paiements & Intégrations (Semaines 11-13)

| Activité | Heures | Coût |
|----------|--------|------|
| Infrastructure Paiement (Semaine 11) | 120 | 22,200 |
| - Entités & repositories | 16 | 2,960 |
| - Abstraction payment gateway | 24 | 4,440 |
| - Implémentation COD | 16 | 2,960 |
| - API endpoints | 32 | 5,920 |
| - Logs & sécurité | 16 | 2,960 |
| - Tests | 16 | 2,960 |
| | | |
| Intégration CIB (Semaine 12) | 120 | 22,200 |
| - Étude API CIB | 16 | 2,960 |
| - Implémentation gateway | 40 | 7,400 |
| - Gestion callbacks | 32 | 5,920 |
| - Tests sandbox | 24 | 4,440 |
| - Documentation | 8 | 1,480 |
| | | |
| Intégration Baridimob (Semaine 13) | 120 | 22,200 |
| - Étude API Baridimob | 16 | 2,960 |
| - Implémentation gateway | 40 | 7,400 |
| - Gestion callbacks | 24 | 4,440 |
| - Système remboursement | 24 | 4,440 |
| - Tests sandbox | 16 | 2,960 |

**Total Phase 5**: 360 heures = **66,600 DZD**

---

### Phase 6: Notifications & Reporting (Semaines 14-15)

| Activité | Heures | Coût |
|----------|--------|------|
| Système Notifications (Semaine 14) | 120 | 22,200 |
| - Service emails | 24 | 4,440 |
| - Templates multilingues | 24 | 4,440 |
| - Service SMS | 24 | 4,440 |
| - Service Push (FCM) | 24 | 4,440 |
| - API notifications | 16 | 2,960 |
| - Tests | 8 | 1,480 |
| | | |
| Reporting & iText PDF (Semaine 15) | 120 | 22,200 |
| - Configuration iText 7 | 16 | 2,960 |
| - Templates PDF | 32 | 5,920 |
| - API statistiques | 40 | 7,400 |
| - Export CSV/Excel | 16 | 2,960 |
| - Tests | 16 | 2,960 |

**Total Phase 6**: 240 heures = **44,400 DZD**

---

### Phase 7: Synchronisation ERP/WMS (Semaine 16)

| Activité | Heures | Coût |
|----------|--------|------|
| Intégration Systèmes Existants | 120 | 22,200 |
| - Analyse API ERP/WMS | 24 | 4,440 |
| - Service synchronisation | 40 | 7,400 |
| - Sync produits & stocks | 24 | 4,440 |
| - Push commandes | 16 | 2,960 |
| - Gestion erreurs & retry | 8 | 1,480 |
| - Tests intégration | 8 | 1,480 |

**Total Phase 7**: 120 heures = **22,200 DZD**

---

## 4. Coûts Récapitulatifs par Phase

| Phase | Semaines | Heures | Coût | % Total |
|-------|----------|--------|------|---------|
| Phase 1: Init & Sécurité | 1-2 | 240 | 44,400 | 12.5% |
| Phase 2: Utilisateurs | 3-4 | 240 | 44,400 | 12.5% |
| Phase 3: Catalogue | 5-7 | 360 | 66,600 | 18.75% |
| Phase 4: Panier & Commandes | 8-10 | 360 | 66,600 | 18.75% |
| Phase 5: Paiements | 11-13 | 360 | 66,600 | 18.75% |
| Phase 6: Notifications & Reporting | 14-15 | 240 | 44,400 | 12.5% |
| Phase 7: Synchronisation | 16 | 120 | 22,200 | 6.25% |

**Total Développement**: 1,920 heures = **355,200 DZD**

---

## 5. Coûts d'Infrastructure & Outils

### 5.1 Licences & Outils (Setup initial + 4 mois)

| Item | Coût Mensuel | Durée | Coût Total |
|------|--------------|-------|------------|
| VS Code / IntelliJ Community | Gratuit | - | 0 |
| GitHub (plan gratuit) | Gratuit | - | 0 |
| SonarQube (optionnel) | Gratuit | - | 0 |
| Postman (plan gratuit) | Gratuit | - | 0 |
| iText Community | Gratuit | - | 0 |

**Sous-total Outils**: 0 DZD

---

### 5.2 Infrastructure (Développement & Staging)

| Item | Coût Mensuel | Durée | Coût Total |
|------|--------------|-------|------------|
| VPS Dev+Staging (2GB RAM) | 1,500 | 4 mois | 6,000 |
| PostgreSQL (inclus dans VPS) | 0 | - | 0 |
| Stockage local VPS | 0 | - | 0 |
| Domain & SSL (Let's Encrypt) | 500 | 1 an | 500 |
| GitHub Actions (CI/CD gratuit) | 0 | - | 0 |

**Sous-total Infrastructure**: 6,500 DZD

---

### 5.3 Services Externes (Développement)

| Service | Coût Setup | Coût Mensuel | Durée | Coût Total |
|---------|------------|--------------|-------|------------|
| SMTP (Gmail/plan gratuit) | 0 | Gratuit | - | 0 |
| SMS Gateway (Dev - minimal) | 2,000 | 500 | 4 mois | 4,000 |
| CIB Sandbox | Gratuit | 0 | - | 0 |
| Baridimob Sandbox | Gratuit | 0 | - | 0 |

**Sous-total Services**: 4,000 DZD

---

## 6. Budget Total Backend

| Catégorie | Coût | % Total |
|-----------|------|---------|
| **Développement (RH)** | 355,200 | 97.1% |
| **Licences & Outils** | 0 | 0% |
| **Infrastructure** | 6,500 | 1.8% |
| **Services Externes** | 4,000 | 1.1% |
| **TOTAL BACKEND** | **365,700** | **100%** |

---

## 7. Provision pour Risques & Imprévus

Une **marge de contingence de 10%** est incluse pour couvrir:
- Retards d'intégration avec API tierces
- Modifications de scope mineures
- Bugs critiques nécessitant intervention supplémentaire
- Complexité technique imprévue

**Contingence (10%)**: 36,570 DZD

---

## 8. Budget Total Recommandé

| Item | Coût |
|------|------|
| Coût de base | 365,700 |
| Contingence (10%) | 36,570 |
| **TOTAL RECOMMANDÉ** | **402,270 DZD** |

---

## 9. Paiement Échelonné (Recommandation)

| Jalon | % | Montant | Date |
|-------|---|---------|------|
| Signature contrat | 20% | 73,140 | Semaine 0 |
| Fin Phase 2 (Auth complète) | 20% | 73,140 | Semaine 4 |
| Fin Phase 4 (Commandes OK) | 25% | 91,425 | Semaine 10 |
| Fin Phase 5 (Paiements intégrés) | 20% | 73,140 | Semaine 13 |
| Livraison finale & tests | 15% | 54,855 | Semaine 16 |

**Total**: 365,700 DZD

---

## 10. Coûts Post-Livraison (Non inclus)

### Support & Maintenance (Mensuel)
- Support niveau 1 (bugs critiques): 15,000/mois
- Maintenance corrective: 10,000/mois
- Évolutions mineures: 20,000/mois
- Total: **45,000 DZD/mois**

### Infrastructure Production (Mensuel)
- Serveur production (VPS 4GB): 8,000/mois
- Base de données production: 0 (inclus)
- Stockage: 2,000/mois
- Monitoring & logs: 1,000/mois
- Backup & sécurité: 2,000/mois
- Total: **13,000 DZD/mois**

---

## 11. ROI & Justification

### Pourquoi ce budget?

1. **Équipe optimisée**: Développeurs junior/mid-level avec encadrement technique, permettant un coût maîtrisé
2. **Complexité technique**:
   - GraphQL avec SPQR pour API moderne
   - Intégrations bancaires algériennes (CIB, Baridimob)
   - Synchronisation temps réel avec ERP/WMS
   - Système de paiement sécurisé
   - Architecture scalable
3. **Budget optimisé**: Utilisation d'outils open source, infrastructure cloud économique, équipe efficace
4. **Qualité assurée**: Tests, sécurité renforcée, documentation complète
5. **Délais réalistes**: 16 semaines permettant un développement soigné

### Stratégie de coûts
- **Taux horaire**: 185 DZD/heure (équipe junior/mid-level)
- **Outils gratuits**: VS Code, GitHub, iText Community, Postman
- **Infrastructure économique**: VPS partagé, services cloud gratuits
- **Focus sur l'essentiel**: Pas de over-engineering

---

## 12. Conditions & Hypothèses

### Inclus dans le budget:
- Développement selon spécifications
- Tests (unitaires, intégration, API)
- Documentation technique
- Formation des administrateurs (2 jours)
- Support durant les 2 premières semaines post-livraison

### Non inclus:
- Infrastructure production (client)
- Licences production (Jasper Reports commercial si nécessaire)
- Formation utilisateurs finaux
- Contenu (photos produits, descriptions)
- Support au-delà de 2 semaines
- Modifications majeures de scope

### Hypothèses critiques:
1. API ERP/WMS documentée et accessible
2. Accès aux sandboxes CIB/Baridimob sous 2 semaines
3. Client fournit credentials et infos bancaires en temps voulu
4. Validation client sous 3 jours ouvrables max
5. Équipe disponible à 100% (pas de turn-over)

---

**Version**: 1.0
**Date**: Novembre 2025
**Validité**: 60 jours
**Statut**: Estimation détaillée
