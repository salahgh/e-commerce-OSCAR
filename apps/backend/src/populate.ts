import 'dotenv/config';
import {
  LanguageCode,
  FacetService,
  FacetValueService,
  ProductService,
  ProductVariantService,
  CollectionService,
  TaxCategoryService,
  ChannelService,
  RequestContext,
  bootstrapWorker,
  JobQueueService,
} from '@vendure/core';
import { config } from './vendure-config';

/**
 * OSCAR Fashion - Vendure Seed Script
 *
 * Seeds the database with:
 * - 40 Categories (Collections) nested up to 3 levels
 * - Product Options: Sizes (XS-3XL) and Colors (12 colors)
 * - 100 Products with variants
 * - Realistic prices in DZD (Algerian Dinar)
 *
 * Run with: npm run populate
 * NOTE: Stop the main Vendure server first before running this script.
 */

// =====================================================
// CATEGORY DEFINITIONS (40 categories, 3 levels deep)
// =====================================================

interface CategoryDef {
  name: string;
  nameFr: string;
  nameAr: string;
  slug: string;
  children?: CategoryDef[];
}

const categories: CategoryDef[] = [
  {
    name: 'Men',
    nameFr: 'Homme',
    nameAr: 'رجال',
    slug: 'men',
    children: [
      {
        name: 'Shirts',
        nameFr: 'Chemises',
        nameAr: 'قمصان',
        slug: 'men-shirts',
        children: [
          { name: 'Casual Shirts', nameFr: 'Chemises Décontractées', nameAr: 'قمصان كاجوال', slug: 'men-casual-shirts' },
          { name: 'Formal Shirts', nameFr: 'Chemises Formelles', nameAr: 'قمصان رسمية', slug: 'men-formal-shirts' },
          { name: 'Polo Shirts', nameFr: 'Polos', nameAr: 'بولو', slug: 'men-polo-shirts' },
        ],
      },
      {
        name: 'Pants',
        nameFr: 'Pantalons',
        nameAr: 'بناطيل',
        slug: 'men-pants',
        children: [
          { name: 'Jeans', nameFr: 'Jeans', nameAr: 'جينز', slug: 'men-jeans' },
          { name: 'Chinos', nameFr: 'Chinos', nameAr: 'تشينو', slug: 'men-chinos' },
          { name: 'Shorts', nameFr: 'Shorts', nameAr: 'شورت', slug: 'men-shorts' },
        ],
      },
      {
        name: 'Outerwear',
        nameFr: 'Vêtements d\'extérieur',
        nameAr: 'ملابس خارجية',
        slug: 'men-outerwear',
        children: [
          { name: 'Jackets', nameFr: 'Vestes', nameAr: 'جاكيتات', slug: 'men-jackets' },
          { name: 'Coats', nameFr: 'Manteaux', nameAr: 'معاطف', slug: 'men-coats' },
        ],
      },
      { name: 'T-Shirts', nameFr: 'T-Shirts', nameAr: 'تي شيرت', slug: 'men-tshirts' },
      { name: 'Suits', nameFr: 'Costumes', nameAr: 'بدلات', slug: 'men-suits' },
    ],
  },
  {
    name: 'Women',
    nameFr: 'Femme',
    nameAr: 'نساء',
    slug: 'women',
    children: [
      {
        name: 'Dresses',
        nameFr: 'Robes',
        nameAr: 'فساتين',
        slug: 'women-dresses',
        children: [
          { name: 'Casual Dresses', nameFr: 'Robes Décontractées', nameAr: 'فساتين كاجوال', slug: 'women-casual-dresses' },
          { name: 'Evening Dresses', nameFr: 'Robes de Soirée', nameAr: 'فساتين سهرة', slug: 'women-evening-dresses' },
          { name: 'Summer Dresses', nameFr: 'Robes d\'Été', nameAr: 'فساتين صيفية', slug: 'women-summer-dresses' },
        ],
      },
      {
        name: 'Tops',
        nameFr: 'Hauts',
        nameAr: 'بلوزات',
        slug: 'women-tops',
        children: [
          { name: 'Blouses', nameFr: 'Chemisiers', nameAr: 'بلوزات', slug: 'women-blouses' },
          { name: 'T-Shirts', nameFr: 'T-Shirts', nameAr: 'تي شيرت', slug: 'women-tshirts' },
        ],
      },
      {
        name: 'Bottoms',
        nameFr: 'Bas',
        nameAr: 'أسفل',
        slug: 'women-bottoms',
        children: [
          { name: 'Skirts', nameFr: 'Jupes', nameAr: 'تنانير', slug: 'women-skirts' },
          { name: 'Pants', nameFr: 'Pantalons', nameAr: 'بناطيل', slug: 'women-pants' },
          { name: 'Jeans', nameFr: 'Jeans', nameAr: 'جينز', slug: 'women-jeans' },
        ],
      },
      { name: 'Abayas', nameFr: 'Abayas', nameAr: 'عباءات', slug: 'women-abayas' },
      { name: 'Hijabs', nameFr: 'Hijabs', nameAr: 'حجاب', slug: 'women-hijabs' },
    ],
  },
  {
    name: 'Kids',
    nameFr: 'Enfants',
    nameAr: 'أطفال',
    slug: 'kids',
    children: [
      {
        name: 'Boys',
        nameFr: 'Garçons',
        nameAr: 'أولاد',
        slug: 'boys',
        children: [
          { name: 'Boys Shirts', nameFr: 'Chemises Garçons', nameAr: 'قمصان أولاد', slug: 'boys-shirts' },
          { name: 'Boys Pants', nameFr: 'Pantalons Garçons', nameAr: 'بناطيل أولاد', slug: 'boys-pants' },
        ],
      },
      {
        name: 'Girls',
        nameFr: 'Filles',
        nameAr: 'بنات',
        slug: 'girls',
        children: [
          { name: 'Girls Dresses', nameFr: 'Robes Filles', nameAr: 'فساتين بنات', slug: 'girls-dresses' },
          { name: 'Girls Tops', nameFr: 'Hauts Filles', nameAr: 'بلوزات بنات', slug: 'girls-tops' },
        ],
      },
    ],
  },
  {
    name: 'Accessories',
    nameFr: 'Accessoires',
    nameAr: 'إكسسوارات',
    slug: 'accessories',
    children: [
      { name: 'Bags', nameFr: 'Sacs', nameAr: 'حقائب', slug: 'bags' },
      { name: 'Belts', nameFr: 'Ceintures', nameAr: 'أحزمة', slug: 'belts' },
      { name: 'Scarves', nameFr: 'Écharpes', nameAr: 'أوشحة', slug: 'scarves' },
      { name: 'Hats', nameFr: 'Chapeaux', nameAr: 'قبعات', slug: 'hats' },
    ],
  },
];

