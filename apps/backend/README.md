# OSCAR Fashion - Vendure Backend

A headless e-commerce backend built with [Vendure](https://www.vendure.io/) for the OSCAR Fashion store, tailored for the Algerian market.

## Features

- **GraphQL API** - Shop API & Admin API
- **Admin UI** - Built-in admin dashboard
- **Multilingual Support** - French, Arabic, English
- **Algerian Payment Methods**:
  - Cash on Delivery (COD)
  - CIB (Carte Interbancaire)
  - Baridimob (Algeria Post mobile payment)
- **Algeria Shipping** - All 58 wilayas with zone-based pricing
- **Custom Fields** - Extended product/order fields for fashion e-commerce

## Tech Stack

- **Framework**: Vendure 3.x (NestJS + TypeORM)
- **Language**: TypeScript
- **Database**: PostgreSQL
- **API**: GraphQL

## Prerequisites

- Node.js >= 18.0.0
- PostgreSQL 13+
- npm

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Database

Create a PostgreSQL database:

```sql
CREATE DATABASE oscar_vendure;
```

### 3. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Update the `.env` file with your database credentials.

### 4. Start Development Server

```bash
npm run dev
```

## API Endpoints

Once running, the following endpoints are available:

| Endpoint | URL | Description |
|----------|-----|-------------|
| Shop API | http://localhost:8085/shop-api | Customer-facing GraphQL API |
| Admin API | http://localhost:8085/admin-api | Admin GraphQL API |
| Admin UI | http://localhost:3002/admin | Admin dashboard |
| Shop Playground | http://localhost:8085/shop-api | GraphQL Playground (dev) |
| Admin Playground | http://localhost:8085/admin-api | GraphQL Playground (dev) |

## Default Admin Credentials

- **Username**: superadmin
- **Password**: superadmin123

⚠️ Change these in production!

## Project Structure

```
oscar-vendure/
├── src/
│   ├── index.ts              # Application entry point
│   ├── vendure-config.ts     # Vendure configuration
│   ├── migrations/           # Database migrations
│   └── plugins/
│       └── oscar-plugin/     # Custom OSCAR plugin
│           ├── oscar-plugin.ts
│           ├── api/          # GraphQL resolvers & extensions
│           ├── services/     # Business logic
│           └── payment/      # Payment handlers
├── static/
│   ├── assets/              # Uploaded assets
│   └── email/               # Email templates
├── package.json
├── tsconfig.json
└── README.md
```

## Custom GraphQL Extensions

### Shop API Extensions

```graphql
# Get featured products
query {
  featuredProducts(take: 10) {
    id
    name
    customFields {
      nameFr
      nameAr
      isFeatured
    }
  }
}

# Search with multilingual support
query {
  searchProductsMultilingual(keyword: "robe", take: 20) {
    items { id name }
    totalItems
  }
}

# Get Algeria wilayas
query {
  wilayas {
    code
    name
  }
}

# Calculate shipping cost
query {
  shippingCost(wilayaCode: "16") {
    amount
    currency
  }
}
```

### Admin API Extensions

```graphql
# Get dashboard stats
query {
  oscarDashboardStats {
    totalOrders
    totalRevenue
    totalCustomers
    pendingOrders
  }
}

# Toggle featured product
mutation {
  toggleProductFeatured(productId: "1") {
    id
    customFields { isFeatured }
  }
}
```

## Payment Methods

### Cash on Delivery (COD)
The most common payment method in Algeria. Payment collected upon delivery.

### CIB (Carte Interbancaire)
Algerian interbank card payment. Configure in Admin UI > Settings > Payment Methods.

### Baridimob
Algeria Post mobile payment. Customers pay via their Baridimob app.

## Custom Fields

### Product
- `nameFr`, `nameAr` - Multilingual names
- `descriptionFr`, `descriptionAr` - Multilingual descriptions
- `salePrice` - Discounted price
- `isFeatured` - Featured on homepage
- `viewCount` - Analytics
- `availableSizes`, `availableColors` - Variants

### Collection (Category)
- `nameFr`, `nameAr` - Multilingual names
- `displayOrder` - Sort order

### Order
- `customerNotes`, `adminNotes` - Notes
- `trackingNumber` - Shipping tracking
- `wilaya` - Delivery wilaya
- `cancellationReason` - If cancelled

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Run production server |

## Migration from Spring Boot

This Vendure backend replaces the previous Spring Boot backend with:

| Spring Boot | Vendure |
|-------------|---------|
| JPA Entities | TypeORM + Custom Fields |
| REST/GraphQL SPQR | Native GraphQL |
| Spring Security | Vendure Auth |
| Custom Services | Vendure Services + Plugins |

## License

MIT
