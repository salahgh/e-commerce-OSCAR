# Backend API - Spécifications Détaillées
## OSCAR Fashion E-commerce Platform

---

## 1. Vue d'ensemble

Le backend constitue le cœur de la plateforme OSCAR Fashion. Il fournit une **API GraphQL** complète pour le site web Next.js, l'application mobile et le back-office administrateur.

### Objectifs Principaux
- Fournir une API GraphQL sécurisée et performante
- Gérer l'authentification et l'autorisation des utilisateurs
- Assurer la synchronisation en temps réel avec les systèmes existants (ERP, WMS, POS)
- Intégrer les passerelles de paiement algériennes (CIB, Baridimob)
- Générer des documents (factures, bons de livraison) via iText
- Gérer les notifications (Email, SMS, Push)

---

## 2. Stack Technique

### Core Framework
- **Framework**: Spring Boot 3.x (Java 17+)
- **Build Tool**: Maven
- **Architecture**: Monolithique modulaire

### GraphQL
- **GraphQL Library**: SPQR (GraphQL SPQR - Spring Boot starter)
- **Schema Generation**: Automatic from Java code (annotations)
- **Subscriptions**: WebSocket support for real-time updates
- **DataLoader**: Batch loading and caching pour optimisation N+1

### Sécurité
- **Spring Security**: Authentification et autorisation
- **JWT (JSON Web Tokens)**: Gestion des sessions stateless
- **BCrypt**: Hachage des mots de passe
- **CORS**: Configuration pour le web et mobile
- **GraphQL Security**: Query complexity analysis, depth limiting
- **OAuth2**: Pour l'authentification sociale (optionnel)

### Accès aux Données
- **Spring Data JPA**: Couche d'abstraction
- **Hibernate**: ORM
- **PostgreSQL**: Base de données principale
- **Connection Pooling**: HikariCP

### Génération de Documents
- **iText 7**: Génération de factures PDF, bons de livraison
- **Template Engine**: Thymeleaf pour templates HTML → PDF

### Communication & Notifications
- **Spring Mail**: Envoi d'emails
- **SMS Gateway Integration**: Service SMS algérien
- **WebSocket (Spring WebSocket)**: Notifications temps réel via GraphQL Subscriptions

### API & Documentation
- **GraphQL Playground**: Interface interactive pour tester l'API
- **GraphQL Voyager**: Visualisation du schéma GraphQL
- **Schema Introspection**: Documentation automatique via introspection

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
│   │   ├── SecurityConfig.java
│   │   ├── GraphQLConfig.java
│   │   └── WebSocketConfig.java
│   ├── security/            # Sécurité (JWT, Filters)
│   ├── graphql/
│   │   ├── resolvers/      # GraphQL Resolvers (Query, Mutation, Subscription)
│   │   │   ├── UserResolver.java
│   │   │   ├── ProductResolver.java
│   │   │   ├── OrderResolver.java
│   │   │   └── ...
│   │   ├── types/          # GraphQL Types (DTOs)
│   │   ├── inputs/         # GraphQL Input Types
│   │   ├── scalars/        # Custom Scalars (Date, DateTime, etc.)
│   │   └── directives/     # Custom Directives (@auth, @hasRole, etc.)
│   ├── domain/              # Entities JPA
│   │   ├── User.java
│   │   ├── Product.java
│   │   ├── Order.java
│   │   └── ...
│   ├── repository/          # Spring Data JPA Repositories
│   ├── service/             # Business Logic
│   ├── dataloader/          # DataLoaders for batching
│   ├── exception/           # Custom Exceptions
│   ├── util/                # Utilitaires
│   └── Application.java
├── src/main/resources/
│   ├── application.yml
│   ├── application-dev.yml
│   ├── application-prod.yml
│   ├── graphql/             # GraphQL Schema (optionnel si SPQR génère tout)
│   └── pdf-templates/       # Templates PDF (HTML pour iText)
└── src/test/
```

### Architecture GraphQL avec SPQR

**SPQR (GraphQL SPQR)**: Library qui génère automatiquement le schéma GraphQL à partir des classes Java annotées.

**Avantages**:
- Code-first approach
- Pas besoin de fichiers .graphql séparés
- Type safety complet
- Génération automatique de documentation

**Exemple Resolver**:
```java
@GraphQLApi
@Service
public class ProductResolver {

    @Autowired
    private ProductService productService;

    @GraphQLQuery(name = "products")
    public Page<Product> getProducts(
        @GraphQLArgument(name = "page") int page,
        @GraphQLArgument(name = "size") int size,
        @GraphQLArgument(name = "filter") ProductFilter filter
    ) {
        return productService.findAll(page, size, filter);
    }