// =====================================================
// SIZE AND COLOR OPTIONS
// =====================================================

const sizes = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];

const colors = [
  { name: 'Black', nameFr: 'Noir', nameAr: 'أسود', code: '#000000' },
  { name: 'White', nameFr: 'Blanc', nameAr: 'أبيض', code: '#FFFFFF' },
  { name: 'Navy', nameFr: 'Marine', nameAr: 'كحلي', code: '#001F3F' },
  { name: 'Gray', nameFr: 'Gris', nameAr: 'رمادي', code: '#808080' },
  { name: 'Beige', nameFr: 'Beige', nameAr: 'بيج', code: '#F5F5DC' },
  { name: 'Brown', nameFr: 'Marron', nameAr: 'بني', code: '#8B4513' },
  { name: 'Red', nameFr: 'Rouge', nameAr: 'أحمر', code: '#FF0000' },
  { name: 'Blue', nameFr: 'Bleu', nameAr: 'أزرق', code: '#0074D9' },
  { name: 'Green', nameFr: 'Vert', nameAr: 'أخضر', code: '#2ECC40' },
  { name: 'Pink', nameFr: 'Rose', nameAr: 'وردي', code: '#FF69B4' },
  { name: 'Purple', nameFr: 'Violet', nameAr: 'بنفسجي', code: '#B10DC9' },
  { name: 'Orange', nameFr: 'Orange', nameAr: 'برتقالي', code: '#FF851B' },
];

// =====================================================
// PRODUCT DEFINITIONS (100 products)
// =====================================================

