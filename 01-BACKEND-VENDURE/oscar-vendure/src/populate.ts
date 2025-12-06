import 'dotenv/config';
import { bootstrap, RequestContext, TransactionalConnection, ChannelService, Injector } from '@vendure/core';
import {
  FacetService,
  FacetValueService,
  ProductService,
  ProductVariantService,
  CollectionService,
  TaxCategoryService,
  TaxRateService,
  ShippingMethodService,
  StockLevelService,
  AssetService,
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
  basePrice: number; // in DZD cents
  category: string; // slug
  sizes: string[];
  colors: string[];
  isFeatured?: boolean;
  weightKg?: number;
}

// Helper to generate products
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
      name: n.en,
      nameFr: n.fr,
      nameAr: n.ar,
      slug: `men-casual-shirt-${i + 1}`,
      description: `Premium quality ${n.en.toLowerCase()} made from 100% cotton. Perfect for everyday wear.`,
      descriptionFr: `${n.fr} de qualité premium en 100% coton. Parfait pour un usage quotidien.`,
      descriptionAr: `${n.ar} عالي الجودة مصنوع من القطن 100%. مثالي للاستخدام اليومي.`,
      basePrice: 350000 + (i * 25000), // 3500-5500 DZD
      category: 'men-casual-shirts',
      sizes: ['S', 'M', 'L', 'XL', '2XL'],
      colors: ['White', 'Blue', 'Navy', 'Gray', 'Beige'].slice(0, 3 + (i % 3)),
      isFeatured: i < 2,
      weightKg: 0.35,
    });
  });

  // Men's Formal Shirts (6 products)
  const formalShirtNames = [
    { en: 'Classic White Dress Shirt', fr: 'Chemise Habillée Blanche Classique', ar: 'قميص أبيض رسمي كلاسيكي' },
    { en: 'French Cuff Shirt', fr: 'Chemise à Manchettes Françaises', ar: 'قميص بأكمام فرنسية' },
    { en: 'Spread Collar Shirt', fr: 'Chemise Col Italien', ar: 'قميص بياقة إيطالية' },
    { en: 'Slim Fit Dress Shirt', fr: 'Chemise Habillée Coupe Slim', ar: 'قميص رسمي ضيق' },
    { en: 'Pinstripe Dress Shirt', fr: 'Chemise Habillée Rayée', ar: 'قميص رسمي مخطط' },
    { en: 'Herringbone Shirt', fr: 'Chemise Chevrons', ar: 'قميص متعرج' },
  ];
  formalShirtNames.forEach((n, i) => {
    products.push({
      name: n.en,
      nameFr: n.fr,
      nameAr: n.ar,
      slug: `men-formal-shirt-${i + 1}`,
      description: `Elegant ${n.en.toLowerCase()} for business and formal occasions. Easy-iron fabric.`,
      descriptionFr: `${n.fr} élégante pour le business et les occasions formelles. Tissu facile à repasser.`,
      descriptionAr: `${n.ar} أنيق للعمل والمناسبات الرسمية. قماش سهل الكي.`,
      basePrice: 450000 + (i * 30000), // 4500-6300 DZD
      category: 'men-formal-shirts',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['White', 'Blue', 'Gray'],
      isFeatured: i === 0,
      weightKg: 0.30,
    });
  });

  // Men's Polo Shirts (6 products)
  const poloNames = [
    { en: 'Classic Piqué Polo', fr: 'Polo Piqué Classique', ar: 'بولو بيكيه كلاسيكي' },
    { en: 'Performance Polo', fr: 'Polo Performance', ar: 'بولو رياضي' },
    { en: 'Long Sleeve Polo', fr: 'Polo Manches Longues', ar: 'بولو أكمام طويلة' },
    { en: 'Slim Fit Polo', fr: 'Polo Coupe Slim', ar: 'بولو ضيق' },
    { en: 'Striped Polo', fr: 'Polo Rayé', ar: 'بولو مخطط' },
    { en: 'Contrast Collar Polo', fr: 'Polo Col Contrasté', ar: 'بولو بياقة متباينة' },
  ];
  poloNames.forEach((n, i) => {
    products.push({
      name: n.en,
      nameFr: n.fr,
      nameAr: n.ar,
      slug: `men-polo-${i + 1}`,
      description: `Comfortable ${n.en.toLowerCase()} in breathable cotton piqué.`,
      descriptionFr: `${n.fr} confortable en coton piqué respirant.`,
      descriptionAr: `${n.ar} مريح من القطن المسامي.`,
      basePrice: 280000 + (i * 20000), // 2800-3800 DZD
      category: 'men-polo-shirts',
      sizes: ['S', 'M', 'L', 'XL', '2XL'],
      colors: ['Navy', 'White', 'Black', 'Red', 'Green'].slice(0, 4),
      isFeatured: i < 2,
      weightKg: 0.28,
    });
  });

  // Men's Jeans (6 products)
  const jeansNames = [
    { en: 'Slim Fit Jeans', fr: 'Jean Coupe Slim', ar: 'جينز ضيق' },
    { en: 'Straight Fit Jeans', fr: 'Jean Coupe Droite', ar: 'جينز مستقيم' },
    { en: 'Relaxed Fit Jeans', fr: 'Jean Coupe Relaxée', ar: 'جينز واسع' },
    { en: 'Stretch Denim Jeans', fr: 'Jean Denim Stretch', ar: 'جينز مرن' },
    { en: 'Dark Wash Jeans', fr: 'Jean Lavage Foncé', ar: 'جينز غامق' },
    { en: 'Distressed Jeans', fr: 'Jean Délavé', ar: 'جينز ممزق' },
  ];
  jeansNames.forEach((n, i) => {
    products.push({
      name: n.en,
      nameFr: n.fr,
      nameAr: n.ar,
      slug: `men-jeans-${i + 1}`,
      description: `Premium denim ${n.en.toLowerCase()} with comfortable fit.`,
      descriptionFr: `${n.fr} en denim premium avec coupe confortable.`,
      descriptionAr: `${n.ar} من الدنيم الفاخر بقصة مريحة.`,
      basePrice: 420000 + (i * 25000), // 4200-5450 DZD
      category: 'men-jeans',
      sizes: ['S', 'M', 'L', 'XL', '2XL'],
      colors: ['Blue', 'Black', 'Gray'],
      isFeatured: i === 0,
      weightKg: 0.65,
    });
  });

  // Men's Chinos (4 products)
  const chinoNames = [
    { en: 'Classic Chinos', fr: 'Chinos Classiques', ar: 'تشينو كلاسيكي' },
    { en: 'Slim Chinos', fr: 'Chinos Slim', ar: 'تشينو ضيق' },
    { en: 'Stretch Chinos', fr: 'Chinos Stretch', ar: 'تشينو مرن' },
    { en: 'Pleated Chinos', fr: 'Chinos Plissés', ar: 'تشينو بطيات' },
  ];
  chinoNames.forEach((n, i) => {
    products.push({
      name: n.en,
      nameFr: n.fr,
      nameAr: n.ar,
      slug: `men-chinos-${i + 1}`,
      description: `Versatile ${n.en.toLowerCase()} for smart-casual looks.`,
      descriptionFr: `${n.fr} polyvalent pour un look smart-casual.`,
      descriptionAr: `${n.ar} متعدد الاستخدامات للإطلالة الكاجوال الأنيقة.`,
      basePrice: 380000 + (i * 20000), // 3800-4600 DZD
      category: 'men-chinos',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Beige', 'Navy', 'Gray', 'Brown'],
      weightKg: 0.45,
    });
  });

  // Men's T-Shirts (8 products)
  const tshirtNames = [
    { en: 'Essential Crew Neck', fr: 'T-Shirt Col Rond Essentiel', ar: 'تي شيرت برقبة دائرية' },
    { en: 'V-Neck T-Shirt', fr: 'T-Shirt Col en V', ar: 'تي شيرت برقبة V' },
    { en: 'Henley T-Shirt', fr: 'T-Shirt Henley', ar: 'تي شيرت هنلي' },
    { en: 'Graphic Print T-Shirt', fr: 'T-Shirt Imprimé Graphique', ar: 'تي شيرت مطبوع' },
    { en: 'Longline T-Shirt', fr: 'T-Shirt Long', ar: 'تي شيرت طويل' },
    { en: 'Pocket T-Shirt', fr: 'T-Shirt à Poche', ar: 'تي شيرت بجيب' },
    { en: 'Striped T-Shirt', fr: 'T-Shirt Rayé', ar: 'تي شيرت مخطط' },
    { en: 'Organic Cotton T-Shirt', fr: 'T-Shirt Coton Bio', ar: 'تي شيرت قطن عضوي' },
  ];
  tshirtNames.forEach((n, i) => {
    products.push({
      name: n.en,
      nameFr: n.fr,
      nameAr: n.ar,
      slug: `men-tshirt-${i + 1}`,
      description: `Soft and comfortable ${n.en.toLowerCase()} for everyday wear.`,
      descriptionFr: `${n.fr} doux et confortable pour un usage quotidien.`,
      descriptionAr: `${n.ar} ناعم ومريح للاستخدام اليومي.`,
      basePrice: 180000 + (i * 15000), // 1800-2850 DZD
      category: 'men-tshirts',
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'],
      colors: ['Black', 'White', 'Navy', 'Gray', 'Red', 'Blue'],
      isFeatured: i < 3,
      weightKg: 0.22,
    });
  });

  // Men's Jackets (4 products)
  const jacketNames = [
    { en: 'Bomber Jacket', fr: 'Blouson Bomber', ar: 'جاكيت بومبر' },
    { en: 'Denim Jacket', fr: 'Veste en Jean', ar: 'جاكيت جينز' },
    { en: 'Leather Jacket', fr: 'Veste en Cuir', ar: 'جاكيت جلد' },
    { en: 'Harrington Jacket', fr: 'Veste Harrington', ar: 'جاكيت هارينغتون' },
  ];
  jacketNames.forEach((n, i) => {
    products.push({
      name: n.en,
      nameFr: n.fr,
      nameAr: n.ar,
      slug: `men-jacket-${i + 1}`,
      description: `Stylish ${n.en.toLowerCase()} for transitional weather.`,
      descriptionFr: `${n.fr} élégant pour les mi-saisons.`,
      descriptionAr: `${n.ar} أنيق للطقس المتقلب.`,
      basePrice: 680000 + (i * 80000), // 6800-9200 DZD
      category: 'men-jackets',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'Navy', 'Brown'],
      isFeatured: i === 2,
      weightKg: 0.85,
    });
  });

  // Women's Casual Dresses (6 products)
  const casualDressNames = [
    { en: 'Maxi Dress', fr: 'Robe Longue', ar: 'فستان طويل' },
    { en: 'Midi Dress', fr: 'Robe Mi-Longue', ar: 'فستان متوسط الطول' },
    { en: 'Wrap Dress', fr: 'Robe Portefeuille', ar: 'فستان ملفوف' },
    { en: 'Shirt Dress', fr: 'Robe Chemise', ar: 'فستان قميص' },
    { en: 'A-Line Dress', fr: 'Robe Trapèze', ar: 'فستان خط A' },
    { en: 'Sundress', fr: 'Robe d\'Été', ar: 'فستان صيفي' },
  ];
  casualDressNames.forEach((n, i) => {
    products.push({
      name: n.en,
      nameFr: n.fr,
      nameAr: n.ar,
      slug: `women-casual-dress-${i + 1}`,
      description: `Beautiful ${n.en.toLowerCase()} perfect for casual occasions.`,
      descriptionFr: `Belle ${n.fr.toLowerCase()} parfaite pour les occasions décontractées.`,
      descriptionAr: `${n.ar} جميل مثالي للمناسبات الكاجوال.`,
      basePrice: 450000 + (i * 35000), // 4500-6250 DZD
      category: 'women-casual-dresses',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['Black', 'Navy', 'Red', 'Pink', 'Beige', 'White'],
      isFeatured: i < 2,
      weightKg: 0.40,
    });
  });

  // Women's Evening Dresses (4 products)
  const eveningDressNames = [
    { en: 'Cocktail Dress', fr: 'Robe de Cocktail', ar: 'فستان كوكتيل' },
    { en: 'Gala Dress', fr: 'Robe de Gala', ar: 'فستان حفل' },
    { en: 'Sequin Dress', fr: 'Robe à Paillettes', ar: 'فستان ترتر' },
    { en: 'Velvet Dress', fr: 'Robe en Velours', ar: 'فستان مخمل' },
  ];
  eveningDressNames.forEach((n, i) => {
    products.push({
      name: n.en,
      nameFr: n.fr,
      nameAr: n.ar,
      slug: `women-evening-dress-${i + 1}`,
      description: `Elegant ${n.en.toLowerCase()} for special occasions.`,
      descriptionFr: `${n.fr} élégante pour les occasions spéciales.`,
      descriptionAr: `${n.ar} أنيق للمناسبات الخاصة.`,
      basePrice: 850000 + (i * 100000), // 8500-11500 DZD
      category: 'women-evening-dresses',
      sizes: ['XS', 'S', 'M', 'L'],
      colors: ['Black', 'Red', 'Navy', 'Purple'],
      isFeatured: i === 0,
      weightKg: 0.55,
    });
  });

  // Women's Blouses (6 products)
  const blouseNames = [
    { en: 'Silk Blouse', fr: 'Chemisier en Soie', ar: 'بلوزة حرير' },
    { en: 'Peplum Top', fr: 'Haut Peplum', ar: 'بلوزة بيبلوم' },
    { en: 'Off-Shoulder Blouse', fr: 'Chemisier Épaules Dénudées', ar: 'بلوزة أكتاف مكشوفة' },
    { en: 'Bow Tie Blouse', fr: 'Chemisier à Noeud', ar: 'بلوزة بفيونكة' },
    { en: 'Ruffle Blouse', fr: 'Chemisier à Volants', ar: 'بلوزة بكشكشة' },
    { en: 'Lace Blouse', fr: 'Chemisier en Dentelle', ar: 'بلوزة دانتيل' },
  ];
  blouseNames.forEach((n, i) => {
    products.push({
      name: n.en,
      nameFr: n.fr,
      nameAr: n.ar,
      slug: `women-blouse-${i + 1}`,
      description: `Feminine ${n.en.toLowerCase()} for a polished look.`,
      descriptionFr: `${n.fr} féminin pour un look soigné.`,
      descriptionAr: `${n.ar} أنثوي لإطلالة أنيقة.`,
      basePrice: 320000 + (i * 25000), // 3200-4450 DZD
      category: 'women-blouses',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['White', 'Pink', 'Beige', 'Black', 'Navy'],
      isFeatured: i === 0,
      weightKg: 0.25,
    });
  });

  // Women's T-Shirts (4 products)
  const womenTshirtNames = [
    { en: 'Basic T-Shirt', fr: 'T-Shirt Basique', ar: 'تي شيرت أساسي' },
    { en: 'Crop Top', fr: 'Crop Top', ar: 'كروب توب' },
    { en: 'Oversized T-Shirt', fr: 'T-Shirt Oversize', ar: 'تي شيرت واسع' },
    { en: 'Embroidered T-Shirt', fr: 'T-Shirt Brodé', ar: 'تي شيرت مطرز' },
  ];
  womenTshirtNames.forEach((n, i) => {
    products.push({
      name: n.en,
      nameFr: n.fr,
      nameAr: n.ar,
      slug: `women-tshirt-${i + 1}`,
      description: `Comfortable ${n.en.toLowerCase()} for everyday style.`,
      descriptionFr: `${n.fr} confortable pour un style quotidien.`,
      descriptionAr: `${n.ar} مريح للأناقة اليومية.`,
      basePrice: 150000 + (i * 15000), // 1500-1950 DZD
      category: 'women-tshirts',
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
      colors: ['White', 'Black', 'Pink', 'Gray', 'Red'],
      weightKg: 0.18,
    });
  });

  // Women's Skirts (4 products)
  const skirtNames = [
    { en: 'Pencil Skirt', fr: 'Jupe Crayon', ar: 'تنورة ضيقة' },
    { en: 'Pleated Skirt', fr: 'Jupe Plissée', ar: 'تنورة بطيات' },
    { en: 'Denim Skirt', fr: 'Jupe en Jean', ar: 'تنورة جينز' },
    { en: 'Maxi Skirt', fr: 'Jupe Longue', ar: 'تنورة طويلة' },
  ];
  skirtNames.forEach((n, i) => {
    products.push({
      name: n.en,
      nameFr: n.fr,
      nameAr: n.ar,
      slug: `women-skirt-${i + 1}`,
      description: `Versatile ${n.en.toLowerCase()} for various occasions.`,
      descriptionFr: `${n.fr} polyvalente pour diverses occasions.`,
      descriptionAr: `${n.ar} متعددة الاستخدامات لمختلف المناسبات.`,
      basePrice: 280000 + (i * 20000), // 2800-3400 DZD
      category: 'women-skirts',
      sizes: ['XS', 'S', 'M', 'L'],
      colors: ['Black', 'Navy', 'Beige', 'Blue'],
      weightKg: 0.30,
    });
  });

  // Women's Hijabs (6 products)
  const hijabNames = [
    { en: 'Chiffon Hijab', fr: 'Hijab en Mousseline', ar: 'حجاب شيفون' },
    { en: 'Jersey Hijab', fr: 'Hijab Jersey', ar: 'حجاب جيرسي' },
    { en: 'Silk Hijab', fr: 'Hijab en Soie', ar: 'حجاب حرير' },
    { en: 'Cotton Hijab', fr: 'Hijab en Coton', ar: 'حجاب قطن' },
    { en: 'Instant Hijab', fr: 'Hijab Instantané', ar: 'حجاب جاهز' },
    { en: 'Printed Hijab', fr: 'Hijab Imprimé', ar: 'حجاب مطبوع' },
  ];
  hijabNames.forEach((n, i) => {
    products.push({
      name: n.en,
      nameFr: n.fr,
      nameAr: n.ar,
      slug: `women-hijab-${i + 1}`,
      description: `Beautiful ${n.en.toLowerCase()} with premium fabric.`,
      descriptionFr: `${n.fr} avec tissu premium.`,
      descriptionAr: `${n.ar} جميل بقماش فاخر.`,
      basePrice: 120000 + (i * 20000), // 1200-2200 DZD
      category: 'women-hijabs',
      sizes: ['One Size'],
      colors: ['Black', 'Navy', 'Beige', 'White', 'Pink', 'Purple', 'Brown', 'Gray'],
      isFeatured: i < 2,
      weightKg: 0.08,
    });
  });

  // Women's Abayas (4 products)
  const abayaNames = [
    { en: 'Classic Black Abaya', fr: 'Abaya Noire Classique', ar: 'عباءة سوداء كلاسيكية' },
    { en: 'Embroidered Abaya', fr: 'Abaya Brodée', ar: 'عباءة مطرزة' },
    { en: 'Open Front Abaya', fr: 'Abaya Ouverte', ar: 'عباءة مفتوحة' },
    { en: 'Kimono Abaya', fr: 'Abaya Kimono', ar: 'عباءة كيمونو' },
  ];
  abayaNames.forEach((n, i) => {
    products.push({
      name: n.en,
      nameFr: n.fr,
      nameAr: n.ar,
      slug: `women-abaya-${i + 1}`,
      description: `Elegant ${n.en.toLowerCase()} for modest fashion.`,
      descriptionFr: `${n.fr} élégante pour la mode modeste.`,
      descriptionAr: `${n.ar} أنيقة للموضة المحتشمة.`,
      basePrice: 580000 + (i * 60000), // 5800-7600 DZD
      category: 'women-abayas',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'Navy', 'Brown', 'Beige'],
      isFeatured: i === 1,
      weightKg: 0.50,
    });
  });

  // Kids - Boys Shirts (4 products)
  const boysShirtNames = [
    { en: 'Boys Polo Shirt', fr: 'Polo Garçon', ar: 'بولو أولاد' },
    { en: 'Boys Oxford Shirt', fr: 'Chemise Oxford Garçon', ar: 'قميص أوكسفورد أولاد' },
    { en: 'Boys T-Shirt', fr: 'T-Shirt Garçon', ar: 'تي شيرت أولاد' },
    { en: 'Boys Checked Shirt', fr: 'Chemise à Carreaux Garçon', ar: 'قميص مربعات أولاد' },
  ];
  boysShirtNames.forEach((n, i) => {
    products.push({
      name: n.en,
      nameFr: n.fr,
      nameAr: n.ar,
      slug: `boys-shirt-${i + 1}`,
      description: `Comfortable ${n.en.toLowerCase()} for active boys.`,
      descriptionFr: `${n.fr} confortable pour les garçons actifs.`,
      descriptionAr: `${n.ar} مريح للأولاد النشطين.`,
      basePrice: 180000 + (i * 15000), // 1800-2250 DZD
      category: 'boys-shirts',
      sizes: ['XS', 'S', 'M', 'L'],
      colors: ['Navy', 'White', 'Blue', 'Red'],
      weightKg: 0.18,
    });
  });

  // Kids - Boys Pants (4 products)
  const boysPantsNames = [
    { en: 'Boys Jeans', fr: 'Jean Garçon', ar: 'جينز أولاد' },
    { en: 'Boys Chinos', fr: 'Chinos Garçon', ar: 'تشينو أولاد' },
    { en: 'Boys Joggers', fr: 'Jogging Garçon', ar: 'بنطلون رياضي أولاد' },
    { en: 'Boys Shorts', fr: 'Short Garçon', ar: 'شورت أولاد' },
  ];
  boysPantsNames.forEach((n, i) => {
    products.push({
      name: n.en,
      nameFr: n.fr,
      nameAr: n.ar,
      slug: `boys-pants-${i + 1}`,
      description: `Durable ${n.en.toLowerCase()} for everyday wear.`,
      descriptionFr: `${n.fr} durable pour un usage quotidien.`,
      descriptionAr: `${n.ar} متين للاستخدام اليومي.`,
      basePrice: 220000 + (i * 15000), // 2200-2650 DZD
      category: 'boys-pants',
      sizes: ['XS', 'S', 'M', 'L'],
      colors: ['Navy', 'Black', 'Gray', 'Blue'],
      weightKg: 0.35,
    });
  });

  // Kids - Girls Dresses (4 products)
  const girlsDressNames = [
    { en: 'Girls Party Dress', fr: 'Robe de Fête Fille', ar: 'فستان حفلة بنات' },
    { en: 'Girls Sundress', fr: 'Robe d\'Été Fille', ar: 'فستان صيفي بنات' },
    { en: 'Girls Casual Dress', fr: 'Robe Décontractée Fille', ar: 'فستان كاجوال بنات' },
    { en: 'Girls Denim Dress', fr: 'Robe en Jean Fille', ar: 'فستان جينز بنات' },
  ];
  girlsDressNames.forEach((n, i) => {
    products.push({
      name: n.en,
      nameFr: n.fr,
      nameAr: n.ar,
      slug: `girls-dress-${i + 1}`,
      description: `Adorable ${n.en.toLowerCase()} for little fashionistas.`,
      descriptionFr: `${n.fr} adorable pour les petites fashionistas.`,
      descriptionAr: `${n.ar} رائع للفتيات الأنيقات.`,
      basePrice: 280000 + (i * 25000), // 2800-3550 DZD
      category: 'girls-dresses',
      sizes: ['XS', 'S', 'M', 'L'],
      colors: ['Pink', 'White', 'Blue', 'Red', 'Purple'],
      isFeatured: i === 0,
      weightKg: 0.25,
    });
  });

  // Accessories - Bags (4 products)
  const bagNames = [
    { en: 'Leather Tote Bag', fr: 'Sac Cabas en Cuir', ar: 'حقيبة توت جلد' },
    { en: 'Crossbody Bag', fr: 'Sac Bandoulière', ar: 'حقيبة كتف' },
    { en: 'Backpack', fr: 'Sac à Dos', ar: 'حقيبة ظهر' },
    { en: 'Clutch Bag', fr: 'Pochette', ar: 'حقيبة يد صغيرة' },
  ];
  bagNames.forEach((n, i) => {
    products.push({
      name: n.en,
      nameFr: n.fr,
      nameAr: n.ar,
      slug: `bag-${i + 1}`,
      description: `Stylish ${n.en.toLowerCase()} for everyday use.`,
      descriptionFr: `${n.fr} élégant pour un usage quotidien.`,
      descriptionAr: `${n.ar} أنيق للاستخدام اليومي.`,
      basePrice: 380000 + (i * 50000), // 3800-5300 DZD
      category: 'bags',
      sizes: ['One Size'],
      colors: ['Black', 'Brown', 'Beige', 'Navy'],
      isFeatured: i === 0,
      weightKg: 0.45,
    });
  });

  // Accessories - Belts (4 products)
  const beltNames = [
    { en: 'Leather Belt', fr: 'Ceinture en Cuir', ar: 'حزام جلد' },
    { en: 'Braided Belt', fr: 'Ceinture Tressée', ar: 'حزام مجدول' },
    { en: 'Canvas Belt', fr: 'Ceinture en Toile', ar: 'حزام قماش' },
    { en: 'Reversible Belt', fr: 'Ceinture Réversible', ar: 'حزام قابل للعكس' },
  ];
  beltNames.forEach((n, i) => {
    products.push({
      name: n.en,
      nameFr: n.fr,
      nameAr: n.ar,
      slug: `belt-${i + 1}`,
      description: `Quality ${n.en.toLowerCase()} to complete any outfit.`,
      descriptionFr: `${n.fr} de qualité pour compléter toute tenue.`,
      descriptionAr: `${n.ar} عالي الجودة لإكمال أي إطلالة.`,
      basePrice: 150000 + (i * 20000), // 1500-2100 DZD
      category: 'belts',
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'Brown', 'Navy'],
      weightKg: 0.15,
    });
  });

  // Accessories - Scarves (4 products)
  const scarfNames = [
    { en: 'Wool Scarf', fr: 'Écharpe en Laine', ar: 'وشاح صوف' },
    { en: 'Silk Scarf', fr: 'Foulard en Soie', ar: 'وشاح حرير' },
    { en: 'Cashmere Scarf', fr: 'Écharpe en Cachemire', ar: 'وشاح كشمير' },
    { en: 'Cotton Scarf', fr: 'Écharpe en Coton', ar: 'وشاح قطن' },
  ];
  scarfNames.forEach((n, i) => {
    products.push({
      name: n.en,
      nameFr: n.fr,
      nameAr: n.ar,
      slug: `scarf-${i + 1}`,
      description: `Elegant ${n.en.toLowerCase()} for added warmth and style.`,
      descriptionFr: `${n.fr} élégante pour plus de chaleur et de style.`,
      descriptionAr: `${n.ar} أنيق لمزيد من الدفء والأناقة.`,
      basePrice: 180000 + (i * 40000), // 1800-3000 DZD
      category: 'scarves',
      sizes: ['One Size'],
      colors: ['Gray', 'Navy', 'Beige', 'Red', 'Black'],
      weightKg: 0.12,
    });
  });

  return products;
}

