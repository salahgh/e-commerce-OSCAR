# Backend - Budget Détaillé
## OSCAR Fashion E-commerce Platform

---

## 1. Résumé Exécutif

**Durée**: 16 semaines (4 mois)
**Heures totales**: 1,920 heures
**Taux horaire**: 1,000 DZD/heure
**Coût total**: 1,920,000 DZD

---

## 2. Composition de l'Équipe

### 2.1 Ressources Humaines

| Rôle | Nombre | Taux/heure | Allocation | Heures | Coût |
|------|--------|------------|------------|--------|------|
| Architecte/Tech Lead | 1 | 1,500 | 25% | 160 | 240,000 |
| Développeur Backend Senior | 2 | 1,200 | 100% | 1,280 | 1,536,000 |
| Développeur Backend Junior | 1 | 800 | 50% | 320 | 256,000 |
| DevOps Engineer | 1 | 1,100 | 15% | 96 | 105,600 |
| QA/Test Engineer | 1 | 900 | 20% | 128 | 115,200 |

**Sous-total RH**: 2,252,800 DZD

### 2.2 Répartition Moyenne

Pour simplification budgétaire, nous utiliserons un **taux moyen pondéré de 1,000 DZD/heure** incluant tous les profils.

---

## 3. Détail par Phase

### Phase 1: Initialisation & Sécurité (Semaines 1-2)

| Activité | Heures | Coût |
|----------|--------|------|
| Architecture & Setup (Semaine 1) | 120 | 120,000 |
| - Validation architecture | 24 | 24,000 |
| - Conception BD | 32 | 32,000 |
| - Setup environnements | 24 | 24,000 |
| - Configuration CI/CD | 24 | 24,000 |
| - Documentation | 16 | 16,000 |
| | | |
| Initialisation Projet & Sécurité (Semaine 2) | 120 | 120,000 |
| - Setup Spring Boot | 16 | 16,000 |
| - Configuration BD | 16 | 16,000 |
| - Implémentation JWT | 40 | 40,000 |
| - Configuration CORS & sécurité | 24 | 24,000 |
| - Setup Swagger | 16 | 16,000 |
| - Tests | 8 | 8,000 |

**Total Phase 1**: 240 heures = **240,000 DZD**

---

### Phase 2: Gestion Utilisateurs (Semaines 3-4)

| Activité | Heures | Coût |
|----------|--------|------|
| Authentification (Semaine 3) | 120 | 120,000 |
| - Entités & repositories | 16 | 16,000 |
| - Services auth (register, login) | 32 | 32,000 |
| - Validation & sécurité | 24 | 24,000 |
| - API endpoints | 24 | 24,000 |
| - Tests | 24 | 24,000 |
| | | |
| Profil & Récupération MDP (Semaine 4) | 120 | 120,000 |
| - Service récupération MDP | 24 | 24,000 |
| - Configuration emails | 24 | 24,000 |
| - Gestion adresses | 32 | 32,000 |
| - API endpoints | 24 | 24,000 |
| - Tests | 16 | 16,000 |

**Total Phase 2**: 240 heures = **240,000 DZD**

---

### Phase 3: Catalogue Produits (Semaines 5-7)

| Activité | Heures | Coût |
|----------|--------|------|
| Entités & Repository (Semaine 5) | 120 | 120,000 |
| - Modèle de données | 40 | 40,000 |
| - Relations JPA | 24 | 24,000 |
| - Support multilingue | 24 | 24,000 |
| - Migrations BD | 16 | 16,000 |
| - Seeding données | 16 | 16,000 |
| | | |
| API CRUD Produits (Semaine 6) | 120 | 120,000 |
| - Services métier | 32 | 32,000 |
| - DTOs & validation | 16 | 16,000 |
| - API publique | 40 | 40,000 |
| - Recherche & filtrage | 24 | 24,000 |
| - Tests | 8 | 8,000 |
| | | |
| Admin Produits & Stock (Semaine 7) | 120 | 120,000 |
| - API admin CRUD | 32 | 32,000 |
| - Upload images | 24 | 24,000 |
| - Gestion stock | 24 | 24,000 |
| - Autorisation | 16 | 16,000 |
| - Tests | 24 | 24,000 |

**Total Phase 3**: 360 heures = **360,000 DZD**

---

### Phase 4: Panier & Commandes (Semaines 8-10)