interface ProductDef {
  name: string;
  nameFr: string;
  nameAr: string;
  slug: string;
  description: string;
  descriptionFr: string;
  descriptionAr: string;
  basePrice: number;
  category: string;
  sizes: string[];
  colors: string[];
  isFeatured?: boolean;
  weightKg?: number;
}

function generateProducts(): ProductDef[] {
  const products: ProductDef[] = [];

  // Men's Casual Shirts (8 products)
  const casualShirtNames = [
    { en: 'Classic Oxford Shirt', fr: 'Chemise Oxford Classique', ar: 'قميص أوكسفورد كلاسيكي' },
    { en: 'Linen Summer Shirt', fr: 'Chemise en Lin Été', ar: 'قميص كتان صيفي' },
    { en: 'Denim Casual Shirt', fr: 'Chemise Denim Décontractée', ar: 'قميص دنيم كاجوال' },
    { en: 'Flannel Check Shirt', fr: 'Chemise Flanelle à Carreaux', ar: 'قميص فانيلا مربعات' },
    { en: 'Chambray Shirt', fr: 'Chemise Chambray', ar: 'قميص شامبراي' },
    { en: 'Cotton Poplin Shirt', fr: 'Chemise Popeline Coton', ar: 'قميص بوبلين قطن' },
    { en: 'Madras Check Shirt', fr: 'Chemise Madras à Carreaux', ar: 'قميص مدراس مربعات' },
    { en: 'Brushed Cotton Shirt', fr: 'Chemise Coton Brossé', ar: 'قميص قطن ناعم' },
  ];
  casualShirtNames.forEach((n, i) => {
    products.push({
      name: n.en, nameFr: n.fr, nameAr: n.ar,
      slug: `men-casual-shirt-${i + 1}`,
      description: `Premium quality ${n.en.toLowerCase()} made from 100% cotton.`,
      descriptionFr: `${n.fr} de qualité premium en 100% coton.`,
      descriptionAr: `${n.ar} عالي الجودة مصنوع من القطن 100%.`,
      basePrice: 350000 + (i * 25000),
      category: 'men-casual-shirts',
      sizes: ['S', 'M', 'L', 'XL', '2XL'],
      colors: ['White', 'Blue', 'Navy', 'Gray', 'Beige'].slice(0, 3 + (i % 3)),
      isFeatured: i < 2, weightKg: 0.35,
    });
  });

  // Men's Formal Shirts (6)
  ['Classic White Dress Shirt', 'French Cuff Shirt', 'Spread Collar Shirt', 'Slim Fit Dress Shirt', 'Pinstripe Dress Shirt', 'Herringbone Shirt'].forEach((n, i) => {
    products.push({
      name: n, nameFr: n, nameAr: n, slug: `men-formal-shirt-${i + 1}`,
      description: `Elegant ${n.toLowerCase()} for business.`, descriptionFr: `${n} élégante.`, descriptionAr: `${n} أنيق.`,
      basePrice: 450000 + (i * 30000), category: 'men-formal-shirts',
      sizes: ['S', 'M', 'L', 'XL'], colors: ['White', 'Blue', 'Gray'], isFeatured: i === 0, weightKg: 0.30,
    });
  });

  // Men's Polo Shirts (6)
  ['Classic Piqué Polo', 'Performance Polo', 'Long Sleeve Polo', 'Slim Fit Polo', 'Striped Polo', 'Contrast Collar Polo'].forEach((n, i) => {
    products.push({
      name: n, nameFr: n, nameAr: n, slug: `men-polo-${i + 1}`,
      description: `Comfortable ${n.toLowerCase()}.`, descriptionFr: `${n} confortable.`, descriptionAr: `${n} مريح.`,
      basePrice: 280000 + (i * 20000), category: 'men-polo-shirts',
      sizes: ['S', 'M', 'L', 'XL', '2XL'], colors: ['Navy', 'White', 'Black', 'Red'], isFeatured: i < 2, weightKg: 0.28,
    });
  });

  // Men's Jeans (6)
  ['Slim Fit Jeans', 'Straight Fit Jeans', 'Relaxed Fit Jeans', 'Stretch Denim Jeans', 'Dark Wash Jeans', 'Distressed Jeans'].forEach((n, i) => {
    products.push({
      name: n, nameFr: n, nameAr: n, slug: `men-jeans-${i + 1}`,
      description: `Premium denim ${n.toLowerCase()}.`, descriptionFr: `${n} en denim premium.`, descriptionAr: `${n} من الدنيم الفاخر.`,
      basePrice: 420000 + (i * 25000), category: 'men-jeans',
      sizes: ['S', 'M', 'L', 'XL', '2XL'], colors: ['Blue', 'Black', 'Gray'], isFeatured: i === 0, weightKg: 0.65,
    });
  });

  // Men's Chinos (4)
  ['Classic Chinos', 'Slim Chinos', 'Stretch Chinos', 'Pleated Chinos'].forEach((n, i) => {
    products.push({
      name: n, nameFr: n, nameAr: n, slug: `men-chinos-${i + 1}`,
      description: `Versatile ${n.toLowerCase()}.`, descriptionFr: `${n} polyvalent.`, descriptionAr: `${n} متعدد الاستخدامات.`,
      basePrice: 380000 + (i * 20000), category: 'men-chinos',
      sizes: ['S', 'M', 'L', 'XL'], colors: ['Beige', 'Navy', 'Gray', 'Brown'], weightKg: 0.45,
    });
  });

  // Men's T-Shirts (8)
  ['Essential Crew Neck', 'V-Neck T-Shirt', 'Henley T-Shirt', 'Graphic Print T-Shirt', 'Longline T-Shirt', 'Pocket T-Shirt', 'Striped T-Shirt', 'Organic Cotton T-Shirt'].forEach((n, i) => {
    products.push({
      name: n, nameFr: n, nameAr: n, slug: `men-tshirt-${i + 1}`,
      description: `Soft ${n.toLowerCase()}.`, descriptionFr: `${n} doux.`, descriptionAr: `${n} ناعم.`,
      basePrice: 180000 + (i * 15000), category: 'men-tshirts',
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'], colors: ['Black', 'White', 'Navy', 'Gray', 'Red', 'Blue'], isFeatured: i < 3, weightKg: 0.22,
    });
  });

  // Men's Jackets (4)
  ['Bomber Jacket', 'Denim Jacket', 'Leather Jacket', 'Harrington Jacket'].forEach((n, i) => {
    products.push({
      name: n, nameFr: n, nameAr: n, slug: `men-jacket-${i + 1}`,
      description: `Stylish ${n.toLowerCase()}.`, descriptionFr: `${n} élégant.`, descriptionAr: `${n} أنيق.`,
      basePrice: 680000 + (i * 80000), category: 'men-jackets',
      sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Navy', 'Brown'], isFeatured: i === 2, weightKg: 0.85,
    });
  });

  // Women's Casual Dresses (6)
  ['Maxi Dress', 'Midi Dress', 'Wrap Dress', 'Shirt Dress', 'A-Line Dress', 'Sundress'].forEach((n, i) => {
    products.push({
      name: n, nameFr: n, nameAr: n, slug: `women-casual-dress-${i + 1}`,
      description: `Beautiful ${n.toLowerCase()}.`, descriptionFr: `Belle ${n.toLowerCase()}.`, descriptionAr: `${n} جميل.`,
      basePrice: 450000 + (i * 35000), category: 'women-casual-dresses',
      sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['Black', 'Navy', 'Red', 'Pink', 'Beige', 'White'], isFeatured: i < 2, weightKg: 0.40,
    });
  });

  // Women's Evening Dresses (4)
  ['Cocktail Dress', 'Gala Dress', 'Sequin Dress', 'Velvet Dress'].forEach((n, i) => {
    products.push({
      name: n, nameFr: n, nameAr: n, slug: `women-evening-dress-${i + 1}`,
      description: `Elegant ${n.toLowerCase()}.`, descriptionFr: `${n} élégante.`, descriptionAr: `${n} أنيق.`,
      basePrice: 850000 + (i * 100000), category: 'women-evening-dresses',
      sizes: ['XS', 'S', 'M', 'L'], colors: ['Black', 'Red', 'Navy', 'Purple'], isFeatured: i === 0, weightKg: 0.55,
    });
  });

  // Women's Blouses (6)
  ['Silk Blouse', 'Peplum Top', 'Off-Shoulder Blouse', 'Bow Tie Blouse', 'Ruffle Blouse', 'Lace Blouse'].forEach((n, i) => {
    products.push({
      name: n, nameFr: n, nameAr: n, slug: `women-blouse-${i + 1}`,
      description: `Feminine ${n.toLowerCase()}.`, descriptionFr: `${n} féminin.`, descriptionAr: `${n} أنثوي.`,
      basePrice: 320000 + (i * 25000), category: 'women-blouses',
      sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['White', 'Pink', 'Beige', 'Black', 'Navy'], isFeatured: i === 0, weightKg: 0.25,
    });
  });

  // Women's T-Shirts (4)
  ['Basic T-Shirt', 'Crop Top', 'Oversized T-Shirt', 'Embroidered T-Shirt'].forEach((n, i) => {
    products.push({
      name: n, nameFr: n, nameAr: n, slug: `women-tshirt-${i + 1}`,
      description: `Comfortable ${n.toLowerCase()}.`, descriptionFr: `${n} confortable.`, descriptionAr: `${n} مريح.`,
      basePrice: 150000 + (i * 15000), category: 'women-tshirts',
      sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['White', 'Black', 'Pink', 'Gray', 'Red'], weightKg: 0.18,
    });
  });

  // Women's Skirts (4)
  ['Pencil Skirt', 'Pleated Skirt', 'Denim Skirt', 'Maxi Skirt'].forEach((n, i) => {
    products.push({
      name: n, nameFr: n, nameAr: n, slug: `women-skirt-${i + 1}`,
      description: `Versatile ${n.toLowerCase()}.`, descriptionFr: `${n} polyvalente.`, descriptionAr: `${n} متعددة الاستخدامات.`,
      basePrice: 280000 + (i * 20000), category: 'women-skirts',
      sizes: ['XS', 'S', 'M', 'L'], colors: ['Black', 'Navy', 'Beige', 'Blue'], weightKg: 0.30,
    });
  });

  // Women's Hijabs (6)
  ['Chiffon Hijab', 'Jersey Hijab', 'Silk Hijab', 'Cotton Hijab', 'Instant Hijab', 'Printed Hijab'].forEach((n, i) => {
    products.push({
      name: n, nameFr: n, nameAr: n, slug: `women-hijab-${i + 1}`,
      description: `Beautiful ${n.toLowerCase()}.`, descriptionFr: `${n} magnifique.`, descriptionAr: `${n} جميل.`,
      basePrice: 120000 + (i * 20000), category: 'women-hijabs',
      sizes: ['One Size'], colors: ['Black', 'Navy', 'Beige', 'White', 'Pink', 'Purple', 'Brown', 'Gray'], isFeatured: i < 2, weightKg: 0.08,
    });
  });

  // Women's Abayas (4)
  ['Classic Black Abaya', 'Embroidered Abaya', 'Open Front Abaya', 'Kimono Abaya'].forEach((n, i) => {
    products.push({
      name: n, nameFr: n, nameAr: n, slug: `women-abaya-${i + 1}`,
      description: `Elegant ${n.toLowerCase()}.`, descriptionFr: `${n} élégante.`, descriptionAr: `${n} أنيقة.`,
      basePrice: 580000 + (i * 60000), category: 'women-abayas',
      sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Navy', 'Brown', 'Beige'], isFeatured: i === 1, weightKg: 0.50,
    });
  });

  // Kids - Boys Shirts (4)
  ['Boys Polo Shirt', 'Boys Oxford Shirt', 'Boys T-Shirt', 'Boys Checked Shirt'].forEach((n, i) => {
    products.push({
      name: n, nameFr: n, nameAr: n, slug: `boys-shirt-${i + 1}`,
      description: `Comfortable ${n.toLowerCase()}.`, descriptionFr: `${n} confortable.`, descriptionAr: `${n} مريح.`,
      basePrice: 180000 + (i * 15000), category: 'boys-shirts',
      sizes: ['XS', 'S', 'M', 'L'], colors: ['Navy', 'White', 'Blue', 'Red'], weightKg: 0.18,
    });
  });

  // Kids - Boys Pants (4)
  ['Boys Jeans', 'Boys Chinos', 'Boys Joggers', 'Boys Shorts'].forEach((n, i) => {
    products.push({
      name: n, nameFr: n, nameAr: n, slug: `boys-pants-${i + 1}`,
      description: `Durable ${n.toLowerCase()}.`, descriptionFr: `${n} durable.`, descriptionAr: `${n} متين.`,
      basePrice: 220000 + (i * 15000), category: 'boys-pants',
      sizes: ['XS', 'S', 'M', 'L'], colors: ['Navy', 'Black', 'Gray', 'Blue'], weightKg: 0.35,
    });
  });

  // Kids - Girls Dresses (4)
  ['Girls Party Dress', 'Girls Sundress', 'Girls Casual Dress', 'Girls Denim Dress'].forEach((n, i) => {
    products.push({
      name: n, nameFr: n, nameAr: n, slug: `girls-dress-${i + 1}`,
      description: `Adorable ${n.toLowerCase()}.`, descriptionFr: `${n} adorable.`, descriptionAr: `${n} رائع.`,
      basePrice: 280000 + (i * 25000), category: 'girls-dresses',
      sizes: ['XS', 'S', 'M', 'L'], colors: ['Pink', 'White', 'Blue', 'Red', 'Purple'], isFeatured: i === 0, weightKg: 0.25,
    });
  });

  // Accessories - Bags (4)
  ['Leather Tote Bag', 'Crossbody Bag', 'Backpack', 'Clutch Bag'].forEach((n, i) => {
    products.push({
      name: n, nameFr: n, nameAr: n, slug: `bag-${i + 1}`,
      description: `Stylish ${n.toLowerCase()}.`, descriptionFr: `${n} élégant.`, descriptionAr: `${n} أنيق.`,
      basePrice: 380000 + (i * 50000), category: 'bags',
      sizes: ['One Size'], colors: ['Black', 'Brown', 'Beige', 'Navy'], isFeatured: i === 0, weightKg: 0.45,
    });
  });

  // Accessories - Belts (4)
  ['Leather Belt', 'Braided Belt', 'Canvas Belt', 'Reversible Belt'].forEach((n, i) => {
    products.push({
      name: n, nameFr: n, nameAr: n, slug: `belt-${i + 1}`,
      description: `Quality ${n.toLowerCase()}.`, descriptionFr: `${n} de qualité.`, descriptionAr: `${n} عالي الجودة.`,
      basePrice: 150000 + (i * 20000), category: 'belts',
      sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Brown', 'Navy'], weightKg: 0.15,
    });
  });

  // Accessories - Scarves (4)
  ['Wool Scarf', 'Silk Scarf', 'Cashmere Scarf', 'Cotton Scarf'].forEach((n, i) => {
    products.push({
      name: n, nameFr: n, nameAr: n, slug: `scarf-${i + 1}`,
      description: `Elegant ${n.toLowerCase()}.`, descriptionFr: `${n} élégante.`, descriptionAr: `${n} أنيق.`,
      basePrice: 180000 + (i * 40000), category: 'scarves',
      sizes: ['One Size'], colors: ['Gray', 'Navy', 'Beige', 'Red', 'Black'], weightKg: 0.12,
    });
  });

  return products;
}

