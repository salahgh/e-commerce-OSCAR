# Backend - Calendrier de Développement
## OSCAR Fashion E-commerce Platform

---

## Vue d'ensemble

**Durée totale**: 16 semaines
**Heures estimées**: 1,920 heures
**Équipe requise**:
- 2 Développeurs Backend Senior
- 1 Développeur Backend Junior
- 1 Architecte/Tech Lead (temps partiel)

---

## Phase 1: Initialisation & Sécurité (Semaines 1-2)

### Semaine 1: Architecture & Setup

#### Tâches
- [x] Validation de l'architecture technique
- [x] Choix de l'approche (monolithique vs microservices)
- [x] Conception du schéma de base de données
- [x] Définition du contrat API (OpenAPI/Swagger)
- [x] Setup de l'environnement de développement
- [x] Configuration du repository Git
- [x] Setup CI/CD pipeline (Jenkins/GitLab CI)
- [x] Configuration Docker (Dockerfile, docker-compose)
- [x] Setup des environnements (Dev, Staging, Prod)

#### Livrables
- Schéma de base de données (ERD)
- Documentation architecture
- Spécification API (OpenAPI)
- Repository Git configuré
- Pipeline CI/CD fonctionnel

**Temps estimé**: 120 heures

---

### Semaine 2: Initialisation du Projet & Sécurité

#### Tâches
- [x] Initialisation projet Spring Boot
- [x] Configuration des dépendances Maven/Gradle
- [x] Structure du projet (packages, modules)
- [x] Configuration PostgreSQL
- [x] Configuration Flyway/Liquibase (migrations DB)
- [x] Implémentation Spring Security
- [x] Système JWT (génération, validation)
- [x] Configuration CORS
- [x] Gestion des exceptions globale
- [x] Setup Swagger/OpenAPI
- [x] Configuration des logs (SLF4J + Logback)
- [x] Configuration Spring Actuator

#### Livrables
- Projet Spring Boot initialisé
- Sécurité JWT fonctionnelle
- Documentation API Swagger accessible
- Base de données configurée

**Temps estimé**: 120 heures

---

## Phase 2: Gestion Utilisateurs (Semaines 3-4)

### Semaine 3: Authentification

#### Tâches
- [x] Entité User (JPA)
- [x] Repository User
- [x] Service d'inscription
- [x] Service de connexion
- [x] Service de déconnexion
- [x] Validation des données (email, mot de passe)
- [x] Hachage des mots de passe (BCrypt)
- [x] Génération de tokens JWT
- [x] Refresh token mechanism
- [x] API: POST /auth/register
- [x] API: POST /auth/login
- [x] API: POST /auth/logout
- [x] API: POST /auth/refresh-token
- [x] Tests unitaires (JUnit + Mockito)
- [x] Tests d'intégration

#### Livrables
- Module d'authentification complet
- Tests (couverture > 80%)

**Temps estimé**: 120 heures

---

### Semaine 4: Profil Utilisateur & Récupération MDP

#### Tâches
- [x] Service de récupération de mot de passe
- [x] Génération de token de réinitialisation
- [x] Envoi d'email de réinitialisation
- [x] Validation d'email
- [x] Entité Address (JPA)
- [x] Gestion des adresses utilisateur
- [x] API: POST /auth/forgot-password
- [x] API: POST /auth/reset-password
- [x] API: POST /auth/verify-email
- [x] API: GET /users/me
- [x] API: PUT /users/me
- [x] API: CRUD /users/me/addresses
- [x] Configuration Spring Mail (SMTP)
- [x] Templates d'emails
- [x] Tests unitaires et d'intégration

#### Livrables
- Module utilisateur complet
- Service d'emails fonctionnel
- Tests

**Temps estimé**: 120 heures

---

## Phase 3: Catalogue Produits (Semaines 5-7)

### Semaine 5: Entités & Repository

