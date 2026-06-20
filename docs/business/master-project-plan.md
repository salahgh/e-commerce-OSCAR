# MASTER PROJECT PLAN
## Plateforme E-commerce OSCAR Fashion
### Vue d'ensemble & Budget Consolidé

---

## 📋 Table des Matières

1. [Vue d'ensemble du Projet](#1-vue-densemble-du-projet)
2. [Composants du Projet](#2-composants-du-projet)
3. [Calendrier Global](#3-calendrier-global)
4. [Budget Consolidé](#4-budget-consolidé)
5. [Équipe Requise](#5-équipe-requise)
6. [Dépendances & Chemin Critique](#6-dépendances--chemin-critique)
7. [Analyse des Risques](#7-analyse-des-risques)
8. [Plan de Paiement](#8-plan-de-paiement)
9. [Livrables](#9-livrables)
10. [Garanties & Support](#10-garanties--support)

---

## 1. Vue d'ensemble du Projet

### 1.1 Description

Développement d'une **solution e-commerce complète** pour la marque OSCAR Fashion comprenant:
- Une plateforme web (React.js)
- Une application mobile iOS & Android (React Native)
- Un back-office d'administration (React.js)
- Une API backend robuste (Spring Boot)

### 1.2 Objectifs

- Offrir une expérience client moderne et fluide
- Intégrer les paiements locaux algériens (CIB, Baridimob)
- Support multilingue (Arabe RTL, Français, Anglais)
- Reporting et analytics avancés
- Notifications multi-canaux (Email, SMS, Push)

### 1.3 Stack Technique

| Composant | Technologies Principales |
|-----------|--------------------------|
| **Backend** | Spring Boot, PostgreSQL, JWT, Redis |
| **Frontend Web** | React.js, Material-UI, Redux Toolkit, React Query, TypeScript |
| **Back-Office** | React.js, MUI DataGrid, MUI X Charts, Redux Toolkit |
| **Mobile** | React Native, React Navigation, Firebase (FCM), TypeScript |

---

## 2. Composants du Projet

### 2.1 Backend API (Spring Boot)

**Durée**: 16 semaines
**Heures**: 1,920 heures
**Coût**: 2,486,000 DZD (avec contingence)

**Fonctionnalités**:
- API REST sécurisées (JWT)
- Gestion utilisateurs et authentification
- CRUD Produits et catalogue
- Gestion commandes et paiements
- Intégration CIB, Baridimob
- Notifications (Email, SMS, Push)
- Reporting (analytics)

**Voir détails**: [Backend (apps/backend)](../../apps/backend/README.md)

---

### 2.2 Frontend Web (React)

**Durée**: 12 semaines
**Heures**: 1,440 heures
**Coût**: 1,771,000 DZD (avec contingence)

**Fonctionnalités**:
- Interface e-commerce moderne
- Catalogue produits avec filtres avancés
- Recherche intelligente
- Panier et tunnel de commande
- Profil utilisateur
- Historique commandes
- Support multilingue avec RTL
- SEO optimisé
- PWA

**Voir détails**: [Spécification Frontend](../specs/frontend-spec.md)

---

### 2.3 Back-Office Admin (React)

**Durée**: 8 semaines
**Heures**: 960 heures
**Coût**: 1,100,000 DZD (avec contingence)

**Fonctionnalités**:
- Dashboard avec KPIs et graphiques
- Gestion produits (CRUD complet)
- Gestion commandes et statuts
- Gestion clients
- Rapports et statistiques
- Gestion utilisateurs admin
- Configuration système

**Voir détails**: [Spécification Back-Office](../specs/backoffice-spec.md)

---

### 2.4 Application Mobile (React Native)

**Durée**: 10 semaines
**Heures**: 1,200 heures
**Coût**: 1,413,500 DZD (avec contingence)

**Fonctionnalités**:
- App native iOS + Android
- Catalogue et recherche mobile
- Panier et checkout mobile
- Paiements mobiles (WebView)
- Notifications push (FCM)
- Profil et historique commandes
- Support multilingue avec RTL
- Mode offline (cache)

**Voir détails**: [Spécification Mobile](../specs/mobile-spec.md)

---

## 3. Calendrier Global

### 3.1 Timeline Globale

**Durée totale projet**: **26 semaines** (6.5 mois)

### 3.2 Planning par Composant

| Composant | Début | Fin | Durée |
|-----------|-------|-----|-------|
| **Backend** | Semaine 1 | Semaine 16 | 16 semaines |
| **Frontend Web** | Semaine 5 | Semaine 16 | 12 semaines |
| **Back-Office** | Semaine 9 | Semaine 16 | 8 semaines |
| **Mobile** | Semaine 7 | Semaine 16 | 10 semaines |

### 3.3 Diagramme de Gantt Simplifié

```
Semaines:  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16
─────────────────────────────────────────────────────────────
Backend:   ████████████████████████████████████████████████
Frontend:              ████████████████████████████████████
Mobile:                    ████████████████████████████████
BackOffice:                        ████████████████████████
─────────────────────────────────────────────────────────────
           |Phase 1|  Phase 2  |  Phase 3  |  Phase 4  |P5|

Phase 1: Découverte & Conception (Sem 1-4)
Phase 2: Fondations Backend (Sem 5-10)
Phase 3: Développement Frontend/Mobile (Sem 11-16)
Phase 4: Intégrations & Tests (Sem 17-22) - Intégré
Phase 5: Tests finaux & Déploiement (Sem 23-26) - Intégré
```

### 3.4 Jalons Majeurs

| Semaine | Jalon | Composants |
|---------|-------|------------|
| **Semaine 4** | Architecture & Design finalisés | Tous |
| **Semaine 10** | Backend API core fonctionnel | Backend |
| **Semaine 12** | Frontend catalogue opérationnel | Frontend |
| **Semaine 13** | Backend paiements intégrés | Backend |
| **Semaine 14** | Mobile checkout complet | Mobile |
| **Semaine 16** | **LIVRAISON FINALE** | Tous |

---

## 4. Budget Consolidé

### 4.1 Coûts par Composant

| Composant | Heures | Coût Base | Contingence (10%) | **Total** |
|-----------|--------|-----------|-------------------|-----------|
| **Backend** | 1,920 | 365,700 | 36,570 | **402,270** |
| **Frontend Web** | 1,440 | 266,900 | 26,690 | **293,590** |
| **Back-Office** | 960 | 177,600 | 17,760 | **195,360** |
| **Mobile** | 1,200 | 237,000 | 23,700 | **260,700** |
| **TOTAL** | **5,520** | **1,047,200** | **104,720** | **1,151,920** |

### 4.2 Répartition Budgétaire

```
Backend:     35% ████████████████████
Frontend:    25% ███████████████
BackOffice:  17% ██████████
Mobile:      23% █████████████
```

### 4.3 Détail des Coûts

#### Ressources Humaines (RH)
| Poste | Heures Totales | Coût Total |
|-------|----------------|------------|
| Développeurs Backend Mid-Level | 1,920 | 355,200 |
| Développeurs Frontend Junior/Mid | 2,400 | 444,000 |
| Développeurs React Native Mid | 1,200 | 222,000 |
| Tech Lead Junior | 224 | 41,440 |
| Testeurs | 448 | 82,880 |
| **Total RH** | **6,192** | **1,145,520** |

**Taux moyen pondéré**: 185 DZD/heure

#### Infrastructure & Outils

| Catégorie | Coût Total |
|-----------|------------|
| Licences & Outils | 0 |
| Infrastructure Dev & Staging | 7,000 |
| Services Externes | 4,000 |
| Comptes Développeur (Apple + Google) | 15,000 |
| **Total Infrastructure** | **26,000** |

### 4.4 Budget Total Projet

| Catégorie | Montant | % |
|-----------|---------|---|
| Développement (RH) | 1,021,200 | 88.7% |
| Infrastructure & Outils | 26,000 | 2.3% |
| Contingence (10%) | 104,720 | 9.1% |
| **TOTAL PROJET** | **1,151,920 DZD** | **100%** |

---

## 5. Équipe Requise

### 5.1 Composition de l'Équipe

| Rôle | Nombre | Allocation | Période |
|------|--------|------------|---------|
| **Chef de Projet / Product Owner** | 1 | 50% | Sem 1-26 |
| **Architecte Technique** | 1 | 50% | Sem 1-16 |
| **Développeurs Backend Senior** | 2 | 100% | Sem 1-16 |
| **Développeurs Backend Junior** | 1 | 50% | Sem 5-16 |
| **Développeurs Frontend Senior** | 2 | 100% | Sem 5-16 |
| **UI/UX Developer** | 1 | 100% | Sem 5-16 |
| **Développeurs React Native Senior** | 2 | 100% | Sem 7-16 |
| **QA/Test Engineer** | 1 | 50% | Sem 1-26 |
| **DevOps Engineer** | 1 | 20% | Sem 1-26 |

**Total équipe**: 12 personnes (certaines à temps partiel)

### 5.2 Profils & Compétences

#### Backend Team
- Expertise Spring Boot, Java 17+
- PostgreSQL, JPA/Hibernate
- Spring Security, JWT
- Intégrations API (banques)

#### Frontend Team
- Expertise React.js, TypeScript
- Material-UI (MUI)
- Redux Toolkit, React Query
- SEO, Performance, A11y

#### Mobile Team
- Expertise React Native, TypeScript
- Expo ou React Native CLI
- Firebase (FCM)
- iOS & Android guidelines
- App Store & Play Store submission

#### QA Team
- Tests automatisés (Jest, Cypress, Detox)
- Tests manuels (UI, fonctionnel, régression)
- Tests cross-browser, cross-device
- Performance testing

---

## 6. Dépendances & Chemin Critique

### 6.1 Dépendances Inter-Composants

```
Backend (Sem 1-16)
    ↓
    ├─→ Frontend (Sem 5-16) - Dépend de API Auth, Products, Cart, Orders
    ├─→ Mobile (Sem 7-16)   - Dépend de API Auth, Products, Cart, Orders
    └─→ BackOffice (Sem 9-16) - Dépend de API Admin endpoints

Conception UX/UI (Sem 3-4)
    ↓
    ├─→ Frontend (Sem 5)
    ├─→ Mobile (Sem 7)
    └─→ BackOffice (Sem 9)
```

### 6.2 Chemin Critique

**Chemin critique**: Backend → Frontend/Mobile → Tests Intégration

1. **Semaines 1-4**: Architecture, conception DB, design UI/UX
2. **Semaines 5-10**: Backend API core (Auth, Products, Cart)
3. **Semaines 11-13**: Intégration Frontend/Mobile avec Backend
4. **Semaines 14-16**: Paiements, reporting, tests finaux

**Impact retard Backend**: Retard direct sur Frontend, Mobile, BackOffice

### 6.3 Dépendances Externes Critiques

| Dépendance | Impact | Délai Obtention | Mitigation |
|------------|--------|-----------------|------------|
| **Credentials CIB** | Élevé | Semaine 8-10 | Contact précoce banque, sandbox dès que possible |
| **Credentials Baridimob** | Élevé | Semaine 8-10 | Contact précoce, tests en sandbox |
| **Gateway SMS Algérien** | Moyen | Semaine 12 | Identifier fournisseur tôt, configuration simple |
| **Apple Developer Account** | Faible | Semaine 0-1 | Créer compte avant début projet |
| **Google Play Console** | Faible | Semaine 0-1 | Créer compte avant début projet |
| **Contenu Client** (photos, textes) | Moyen | Semaines 10-11 | Définir deadlines claires, utiliser placeholders |

---

## 7. Analyse des Risques

### 7.1 Risques Techniques

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| **Retard intégration CIB/Baridimob** | Élevée | Élevé | Contact précoce banques, tests sandbox précoces, buffer 2 sem |
| **Problèmes performance** | Moyenne | Moyen | Tests de charge dès sem 10, optimisation continue |
| **Problèmes WebView mobile (paiements)** | Moyenne | Moyen | Tests précoces iOS/Android, fallback strategies |
| **Rejection App Store/Play Store** | Faible | Élevé | Respect strict guidelines, tests approfondis, privacy policy |

### 7.2 Risques Projet

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| **Changements de scope (Scope Creep)** | Élevée | Élevé | Processus de change request strict, validation formelle |
| **Retards validation client** | Moyenne | Moyen | SLA validation 2-3 jours max, relances proactives |
| **Turn-over équipe** | Faible | Élevé | Documentation continue, code review, pair programming |
| **Retard contenu client** | Élevée | Moyen | Deadlines claires, placeholders, communication régulière |
| **Dépendances tiers non résolues** | Moyenne | Élevé | Identification précoce, contacts directs fournisseurs |

### 7.3 Mesures de Mitigation Globales

1. **Communication**:
   - Réunions hebdomadaires (status, risques)
   - Dashboard projet en temps réel
   - Alertes précoces sur blocages

2. **Qualité**:
   - Code review systématique
   - Tests automatisés (> 70% couverture)
   - CI/CD avec gates de qualité

3. **Planning**:
   - Buffer de 10% intégré (contingence)
   - Jalons intermédiaires fréquents
   - Re-planning si nécessaire

4. **Documentation**:
   - Documentation technique continue
   - Knowledge sharing sessions
   - Handover docs pour maintenance

---

## 8. Plan de Paiement

### 8.1 Échéancier de Paiement Recommandé

| Jalon | % | Montant (DZD) | Date/Événement |
|-------|---|---------------|----------------|
| **Acompte - Signature contrat** | 20% | 230,384 | Semaine 0 |
| **Jalon 1 - Backend Auth + Produits** | 20% | 230,384 | Semaine 8 |
| **Jalon 2 - Frontend/Mobile Catalogue OK** | 20% | 230,384 | Semaine 12 |
| **Jalon 3 - Paiements intégrés** | 20% | 230,384 | Semaine 14 |
| **Livraison finale - Tests validés** | 15% | 172,788 | Semaine 16 |
| **Support post-livraison (2 semaines)** | 5% | 57,596 | Semaine 18 |
| **TOTAL** | **100%** | **1,151,920** | - |

### 8.2 Conditions de Paiement

- Paiement par virement bancaire
- Délai de paiement: 15 jours après réception facture
- Factures émises à chaque jalon validé
- Validation jalon: Tests passés + acceptance client

---

## 9. Livrables

### 9.1 Livrables par Composant

#### Backend
- Code source (repository Git)
- Base de données (scripts migration)
- Documentation API (Swagger/OpenAPI)
- Documentation technique
- Guide de déploiement
- Tests (unitaires, intégration)

#### Frontend Web
- Code source (repository Git)
- Build de production
- Documentation technique
- Storybook (composants)
- Guide de déploiement
- Tests

#### Back-Office
- Code source (repository Git)
- Build de production
- Documentation technique
- Guide utilisateur admin
- Tests

#### Mobile
- Code source (repository Git)
- Build iOS (.ipa)
- Build Android (.apk/.aab)
- Applications soumises sur App Store & Play Store
- Documentation technique
- Guide de déploiement
- Tests

### 9.2 Livrables Transverses

- **Documentation Projet**:
  - Spécifications fonctionnelles
  - Spécifications techniques
  - Architecture globale (schémas)
  - Schéma base de données (ERD)
  - Guide d'installation global

- **Formation**:
  - Formation administrateurs (2 jours)
  - Documentation utilisateur
  - Vidéos tutoriels (optionnel)

- **Support**:
  - Support 2 semaines post-livraison (inclus)
  - Corrections bugs critiques
  - Assistance déploiement

---

## 10. Garanties & Support

### 10.1 Garantie Qualité

- **Tests**: Couverture > 70% (backend, frontend, backoffice), > 60% (mobile)
- **Performance**:
  - Temps de réponse API < 500ms (90% des requêtes)
  - Temps de chargement pages web < 3s (Lighthouse > 90)
  - App mobile fluide (60 fps)
- **Sécurité**:
  - HTTPS obligatoire
  - Authentification JWT sécurisée
  - Protection OWASP Top 10
  - Audit sécurité basique inclus

### 10.2 Support Post-Livraison (Inclus)

**Durée**: 2 semaines après livraison finale

**Inclus**:
- Corrections bugs critiques (bloquants)
- Assistance déploiement production
- Support questions techniques
- Hotfixes si nécessaire

**Canaux**:
- Email support
- Ticket system
- Appels si urgence

### 10.3 Maintenance & Support Optionnel (Post-garantie)

#### Option 1: Support Standard
**180,000 DZD/mois**

Inclus:
- Support bugs non critiques (délai 48h)
- Maintenance corrective
- Mises à jour sécurité
- Monitoring basique

#### Option 2: Support Premium
**280,000 DZD/mois**

Inclus:
- Tout du Support Standard
- Support bugs critiques (délai 4h)
- Évolutions mineures (jusqu'à 8h/mois)
- Monitoring avancé + alertes
- Mises à jour OS mobile (iOS/Android)

#### Option 3: Support Enterprise
**Sur devis**

Inclus:
- Tout du Support Premium
- Développements sur mesure
- Évolutions fonctionnelles majeures
- SLA personnalisé
- Équipe dédiée

---

## 11. Hypothèses & Exclusions

### 11.1 Hypothèses du Projet

1. **Credentials bancaires** (CIB, Baridimob) fournis par le client sous 2 semaines
2. **Contenu** (photos produits, descriptions, textes) fourni par le client selon planning
3. **Validation client** sous 2-3 jours ouvrables maximum
4. **Environnement production** (serveurs, domaines, SSL) fourni par le client ou coût séparé
5. **Équipe disponible** à 100% (pas de turn-over majeur)
6. **Scope stable** (changements majeurs = avenant)

### 11.2 Exclusions (Non Inclus)

**Fonctionnalités hors périmètre**:
- Génération de documents PDF (factures, bons de livraison)
- Synchronisation / intégration avec systèmes de gestion externes (ERP, WMS, POS)

**Infrastructure Production**:
- Serveurs de production (backend, frontend, BDD)
- Noms de domaine
- Certificats SSL
- CDN production
- Hébergement cloud (AWS, Azure, etc.)

**Contenu & Données**:
- Photos produits professionnelles
- Descriptions produits
- Traductions contenu
- Import données produits existantes
- Shooting photo

**Services Tiers Payants** (production):
- MUI X DataGrid Pro (si nécessaire)
- Services SMS (frais SMS)
- Services Email (frais envoi)
- Firebase (Blaze plan au-delà gratuit)

**Formations Étendues**:
- Formation utilisateurs finaux (clients)
- Formation marketing/SEO
- Formation technique avancée

**Marketing & Lancement**:
- Campagnes publicitaires
- Marketing digital
- SEO avancé (au-delà on-page)
- ASO (App Store Optimization marketing)
- Social media management

**Support Long Terme**:
- Maintenance au-delà de 2 semaines (voir options support)
- Évolutions fonctionnelles post-livraison
- Nouvelles intégrations (au-delà scope initial)

---

## 12. Conditions Contractuelles

### 12.1 Durée du Contrat

- **Durée**: 26 semaines (6.5 mois) à partir de la signature
- **Début**: À définir lors de la signature
- **Fin**: Livraison finale + 2 semaines support

### 12.2 Modalités de Validation

- **Jalons**: Validation formelle (email ou PV signé) sous 3 jours ouvrables max
- **Retard validation**: Jalon considéré validé si pas de retour sous 5 jours
- **Recette finale**: Tests d'acceptance (UAT) + PV de recette signé

### 12.3 Gestion des Changements

**Change Requests**:
- Demande formelle écrite (email ou formulaire)
- Évaluation impact (délais, coûts) sous 3 jours
- Devis avenant si approuvé
- Signature avenant avant mise en œuvre
- Ajustement planning si nécessaire

**Changements Mineurs** (< 2h de dev):
- Traités sans avenant
- Budget contingence (si disponible)

**Changements Majeurs**:
- Avenant avec nouveau budget et planning
- Re-planification projet si impact > 1 semaine

### 12.4 Propriété Intellectuelle

- **Code source**: Propriété du client après paiement intégral
- **Repository Git**: Transféré au client à la livraison
- **Licence**: Code livré sous licence MIT ou équivalent (à définir)
- **Composants tiers**: Licences open-source respectives
- **Documentation**: Propriété du client

### 12.5 Confidentialité

- **NDA**: Accord de confidentialité signé
- **Données sensibles**: Protection et non-divulgation
- **Credentials**: Stockage sécurisé, suppression post-projet
- **Code**: Pas de réutilisation pour autres clients sans accord

---

## 13. Critères de Succès

### 13.1 Critères Techniques

- ✅ Tous les tests passent (> 70% couverture backend/web, > 60% mobile)
- ✅ Performance: API < 500ms, Web < 3s, Mobile fluide
- ✅ Sécurité: Audit OWASP basique passé
- ✅ Paiements: CIB + Baridimob fonctionnels en production
- ✅ Apps mobiles approuvées sur App Store & Play Store
- ✅ Support multilingue (AR RTL, FR, EN) fonctionnel
- ✅ Documentation complète livrée

### 13.2 Critères Fonctionnels

- ✅ Utilisateurs peuvent s'inscrire, se connecter, gérer profil
- ✅ Catalogue produits complet et recherche fonctionnelle
- ✅ Tunnel de commande complet du panier à la confirmation
- ✅ Paiements en ligne (CIB, Baridimob) et à la livraison
- ✅ Notifications (Email, SMS, Push) opérationnelles
- ✅ Back-office: Gestion produits, commandes, clients, rapports
- ✅ Mobile: App iOS et Android fonctionnelles et publiées

### 13.3 Critères Acceptance

- ✅ Validation client de tous les jalons
- ✅ Tests UAT (User Acceptance Testing) passés
- ✅ Formation administrateurs effectuée
- ✅ PV de recette signé

---

## 14. Contacts & Gouvernance

### 14.1 Gouvernance Projet

**Comité de Pilotage**:
- Fréquence: Bi-hebdomadaire (toutes les 2 semaines)
- Participants: Chef de projet (côté prestataire), Product Owner (côté client), Architecte
- Objectifs: Revue avancement, validation jalons, décisions stratégiques

**Réunions Hebdomadaires**:
- Fréquence: Hebdomadaire
- Participants: Équipe technique, Chef de projet
- Objectifs: Status, risques, blocages, planning

**Daily Standups** (optionnel):
- Fréquence: Quotidienne (15 min)
- Participants: Équipe dev
- Objectifs: Synchronisation quotidienne

### 14.2 Communication

**Outils**:
- Email: Communication formelle
- Slack/Teams: Communication quotidienne
- Jira/Trello: Suivi des tâches
- Confluence/Notion: Documentation projet
- GitLab/GitHub: Code source, CI/CD

**Rapports**:
- Rapport hebdomadaire (status, risques, KPIs)
- Rapport mensuel (avancement global, budget)
- Alertes immédiates (blocages critiques)

---

## 15. Annexes

### 15.1 Documents de Référence

1. **Spécifications Détaillées**:
   - [Spec technique globale (V2)](../specs/technical-spec.md)
   - [Frontend - frontend-spec.md](../specs/frontend-spec.md)
   - [Back-Office - backoffice-spec.md](../specs/backoffice-spec.md)
   - [Mobile - mobile-spec.md](../specs/mobile-spec.md)

2. **Calendriers Détaillés**:
   - [Frontend - frontend-calendar.md](../planning/frontend-calendar.md)
   - [Back-Office - backoffice-calendar.md](../planning/backoffice-calendar.md)
   - [Mobile - mobile-calendar.md](../planning/mobile-calendar.md)

3. **Budgets Détaillés**:
   - [Frontend - frontend-budget.md](../planning/frontend-budget.md)
   - [Back-Office - backoffice-budget.md](../planning/backoffice-budget.md)
   - [Mobile - mobile-budget.md](../planning/mobile-budget.md)

### 15.2 Glossaire

| Terme | Définition |
|-------|------------|
| **API** | Application Programming Interface |
| **CRUD** | Create, Read, Update, Delete |
| **JWT** | JSON Web Token (authentification) |
| **RTL** | Right-to-Left (support arabe) |
| **PWA** | Progressive Web App |
| **FCM** | Firebase Cloud Messaging |
| **CIB** | Centre Interbancaire de Monétique (Algérie) |
| **ERP** | Enterprise Resource Planning |
| **WMS** | Warehouse Management System |
| **UAT** | User Acceptance Testing |
| **CI/CD** | Continuous Integration/Continuous Deployment |
| **MVP** | Minimum Viable Product |
| **SLA** | Service Level Agreement |

---

## 16. Signatures

### 16.1 Acceptation du Plan

Ce document constitue le plan de projet officiel pour le développement de la plateforme e-commerce OSCAR Fashion.

**Client (OSCAR Fashion)**:
- Nom: ______________________
- Fonction: __________________
- Signature: _________________
- Date: ______________________

**Prestataire**:
- Nom: ______________________
- Fonction: __________________
- Signature: _________________
- Date: ______________________

---

## 📊 Résumé Exécutif

| Métrique | Valeur |
|----------|--------|
| **Durée Totale** | 26 semaines (6.5 mois) |
| **Heures Totales** | 5,520 heures |
| **Budget Total** | **1,151,920 DZD** |
| **Composants** | 4 (Backend, Frontend, BackOffice, Mobile) |
| **Équipe** | 12 personnes (temps plein et partiel) |
| **Technologies** | Spring Boot, React.js, React Native, PostgreSQL |
| **Plateformes** | Web, iOS, Android, Admin Panel |
| **Langues** | Arabe (RTL), Français, Anglais |
| **Paiements** | CIB, Baridimob, Cash on Delivery |
| **Livraison** | Semaine 16 + 2 semaines support |

---

**Version**: 1.0
**Date**: Novembre 2025
**Validité**: 90 jours
**Statut**: Proposition commerciale & technique détaillée

---

**FIN DU DOCUMENT**