// =====================================================
// MAIN SEED FUNCTION
// =====================================================

async function seed() {
  console.log('🚀 Starting OSCAR Fashion Vendure seed...\n');

  const app = await bootstrap(config);

  const connection = app.get(TransactionalConnection);
  const channelService = app.get(ChannelService);
  const facetService = app.get(FacetService);
  const facetValueService = app.get(FacetValueService);
  const productService = app.get(ProductService);
  const productVariantService = app.get(ProductVariantService);
  const collectionService = app.get(CollectionService);
  const taxCategoryService = app.get(TaxCategoryService);
  const stockLevelService = app.get(StockLevelService);

  // Get the default channel and create admin context
  const channel = await channelService.getDefaultChannel();
  const ctx = new RequestContext({
    channel,
    apiType: 'admin',
    isAuthorized: true,
    authorizedAsOwnerOnly: false,
  });

  console.log('📦 Creating Size and Color Facets...\n');

  // Create Size Facet
  let sizeFacet = await facetService.findByCode(ctx, 'size');
  if (!sizeFacet) {
    sizeFacet = await facetService.create(ctx, {
      code: 'size',
      isPrivate: false,
      translations: [
        { languageCode: 'en' as any, name: 'Size' },
        { languageCode: 'fr' as any, name: 'Taille' },
        { languageCode: 'ar' as any, name: 'المقاس' },
      ],
    });
    console.log('  ✅ Created Size facet');
  }

  // Create Color Facet
  let colorFacet = await facetService.findByCode(ctx, 'color');
  if (!colorFacet) {
    colorFacet = await facetService.create(ctx, {
      code: 'color',
      isPrivate: false,
      translations: [
        { languageCode: 'en' as any, name: 'Color' },
        { languageCode: 'fr' as any, name: 'Couleur' },
        { languageCode: 'ar' as any, name: 'اللون' },
      ],
    });
    console.log('  ✅ Created Color facet');
  }

  // Create Size Facet Values
  const sizeFacetValues: Map<string, any> = new Map();
  for (const size of sizes) {
    let existing = await facetValueService.findByCode(ctx, sizeFacet.id, size);
    if (!existing) {
      existing = await facetValueService.create(ctx, sizeFacet, {
        code: size,
        translations: [
          { languageCode: 'en' as any, name: size },
        ],
      });
      console.log(`  ✅ Created size: ${size}`);
    }
    sizeFacetValues.set(size, existing);
  }
  sizeFacetValues.set('One Size', await facetValueService.findByCode(ctx, sizeFacet.id, 'One Size') || await facetValueService.create(ctx, sizeFacet, {
    code: 'One Size',
    translations: [{ languageCode: 'en' as any, name: 'One Size' }],
  }));

  // Create Color Facet Values
  const colorFacetValues: Map<string, any> = new Map();
  for (const color of colors) {
    let existing = await facetValueService.findByCode(ctx, colorFacet.id, color.name);
    if (!existing) {
      existing = await facetValueService.create(ctx, colorFacet, {
        code: color.name,
        translations: [
          { languageCode: 'en' as any, name: color.name },
          { languageCode: 'fr' as any, name: color.nameFr },
          { languageCode: 'ar' as any, name: color.nameAr },
        ],
      });
      console.log(`  ✅ Created color: ${color.name}`);
    }
    colorFacetValues.set(color.name, existing);
  }

  console.log('\n📂 Creating Collections (Categories)...\n');

  // Create collections recursively
  const collectionMap: Map<string, any> = new Map();
  let collectionCount = 0;

  async function createCollection(cat: CategoryDef, parentId?: string): Promise<void> {
    let existing = await collectionService.findBySlug(ctx, cat.slug);
    if (!existing) {
      const createInput: any = {
        parentId,
        translations: [
          { languageCode: 'en' as any, name: cat.name, slug: cat.slug, description: '' },
          { languageCode: 'fr' as any, name: cat.nameFr, slug: cat.slug, description: '' },
          { languageCode: 'ar' as any, name: cat.nameAr, slug: cat.slug, description: '' },
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
    }
    collectionMap.set(cat.slug, existing);

    if (cat.children) {
      for (const child of cat.children) {
        await createCollection(child, existing.id);
      }
    }
  }

  for (const cat of categories) {
    await createCollection(cat);
  }

  console.log(`\n  📊 Total collections created: ${collectionCount}\n`);

  console.log('👕 Creating Products...\n');

  // Get default tax category
  const taxCategories = await taxCategoryService.findAll(ctx);
  const defaultTaxCategory = taxCategories.items[0];
  if (!defaultTaxCategory) {
    throw new Error('No tax category found. Please run initial Vendure setup first.');
  }

  const products = generateProducts();
  let productCount = 0;
  let variantCount = 0;

  for (const productDef of products) {
    // Check if product exists
    const existingProducts = await productService.findAll(ctx, {
      filter: { slug: { eq: productDef.slug } },
    });

    if (existingProducts.totalItems > 0) {
      console.log(`  ⏭️  Skipping existing product: ${productDef.name}`);
      continue;
    }

    // Get collection
    const collection = collectionMap.get(productDef.category);
    if (!collection) {
      console.log(`  ⚠️  Collection not found for ${productDef.name}: ${productDef.category}`);
      continue;
    }

    // Create product
    const product = await productService.create(ctx, {
      translations: [
        {
          languageCode: 'en' as any,
          name: productDef.name,
          slug: productDef.slug,
          description: productDef.description,
        },
        {
          languageCode: 'fr' as any,
          name: productDef.nameFr,
          slug: productDef.slug,
          description: productDef.descriptionFr,
        },
        {
          languageCode: 'ar' as any,
          name: productDef.nameAr,
          slug: productDef.slug,
          description: productDef.descriptionAr,
        },
      ],
      customFields: {
        nameFr: productDef.nameFr,
        nameAr: productDef.nameAr,
        descriptionFr: productDef.descriptionFr,
        descriptionAr: productDef.descriptionAr,
        isFeatured: productDef.isFeatured || false,
        weightKg: productDef.weightKg || 0.3,
        viewCount: Math.floor(Math.random() * 500),
        availableSizes: productDef.sizes,
        availableColors: productDef.colors,
      },
    });

    // Assign to collection
    await collectionService.assignProductsToCollection(ctx, collection.id, [product.id]);

    // Create variants (size x color combinations)
    for (const size of productDef.sizes) {
      for (const color of productDef.colors) {
        // Price variation: ±10% based on size and color
        const sizeMultiplier = 1 + (sizes.indexOf(size) - 3) * 0.03; // XS cheapest, 3XL most expensive
        const colorMultiplier = color === 'Black' || color === 'White' ? 1 : 1.05; // Basic colors cheaper
        const finalPrice = Math.round(productDef.basePrice * sizeMultiplier * colorMultiplier);

        const sku = `${productDef.slug.toUpperCase().substring(0, 10)}-${size}-${color.substring(0, 3).toUpperCase()}`.replace(/[^A-Z0-9-]/g, '');

        const sizeFv = sizeFacetValues.get(size);
        const colorFv = colorFacetValues.get(color);

        const variant = await productVariantService.create(ctx, [{
          productId: product.id,
          sku,
          price: finalPrice,
          taxCategoryId: defaultTaxCategory.id,
          facetValueIds: [sizeFv?.id, colorFv?.id].filter(Boolean),
          translations: [
            {
              languageCode: 'en' as any,
              name: `${productDef.name} - ${size} / ${color}`,
            },
          ],
          stockOnHand: 10 + Math.floor(Math.random() * 90), // Random stock 10-99
          trackInventory: 'TRUE' as any,
          customFields: {
            minStockAlert: 5,
          },
        }]);

        variantCount++;
      }
    }

    productCount++;
    console.log(`  ✅ Created product: ${productDef.name} (${productDef.sizes.length * productDef.colors.length} variants)`);
  }

  console.log(`\n📊 Seed Summary:`);
  console.log(`   Collections: ${collectionCount}`);
  console.log(`   Products: ${productCount}`);
  console.log(`   Variants: ${variantCount}`);
  console.log('\n✨ Seed completed successfully!\n');

  await app.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
