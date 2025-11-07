# Backend API - Spécifications Détaillées
## OSCAR Fashion E-commerce Platform

---

## 1. Vue d'ensemble

Le backend constitue le cœur de la plateforme OSCAR Fashion. Il fournit l'ensemble des API graphql nécessaires au fonctionnement du site web, de l'application mobile et du back-office administrateur.

### Objectifs Principaux
- Fournir des API graphql sécurisées et performantes
- Gérer l'authentification et l'autorisation des utilisateurs
- Assurer la synchronisation en temps réel avec les systèmes existants (ERP, WMS, POS)
- Intégrer les passerelles de paiement algériennes (CIB, Baridimob)
- Générer des documents (factures, bons de livraison) via Jasper Reports
- Gérer les notifications (Email, SMS, Push)

---

## 2. Stack Technique

### Core Framework
- **Framework**: Spring Boot 3.x (Java 17+)
- **Build Tool**: Maven
- **Architecture**: Monolithique modulaire

### Sécurité
- **Spring Security**: Authentification et autorisation
- **JWT (JSON Web Tokens)**: Gestion des sessions stateless
- **BCrypt**: Hachage des mots de passe
- **CORS**: Configuration pour le web et mobile
- **OAuth2**: Pour l'authentification sociale (optionnel)

### Accès aux Données
- **Spring Data JPA**: Couche d'abstraction
- **Hibernate**: ORM
- **PostgreSQL**: Base de données principale

### Génération de Documents
- **Jasper Reports**: Génération de factures PDF, bons de livraison
- **iText**: Alternative pour documents simples

### Communication & Notifications
- **Spring Mail**: Envoi d'emails
- **SMS Gateway Integration**: Service SMS algérien
- **WebSocket (Spring WebSocket)**: Notifications temps réel

### API & Documentation
- **OpenAPI/Swagger**: Documentation automatique des API

### Monitoring & Logging
- **Spring Actuator**: Endpoints de monitoring
- **SLF4J + Logback**: Logging
- **Micrometer + Prometheus**: Métriques
---

## 3. Architecture Backend

### Structure du Projet

```
oscar-backend/
├── src/main/java/com/oscar/ecommerce/
│   ├── config/              # Configurations Spring
│   ├── security/            # Sécurité (JWT, Filters)
│   ├── modules/
│   │   ├── auth/           # Authentification
│   │   ├── user/           # Gestion utilisateurs
│   │   ├── product/        # Gestion produits
│   │   ├── category/       # Catégories
│   │   ├── cart/           # Panier
│   │   ├── order/          # Commandes
│   │   ├── payment/        # Paiements
│   │   ├── notification/   # Notifications
│   │   ├── report/         # Rapports & Statistiques
│   │   └── sync/           # Synchronisation ERP/WMS
│   ├── shared/
│   │   ├── dto/            # Data Transfer Objects
│   │   ├── exception/      # Gestion des exceptions
│   │   ├── util/           # Utilitaires
│   │   └── constant/       # Constantes
│   └── Application.java
├── src/main/resources/
│   ├── application.yml
│   ├── application-dev.yml
│   ├── application-prod.yml
│   └── jasper/             # Templates Jasper Reports
└── src/test/
```

### Couches Applicatives

1. **Controller Layer**: Endpoints REST
2. **Service Layer**: Logique métier
3. **Repository Layer**: Accès aux données
4. **DTO Layer**: Objets de transfert
5. **Entity Layer**: Entités JPA

---

## 4. Modules Fonctionnels Détaillés

### 4.1 Module Authentification & Utilisateurs

#### Fonctionnalités
- Inscription (Email + Mot de passe)
- Connexion (JWT Token)
- Déconnexion
- Récupération de mot de passe (Email)
- Validation d'email
- Gestion de profil utilisateur
- Authentification sociale (Google, Facebook - optionnel)