    @GraphQLQuery(name = "product")
    public Product getProduct(@GraphQLArgument(name = "id") UUID id) {
        return productService.findById(id);
    }

    @GraphQLMutation(name = "createProduct")
   @PreAuthorize("hasRole('ADMIN')")
    public Product createProduct(@GraphQLArgument(name = "input") ProductInput input) {
        return productService.create(input);
    }
}
```

---

## 4. Schéma GraphQL Principal

### Types de Base

```graphql
type User {
  id: ID!
  firstName: String!
  lastName: String!
  email: String!
  phone: String
  role: UserRole!
  addresses: [Address!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Product {
  id: ID!
  sku: String!
  name: LocalizedString!
  description: LocalizedString!
  slug: String!
  category: Category!
  basePrice: Float!
  salePrice: Float
  status: ProductStatus!
  stockQuantity: Int!
  images: [ProductImage!]!
  attributes: [Attribute!]!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type Order {
  id: ID!
  orderNumber: String!
  user: User!
  status: OrderStatus!
  items: [OrderItem!]!
  shippingAddress: Address!
  billingAddress: Address!
  subtotal: Float!
  shippingCost: Float!
  discount: Float!
  total: Float!
  paymentMethod: PaymentMethod!
  paymentStatus: PaymentStatus!
  createdAt: DateTime!
  updatedAt: DateTime!
}

type LocalizedString {
  ar: String
  fr: String
  en: String
}

enum UserRole {
  CUSTOMER
  ADMIN
  SUPER_ADMIN
}

enum ProductStatus {
  ACTIVE
  DRAFT
  OUT_OF_STOCK
}

enum OrderStatus {
  PENDING
  CONFIRMED
  SHIPPED
  DELIVERED
  CANCELLED
}
```

### Queries

```graphql
type Query {
  # Auth & Users
  me: User
  user(id: ID!): User
  users(page: Int!, size: Int!, filter: UserFilter): UserConnection!

  # Products
  product(id: ID!): Product
  products(page: Int!, size: Int!, filter: ProductFilter, sort: ProductSort): ProductConnection!
  searchProducts(query: String!, limit: Int): [Product!]!
  featuredProducts(limit: Int): [Product!]!
  newArrivals(limit: Int): [Product!]!

  # Categories
  category(id: ID!): Category
  categories: [Category!]!

  # Cart
  cart: Cart

  # Orders
  order(id: ID!): Order
  myOrders(page: Int!, size: Int!): OrderConnection!
  orders(page: Int!, size: Int!, filter: OrderFilter): OrderConnection! # Admin only

  # Reports (Admin)
  salesReport(from: Date!, to: Date!): SalesReport!
  topProducts(limit: Int!): [ProductSales!]!
  revenueReport(period: ReportPeriod!): RevenueReport!
}
```

### Mutations

```graphql
type Mutation {
  # Auth
  register(input: RegisterInput!): AuthPayload!
  login(input: LoginInput!): AuthPayload!
  refreshToken(token: String!): AuthPayload!
  forgotPassword(email: String!): Boolean!
  resetPassword(token: String!, newPassword: String!): Boolean!

  # User Profile
  updateProfile(input: UpdateProfileInput!): User!
  addAddress(input: AddressInput!): Address!
  updateAddress(id: ID!, input: AddressInput!): Address!
  deleteAddress(id: ID!): Boolean!

  # Products (Admin)
  createProduct(input: ProductInput!): Product!
  updateProduct(id: ID!, input: ProductInput!): Product!
  deleteProduct(id: ID!): Boolean!

  # Categories (Admin)
  createCategory(input: CategoryInput!): Category!
  updateCategory(id: ID!, input: CategoryInput!): Category!
  deleteCategory(id: ID!): Boolean!

  # Cart
  addToCart(productId: ID!, quantity: Int!): Cart!
  updateCartItem(itemId: ID!, quantity: Int!): Cart!
  removeFromCart(itemId: ID!): Cart!
  clearCart: Boolean!
  applyPromoCode(code: String!): Cart!

  # Orders
  createOrder(input: OrderInput!): Order!
  cancelOrder(id: ID!): Order!
  updateOrderStatus(id: ID!, status: OrderStatus!): Order! # Admin only

  # Payments
  initiatePayment(orderId: ID!, method: PaymentMethod!): PaymentIntent!
  confirmPayment(paymentId: ID!): Payment!
}
```

### Subscriptions

```graphql
type Subscription {
  # Real-time notifications
  orderStatusChanged(userId: ID!): Order!
  newNotification(userId: ID!): Notification!
  stockUpdated(productId: ID!): Product!
}
```

---

## 5. Modules Fonctionnels Détaillés

### 5.1 Module Authentification & Utilisateurs

#### Fonctionnalités
- Inscription (Email + Mot de passe)
- Connexion (JWT Token)
- Refresh token
- Récupération de mot de passe (Email)
- Validation d'email
- Gestion de profil utilisateur
- Gestion des adresses

#### GraphQL Types

```graphql
input RegisterInput {
  firstName: String!
  lastName: String!
  email: String!
  password: String!
  phone: String
}

input LoginInput {
  email: String!
  password: String!
}

type AuthPayload {
  token: String!
  refreshToken: String!
  user: User!
}
```

#### Entités JPA

```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password; // BCrypt hashed

    private String phone;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Address> addresses;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

---

### 5.2 Module Produits & Catalogue

#### GraphQL Types

```graphql
input ProductInput {
  sku: String!
  name: LocalizedStringInput!
  description: LocalizedStringInput!
  categoryId: ID!
  basePrice: Float!
  salePrice: Float
  stockQuantity: Int!
  images: [String!]!
  attributes: [AttributeInput!]
}

input ProductFilter {
  categoryId: ID
  minPrice: Float
  maxPrice: Float
  status: ProductStatus
  searchQuery: String
}

type ProductConnection {
  edges: [ProductEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}
```

#### DataLoader pour Optimisation

```java
@Component
public class ProductDataLoader implements DataLoader<UUID, Product> {

    @Autowired
    private ProductRepository productRepository;

    @Override
    public CompletableFuture<List<Product>> load(List<UUID> ids) {
        return CompletableFuture.supplyAsync(() ->
            productRepository.findAllById(ids)
        );
    }
}
```

---

### 5.3 Module Commandes

#### GraphQL Types

```graphql
input OrderInput {
  items: [OrderItemInput!]!
  shippingAddressId: ID!
  billingAddressId: ID
  shippingMethod: ShippingMethod!
  paymentMethod: PaymentMethod!
}

input OrderItemInput {
  productId: ID!
  quantity: Int!
}

enum PaymentMethod {
  CIB
  BARIDIMOB
  CASH_ON_DELIVERY
}

enum ShippingMethod {
  STANDARD
  EXPRESS
}
```

---

### 5.4 Module Paiement

#### Mutations Paiement

```java
@GraphQLApi
@Service
public class PaymentResolver {

    @GraphQLMutation
    public PaymentIntent initiatePayment(
        @GraphQLArgument(name = "orderId") UUID orderId,
        @GraphQLArgument(name = "method") PaymentMethod method
    ) {
        // Create payment intent, generate redirect URL
        return paymentService.initiate(orderId, method);
    }

    @GraphQLMutation
    public Payment confirmPayment(@GraphQLArgument(name = "paymentId") UUID paymentId) {
        // Verify payment with gateway, update order status
        return paymentService.confirm(paymentId);
    }
}
```

---

### 5.5 Module Reporting (iText)

#### Génération PDF avec iText

```java
@Service
public class PdfReportService {

    public byte[] generateInvoicePdf(Order order) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf, PageSize.A4);

        // Add logo
        Image logo = new Image(ImageDataFactory.create("logo.png"));
        document.add(logo);

        // Add invoice header
        Paragraph header = new Paragraph("FACTURE")
            .setFontSize(24)
            .setBold()
            .setTextAlignment(TextAlignment.CENTER);
        document.add(header);

        // Add order details
        Table table = new Table(UnitValue.createPercentArray(new float[]{3, 1, 1, 1}));
        table.addHeaderCell("Produit");
        table.addHeaderCell("Quantité");
        table.addHeaderCell("Prix Unit.");
        table.addHeaderCell("Total");

        for (OrderItem item : order.getItems()) {
            table.addCell(item.getProductName());
            table.addCell(String.valueOf(item.getQuantity()));
            table.addCell(String.format("%.2f DZD", item.getUnitPrice()));
            table.addCell(String.format("%.2f DZD", item.getTotal()));
        }

        document.add(table);

        // Add total
        Paragraph total = new Paragraph("TOTAL: " + order.getTotal() + " DZD")
            .setFontSize(16)
            .setBold()
            .setTextAlignment(TextAlignment.RIGHT);
        document.add(total);

        document.close();
        return baos.toByteArray();
    }
}
```

#### GraphQL Query pour PDF

```graphql
type Query {
  orderInvoicePdf(orderId: ID!): String! # Returns base64 encoded PDF
}
```

---

## 6. GraphQL Documentation

### Approches de Documentation

1. **GraphQL Playground**
   - Interface interactive intégrée
   - Explore le schéma via introspection
   - Test des queries/mutations en temps réel
   - URL: `http://localhost:8080/graphql`

2. **GraphQL Voyager**
   - Visualisation graphique du schéma
   - Relations entre types
   - URL: `http://localhost:8080/voyager`

3. **Schema Introspection**
   - Introspection Query pour générer documentation
   - Utilisé par les outils frontend pour code generation

Configuration:
```yaml
graphql:
  spqr:
    gui:
      enabled: true
      endpoint: /graphql
      page-title: "OSCAR Fashion API"
  voyager:
    enabled: true
    endpoint: /voyager
```

---

## 7. Sécurité GraphQL

### Mesures de Sécurité Spécifiques

1. **Query Complexity Analysis**
```java
@Configuration
public class GraphQLSecurityConfig {

    @Bean
    public QueryComplexityInstrumentation queryComplexity() {
        return QueryComplexityInstrumentation.builder()
            .maxComplexity(1000)
            .build();
    }
}
```

2. **Depth Limiting**
```java
@Bean
public MaxQueryDepthInstrumentation maxDepth() {
    return new MaxQueryDepthInstrumentation(10);
}
```

3. **Authentication Directive**
```java
@GraphQLDirective(name = "auth")
public @interface AuthDirective {
    String[] roles() default {};
}
```

4. **Rate Limiting**
- Limiter nombre de requêtes par utilisateur/IP
- Utiliser annotations Spring Security

---

## 8. Performance & Optimisation

### Stratégies

1. **DataLoader Pattern**
   - Batch loading pour éviter N+1 queries
   - Cache au niveau requête

2. **Pagination**
   - Cursor-based pagination (Relay spec)
   - Connection pattern

3. **Field Selection**
   - Charger uniquement les champs demandés
   - Projection JPA dynamique

4. **Query Optimization**
   - Index database
   - Fetch joins JPA
   - Query plan analysis

---

## 9. Tests

### Types de Tests

1. **Tests Unitaires**: Service layer (JUnit 5 + Mockito)
2. **Tests d'Intégration GraphQL**:
   ```java
   @GraphQLTest
   @AutoConfigureGraphQl
   class ProductResolverTest {
       @Autowired
       private GraphQlTester graphQlTester;

       @Test
       void shouldGetProduct() {
           graphQlTester.query("""
               query {
                   product(id: "123") {
                       name { fr }
                   }
               }
           """)
           .execute()
           .path("product.name.fr")
           .entity(String.class)
           .isEqualTo("Test Product");
       }
   }
   ```

**Note**: Tests minimaux pour le moment (selon requirements)

---

## 10. Déploiement

### Configuration Production

```yaml
spring:
  datasource:
    url: ${DATABASE_URL}
    username: ${DATABASE_USERNAME}
    password: ${DATABASE_PASSWORD}
    hikari:
      maximum-pool-size: 20
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: false

graphql:
  spqr:
    gui:
      enabled: false # Désactiver en production
```

---

## 11. Variables d'Environnement

```
DATABASE_URL
DATABASE_USERNAME
DATABASE_PASSWORD
JWT_SECRET
JWT_EXPIRATION
SMTP_HOST
SMTP_USERNAME
SMTP_PASSWORD
SMS_API_KEY
CIB_MERCHANT_ID
CIB_API_KEY
BARIDIMOB_MERCHANT_ID
BARIDIMOB_API_KEY
ERP_API_URL
ERP_API_KEY
```

---

## 12. Dépendances Maven Principales

```xml
<dependencies>
    <!-- Spring Boot -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>

    <!-- GraphQL SPQR -->
    <dependency>
        <groupId>io.leangen.graphql</groupId>
        <artifactId>graphql-spqr-spring-boot-starter</artifactId>
        <version>0.0.6</version>
    </dependency>

    <!-- Security -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>

    <!-- JWT -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.11.5</version>
    </dependency>

    <!-- Database -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.postgresql</groupId>
        <artifactId>postgresql</artifactId>
    </dependency>

    <!-- iText for PDF -->
    <dependency>
        <groupId>com.itextpdf</groupId>
        <artifactId>itext7-core</artifactId>
        <version>7.2.5</version>
        <type>pom</type>
    </dependency>

    <!-- Mail -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-mail</artifactId>
    </dependency>

    <!-- Validation -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>

    <!-- WebSocket -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-websocket</artifactId>
    </dependency>

    <!-- Actuator -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>

    <!-- Lombok -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
    </dependency>
</dependencies>
```

---

**Version**: 2.0 (GraphQL + iText)
**Date**: Novembre 2025
**Statut**: Spécification technique détaillée (Mise à jour)