// =====================================================
// MAIN SEED FUNCTION
// =====================================================

async function seed() {
  console.log('🚀 Starting OSCAR Fashion Vendure seed...\n');
  console.log('⚠️  Make sure the main Vendure server is STOPPED before running this script.\n');

  // Use bootstrapWorker which doesn't start HTTP server
  const { app } = await bootstrapWorker(config);

  const channelService = app.get(ChannelService);
  const facetService = app.get(FacetService);
  const facetValueService = app.get(FacetValueService);
  const productService = app.get(ProductService);
  const productVariantService = app.get(ProductVariantService);
  const collectionService = app.get(CollectionService);
  const taxCategoryService = app.get(TaxCategoryService);

  const channel = await channelService.getDefaultChannel();
  const ctx = new RequestContext({
    channel,
    apiType: 'admin',
    isAuthorized: true,
    authorizedAsOwnerOnly: false,
  });

  console.log('📦 Creating Size and Color Facets...\n');

  // Create or find Size Facet
  let sizeFacet = await facetService.findByCode(ctx, 'size', LanguageCode.en);
  if (!sizeFacet) {
    sizeFacet = await facetService.create(ctx, {
      code: 'size',
      isPrivate: false,
      translations: [
        { languageCode: LanguageCode.en, name: 'Size' },
        { languageCode: LanguageCode.fr, name: 'Taille' },
        { languageCode: LanguageCode.ar, name: 'المقاس' },
      ],
    });
    console.log('  ✅ Created Size facet');
  } else {
    console.log('  ⏭️  Size facet already exists');
  }

  // Create or find Color Facet
  let colorFacet = await facetService.findByCode(ctx, 'color', LanguageCode.en);
  if (!colorFacet) {
    colorFacet = await facetService.create(ctx, {
      code: 'color',
      isPrivate: false,
      translations: [
        { languageCode: LanguageCode.en, name: 'Color' },
        { languageCode: LanguageCode.fr, name: 'Couleur' },
        { languageCode: LanguageCode.ar, name: 'اللون' },
      ],
    });
    console.log('  ✅ Created Color facet');
  } else {
    console.log('  ⏭️  Color facet already exists');
  }

  // Get existing facet values
  const existingSizeFacetValues = await facetValueService.findByFacetId(ctx, sizeFacet.id);
  const existingColorFacetValues = await facetValueService.findByFacetId(ctx, colorFacet.id);

  // Create Size Facet Values
  const sizeFacetValues: Map<string, any> = new Map();
  for (const size of [...sizes, 'One Size']) {
    let existing = existingSizeFacetValues.find(fv => fv.code === size);
    if (!existing) {
      existing = await facetValueService.create(ctx, sizeFacet, {
        code: size,
        translations: [{ languageCode: LanguageCode.en, name: size }],
      });
      console.log(`  ✅ Created size: ${size}`);
    }
    sizeFacetValues.set(size, existing);
  }

  // Create Color Facet Values with colorHex custom field
  const colorFacetValues: Map<string, any> = new Map();
  for (const color of colors) {
    let existing = existingColorFacetValues.find(fv => fv.code === color.name);
    if (!existing) {
      existing = await facetValueService.create(ctx, colorFacet, {
        code: color.name,
        translations: [
          { languageCode: LanguageCode.en, name: color.name },
          { languageCode: LanguageCode.fr, name: color.nameFr },
          { languageCode: LanguageCode.ar, name: color.nameAr },
        ],
        customFields: {
          colorHex: color.code,
        },
      });
      console.log(`  ✅ Created color: ${color.name} (${color.code})`);
    } else {
      // Update existing color facet value with colorHex if missing
      const existingHex = (existing.customFields as any)?.colorHex;
      if (!existingHex) {
        await facetValueService.update(ctx, {
          id: existing.id,
          customFields: {
            colorHex: color.code,
          } as any,
        });
        console.log(`  🔄 Updated color hex for: ${color.name} (${color.code})`);
      }
    }
    colorFacetValues.set(color.name, existing);
  }

  console.log('\n📂 Creating Collections (Categories)...\n');

  const collectionMap: Map<string, any> = new Map();
  let collectionCount = 0;

  async function createCollection(cat: CategoryDef, parentId?: any): Promise<void> {
    let existing = await collectionService.findOneBySlug(ctx, cat.slug);
    if (!existing) {
      const createInput: any = {
        parentId,
        translations: [
          { languageCode: LanguageCode.en, name: cat.name, slug: cat.slug, description: '' },
          { languageCode: LanguageCode.fr, name: cat.nameFr, slug: cat.slug, description: '' },
          { languageCode: LanguageCode.ar, name: cat.nameAr, slug: cat.slug, description: '' },
        ],
        filters: [],
        customFields: {
          nameFr: cat.nameFr,
          nameAr: cat.nameAr,
          displayOrder: collectionCount,
        },
      };
      existing = await collectionService.create(ctx, createInput);
      collectionCount++;
      console.log(`  ✅ Created collection: ${cat.name} (${cat.nameFr})`);
    } else {
      console.log(`  ⏭️  Collection already exists: ${cat.name}`);
    }
    collectionMap.set(cat.slug, existing);

    if (cat.children) {
      for (const child of cat.children) {
        await createCollection(child, String(existing.id));
      }
    }
  }

  for (const cat of categories) {
    await createCollection(cat);
  }

  console.log(`\n  📊 Total collections created: ${collectionCount}\n`);

  console.log('👕 Creating Products...\n');

  const taxCategories = await taxCategoryService.findAll(ctx);
  const defaultTaxCategory = taxCategories.items[0];
  if (!defaultTaxCategory) {
    throw new Error('No tax category found. Please run initial Vendure setup first.');
  }

  const products = generateProducts();
  let productCount = 0;
  let variantCount = 0;

  for (const productDef of products) {
    const existingProduct = await productService.findOneBySlug(ctx, productDef.slug);

    if (existingProduct) {
      console.log(`  ⏭️  Skipping existing product: ${productDef.name}`);
      continue;
    }

    const collection = collectionMap.get(productDef.category);
    if (!collection) {
      console.log(`  ⚠️  Collection not found for ${productDef.name}: ${productDef.category}`);
      continue;
    }

    const product = await productService.create(ctx, {
      translations: [
        { languageCode: LanguageCode.en, name: productDef.name, slug: productDef.slug, description: productDef.description },
        { languageCode: LanguageCode.fr, name: productDef.nameFr, slug: productDef.slug, description: productDef.descriptionFr },
        { languageCode: LanguageCode.ar, name: productDef.nameAr, slug: productDef.slug, description: productDef.descriptionAr },
      ],
      facetValueIds: [],
      // Only the restored/backed Product custom fields are written. The previously
      // removed fields (nameFr/nameAr/descriptionFr/descriptionAr/weightKg/availableSizes/
      // availableColors) have no DB column — FR/AR names+descriptions flow through translations[].
      customFields: {
        isFeatured: productDef.isFeatured || false,
        viewCount: Math.floor(Math.random() * 500),
      },
    });

    for (const size of productDef.sizes) {
      for (const color of productDef.colors) {
        const sizeIndex = sizes.indexOf(size);
        const sizeMultiplier = 1 + (sizeIndex >= 0 ? (sizeIndex - 3) * 0.03 : 0);
        const colorMultiplier = color === 'Black' || color === 'White' ? 1 : 1.05;
        const finalPrice = Math.round(productDef.basePrice * sizeMultiplier * colorMultiplier);

        const sku = `${productDef.slug.toUpperCase().substring(0, 10)}-${size}-${color.substring(0, 3).toUpperCase()}`.replace(/[^A-Z0-9-]/g, '');

        const sizeFv = sizeFacetValues.get(size);
        const colorFv = colorFacetValues.get(color);

        try {
          await productVariantService.create(ctx, [{
            productId: product.id,
            sku,
            price: finalPrice,
            taxCategoryId: defaultTaxCategory.id,
            facetValueIds: [sizeFv?.id, colorFv?.id].filter(Boolean),
            translations: [{ languageCode: LanguageCode.en, name: `${productDef.name} - ${size} / ${color}` }],
            stockOnHand: 10 + Math.floor(Math.random() * 90),
            trackInventory: 'TRUE' as any,
            customFields: { minStockAlert: 5 },
          }]);
          variantCount++;
        } catch (e: any) {
          // Skip if variant combination already exists or SKU is duplicate
          if (e.code === 'USER_INPUT_ERROR') {
            continue;
          }
          throw e;
        }
      }
    }

    productCount++;
    console.log(`  ✅ Created product: ${productDef.name} (${productDef.sizes.length * productDef.colors.length} variants)`);
  }

  console.log(`\n📊 Seed Summary:`);
  console.log(`   Collections: ${collectionCount}`);
  console.log(`   Products: ${productCount}`);
  console.log(`   Variants: ${variantCount}`);

  // Reindex search index
  console.log('\n🔍 Search index will be rebuilt automatically on next server start.');
  console.log('  💡 You can also rebuild it manually from the Vendure Admin UI: Settings > Job Queue > Reindex');

  console.log('\n✨ Seed completed successfully!\n');

  await app.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