#### Entités Principales
```
User
├── id (UUID)
├── firstName
├── lastName
├── email (unique)
├── password (encrypted)
├── phone
├── emailVerified
├── status (ACTIVE, INACTIVE, BLOCKED)
├── role (CUSTOMER, ADMIN, SUPER_ADMIN)
├── addresses (OneToMany)
├── createdAt
└── updatedAt

Address
├── id (UUID)
├── userId (FK)
├── street
├── city
├── wilaya
├── postalCode
├── country
├── isDefault
└── type (SHIPPING, BILLING)
```

#### API Endpoints
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh-token
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
POST   /api/v1/auth/verify-email
GET    /api/v1/users/me
PUT    /api/v1/users/me
GET    /api/v1/users/me/addresses
POST   /api/v1/users/me/addresses
PUT    /api/v1/users/me/addresses/{id}
DELETE /api/v1/users/me/addresses/{id}
```

---

### 4.2 Module Produits & Catalogue

#### Fonctionnalités
- CRUD Produits
- Gestion des catégories
- Gestion des attributs (taille, couleur, matière)
- Gestion des variations produits
- Recherche et filtrage avancés
- Gestion des images
- Gestion du stock
- Synchronisation avec ERP/WMS

#### Entités Principales
```
Product
├── id (UUID)
├── sku (unique)
├── name (Map<Locale, String>)
├── description (Map<Locale, String>)
├── slug
├── categoryId (FK)
├── basePrice
├── salePrice
├── status (ACTIVE, DRAFT, OUT_OF_STOCK)
├── stockQuantity
├── images (OneToMany)
├── attributes (ManyToMany)
├── createdAt
└── updatedAt

Category
├── id (UUID)
├── name (Map<Locale, String>)
├── slug
├── parentId (self-reference)
├── order
├── image
└── active

ProductImage
├── id (UUID)
├── productId (FK)
├── url
├── order
└── isMain

Attribute
├── id (UUID)
├── name (color, size, material)
├── values (List)
```

#### API Endpoints
```
GET    /api/v1/products
GET    /api/v1/products/{id}
GET    /api/v1/products/search?q=&category=&minPrice=&maxPrice=
GET    /api/v1/products/featured
GET    /api/v1/products/new-arrivals
GET    /api/v1/categories
GET    /api/v1/categories/{id}
GET    /api/v1/categories/{id}/products

Admin endpoints:
POST   /api/v1/admin/products
PUT    /api/v1/admin/products/{id}
DELETE /api/v1/admin/products/{id}
POST   /api/v1/admin/categories
PUT    /api/v1/admin/categories/{id}
```

---

### 4.3 Module Panier

#### Fonctionnalités
- Ajouter au panier (produit + quantité)
- Modifier la quantité
- Supprimer un article
- Vider le panier
- Calcul du total
- Persistance du panier (utilisateur connecté)
- Gestion panier invité (session)

#### Entités Principales
```
Cart
├── id (UUID)
├── userId (FK, nullable)
├── sessionId (pour invités)
├── items (OneToMany)
├── subtotal
├── discount
├── total
├── createdAt
└── updatedAt

CartItem
├── id (UUID)
├── cartId (FK)
├── productId (FK)
├── quantity
├── unitPrice
└── total
```

#### API Endpoints
```
GET    /api/v1/cart
POST   /api/v1/cart/items
PUT    /api/v1/cart/items/{id}
DELETE /api/v1/cart/items/{id}
DELETE /api/v1/cart
POST   /api/v1/cart/merge (merge guest cart with user cart on login)
```

---

### 4.4 Module Commandes

#### Fonctionnalités
- Création de commande
- Calcul frais de livraison
- Gestion des adresses de livraison
- Statuts de commande (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
- Historique des commandes
- Détails de commande
- Annulation de commande (si autorisé)
- Génération de facture PDF

#### Entités Principales
```
Order
├── id (UUID)
├── orderNumber (unique)
├── userId (FK)
├── status (ENUM)
├── shippingAddress (JSON)
├── billingAddress (JSON)
├── items (OneToMany)
├── subtotal
├── shippingCost
├── discount
├── tax
├── total
├── paymentMethod
├── paymentStatus
├── trackingNumber
├── notes
├── createdAt
└── updatedAt