#### Tâches
- [x] Entité Product (JPA)
- [x] Entité Category (JPA)
- [x] Entité ProductImage (JPA)
- [x] Entité Attribute (JPA)
- [x] Relations entre entités
- [x] Support multilingue (i18n)
- [x] Repository Product
- [x] Repository Category
- [x] Repository Attribute
- [x] Migrations base de données
- [x] Index optimisés
- [x] Seeding de données de test

#### Livrables
- Modèle de données produits complet
- Database migrations

**Temps estimé**: 120 heures

---

### Semaine 6: API CRUD Produits

#### Tâches
- [x] Service Product (logique métier)
- [x] Service Category
- [x] DTOs (ProductDTO, CategoryDTO, etc.)
- [x] Validation des données
- [x] API: GET /products (liste paginée)
- [x] API: GET /products/{id}
- [x] API: GET /products/search (recherche & filtrage)
- [x] API: GET /products/featured
- [x] API: GET /products/new-arrivals
- [x] API: GET /categories
- [x] API: GET /categories/{id}/products
- [x] Gestion des slugs (URL-friendly)
- [x] Pagination et tri
- [x] Tests unitaires

#### Livrables
- API publique produits fonctionnelle
- Tests

**Temps estimé**: 120 heures

---

### Semaine 7: Admin Produits & Gestion Stock

#### Tâches
- [x] API Admin: POST /admin/products
- [x] API Admin: PUT /admin/products/{id}
- [x] API Admin: DELETE /admin/products/{id}
- [x] API Admin: CRUD /admin/categories
- [x] Upload d'images (local ou S3)
- [x] Gestion du stock (quantité)
- [x] Gestion des attributs produits
- [x] Validation business rules
- [x] Autorisation (ADMIN role)
- [x] Tests d'intégration
- [x] Documentation Swagger enrichie

#### Livrables
- API admin produits complète
- Système d'upload d'images
- Tests

**Temps estimé**: 120 heures

---

## Phase 4: Panier & Commandes (Semaines 8-10)

### Semaine 8: Module Panier

#### Tâches
- [x] Entité Cart & CartItem (JPA)
- [x] Repository Cart
- [x] Service Cart (logique métier)
- [x] Gestion panier utilisateur connecté
- [x] Gestion panier invité (session)
- [x] Calcul du total
- [x] API: GET /cart
- [x] API: POST /cart/items
- [x] API: PUT /cart/items/{id}
- [x] API: DELETE /cart/items/{id}
- [x] API: DELETE /cart (vider)
- [x] API: POST /cart/merge (merge guest cart)
- [x] Validation de stock
- [x] Tests unitaires et d'intégration

#### Livrables
- Module panier fonctionnel
- Tests

**Temps estimé**: 120 heures

---

### Semaine 9: Module Commandes

#### Tâches
- [x] Entité Order & OrderItem (JPA)
- [x] Entité OrderStatusHistory (JPA)
- [x] Repository Order
- [x] Service Order (création, gestion)
- [x] Logique de création de commande
- [x] Calcul des frais de livraison
- [x] Gestion des adresses de livraison
- [x] Statuts de commande (workflow)
- [x] Historique des statuts
- [x] API: POST /orders
- [x] API: GET /orders (historique)
- [x] API: GET /orders/{id}
- [x] Validation de commande
- [x] Vérification de stock
- [x] Tests

#### Livrables
- Module commandes fonctionnel
- API client

**Temps estimé**: 120 heures

---

### Semaine 10: Admin Commandes & Annulation

#### Tâches
- [x] API: POST /orders/{id}/cancel (client)
- [x] API Admin: GET /admin/orders
- [x] API Admin: PUT /admin/orders/{id}/status
- [x] API Admin: POST /admin/orders/{id}/tracking
- [x] Service de notification de statut
- [x] Logique d'annulation (conditions)
- [x] Gestion du remboursement de stock
- [x] Logs de modifications
- [x] Permissions admin
- [x] Tests d'intégration complets

#### Livrables
- API admin commandes complète
- Système de gestion de statuts
- Tests

**Temps estimé**: 120 heures

---

## Phase 5: Paiements & Intégrations (Semaines 11-13)

### Semaine 11: Infrastructure Paiement

