-- =====================================================
-- OSCAR Fashion E-Commerce - Database Seeding Script
-- =====================================================
-- This script populates the database with sample data
-- Execute manually: psql -U postgres -d oscar_ecommerce -f seed-data.sql
-- Or via pgAdmin: Open Query Tool and run this script
-- =====================================================

-- Clear existing data (in correct order to avoid FK violations)
TRUNCATE TABLE order_items CASCADE;
TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE cart_items CASCADE;
TRUNCATE TABLE carts CASCADE;
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE categories CASCADE;
TRUNCATE TABLE users CASCADE;

-- Reset sequences
ALTER SEQUENCE IF EXISTS users_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS categories_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS products_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS carts_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS cart_items_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS orders_id_seq RESTART WITH 1;
ALTER SEQUENCE IF EXISTS order_items_id_seq RESTART WITH 1;

-- =====================================================
-- USERS
-- =====================================================
-- Password for all users: "password123" (BCrypt encoded)
INSERT INTO users (id, first_name, last_name, email, password, phone_number, role, email_verified, is_active, created_at, updated_at) VALUES
(1, 'Admin', 'System', 'admin@oscarfashion.dz', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0555000001', 'SUPER_ADMIN', true, true, NOW(), NOW()),
(2, 'Manager', 'Store', 'manager@oscarfashion.dz', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0555000002', 'ADMIN', true, true, NOW(), NOW()),
(3, 'Ahmed', 'Benali', 'ahmed.benali@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0555123456', 'CUSTOMER', true, true, NOW(), NOW()),
(4, 'Fatima', 'Bouazza', 'fatima.bouazza@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0666234567', 'CUSTOMER', true, true, NOW(), NOW()),
(5, 'Karim', 'Meziani', 'karim.meziani@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0777345678', 'CUSTOMER', true, true, NOW(), NOW()),
(6, 'Amina', 'Saidi', 'amina.saidi@yahoo.fr', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0555456789', 'CUSTOMER', true, true, NOW(), NOW()),
(7, 'Mohamed', 'Khelifi', 'mohamed.khelifi@outlook.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0666567890', 'CUSTOMER', false, true, NOW(), NOW()),
(8, 'Sarah', 'Brahimi', 'sarah.brahimi@gmail.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '0777678901', 'CUSTOMER', true, true, NOW(), NOW());

-- =====================================================
-- CATEGORIES (Hierarchical Structure)
-- =====================================================
-- Root Categories
INSERT INTO categories (id, slug, name_fr, name_ar, name_en, description_fr, description_ar, description_en, image_url, display_order, is_active, parent_id, created_at, updated_at) VALUES
-- Men's Fashion
(1, 'hommes', 'Hommes', 'رجال', 'Men', 'Mode masculine', 'أزياء رجالية', 'Men''s fashion', 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891', 1, true, NULL, NOW(), NOW()),
-- Women's Fashion
(2, 'femmes', 'Femmes', 'نساء', 'Women', 'Mode féminine', 'أزياء نسائية', 'Women''s fashion', 'https://images.unsplash.com/photo-1483985988355-763728e1935b', 2, true, NULL, NOW(), NOW()),
-- Kids
(3, 'enfants', 'Enfants', 'أطفال', 'Kids', 'Mode pour enfants', 'أزياء أطفال', 'Kids fashion', 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9', 3, true, NULL, NOW(), NOW()),
-- Accessories
(4, 'accessoires', 'Accessoires', 'إكسسوارات', 'Accessories', 'Accessoires de mode', 'إكسسوارات الموضة', 'Fashion accessories', 'https://images.unsplash.com/photo-1492707892479-7bc8d5a4ee93', 4, true, NULL, NOW(), NOW());

-- Men's Subcategories
INSERT INTO categories (id, slug, name_fr, name_ar, name_en, description_fr, description_ar, description_en, image_url, display_order, is_active, parent_id, created_at, updated_at) VALUES
(11, 'hommes-tshirts', 'T-Shirts', 'تي شيرت', 'T-Shirts', 'T-shirts pour hommes', 'تي شيرت رجالي', 'Men''s t-shirts', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab', 1, true, 1, NOW(), NOW()),
(12, 'hommes-chemises', 'Chemises', 'قمصان', 'Shirts', 'Chemises pour hommes', 'قمصان رجالية', 'Men''s shirts', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf', 2, true, 1, NOW(), NOW()),
(13, 'hommes-pantalons', 'Pantalons', 'بنطلونات', 'Pants', 'Pantalons pour hommes', 'بنطلونات رجالية', 'Men''s pants', 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a', 3, true, 1, NOW(), NOW()),
(14, 'hommes-jeans', 'Jeans', 'جينز', 'Jeans', 'Jeans pour hommes', 'جينز رجالي', 'Men''s jeans', 'https://images.unsplash.com/photo-1542272604-787c3835535d', 4, true, 1, NOW(), NOW()),
(15, 'hommes-vestes', 'Vestes', 'سترات', 'Jackets', 'Vestes pour hommes', 'سترات رجالية', 'Men''s jackets', 'https://images.unsplash.com/photo-1551028719-00167b16eac5', 5, true, 1, NOW(), NOW());

-- Women's Subcategories
INSERT INTO categories (id, slug, name_fr, name_ar, name_en, description_fr, description_ar, description_en, image_url, display_order, is_active, parent_id, created_at, updated_at) VALUES
(21, 'femmes-robes', 'Robes', 'فساتين', 'Dresses', 'Robes pour femmes', 'فساتين نسائية', 'Women''s dresses', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8', 1, true, 2, NOW(), NOW()),
(22, 'femmes-hauts', 'Hauts', 'بلوزات', 'Tops', 'Hauts pour femmes', 'بلوزات نسائية', 'Women''s tops', 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3', 2, true, 2, NOW(), NOW()),
(23, 'femmes-pantalons', 'Pantalons', 'بنطلونات', 'Pants', 'Pantalons pour femmes', 'بنطلونات نسائية', 'Women''s pants', 'https://images.unsplash.com/photo-1506629082955-511b1aa562c8', 3, true, 2, NOW(), NOW()),
(24, 'femmes-jupes', 'Jupes', 'تنانير', 'Skirts', 'Jupes pour femmes', 'تنانير نسائية', 'Women''s skirts', 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa', 4, true, 2, NOW(), NOW()),
(25, 'femmes-hijabs', 'Hijabs', 'حجاب', 'Hijabs', 'Hijabs et voiles', 'حجاب وطرح', 'Hijabs and veils', 'https://images.unsplash.com/photo-1601925662308-a3303c64c5ba', 5, true, 2, NOW(), NOW());

-- Kids Subcategories
INSERT INTO categories (id, slug, name_fr, name_ar, name_en, description_fr, description_ar, description_en, image_url, display_order, is_active, parent_id, created_at, updated_at) VALUES
(31, 'enfants-garcons', 'Garçons', 'أولاد', 'Boys', 'Vêtements pour garçons', 'ملابس أولاد', 'Boys clothing', 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea', 1, true, 3, NOW(), NOW()),
(32, 'enfants-filles', 'Filles', 'بنات', 'Girls', 'Vêtements pour filles', 'ملابس بنات', 'Girls clothing', 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7', 2, true, 3, NOW(), NOW());

-- Accessories Subcategories
INSERT INTO categories (id, slug, name_fr, name_ar, name_en, description_fr, description_ar, description_en, image_url, display_order, is_active, parent_id, created_at, updated_at) VALUES
(41, 'sacs', 'Sacs', 'حقائب', 'Bags', 'Sacs et sacs à main', 'حقائب ومحافظ', 'Bags and handbags', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa', 1, true, 4, NOW(), NOW()),
(42, 'chaussures', 'Chaussures', 'أحذية', 'Shoes', 'Chaussures pour tous', 'أحذية للجميع', 'Shoes for everyone', 'https://images.unsplash.com/photo-1549298916-b41d501d3772', 2, true, 4, NOW(), NOW()),
(43, 'montres', 'Montres', 'ساعات', 'Watches', 'Montres et bijoux', 'ساعات ومجوهرات', 'Watches and jewelry', 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49', 3, true, 4, NOW(), NOW());

-- =====================================================
-- productsS (Men's Collection)
-- =====================================================
INSERT INTO products (id, sku, name_fr, name_ar, name_en, description_fr, description_ar, description_en, base_price, sale_price, stock_quantity, min_stock_alert, category_id, is_active, is_featured, view_count, weight_kg, created_at, updated_at) VALUES
-- Men's T-Shirts
(101, 'MTS-001-BLK', 'T-Shirt Classique Noir', 'تي شيرت كلاسيكي أسود', 'Classic Black T-Shirt', 'T-shirt en coton 100% de qualité supérieure', 'تي شيرت قطن 100% عالي الجودة', '100% premium cotton t-shirt', 2500.00, 1999.00, 150, 20, 11, true, true, 245, 0.25, NOW(), NOW()),
(102, 'MTS-002-WHT', 'T-Shirt Basique Blanc', 'تي شيرت أساسي أبيض', 'Basic White T-Shirt', 'T-shirt blanc essentiel pour tous les jours', 'تي شيرت أبيض أساسي للإستعمال اليومي', 'Essential white t-shirt for everyday wear', 2500.00, NULL, 200, 20, 11, true, true, 312, 0.25, NOW(), NOW()),
(103, 'MTS-003-NVY', 'T-Shirt Sport Marine', 'تي شيرت رياضي كحلي', 'Navy Sport T-Shirt', 'T-shirt sport respirant avec technologie anti-transpiration', 'تي شيرت رياضي قابل للتنفس مع تقنية مضادة للتعرق', 'Breathable sport t-shirt with anti-sweat technology', 3500.00, 2999.00, 80, 15, 11, true, false, 156, 0.22, NOW(), NOW()),

-- Men's Shirts
(201, 'MSH-001-BLU', 'Chemise Oxford Bleue', 'قميص أكسفورد أزرق', 'Blue Oxford Shirt', 'Chemise Oxford classique en coton', 'قميص أكسفورد كلاسيكي قطني', 'Classic cotton Oxford shirt', 6500.00, 5499.00, 60, 10, 12, true, true, 189, 0.35, NOW(), NOW()),
(202, 'MSH-002-WHT', 'Chemise Business Blanche', 'قميص عمل أبيض', 'White Business Shirt', 'Chemise formelle parfaite pour le bureau', 'قميص رسمي مثالي للمكتب', 'Perfect formal shirt for office', 7000.00, NULL, 45, 10, 12, true, false, 98, 0.35, NOW(), NOW()),
(203, 'MSH-003-STR', 'Chemise Rayée Casual', 'قميص مخطط كاجوال', 'Striped Casual Shirt', 'Chemise à rayures décontractée', 'قميص مخطط غير رسمي', 'Casual striped shirt', 5500.00, 4799.00, 55, 10, 12, true, true, 167, 0.33, NOW(), NOW()),

-- Men's Pants
(301, 'MPN-001-BLK', 'Pantalon Chino Noir', 'بنطلون شينو أسود', 'Black Chino Pants', 'Pantalon chino élégant et confortable', 'بنطلون شينو أنيق ومريح', 'Elegant and comfortable chino pants', 8500.00, 6999.00, 70, 15, 13, true, true, 223, 0.55, NOW(), NOW()),
(302, 'MPN-002-BEG', 'Pantalon Chino Beige', 'بنطلون شينو بيج', 'Beige Chino Pants', 'Pantalon chino beige polyvalent', 'بنطلون شينو بيج متعدد الاستخدامات', 'Versatile beige chino pants', 8500.00, NULL, 65, 15, 13, true, false, 145, 0.55, NOW(), NOW()),

-- Men's Jeans
(401, 'MJN-001-BLU', 'Jean Slim Bleu Foncé', 'جينز سليم أزرق داكن', 'Dark Blue Slim Jeans', 'Jean slim fit confortable avec stretch', 'جينز سليم فيت مريح مع مطاطية', 'Comfortable slim fit jeans with stretch', 9500.00, 7999.00, 90, 20, 14, true, true, 456, 0.65, NOW(), NOW()),
(402, 'MJN-002-BLK', 'Jean Noir Classique', 'جينز أسود كلاسيكي', 'Classic Black Jeans', 'Jean noir classique coupe droite', 'جينز أسود كلاسيكي قصة مستقيمة', 'Classic black straight cut jeans', 9500.00, NULL, 85, 20, 14, true, true, 389, 0.65, NOW(), NOW()),
(403, 'MJN-003-LGT', 'Jean Bleu Clair', 'جينز أزرق فاتح', 'Light Blue Jeans', 'Jean délavé bleu clair style moderne', 'جينز أزرق فاتح بأسلوب عصري', 'Light blue washed jeans modern style', 8999.00, 7499.00, 75, 15, 14, true, false, 267, 0.63, NOW(), NOW()),

-- Men's Jackets
(501, 'MJK-001-BLK', 'Veste Bomber Noire', 'سترة بومبر سوداء', 'Black Bomber Jacket', 'Veste bomber tendance avec doublure confortable', 'سترة بومبر عصرية مع بطانة مريحة', 'Trendy bomber jacket with comfortable lining', 15000.00, 12999.00, 35, 8, 15, true, true, 178, 0.85, NOW(), NOW()),
(502, 'MJK-002-DNM', 'Veste en Jean', 'سترة جينز', 'Denim Jacket', 'Veste en jean classique indémodable', 'سترة جينز كلاسيكية لا تتغير مع الزمن', 'Timeless classic denim jacket', 12000.00, NULL, 40, 8, 15, true, true, 201, 0.75, NOW(), NOW());

-- =====================================================
-- productsS (Women's Collection)
-- =====================================================
INSERT INTO products (id, sku, name_fr, name_ar, name_en, description_fr, description_ar, description_en, base_price, sale_price, stock_quantity, min_stock_alert, category_id, is_active, is_featured, view_count, weight_kg, created_at, updated_at) VALUES
-- Women's Dresses
(601, 'WDR-001-FLR', 'Robe Florale Été', 'فستان زهري صيفي', 'Floral Summer Dress', 'Robe florale légère parfaite pour l''été', 'فستان زهري خفيف مثالي للصيف', 'Light floral dress perfect for summer', 12000.00, 9999.00, 45, 10, 21, true, true, 567, 0.35, NOW(), NOW()),
(602, 'WDR-002-BLK', 'Robe de Soirée Noire', 'فستان سهرة أسود', 'Black Evening Dress', 'Robe élégante pour occasions spéciales', 'فستان أنيق للمناسبات الخاصة', 'Elegant dress for special occasions', 18000.00, 15999.00, 25, 5, 21, true, true, 423, 0.45, NOW(), NOW()),
(603, 'WDR-003-MAR', 'Robe Maxi Marron', 'فستان ماكسي بني', 'Brown Maxi Dress', 'Robe longue confortable style bohème', 'فستان طويل مريح بأسلوب بوهيمي', 'Comfortable long dress bohemian style', 13500.00, NULL, 38, 8, 21, true, false, 298, 0.42, NOW(), NOW()),

-- Women's Tops
(701, 'WTP-001-WHT', 'Blouse Blanche Élégante', 'بلوزة بيضاء أنيقة', 'Elegant White Blouse', 'Blouse blanche sophistiquée pour le travail', 'بلوزة بيضاء راقية للعمل', 'Sophisticated white blouse for work', 6500.00, 5499.00, 70, 15, 22, true, true, 334, 0.25, NOW(), NOW()),
(702, 'WTP-002-PNK', 'Top Rose Casual', 'بلوزة وردية كاجوال', 'Pink Casual Top', 'Top décontracté rose poudré', 'بلوزة غير رسمية وردي فاتح', 'Casual powder pink top', 4500.00, NULL, 85, 15, 22, true, false, 245, 0.22, NOW(), NOW()),
(703, 'WTP-003-BLU', 'Chemisier Bleu Marine', 'قميص كحلي', 'Navy Blue Blouse', 'Chemisier professionnel bleu marine', 'قميص احترافي كحلي', 'Professional navy blue blouse', 7000.00, 5999.00, 60, 12, 22, true, false, 189, 0.26, NOW(), NOW()),

-- Women's Pants
(801, 'WPN-001-BLK', 'Pantalon Tailleur Noir', 'بنطلون رسمي أسود', 'Black Dress Pants', 'Pantalon tailleur noir professionnel', 'بنطلون رسمي أسود احترافي', 'Professional black dress pants', 9500.00, 7999.00, 55, 12, 23, true, true, 267, 0.48, NOW(), NOW()),
(802, 'WPN-002-GRY', 'Pantalon Large Gris', 'بنطلون واسع رمادي', 'Gray Wide Pants', 'Pantalon large gris tendance', 'بنطلون واسع رمادي عصري', 'Trendy gray wide pants', 8500.00, NULL, 48, 10, 23, true, false, 178, 0.45, NOW(), NOW()),

-- Women's Hijabs
(901, 'WHJ-001-BLK', 'Hijab Jersey Noir', 'حجاب جيرسي أسود', 'Black Jersey Hijab', 'Hijab en jersey doux et confortable', 'حجاب جيرسي ناعم ومريح', 'Soft and comfortable jersey hijab', 1500.00, 1299.00, 200, 30, 25, true, true, 678, 0.08, NOW(), NOW()),
(902, 'WHJ-002-BEG', 'Hijab Soie Beige', 'حجاب حرير بيج', 'Beige Silk Hijab', 'Hijab en soie premium qualité supérieure', 'حجاب حرير فاخر جودة عالية', 'Premium quality silk hijab', 3500.00, 2999.00, 150, 25, 25, true, true, 523, 0.05, NOW(), NOW()),
(903, 'WHJ-003-NVY', 'Hijab Coton Marine', 'حجاب قطن كحلي', 'Navy Cotton Hijab', 'Hijab en coton respirant', 'حجاب قطني قابل للتنفس', 'Breathable cotton hijab', 2000.00, NULL, 180, 30, 25, true, false, 445, 0.07, NOW(), NOW());

-- =====================================================
-- productsS (Kids & Accessories)
-- =====================================================
INSERT INTO products (id, sku, name_fr, name_ar, name_en, description_fr, description_ar, description_en, base_price, sale_price, stock_quantity, min_stock_alert, category_id, is_active, is_featured, view_count, weight_kg, created_at, updated_at) VALUES
-- Kids Boys
(1001, 'KBY-001-SET', 'Ensemble Garçon Sport', 'طقم ولد رياضي', 'Boys Sport Set', 'Ensemble t-shirt et short pour garçon', 'طقم تي شيرت وشورت للأولاد', 'T-shirt and shorts set for boys', 5500.00, 4499.00, 65, 15, 31, true, true, 234, 0.35, NOW(), NOW()),
(1002, 'KBY-002-JNS', 'Jean Garçon Bleu', 'جينز ولد أزرق', 'Boys Blue Jeans', 'Jean confortable pour garçon', 'جينز مريح للأولاد', 'Comfortable jeans for boys', 6000.00, NULL, 58, 12, 31, true, false, 167, 0.42, NOW(), NOW()),

-- Kids Girls
(1101, 'KGL-001-DRS', 'Robe Fille Rose', 'فستان بنت وردي', 'Girls Pink Dress', 'Jolie robe rose pour petite fille', 'فستان وردي جميل للبنات الصغيرات', 'Pretty pink dress for little girls', 6500.00, 5299.00, 50, 12, 32, true, true, 312, 0.28, NOW(), NOW()),
(1102, 'KGL-002-SET', 'Ensemble Fille Été', 'طقم بنت صيفي', 'Girls Summer Set', 'Ensemble d''été coloré pour fille', 'طقم صيفي ملون للبنات', 'Colorful summer set for girls', 5500.00, 4799.00, 55, 12, 32, true, false, 223, 0.32, NOW(), NOW()),

-- Bags
(1201, 'BAG-001-BRN', 'Sac à Main Cuir Marron', 'حقيبة يد جلد بني', 'Brown Leather Handbag', 'Sac en cuir véritable de haute qualité', 'حقيبة جلد طبيعي عالية الجودة', 'High quality genuine leather bag', 15000.00, 12999.00, 30, 8, 41, true, true, 456, 0.65, NOW(), NOW()),
(1202, 'BAG-002-BLK', 'Sac Bandoulière Noir', 'حقيبة كتف سوداء', 'Black Shoulder Bag', 'Sac bandoulière élégant et pratique', 'حقيبة كتف أنيقة وعملية', 'Elegant and practical shoulder bag', 12000.00, 9999.00, 35, 8, 41, true, true, 389, 0.55, NOW(), NOW()),

-- Shoes
(1301, 'SHO-001-SNK', 'Baskets Sport Blanches', 'حذاء رياضي أبيض', 'White Sport Sneakers', 'Baskets confortables pour tous les jours', 'حذاء رياضي مريح للاستعمال اليومي', 'Comfortable sneakers for everyday', 11000.00, 8999.00, 60, 15, 42, true, true, 678, 0.85, NOW(), NOW()),
(1302, 'SHO-002-FOR', 'Chaussures Formelles Noires', 'حذاء رسمي أسود', 'Black Formal Shoes', 'Chaussures élégantes pour occasions', 'حذاء أنيق للمناسبات', 'Elegant shoes for occasions', 13500.00, NULL, 45, 10, 42, true, false, 234, 0.95, NOW(), NOW()),

-- Watches
(1401, 'WTC-001-SLV', 'Montre Classique Argentée', 'ساعة كلاسيكية فضية', 'Silver Classic Watch', 'Montre élégante pour homme et femme', 'ساعة أنيقة للرجال والنساء', 'Elegant watch for men and women', 8500.00, 6999.00, 40, 10, 43, true, true, 345, 0.15, NOW(), NOW()),
(1402, 'WTC-002-GLD', 'Montre Dorée Premium', 'ساعة ذهبية فاخرة', 'Gold Premium Watch', 'Montre dorée de luxe', 'ساعة ذهبية فاخرة', 'Luxury gold watch', 25000.00, 19999.00, 20, 5, 43, true, true, 289, 0.18, NOW(), NOW());

--=====================================================
--products IMAGES (stored in image_urls as array)
--=====================================================
-- Men's T-Shirts Images
INSERT INTO product_images (product_id, image_url) VALUES
(101, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab'),
(101, 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a'),
(102, 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34'),
(102, 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990'),
(103, 'https://images.unsplash.com/photo-1576566588028-4147f3842f27'),

-- Men's Shirts Images
(201, 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf'),
(201, 'https://images.unsplash.com/photo-1603252109303-2751441dd157'),
(202, 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4'),
(203, 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c'),

-- Women's Dresses Images
(601, 'https://images.unsplash.com/photo-1595777457583-95e059d581b8'),
(601, 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1'),
(602, 'https://images.unsplash.com/photo-1566174053879-31528523f8ae'),
(603, 'https://images.unsplash.com/photo-1591369822096-ffd140ec948f'),

-- Hijabs Images
(901, 'https://images.unsplash.com/photo-1601925662308-a3303c64c5ba'),
(902, 'https://images.unsplash.com/photo-1583003873002-c9b803585e18'),
(903, 'https://images.unsplash.com/photo-1609709295948-17d77cb2a69b');

-- =====================================================
-- products SIZES (stored as array)
-- =====================================================
-- Clothing Sizes
INSERT INTO product_sizes (product_id, size) VALUES
-- Men's T-Shirts & Shirts
(101, 'S'), (101, 'M'), (101, 'L'), (101, 'XL'), (101, 'XXL'),
(102, 'S'), (102, 'M'), (102, 'L'), (102, 'XL'), (102, 'XXL'),
(103, 'S'), (103, 'M'), (103, 'L'), (103, 'XL'),
(201, 'S'), (201, 'M'), (201, 'L'), (201, 'XL'), (201, 'XXL'),
(202, 'M'), (202, 'L'), (202, 'XL'), (202, 'XXL'),
(203, 'S'), (203, 'M'), (203, 'L'), (203, 'XL'),

-- Men's Pants & Jeans (Waist sizes)
(301, '30'), (301, '32'), (301, '34'), (301, '36'), (301, '38'),
(302, '30'), (302, '32'), (302, '34'), (302, '36'), (302, '38'),
(401, '30'), (401, '32'), (401, '34'), (401, '36'), (401, '38'), (401, '40'),
(402, '30'), (402, '32'), (402, '34'), (402, '36'), (402, '38'), (402, '40'),
(403, '28'), (403, '30'), (403, '32'), (403, '34'), (403, '36'),

-- Men's Jackets
(501, 'M'), (501, 'L'), (501, 'XL'), (501, 'XXL'),
(502, 'S'), (502, 'M'), (502, 'L'), (502, 'XL'),

-- Women's Dresses & Tops
(601, 'S'), (601, 'M'), (601, 'L'), (601, 'XL'),
(602, 'S'), (602, 'M'), (602, 'L'), (602, 'XL'),
(603, 'S'), (603, 'M'), (603, 'L'),
(701, 'S'), (701, 'M'), (701, 'L'), (701, 'XL'),
(702, 'S'), (702, 'M'), (702, 'L'), (702, 'XL'),
(703, 'S'), (703, 'M'), (703, 'L'),

-- Women's Pants
(801, 'S'), (801, 'M'), (801, 'L'), (801, 'XL'),
(802, 'S'), (802, 'M'), (802, 'L'),

-- Shoes (EU sizes)
(1301, '39'), (1301, '40'), (1301, '41'), (1301, '42'), (1301, '43'), (1301, '44'),
(1302, '39'), (1302, '40'), (1302, '41'), (1302, '42'), (1302, '43'),

-- Kids
(1001, '4-5'), (1001, '6-7'), (1001, '8-9'), (1001, '10-11'),
(1002, '4-5'), (1002, '6-7'), (1002, '8-9'), (1002, '10-11'),
(1101, '3-4'), (1101, '5-6'), (1101, '7-8'), (1101, '9-10'),
(1102, '3-4'), (1102, '5-6'), (1102, '7-8');

-- =====================================================
-- products COLORS (stored as array)
-- =====================================================
INSERT INTO product_colors (product_id, color) VALUES
-- Basic colors for most clothing
(101, 'Noir'), (101, 'Blanc'), (101, 'Gris'),
(102, 'Blanc'), (102, 'Bleu clair'),
(103, 'Marine'), (103, 'Noir'), (103, 'Gris'),
(201, 'Bleu'), (201, 'Blanc'),
(202, 'Blanc'), (202, 'Bleu clair'),
(203, 'Bleu/Blanc'), (203, 'Noir/Blanc'),
(301, 'Noir'), (301, 'Marine'), (301, 'Gris'),
(302, 'Beige'), (302, 'Kaki'),
(401, 'Bleu foncé'), (401, 'Bleu moyen'),
(402, 'Noir'),
(403, 'Bleu clair'), (403, 'Bleu délavé'),
(501, 'Noir'), (501, 'Marine'),
(502, 'Bleu denim'), (502, 'Noir'),

-- Women's productss
(601, 'Rose/Blanc'), (601, 'Bleu/Blanc'),
(602, 'Noir'),
(603, 'Marron'), (603, 'Beige'),
(701, 'Blanc'), (701, 'Crème'),
(702, 'Rose'), (702, 'Rose poudré'),
(703, 'Marine'), (703, 'Bleu royal'),
(801, 'Noir'), (801, 'Gris foncé'),
(802, 'Gris'), (802, 'Beige'),

-- Hijabs
(901, 'Noir'),
(902, 'Beige'), (902, 'Nude'), (902, 'Camel'),
(903, 'Marine'), (903, 'Bleu foncé'),

-- Kids
(1001, 'Bleu/Rouge'), (1001, 'Noir/Blanc'),
(1002, 'Bleu'), (1002, 'Noir'),
(1101, 'Rose'), (1101, 'Rose/Blanc'),
(1102, 'Multicolore'),

-- Accessories
(1201, 'Marron'), (1201, 'Cognac'),
(1202, 'Noir'), (1202, 'Gris foncé'),
(1301, 'Blanc'), (1301, 'Blanc/Noir'),
(1302, 'Noir'),
(1401, 'Argenté'), (1401, 'Argent/Noir'),
(1402, 'Or'), (1402, 'Or rose');

-- =====================================================
-- cartsS
-- =====================================================
-- Create cartss for some customers
INSERT INTO carts (id, user_id, created_at, updated_at) VALUES
(1, 3, NOW(), NOW()),
(2, 4, NOW(), NOW()),
(3, 5, NOW(), NOW());

-- =====================================================
-- carts ITEMS
-- =====================================================
-- Ahmed's carts (User 3)
INSERT INTO cart_items (id, cart_id, product_id, quantity, selected_size, selected_color, created_at, updated_at) VALUES
(1, 1, 101, 2, 'L', 'Noir', NOW(), NOW()),
(2, 1, 401, 1, '32', 'Bleu foncé', NOW(), NOW()),
(3, 1, 501, 1, 'L', 'Noir', NOW(), NOW());

-- Fatima's carts (User 4)
INSERT INTO cart_items (id, cart_id, product_id, quantity, selected_size, selected_color, created_at, updated_at) VALUES
(4, 2, 601, 1, 'M', 'Rose/Blanc', NOW(), NOW()),
(5, 2, 901, 3, NULL, 'Noir', NOW(), NOW()),
(6, 2, 1201, 1, NULL, 'Marron', NOW(), NOW());

-- Karim's carts (User 5)
INSERT INTO cart_items (id, cart_id, product_id, quantity, selected_size, selected_color, created_at, updated_at) VALUES
(7, 3, 1301, 1, '42', 'Blanc', NOW(), NOW()),
(8, 3, 102, 2, 'M', 'Blanc', NOW(), NOW());

-- =====================================================
-- ORDERS
-- =====================================================
INSERT INTO orders (id, order_number, user_id, status, payment_method, subtotal, shipping_cost, discount_amount, total_amount, shipping_full_name, shipping_phone, shipping_address, shipping_city, shipping_wilaya, shipping_postal_code, customer_notes, payment_status, created_at, updated_at) VALUES
-- Order 1: Delivered
(1, 'OSC-2025-0001', 3, 'DELIVERED', 'CASH_ON_DELIVERY', 37497.00, 800.00, 0.00, 38297.00, 'Ahmed Benali', '0555123456', 'Cité 200 Logements, Bâtiment A, N°15', 'Alger Centre', 'Alger', '16000', 'Livraison avant 18h SVP', 'PAID', NOW() - INTERVAL '15 days', NOW() - INTERVAL '8 days'),

-- Order 2: Shipped
(2, 'OSC-2025-0002', 4, 'SHIPPED', 'CIB', 24297.00, 800.00, 1000.00, 24097.00, 'Fatima Bouazza', '0666234567', 'Rue Larbi Ben M''hidi, Résidence El Yasmine, App 23', 'Oran', 'Oran', '31000', NULL, 'PAID', NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days'),

-- Order 3: Processing
(3, 'OSC-2025-0003', 5, 'PROCESSING', 'BARIDIMOB', 13499.00, 600.00, 500.00, 13599.00, 'Karim Meziani', '0777345678', 'Avenue de l''Indépendance, N°87', 'Constantine', 'Constantine', '25000', 'Emballer soigneusement', 'PAID', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

-- Order 4: Confirmed
(4, 'OSC-2025-0004', 6, 'CONFIRMED', 'CASH_ON_DELIVERY', 21996.00, 800.00, 0.00, 22796.00, 'Amina Saidi', '0555456789', 'Cité El Maghreb El Arabi, Bloc C, N°42', 'Annaba', 'Annaba', '23000', NULL, 'PENDING', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

-- Order 5: Pending
(5, 'OSC-2025-0005', 8, 'PENDING', 'CIB', 8999.00, 600.00, 0.00, 9599.00, 'Sarah Brahimi', '0777678901', 'Boulevard Mohamed V, Résidence Les Oliviers, N°12', 'Tlemcen', 'Tlemcen', '13000', 'Appeler avant livraison', 'PENDING', NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'),

-- Order 6: Cancelled
(6, 'OSC-2025-0006', 3, 'CANCELLED', 'CASH_ON_DELIVERY', 15998.00, 800.00, 0.00, 16798.00, 'Ahmed Benali', '0555123456', 'Cité 200 Logements, Bâtiment A, N°15', 'Alger Centre', 'Alger', '16000', NULL, 'CANCELLED', NOW() - INTERVAL '20 days', NOW() - INTERVAL '18 days');

-- Update Order 1 with shipping details
UPDATE orders SET
    tracking_number = 'YLD-DZ-2025-001234',
    shipped_at = NOW() - INTERVAL '10 days',
    delivered_at = NOW() - INTERVAL '8 days',
    paid_at = NOW() - INTERVAL '8 days'
WHERE id = 1;

-- Update Order 2 with shipping details
UPDATE orders SET
    tracking_number = 'YLD-DZ-2025-001567',
    shipped_at = NOW() - INTERVAL '2 days',
    paid_at = NOW() - INTERVAL '4 days',
    payment_id = 'CIB-PAY-20250103-45678'
WHERE id = 2;

-- Update Order 3 with payment details
UPDATE orders SET
    paid_at = NOW() - INTERVAL '2 days',
    payment_id = 'BRDM-PAY-20250106-12345'
WHERE id = 3;

-- Update Order 6 with cancellation details
UPDATE orders SET
    cancelled_at = NOW() - INTERVAL '18 days',
    cancellation_reason = 'Client a changé d''avis'
WHERE id = 6;

-- =====================================================
-- ORDER ITEMS
-- =====================================================
-- Order 1 Items (Delivered - Ahmed)
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, selected_size, selected_color, product_name_fr, product_name_ar, product_name_en, product_sku, product_image_url) VALUES
(1, 1, 101, 2, 1999.00, 'L', 'Noir', 'T-Shirt Classique Noir', 'تي شيرت كلاسيكي أسود', 'Classic Black T-Shirt', 'MTS-001-BLK', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab'),
(2, 1, 401, 1, 7999.00, '32', 'Bleu foncé', 'Jean Slim Bleu Foncé', 'جينز سليم أزرق داكن', 'Dark Blue Slim Jeans', 'MJN-001-BLU', 'https://images.unsplash.com/photo-1542272604-787c3835535d'),
(3, 1, 501, 1, 12999.00, 'L', 'Noir', 'Veste Bomber Noire', 'سترة بومبر سوداء', 'Black Bomber Jacket', 'MJK-001-BLK', 'https://images.unsplash.com/photo-1551028719-00167b16eac5'),
(4, 1, 1301, 1, 8999.00, '42', 'Blanc', 'Baskets Sport Blanches', 'حذاء رياضي أبيض', 'White Sport Sneakers', 'SHO-001-SNK', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a'),
(5, 1, 1401, 1, 6999.00, NULL, 'Argenté', 'Montre Classique Argentée', 'ساعة كلاسيكية فضية', 'Silver Classic Watch', 'WTC-001-SLV', 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49');

-- Order 2 Items (Shipped - Fatima)
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, selected_size, selected_color, product_name_fr, product_name_ar, product_name_en, product_sku, product_image_url) VALUES
(6, 2, 601, 1, 9999.00, 'M', 'Rose/Blanc', 'Robe Florale Été', 'فستان زهري صيفي', 'Floral Summer Dress', 'WDR-001-FLR', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8'),
(7, 2, 901, 3, 1299.00, NULL, 'Noir', 'Hijab Jersey Noir', 'حجاب جيرسي أسود', 'Black Jersey Hijab', 'WHJ-001-BLK', 'https://images.unsplash.com/photo-1601925662308-a3303c64c5ba'),
(8, 2, 1201, 1, 12999.00, NULL, 'Marron', 'Sac à Main Cuir Marron', 'حقيبة يد جلد بني', 'Brown Leather Handbag', 'BAG-001-BRN', 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa');

-- Order 3 Items (Processing - Karim)
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, selected_size, selected_color, product_name_fr, product_name_ar, product_name_en, product_sku, product_image_url) VALUES
(9, 3, 102, 2, 2500.00, 'M', 'Blanc', 'T-Shirt Basique Blanc', 'تي شيرت أساسي أبيض', 'Basic White T-Shirt', 'MTS-002-WHT', 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34'),
(10, 3, 1301, 1, 8999.00, '42', 'Blanc', 'Baskets Sport Blanches', 'حذاء رياضي أبيض', 'White Sport Sneakers', 'SHO-001-SNK', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a');

-- Order 4 Items (Confirmed - Amina)
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, selected_size, selected_color, product_name_fr, product_name_ar, product_name_en, product_sku, product_image_url) VALUES
(11, 4, 702, 2, 4500.00, 'L', 'Rose', 'Top Rose Casual', 'بلوزة وردية كاجوال', 'Pink Casual Top', 'WTP-002-PNK', 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3'),
(12, 4, 902, 3, 2999.00, NULL, 'Beige', 'Hijab Soie Beige', 'حجاب حرير بيج', 'Beige Silk Hijab', 'WHJ-002-BEG', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a'),
(13, 4, 1101, 2, 5299.00, '5-6', 'Rose', 'Robe Fille Rose', 'فستان بنت وردي', 'Girls Pink Dress', 'KGL-001-DRS', 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7');

-- Order 5 Items (Pending - Sarah)
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, selected_size, selected_color, product_name_fr, product_name_ar, product_name_en, product_sku, product_image_url) VALUES
(14, 5, 1301, 1, 8999.00, '40', 'Blanc', 'Baskets Sport Blanches', 'حذاء رياضي أبيض', 'White Sport Sneakers', 'SHO-001-SNK', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a');

-- Order 6 Items (Cancelled - Ahmed)
INSERT INTO order_items (id, order_id, product_id, quantity, unit_price, selected_size, selected_color, product_name_fr, product_name_ar, product_name_en, product_sku, product_image_url) VALUES
(15, 6, 602, 1, 15999.00, 'M', 'Noir', 'Robe de Soirée Noire', 'فستان سهرة أسود', 'Black Evening Dress', 'WDR-002-BLK', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae');

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Database seeding completed successfully!';
    RAISE NOTICE '-------------------------------------------';
    RAISE NOTICE 'Summary:';
    RAISE NOTICE '  - Users: 8 (2 admins, 6 customers)';
    RAISE NOTICE '  - Categories: 16 (4 root + 12 subcategories)';
    RAISE NOTICE '  - productss: 35 (across all categories)';
    RAISE NOTICE '  - cartss: 3 (with items)';
    RAISE NOTICE '  - Orders: 6 (various statuses)';
    RAISE NOTICE '-------------------------------------------';
    RAISE NOTICE 'Default credentials:';
    RAISE NOTICE '  Admin: admin@oscarfashion.dz / password123';
    RAISE NOTICE '  Manager: manager@oscarfashion.dz / password123';
    RAISE NOTICE '  Customer: ahmed.benali@gmail.com / password123';
    RAISE NOTICE '-------------------------------------------';
END $$;