| Activité | Heures | Coût |
|----------|--------|------|
| Module Panier (Semaine 8) | 120 | 120,000 |
| - Entités & repositories | 16 | 16,000 |
| - Logique panier | 32 | 32,000 |
| - Gestion invités | 24 | 24,000 |
| - API endpoints | 32 | 32,000 |
| - Tests | 16 | 16,000 |
| | | |
| Module Commandes (Semaine 9) | 120 | 120,000 |
| - Entités & repositories | 20 | 20,000 |
| - Logique création commande | 40 | 40,000 |
| - Gestion statuts | 24 | 24,000 |
| - API endpoints | 24 | 24,000 |
| - Tests | 12 | 12,000 |
| | | |
| Admin Commandes (Semaine 10) | 120 | 120,000 |
| - API admin | 32 | 32,000 |
| - Gestion annulation | 24 | 24,000 |
| - Notifications | 24 | 24,000 |
| - Logs & historique | 24 | 24,000 |
| - Tests | 16 | 16,000 |

**Total Phase 4**: 360 heures = **360,000 DZD**

---

### Phase 5: Paiements & Intégrations (Semaines 11-13)

| Activité | Heures | Coût |
|----------|--------|------|
| Infrastructure Paiement (Semaine 11) | 120 | 120,000 |
| - Entités & repositories | 16 | 16,000 |
| - Abstraction payment gateway | 24 | 24,000 |
| - Implémentation COD | 16 | 16,000 |
| - API endpoints | 32 | 32,000 |
| - Logs & sécurité | 16 | 16,000 |
| - Tests | 16 | 16,000 |
| | | |
| Intégration CIB (Semaine 12) | 120 | 120,000 |
| - Étude API CIB | 16 | 16,000 |
| - Implémentation gateway | 40 | 40,000 |
| - Gestion callbacks | 32 | 32,000 |
| - Tests sandbox | 24 | 24,000 |
| - Documentation | 8 | 8,000 |
| | | |
| Intégration Baridimob (Semaine 13) | 120 | 120,000 |
| - Étude API Baridimob | 16 | 16,000 |
| - Implémentation gateway | 40 | 40,000 |
| - Gestion callbacks | 24 | 24,000 |
| - Système remboursement | 24 | 24,000 |
| - Tests sandbox | 16 | 16,000 |

**Total Phase 5**: 360 heures = **360,000 DZD**

---

### Phase 6: Notifications & Reporting (Semaines 14-15)

| Activité | Heures | Coût |
|----------|--------|------|
| Système Notifications (Semaine 14) | 120 | 120,000 |
| - Service emails | 24 | 24,000 |
| - Templates multilingues | 24 | 24,000 |
| - Service SMS | 24 | 24,000 |
| - Service Push (FCM) | 24 | 24,000 |
| - API notifications | 16 | 16,000 |
| - Tests | 8 | 8,000 |
| | | |
| Reporting & Jasper (Semaine 15) | 120 | 120,000 |
| - Configuration Jasper | 16 | 16,000 |
| - Templates PDF | 32 | 32,000 |
| - API statistiques | 40 | 40,000 |
| - Export CSV/Excel | 16 | 16,000 |
| - Tests | 16 | 16,000 |

**Total Phase 6**: 240 heures = **240,000 DZD**

---

### Phase 7: Synchronisation ERP/WMS (Semaine 16)

| Activité | Heures | Coût |
|----------|--------|------|
| Intégration Systèmes Existants | 120 | 120,000 |
| - Analyse API ERP/WMS | 24 | 24,000 |
| - Service synchronisation | 40 | 40,000 |
| - Sync produits & stocks | 24 | 24,000 |
| - Push commandes | 16 | 16,000 |
| - Gestion erreurs & retry | 8 | 8,000 |
| - Tests intégration | 8 | 8,000 |

**Total Phase 7**: 120 heures = **120,000 DZD**

---

## 4. Coûts Récapitulatifs par Phase

| Phase | Semaines | Heures | Coût | % Total |
|-------|----------|--------|------|---------|
| Phase 1: Init & Sécurité | 1-2 | 240 | 240,000 | 12.5% |
| Phase 2: Utilisateurs | 3-4 | 240 | 240,000 | 12.5% |
| Phase 3: Catalogue | 5-7 | 360 | 360,000 | 18.75% |
| Phase 4: Panier & Commandes | 8-10 | 360 | 360,000 | 18.75% |
| Phase 5: Paiements | 11-13 | 360 | 360,000 | 18.75% |
| Phase 6: Notifications & Reporting | 14-15 | 240 | 240,000 | 12.5% |
| Phase 7: Synchronisation | 16 | 120 | 120,000 | 6.25% |

**Total Développement**: 1,920 heures = **1,920,000 DZD**

---

## 5. Coûts d'Infrastructure & Outils

### 5.1 Licences & Outils (Setup initial + 4 mois)

| Item | Coût Mensuel | Durée | Coût Total |
|------|--------------|-------|------------|
| JetBrains IntelliJ Ultimate (×3) | 15,000 | 4 mois | 60,000 |
| GitHub/GitLab (plan privé) | 8,000 | 4 mois | 32,000 |
| SonarQube Cloud | 10,000 | 4 mois | 40,000 |
| Postman Team | 5,000 | 4 mois | 20,000 |
| Jasper Studio | Gratuit | - | 0 |