#### Tâches
- [x] Entité Payment (JPA)
- [x] Repository Payment
- [x] Service Payment (abstraction)
- [x] Interface PaymentGateway
- [x] Implémentation Cash on Delivery (COD)
- [x] Gestion des transactions
- [x] Logs de paiement sécurisés
- [x] API: POST /payments/initiate
- [x] API: GET /payments/{id}/status
- [x] Service de vérification de paiement
- [x] Gestion des échecs de paiement
- [x] Tests unitaires

#### Livrables
- Infrastructure de paiement
- COD fonctionnel
- Tests

**Temps estimé**: 120 heures

---

### Semaine 12: Intégration CIB

#### Tâches
- [x] Étude de l'API CIB
- [x] Configuration CIB (credentials)
- [x] Implémentation PaymentGateway pour CIB
- [x] Génération de requête de paiement
- [x] Signature des requêtes
- [x] API: POST /payments/callback/cib
- [x] Validation des callbacks
- [x] Vérification des signatures
- [x] Mise à jour du statut de paiement
- [x] Mise à jour du statut de commande
- [x] Tests en sandbox CIB
- [x] Gestion des erreurs

#### Livrables
- Intégration CIB fonctionnelle
- Tests sandbox validés

**Temps estimé**: 120 heures

---

### Semaine 13: Intégration Baridimob

#### Tâches
- [x] Étude de l'API Baridimob
- [x] Configuration Baridimob (credentials)
- [x] Implémentation PaymentGateway pour Baridimob
- [x] Génération de requête de paiement
- [x] API: POST /payments/callback/baridimob
- [x] Validation des callbacks
- [x] Gestion des transactions
- [x] Tests en sandbox Baridimob
- [x] API Admin: POST /admin/payments/{id}/refund
- [x] Logique de remboursement
- [x] Documentation intégrations
- [x] Tests end-to-end

#### Livrables
- Intégration Baridimob fonctionnelle
- Système de remboursement
- Tests validés

**Temps estimé**: 120 heures

---

## Phase 6: Notifications & Reporting (Semaines 14-15)

### Semaine 14: Système de Notifications

#### Tâches
- [x] Entité Notification (JPA)
- [x] Service de notification (abstraction)
- [x] Service Email (Spring Mail)
- [x] Templates emails multilingues (Thymeleaf)
- [x] Service SMS (intégration gateway algérien)
- [x] Service Push (FCM)
- [x] Configuration Firebase
- [x] Notification création de compte
- [x] Notification confirmation commande
- [x] Notification statut commande
- [x] API: GET /notifications
- [x] API: PUT /notifications/{id}/read
- [x] Tests

#### Livrables
- Système de notifications complet
- Templates emails
- Tests

**Temps estimé**: 120 heures

---

### Semaine 15: Reporting & Jasper Reports

#### Tâches
- [x] Configuration Jasper Reports
- [x] Template facture PDF
- [x] Template bon de livraison PDF
- [x] Service de génération de documents
- [x] API: GET /orders/{id}/invoice (PDF)
- [x] Service de statistiques
- [x] API: GET /admin/reports/sales
- [x] API: GET /admin/reports/top-products
- [x] API: GET /admin/reports/revenue
- [x] API: GET /admin/reports/customers
- [x] API: GET /admin/reports/orders-summary
- [x] Export CSV/Excel
- [x] Cache des statistiques
- [x] Tests

#### Livrables
- Système de génération de PDF
- API de reporting complète
- Tests

**Temps estimé**: 120 heures

---

## Phase 7: Synchronisation ERP/WMS (Semaine 16)

### Semaine 16: Intégration Systèmes Existants

#### Tâches
- [x] Analyse de l'API ERP/WMS existante
- [x] Configuration des endpoints externes
- [x] Service de synchronisation
- [x] Synchronisation produits (pull from ERP)
- [x] Synchronisation stocks en temps réel
- [x] Transmission commandes (push to ERP)
- [x] Mise à jour statuts de livraison
- [x] API: POST /sync/products/pull
- [x] API: POST /sync/stocks/pull
- [x] API: POST /sync/orders/push
- [x] API: GET /sync/status
- [x] Gestion des erreurs de sync
- [x] Logs de synchronisation
- [x] Retry mechanism
- [x] Tests d'intégration avec ERP