OrderItem
├── id (UUID)
├── orderId (FK)
├── productId (FK)
├── productName
├── productSku
├── quantity
├── unitPrice
└── total

OrderStatusHistory
├── id (UUID)
├── orderId (FK)
├── status
├── comment
├── createdBy
└── createdAt
```

#### API Endpoints
```
POST   /api/v1/orders
GET    /api/v1/orders
GET    /api/v1/orders/{id}
POST   /api/v1/orders/{id}/cancel
GET    /api/v1/orders/{id}/invoice (PDF)

Admin endpoints:
GET    /api/v1/admin/orders
PUT    /api/v1/admin/orders/{id}/status
POST   /api/v1/admin/orders/{id}/tracking
```

---

### 4.5 Module Paiement

#### Fonctionnalités
- Intégration CIB (Centre Interbancaire de Monétique)
- Intégration Baridimob
- Paiement à la livraison (Cash on Delivery)
- Gestion des callbacks de paiement
- Vérification de paiement
- Remboursements
- Logs de transactions

#### Entités Principales
```
Payment
├── id (UUID)
├── orderId (FK)
├── amount
├── currency (DZD)
├── method (CIB, BARIDIMOB, COD)
├── status (PENDING, SUCCESS, FAILED, REFUNDED)
├── transactionId (gateway)
├── gatewayResponse (JSON)
├── createdAt
└── updatedAt
```

#### API Endpoints
```
POST   /api/v1/payments/initiate
POST   /api/v1/payments/callback/cib
POST   /api/v1/payments/callback/baridimob
GET    /api/v1/payments/{id}/status
POST   /api/v1/admin/payments/{id}/refund
```

---

### 4.6 Module Notifications

#### Fonctionnalités
- Envoi d'emails (confirmation inscription, récupération MDP, confirmation commande)
- Envoi de SMS (confirmation commande, statut livraison)
- Notifications push mobile (promotions, statut commande)
- Templates de notifications multilingues
- Centre de notifications utilisateur

#### Entités Principales
```
Notification
├── id (UUID)
├── userId (FK)
├── type (EMAIL, SMS, PUSH)
├── channel (ORDER, PROMO, ACCOUNT)
├── title
├── message
├── isRead
├── createdAt
└── readAt
```

#### API Endpoints
```
GET    /api/v1/notifications
PUT    /api/v1/notifications/{id}/read
PUT    /api/v1/notifications/read-all
GET    /api/v1/notifications/unread-count
```

---

### 4.7 Module Reporting & Statistiques

#### Fonctionnalités
- Statistiques de ventes (jour, semaine, mois, année)
- Produits les plus vendus
- Analyse des revenus
- Taux de conversion
- Rapports clients
- Génération de rapports PDF (Jasper Reports)
- Export de données (CSV, Excel)

#### API Endpoints
```
GET    /api/v1/admin/reports/sales?period=daily|weekly|monthly
GET    /api/v1/admin/reports/top-products?limit=10
GET    /api/v1/admin/reports/revenue?from=&to=
GET    /api/v1/admin/reports/customers
GET    /api/v1/admin/reports/orders-summary
POST   /api/v1/admin/reports/generate (PDF)
GET    /api/v1/admin/reports/export?type=csv|excel
```

---

### 4.8 Module Synchronisation (ERP/WMS/POS)

#### Fonctionnalités
- Synchronisation des produits (bidirectionnelle)
- Synchronisation des stocks en temps réel
- Transmission des commandes vers ERP
- Mise à jour des statuts de livraison
- Logs de synchronisation
- Gestion des erreurs de sync
- Configuration des endpoints externes

#### API Endpoints
```
POST   /api/v1/sync/products/pull (from ERP)
POST   /api/v1/sync/stocks/pull
POST   /api/v1/sync/orders/push (to ERP)
GET    /api/v1/sync/status
GET    /api/v1/sync/logs
POST   /api/v1/admin/sync/trigger
```

---

## 5. Sécurité

### Authentification JWT
- Token d'accès (durée: 15 min)
- Refresh token (durée: 7 jours)
- Stockage sécurisé côté client
- Rotation des refresh tokens

### Autorisations
- Rôles: CUSTOMER, ADMIN, SUPER_ADMIN
- Permissions granulaires par endpoint
- @PreAuthorize sur les méthodes sensibles

### Protection
- Rate limiting (prévention DDoS)
- Validation des entrées (Spring Validator)
- Protection CSRF (pour formulaires)
- Sanitisation des données
- Protection SQL Injection (via JPA)
- HTTPS obligatoire en production

### Données Sensibles
- Chiffrement des mots de passe (BCrypt)
- Chiffrement des données de paiement
- Logs anonymisés (pas de données sensibles)
- Conformité RGPD (si applicable)

---

## 6. Performance & Optimisation

### Stratégies de Cache
- Cache des produits (Redis)
- Cache des catégories
- Cache des statistiques
- Cache des configurations

### Optimisation Base de Données
- Index sur colonnes fréquemment interrogées
- Pagination des résultats
- Lazy loading JPA
- Query optimization
- Connection pooling (HikariCP)

### Optimisation API
- Compression des réponses (GZIP)
- Pagination
- Filtrage des champs (Sparse Fieldsets)
- Rate limiting
- CDN pour les images

---

## 7. Tests

### Types de Tests
- **Tests Unitaires**: JUnit 5 + Mockito (couverture > 80%)
- **Tests d'Intégration**: Spring Boot Test
- **Tests API**: RestAssured ou MockMvc
- **Tests de Performance**: JMeter
- **Tests de Sécurité**: OWASP ZAP

### CI/CD
- Pipeline automatisé (Jenkins/GitLab CI)
- Tests automatiques à chaque commit
- Analyse de code (SonarQube)
- Déploiement automatique sur staging

---

## 8. Déploiement

### Environnements
- **Development**: localhost
- **Staging**: serveur de pré-production
- **Production**: serveur principal

### Infrastructure
- **Containerisation**: Docker
- **Orchestration**: Docker Compose ou Kubernetes
- **Hébergement**: AWS, Azure, OVH, ou serveur local
- **Base de données**: PostgreSQL (cluster HA en prod)
- **Fichiers statiques**: S3 ou stockage local

### Monitoring
- Health checks (Spring Actuator)
- Logs centralisés
- Alertes automatiques
- Métriques de performance

---

## 9. Documentation

### Livrables
- Documentation API (Swagger/OpenAPI)
- Schéma de base de données (ERD)
- Guide d'installation
- Guide de déploiement
- Guide de maintenance
- Documentation technique développeur

---

## 10. Annexes

### Variables d'Environnement
```
DATABASE_URL
DATABASE_USERNAME
DATABASE_PASSWORD
JWT_SECRET
JWT_EXPIRATION
REDIS_HOST
REDIS_PORT
SMTP_HOST
SMTP_USERNAME
SMTP_PASSWORD
SMS_API_KEY
FCM_SERVER_KEY
CIB_MERCHANT_ID
CIB_API_KEY
BARIDIMOB_MERCHANT_ID
BARIDIMOB_API_KEY
ERP_API_URL
ERP_API_KEY
```

### Dépendances Principales (pom.xml)
```xml
spring-boot-starter-web
spring-boot-starter-security
spring-boot-starter-data-jpa
spring-boot-starter-validation
spring-boot-starter-mail
spring-boot-starter-actuator
postgresql
jjwt (JWT)
jasperreports
lombok
springdoc-openapi-ui (Swagger)
redis
firebase-admin (FCM)
```

---

**Version**: 1.0
**Date**: Novembre 2025
**Statut**: Spécification technique détaillée