**Sous-total Outils**: 152,000 DZD

---

### 5.2 Infrastructure (Développement & Staging)

| Item | Coût Mensuel | Durée | Coût Total |
|------|--------------|-------|------------|
| Serveur Dev (VPS 4GB RAM) | 6,000 | 4 mois | 24,000 |
| Serveur Staging (VPS 8GB RAM) | 12,000 | 4 mois | 48,000 |
| PostgreSQL (Dev) | 4,000 | 4 mois | 16,000 |
| PostgreSQL (Staging) | 8,000 | 4 mois | 32,000 |
| Redis (optionnel) | 3,000 | 4 mois | 12,000 |
| Stockage S3/équivalent | 2,000 | 4 mois | 8,000 |
| Domain & SSL | 3,000 | 1 an | 3,000 |
| Jenkins/CI-CD (hébergé) | 5,000 | 4 mois | 20,000 |

**Sous-total Infrastructure**: 163,000 DZD

---

### 5.3 Services Externes (Développement)

| Service | Coût Setup | Coût Mensuel | Durée | Coût Total |
|---------|------------|--------------|-------|------------|
| Firebase (Dev) | 0 | Gratuit | - | 0 |
| SMTP (SendGrid/Mailgun) | 0 | 2,000 | 4 mois | 8,000 |
| SMS Gateway (Dev) | 5,000 | 3,000 | 4 mois | 17,000 |
| CIB Sandbox | Gratuit | 0 | - | 0 |
| Baridimob Sandbox | Gratuit | 0 | - | 0 |

**Sous-total Services**: 25,000 DZD

---

## 6. Budget Total Backend

| Catégorie | Coût | % Total |
|-----------|------|---------|
| **Développement (RH)** | 1,920,000 | 84.9% |
| **Licences & Outils** | 152,000 | 6.7% |
| **Infrastructure** | 163,000 | 7.2% |
| **Services Externes** | 25,000 | 1.2% |
| **TOTAL BACKEND** | **2,260,000** | **100%** |

---

## 7. Provision pour Risques & Imprévus

Il est recommandé d'ajouter une **marge de contingence de 10-15%** pour couvrir:
- Retards d'intégration avec API tierces
- Modifications de scope mineures
- Bugs critiques nécessitant intervention supplémentaire
- Complexité technique imprévue

**Contingence (10%)**: 226,000 DZD

---

## 8. Budget Total Recommandé

| Item | Coût |
|------|------|
| Coût de base | 2,260,000 |
| Contingence (10%) | 226,000 |
| **TOTAL RECOMMANDÉ** | **2,486,000 DZD** |

---

## 9. Paiement Échelonné (Recommandation)

| Jalon | % | Montant | Date |
|-------|---|---------|------|
| Signature contrat | 20% | 452,000 | Semaine 0 |
| Fin Phase 2 (Auth complète) | 20% | 452,000 | Semaine 4 |
| Fin Phase 4 (Commandes OK) | 25% | 565,000 | Semaine 10 |
| Fin Phase 5 (Paiements intégrés) | 20% | 452,000 | Semaine 13 |
| Livraison finale & tests | 15% | 339,000 | Semaine 16 |

**Total**: 2,260,000 DZD

---

## 10. Coûts Post-Livraison (Non inclus)

### Support & Maintenance (Mensuel)
- Support niveau 1 (bugs critiques): 80,000/mois
- Maintenance corrective: 60,000/mois
- Évolutions mineures: 100,000/mois
- Total: **240,000 DZD/mois**

### Infrastructure Production (Mensuel)
- Serveur production (HA): 40,000/mois
- Base de données production: 25,000/mois
- CDN & stockage: 15,000/mois
- Monitoring & logs: 10,000/mois
- Backup & sécurité: 10,000/mois
- Total: **100,000 DZD/mois**

---

## 11. ROI & Justification

### Pourquoi ce budget?

1. **Équipe qualifiée**: Développeurs seniors avec expertise Spring Boot, sécurité, intégrations bancaires
2. **Complexité technique**:
   - Intégrations bancaires algériennes (CIB, Baridimob)
   - Synchronisation temps réel avec ERP/WMS
   - Système de paiement sécurisé
   - Architecture scalable
3. **Qualité**: Tests rigoureux (>80% couverture), sécurité renforcée, documentation complète
4. **Délais réalistes**: 16 semaines permettant un développement soigné sans précipitation

### Comparaison
- **Solution low-cost**: 800,000 - 1,200,000 DZD (qualité médiocre, risques élevés)
- **Solution proposée**: 2,260,000 DZD (qualité professionnelle, risques maîtrisés)
- **Solution premium**: 3,500,000 - 5,000,000 DZD (over-engineered pour ce projet)

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