#### Livrables
- Module de synchronisation fonctionnel
- Documentation technique
- Tests

**Temps estimé**: 120 heures

---

## Phase 8: Tests, Optimisation & Documentation (Intégré)

### Activités Continues

#### Semaines 1-16: Tests
- Tests unitaires (couverture > 80%)
- Tests d'intégration
- Tests de performance (JMeter)
- Tests de sécurité (OWASP ZAP)

#### Semaines 14-16: Optimisation
- Optimisation des requêtes SQL
- Mise en cache (Redis)
- Compression des réponses
- Rate limiting
- Connection pooling
- Profiling des performances

#### Semaines 15-16: Documentation
- Documentation API (Swagger enrichie)
- Guide d'installation
- Guide de déploiement
- Documentation technique
- Schémas d'architecture
- ERD final

**Temps estimé**: Intégré dans chaque phase

---

## Récapitulatif par Semaine

| Semaine | Phase | Heures | Cumul |
|---------|-------|--------|-------|
| 1 | Architecture & Setup | 120 | 120 |
| 2 | Initialisation & Sécurité | 120 | 240 |
| 3 | Authentification | 120 | 360 |
| 4 | Profil & Récupération MDP | 120 | 480 |
| 5 | Entités Produits | 120 | 600 |
| 6 | API CRUD Produits | 120 | 720 |
| 7 | Admin Produits & Stock | 120 | 840 |
| 8 | Module Panier | 120 | 960 |
| 9 | Module Commandes | 120 | 1,080 |
| 10 | Admin Commandes | 120 | 1,200 |
| 11 | Infrastructure Paiement | 120 | 1,320 |
| 12 | Intégration CIB | 120 | 1,440 |
| 13 | Intégration Baridimob | 120 | 1,560 |
| 14 | Notifications | 120 | 1,680 |
| 15 | Reporting & Jasper | 120 | 1,800 |
| 16 | Synchronisation ERP/WMS | 120 | 1,920 |

**Total: 1,920 heures**

---

## Dépendances Critiques

### Dépendances Externes
1. **API ERP/WMS**: Documentation et accès requis (Semaine 1)
2. **Credentials CIB**: Compte marchand et sandbox (Semaine 10)
3. **Credentials Baridimob**: Compte marchand et sandbox (Semaine 11)
4. **Gateway SMS**: Choix du fournisseur et configuration (Semaine 13)
5. **Firebase**: Création projet et configuration (Semaine 13)

### Dépendances Internes
- Phase 4 dépend de Phase 3 (Produits requis pour Panier)
- Phase 5 dépend de Phase 4 (Commandes requises pour Paiements)
- Phase 7 dépend de Phase 3 (Produits) et Phase 4 (Commandes)

---

## Risques & Mitigation

| Risque | Impact | Probabilité | Mitigation |
|--------|--------|-------------|------------|
| API ERP non disponible | Élevé | Moyen | Développer des mocks, planifier API wrapper |
| Retard intégration CIB/Baridimob | Élevé | Élevé | Contact précoce avec banques, prévoir 2 sem buffer |
| Problèmes de performance | Moyen | Moyen | Tests de charge dès sem. 10 |
| Changements de scope | Élevé | Élevé | Processus de change request strict |

---

## Jalons (Milestones)

- **Semaine 2**: Backend initialisé, sécurité fonctionnelle ✓
- **Semaine 4**: Authentification complète ✓
- **Semaine 7**: Catalogue produits complet ✓
- **Semaine 10**: Commandes fonctionnelles ✓
- **Semaine 13**: Paiements intégrés ✓
- **Semaine 16**: Backend complet et prêt pour déploiement ✓

---

**Version**: 1.0
**Date**: Novembre 2025
**Statut**: Planning détaillé
