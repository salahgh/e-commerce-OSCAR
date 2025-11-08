# Database Seeding Guide

This directory contains SQL scripts for seeding your OSCAR Fashion e-commerce database with sample data.

## Files

- `seed-data.sql` - Main seeding script with comprehensive sample data

## What Gets Seeded

The script populates the database with:

### Users (8 total)
- **2 Admin users**: Full system access
- **6 Customer users**: Regular customers with various profiles

### Categories (16 total)
- **4 Root categories**: Men, Women, Kids, Accessories
- **12 Subcategories**: T-Shirts, Shirts, Pants, Jeans, Jackets, Dresses, Tops, Hijabs, Bags, Shoes, Watches, etc.

### Products (35 total)
- Men's clothing (T-shirts, shirts, pants, jeans, jackets)
- Women's clothing (dresses, tops, pants, hijabs)
- Kids clothing (boys & girls)
- Accessories (bags, shoes, watches)
- Each product includes:
  - Multilingual names (French, Arabic, English)
  - Pricing (base price and sale price where applicable)
  - Stock quantities
  - Available sizes and colors
  - Product images (Unsplash URLs)
  - View counts

### Shopping Carts (3 active carts)
- Pre-filled carts for sample customers

### Orders (6 orders)
- Various order statuses: Pending, Confirmed, Processing, Shipped, Delivered, Cancelled
- Different payment methods: Cash on Delivery, CIB, BaridiMob
- Complete shipping information
- Order tracking numbers

## How to Run the Seed Script

### Method 1: Using psql Command Line

```bash
# Navigate to the db directory
cd 01-BACKEND/oscar-backend/src/main/resources/db

# Run the script
psql -U postgres -d oscar_ecommerce -f seed-data.sql
```

### Method 2: Using pgAdmin

1. Open pgAdmin
2. Connect to your PostgreSQL server
3. Select the `oscar_ecommerce` database
4. Click **Tools** → **Query Tool**
5. Click **Open File** and select `seed-data.sql`
6. Click **Execute** (F5)

### Method 3: Using DBeaver or DataGrip

1. Connect to your `oscar_ecommerce` database
2. Open SQL Script
3. Copy and paste the contents of `seed-data.sql`
4. Execute the script

### Method 4: Using Docker (if PostgreSQL is in Docker)

```bash
# Copy script to container
docker cp seed-data.sql postgres_container:/tmp/

# Execute script
docker exec -i postgres_container psql -U postgres -d oscar_ecommerce -f /tmp/seed-data.sql
```

## Important Notes

### ⚠️ Data Cleanup
The script **automatically truncates all tables** before inserting new data. This means:
- All existing data will be deleted
- Only use this on development/testing databases
- **NEVER run this on production databases**

### 🔐 Default Credentials
All users have the same password: `password123`

**Admin Accounts:**
- Email: `admin@oscarfashion.dz` / Password: `password123` (SUPER_ADMIN)
- Email: `manager@oscarfashion.dz` / Password: `password123` (ADMIN)

**Customer Accounts:**
- Email: `ahmed.benali@gmail.com` / Password: `password123`
- Email: `fatima.bouazza@gmail.com` / Password: `password123`
- Email: `karim.meziani@gmail.com` / Password: `password123`
- Email: `amina.saidi@yahoo.fr` / Password: `password123`
- Email: `mohamed.khelifi@outlook.com` / Password: `password123`
- Email: `sarah.brahimi@gmail.com` / Password: `password123`

### 📋 Verification

After running the script, verify the data:

```sql
-- Check users
SELECT id, email, role FROM users;

-- Check categories
SELECT id, name_en, parent_id FROM category ORDER BY parent_id NULLS FIRST, display_order;

-- Check products
SELECT id, sku, name_en, base_price, stock_quantity FROM product LIMIT 10;

-- Check orders
SELECT order_number, status, total_amount FROM orders;
```

### 🖼️ Product Images

Product images use Unsplash URLs. These are:
- Free to use
- High quality
- Publicly accessible
- No authentication required

For production, you should:
1. Download and host images on your own CDN
2. Or use your actual product photography
3. Update the image URLs in the script

## Customization

To customize the seed data:

1. Edit `seed-data.sql`
2. Modify the INSERT statements with your data
3. Maintain referential integrity (categories before products, users before orders, etc.)
4. Update sequence reset values if needed

## Troubleshooting

### Error: relation does not exist
- Ensure your database schema is created
- Run `spring.jpa.hibernate.ddl-auto=create` or `update` first
- Or run Hibernate schema generation before seeding

### Error: duplicate key value
- The script truncates tables first
- If you get this error, manually truncate all tables or drop/recreate the database

### Foreign key constraint violations
- Ensure you run the entire script in order
- Don't modify the order of INSERT statements
- Tables are truncated in correct dependency order

### Sequence issues
- Sequences are reset at the beginning of the script
- If you still have issues, manually reset sequences:

```sql
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));
SELECT setval('product_id_seq', (SELECT MAX(id) FROM product));
-- Repeat for other tables
```

## Next Steps

After seeding:

1. **Start your backend**: `./mvnw spring-boot:run`
2. **Test GraphQL**: Visit `http://localhost:8085/playground`
3. **Test authentication**: Login with admin credentials
4. **Explore products**: Query products and categories
5. **Test orders**: Create test orders

## Sample GraphQL Queries

Test your seeded data with these queries:

```graphql
# Get all featured products
query {
  products(featured: true) {
    id
    nameFr
    basePrice
    salePrice
    stockQuantity
  }
}

# Get user with orders
query {
  user(id: 3) {
    firstName
    email
    orders {
      orderNumber
      status
      totalAmount
    }
  }
}

# Get category with products
query {
  category(id: 11) {
    nameFr
    products {
      nameFr
      basePrice
    }
  }
}
```

---

**Need help?** Check the main project documentation or contact the development team.
