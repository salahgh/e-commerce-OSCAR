import 'dotenv/config';
import {
  LanguageCode,
  CurrencyCode,
  FacetService,
  FacetValueService,
  ProductService,
  ProductVariantService,
  ProductOptionGroupService,
  ProductOptionService,
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
  [
    { en: 'Classic White Dress Shirt', fr: 'Chemise Habillée Blanche Classique', ar: 'قميص أبيض كلاسيكي أنيق' },
    { en: 'French Cuff Shirt', fr: 'Chemise à Poignets Mousquetaire', ar: 'قميص بأساور فرنسية' },
    { en: 'Spread Collar Shirt', fr: 'Chemise à Col Italien', ar: 'قميص بياقة عريضة' },
    { en: 'Slim Fit Dress Shirt', fr: 'Chemise Habillée Ajustée', ar: 'قميص أنيق ضيق' },
    { en: 'Pinstripe Dress Shirt', fr: 'Chemise Habillée à Rayures', ar: 'قميص مخطط أنيق' },
    { en: 'Herringbone Shirt', fr: 'Chemise à Chevrons', ar: 'قميص بنقشة عظم السمك' },
  ].forEach((n, i) => {
    products.push({
      name: n.en, nameFr: n.fr, nameAr: n.ar, slug: `men-formal-shirt-${i + 1}`,
      description: `Elegant ${n.en.toLowerCase()} for business.`, descriptionFr: `${n.fr} élégante pour le travail.`, descriptionAr: `${n.ar} أنيق للعمل.`,
      basePrice: 450000 + (i * 30000), category: 'men-formal-shirts',
      sizes: ['S', 'M', 'L', 'XL'], colors: ['White', 'Blue', 'Gray'], isFeatured: i === 0, weightKg: 0.30,
    });
  });

  // Men's Polo Shirts (6)
  [
    { en: 'Classic Piqué Polo', fr: 'Polo Piqué Classique', ar: 'بولو بيكيه كلاسيكي' },
    { en: 'Performance Polo', fr: 'Polo Performance', ar: 'بولو رياضي' },
    { en: 'Long Sleeve Polo', fr: 'Polo à Manches Longues', ar: 'بولو بأكمام طويلة' },
    { en: 'Slim Fit Polo', fr: 'Polo Ajusté', ar: 'بولو ضيق' },
    { en: 'Striped Polo', fr: 'Polo Rayé', ar: 'بولو مخطط' },
    { en: 'Contrast Collar Polo', fr: 'Polo à Col Contrasté', ar: 'بولو بياقة مغايرة' },
  ].forEach((n, i) => {
    products.push({
      name: n.en, nameFr: n.fr, nameAr: n.ar, slug: `men-polo-${i + 1}`,
      description: `Comfortable ${n.en.toLowerCase()}.`, descriptionFr: `${n.fr} confortable.`, descriptionAr: `${n.ar} مريح.`,
      basePrice: 280000 + (i * 20000), category: 'men-polo-shirts',
      sizes: ['S', 'M', 'L', 'XL', '2XL'], colors: ['Navy', 'White', 'Black', 'Red'], isFeatured: i < 2, weightKg: 0.28,
    });
  });

  // Men's Jeans (6)
  [
    { en: 'Slim Fit Jeans', fr: 'Jean Coupe Ajustée', ar: 'جينز ضيق' },
    { en: 'Straight Fit Jeans', fr: 'Jean Coupe Droite', ar: 'جينز مستقيم' },
    { en: 'Relaxed Fit Jeans', fr: 'Jean Coupe Décontractée', ar: 'جينز واسع' },
    { en: 'Stretch Denim Jeans', fr: 'Jean Denim Extensible', ar: 'جينز مطاطي' },
    { en: 'Dark Wash Jeans', fr: 'Jean Délavé Foncé', ar: 'جينز داكن' },
    { en: 'Distressed Jeans', fr: 'Jean Déchiré', ar: 'جينز ممزق' },
  ].forEach((n, i) => {
    products.push({
      name: n.en, nameFr: n.fr, nameAr: n.ar, slug: `men-jeans-${i + 1}`,
      description: `Premium denim ${n.en.toLowerCase()}.`, descriptionFr: `${n.fr} en denim premium.`, descriptionAr: `${n.ar} من الدنيم الفاخر.`,
      basePrice: 420000 + (i * 25000), category: 'men-jeans',
      sizes: ['S', 'M', 'L', 'XL', '2XL'], colors: ['Blue', 'Black', 'Gray'], isFeatured: i === 0, weightKg: 0.65,
    });
  });

  // Men's Chinos (4)
  [
    { en: 'Classic Chinos', fr: 'Chino Classique', ar: 'شينو كلاسيكي' },
    { en: 'Slim Chinos', fr: 'Chino Ajusté', ar: 'شينو ضيق' },
    { en: 'Stretch Chinos', fr: 'Chino Extensible', ar: 'شينو مطاطي' },
    { en: 'Pleated Chinos', fr: 'Chino à Pinces', ar: 'شينو بكسرات' },
  ].forEach((n, i) => {
    products.push({
      name: n.en, nameFr: n.fr, nameAr: n.ar, slug: `men-chinos-${i + 1}`,
      description: `Versatile ${n.en.toLowerCase()}.`, descriptionFr: `${n.fr} polyvalent.`, descriptionAr: `${n.ar} متعدد الاستخدامات.`,
      basePrice: 380000 + (i * 20000), category: 'men-chinos',
      sizes: ['S', 'M', 'L', 'XL'], colors: ['Beige', 'Navy', 'Gray', 'Brown'], weightKg: 0.45,
    });
  });

  // Men's T-Shirts (8)
  [
    { en: 'Essential Crew Neck', fr: 'T-Shirt Col Rond Essentiel', ar: 'تي شيرت برقبة دائرية' },
    { en: 'V-Neck T-Shirt', fr: 'T-Shirt Col V', ar: 'تي شيرت برقبة V' },
    { en: 'Henley T-Shirt', fr: 'T-Shirt Henley', ar: 'تي شيرت هينلي' },
    { en: 'Graphic Print T-Shirt', fr: 'T-Shirt Imprimé', ar: 'تي شيرت مطبوع' },
    { en: 'Longline T-Shirt', fr: 'T-Shirt Long', ar: 'تي شيرت طويل' },
    { en: 'Pocket T-Shirt', fr: 'T-Shirt à Poche', ar: 'تي شيرت بجيب' },
    { en: 'Striped T-Shirt', fr: 'T-Shirt Rayé', ar: 'تي شيرت مخطط' },
    { en: 'Organic Cotton T-Shirt', fr: 'T-Shirt Coton Bio', ar: 'تي شيرت قطن عضوي' },
  ].forEach((n, i) => {
    products.push({
      name: n.en, nameFr: n.fr, nameAr: n.ar, slug: `men-tshirt-${i + 1}`,
      description: `Soft ${n.en.toLowerCase()}.`, descriptionFr: `${n.fr} doux.`, descriptionAr: `${n.ar} ناعم.`,
      basePrice: 180000 + (i * 15000), category: 'men-tshirts',
      sizes: ['XS', 'S', 'M', 'L', 'XL', '2XL'], colors: ['Black', 'White', 'Navy', 'Gray', 'Red', 'Blue'], isFeatured: i < 3, weightKg: 0.22,
    });
  });

  // Men's Jackets (4)
  [
    { en: 'Bomber Jacket', fr: 'Blouson Bomber', ar: 'جاكيت بومبر' },
    { en: 'Denim Jacket', fr: 'Veste en Jean', ar: 'جاكيت جينز' },
    { en: 'Leather Jacket', fr: 'Veste en Cuir', ar: 'جاكيت جلد' },
    { en: 'Harrington Jacket', fr: 'Veste Harrington', ar: 'جاكيت هارينغتون' },
  ].forEach((n, i) => {
    products.push({
      name: n.en, nameFr: n.fr, nameAr: n.ar, slug: `men-jacket-${i + 1}`,
      description: `Stylish ${n.en.toLowerCase()}.`, descriptionFr: `${n.fr} élégant.`, descriptionAr: `${n.ar} أنيق.`,
      basePrice: 680000 + (i * 80000), category: 'men-jackets',
      sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Navy', 'Brown'], isFeatured: i === 2, weightKg: 0.85,
    });
  });

  // Women's Casual Dresses (6)
  [
    { en: 'Maxi Dress', fr: 'Robe Longue', ar: 'فستان طويل' },
    { en: 'Midi Dress', fr: 'Robe Mi-Longue', ar: 'فستان متوسط الطول' },
    { en: 'Wrap Dress', fr: 'Robe Portefeuille', ar: 'فستان ملفوف' },
    { en: 'Shirt Dress', fr: 'Robe Chemise', ar: 'فستان قميص' },
    { en: 'A-Line Dress', fr: 'Robe Trapèze', ar: 'فستان على شكل حرف A' },
    { en: 'Sundress', fr: "Robe d'Été", ar: 'فستان صيفي' },
  ].forEach((n, i) => {
    products.push({
      name: n.en, nameFr: n.fr, nameAr: n.ar, slug: `women-casual-dress-${i + 1}`,
      description: `Beautiful ${n.en.toLowerCase()}.`, descriptionFr: `Belle ${n.fr.toLowerCase()}.`, descriptionAr: `${n.ar} جميل.`,
      basePrice: 450000 + (i * 35000), category: 'women-casual-dresses',
      sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['Black', 'Navy', 'Red', 'Pink', 'Beige', 'White'], isFeatured: i < 2, weightKg: 0.40,
    });
  });

  // Women's Evening Dresses (4)
  [
    { en: 'Cocktail Dress', fr: 'Robe de Cocktail', ar: 'فستان كوكتيل' },
    { en: 'Gala Dress', fr: 'Robe de Gala', ar: 'فستان سهرة' },
    { en: 'Sequin Dress', fr: 'Robe à Paillettes', ar: 'فستان بترتر' },
    { en: 'Velvet Dress', fr: 'Robe en Velours', ar: 'فستان مخملي' },
  ].forEach((n, i) => {
    products.push({
      name: n.en, nameFr: n.fr, nameAr: n.ar, slug: `women-evening-dress-${i + 1}`,
      description: `Elegant ${n.en.toLowerCase()}.`, descriptionFr: `${n.fr} élégante.`, descriptionAr: `${n.ar} أنيق.`,
      basePrice: 850000 + (i * 100000), category: 'women-evening-dresses',
      sizes: ['XS', 'S', 'M', 'L'], colors: ['Black', 'Red', 'Navy', 'Purple'], isFeatured: i === 0, weightKg: 0.55,
    });
  });

  // Women's Blouses (6)
  [
    { en: 'Silk Blouse', fr: 'Chemisier en Soie', ar: 'بلوزة حرير' },
    { en: 'Peplum Top', fr: 'Top Péplum', ar: 'بلوزة بيبلوم' },
    { en: 'Off-Shoulder Blouse', fr: 'Chemisier Épaules Dénudées', ar: 'بلوزة بأكتاف مكشوفة' },
    { en: 'Bow Tie Blouse', fr: 'Chemisier à Nœud', ar: 'بلوزة بربطة عنق' },
    { en: 'Ruffle Blouse', fr: 'Chemisier à Volants', ar: 'بلوزة بكشكش' },
    { en: 'Lace Blouse', fr: 'Chemisier en Dentelle', ar: 'بلوزة دانتيل' },
  ].forEach((n, i) => {
    products.push({
      name: n.en, nameFr: n.fr, nameAr: n.ar, slug: `women-blouse-${i + 1}`,
      description: `Feminine ${n.en.toLowerCase()}.`, descriptionFr: `${n.fr} féminin.`, descriptionAr: `${n.ar} أنثوي.`,
      basePrice: 320000 + (i * 25000), category: 'women-blouses',
      sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['White', 'Pink', 'Beige', 'Black', 'Navy'], isFeatured: i === 0, weightKg: 0.25,
    });
  });

  // Women's T-Shirts (4)
  [
    { en: 'Basic T-Shirt', fr: 'T-Shirt Basique', ar: 'تي شيرت أساسي' },
    { en: 'Crop Top', fr: 'Top Court', ar: 'توب قصير' },
    { en: 'Oversized T-Shirt', fr: 'T-Shirt Oversize', ar: 'تي شيرت واسع' },
    { en: 'Embroidered T-Shirt', fr: 'T-Shirt Brodé', ar: 'تي شيرت مطرز' },
  ].forEach((n, i) => {
    products.push({
      name: n.en, nameFr: n.fr, nameAr: n.ar, slug: `women-tshirt-${i + 1}`,
      description: `Comfortable ${n.en.toLowerCase()}.`, descriptionFr: `${n.fr} confortable.`, descriptionAr: `${n.ar} مريح.`,
      basePrice: 150000 + (i * 15000), category: 'women-tshirts',
      sizes: ['XS', 'S', 'M', 'L', 'XL'], colors: ['White', 'Black', 'Pink', 'Gray', 'Red'], weightKg: 0.18,
    });
  });

  // Women's Skirts (4)
  [
    { en: 'Pencil Skirt', fr: 'Jupe Crayon', ar: 'تنورة بنسل' },
    { en: 'Pleated Skirt', fr: 'Jupe Plissée', ar: 'تنورة بكسرات' },
    { en: 'Denim Skirt', fr: 'Jupe en Jean', ar: 'تنورة جينز' },
    { en: 'Maxi Skirt', fr: 'Jupe Longue', ar: 'تنورة طويلة' },
  ].forEach((n, i) => {
    products.push({
      name: n.en, nameFr: n.fr, nameAr: n.ar, slug: `women-skirt-${i + 1}`,
      description: `Versatile ${n.en.toLowerCase()}.`, descriptionFr: `${n.fr} polyvalente.`, descriptionAr: `${n.ar} متعددة الاستخدامات.`,
      basePrice: 280000 + (i * 20000), category: 'women-skirts',
      sizes: ['XS', 'S', 'M', 'L'], colors: ['Black', 'Navy', 'Beige', 'Blue'], weightKg: 0.30,
    });
  });

  // Women's Hijabs (6)
  [
    { en: 'Chiffon Hijab', fr: 'Hijab en Mousseline', ar: 'حجاب شيفون' },
    { en: 'Jersey Hijab', fr: 'Hijab en Jersey', ar: 'حجاب جيرسيه' },
    { en: 'Silk Hijab', fr: 'Hijab en Soie', ar: 'حجاب حرير' },
    { en: 'Cotton Hijab', fr: 'Hijab en Coton', ar: 'حجاب قطن' },
    { en: 'Instant Hijab', fr: 'Hijab Prêt-à-Porter', ar: 'حجاب جاهز' },
    { en: 'Printed Hijab', fr: 'Hijab Imprimé', ar: 'حجاب مطبوع' },
  ].forEach((n, i) => {
    products.push({
      name: n.en, nameFr: n.fr, nameAr: n.ar, slug: `women-hijab-${i + 1}`,
      description: `Beautiful ${n.en.toLowerCase()}.`, descriptionFr: `${n.fr} magnifique.`, descriptionAr: `${n.ar} جميل.`,
      basePrice: 120000 + (i * 20000), category: 'women-hijabs',
      sizes: ['One Size'], colors: ['Black', 'Navy', 'Beige', 'White', 'Pink', 'Purple', 'Brown', 'Gray'], isFeatured: i < 2, weightKg: 0.08,
    });
  });

  // Women's Abayas (4)
  [
    { en: 'Classic Black Abaya', fr: 'Abaya Noire Classique', ar: 'عباءة سوداء كلاسيكية' },
    { en: 'Embroidered Abaya', fr: 'Abaya Brodée', ar: 'عباءة مطرزة' },
    { en: 'Open Front Abaya', fr: 'Abaya Ouverte', ar: 'عباءة مفتوحة' },
    { en: 'Kimono Abaya', fr: 'Abaya Kimono', ar: 'عباءة كيمونو' },
  ].forEach((n, i) => {
    products.push({
      name: n.en, nameFr: n.fr, nameAr: n.ar, slug: `women-abaya-${i + 1}`,
      description: `Elegant ${n.en.toLowerCase()}.`, descriptionFr: `${n.fr} élégante.`, descriptionAr: `${n.ar} أنيقة.`,
      basePrice: 580000 + (i * 60000), category: 'women-abayas',
      sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Navy', 'Brown', 'Beige'], isFeatured: i === 1, weightKg: 0.50,
    });
  });

  // Kids - Boys Shirts (4)
  [
    { en: 'Boys Polo Shirt', fr: 'Polo Garçon', ar: 'بولو ولادي' },
    { en: 'Boys Oxford Shirt', fr: 'Chemise Oxford Garçon', ar: 'قميص أوكسفورد ولادي' },
    { en: 'Boys T-Shirt', fr: 'T-Shirt Garçon', ar: 'تي شيرت ولادي' },
    { en: 'Boys Checked Shirt', fr: 'Chemise à Carreaux Garçon', ar: 'قميص مربعات ولادي' },
  ].forEach((n, i) => {
    products.push({
      name: n.en, nameFr: n.fr, nameAr: n.ar, slug: `boys-shirt-${i + 1}`,
      description: `Comfortable ${n.en.toLowerCase()}.`, descriptionFr: `${n.fr} confortable.`, descriptionAr: `${n.ar} مريح.`,
      basePrice: 180000 + (i * 15000), category: 'boys-shirts',
      sizes: ['XS', 'S', 'M', 'L'], colors: ['Navy', 'White', 'Blue', 'Red'], weightKg: 0.18,
    });
  });

  // Kids - Boys Pants (4)
  [
    { en: 'Boys Jeans', fr: 'Jean Garçon', ar: 'جينز ولادي' },
    { en: 'Boys Chinos', fr: 'Chino Garçon', ar: 'شينو ولادي' },
    { en: 'Boys Joggers', fr: 'Jogging Garçon', ar: 'سروال رياضي ولادي' },
    { en: 'Boys Shorts', fr: 'Short Garçon', ar: 'شورت ولادي' },
  ].forEach((n, i) => {
    products.push({
      name: n.en, nameFr: n.fr, nameAr: n.ar, slug: `boys-pants-${i + 1}`,
      description: `Durable ${n.en.toLowerCase()}.`, descriptionFr: `${n.fr} durable.`, descriptionAr: `${n.ar} متين.`,
      basePrice: 220000 + (i * 15000), category: 'boys-pants',
      sizes: ['XS', 'S', 'M', 'L'], colors: ['Navy', 'Black', 'Gray', 'Blue'], weightKg: 0.35,
    });
  });

  // Kids - Girls Dresses (4)
  [
    { en: 'Girls Party Dress', fr: 'Robe de Fête Fille', ar: 'فستان حفلة بناتي' },
    { en: 'Girls Sundress', fr: "Robe d'Été Fille", ar: 'فستان صيفي بناتي' },
    { en: 'Girls Casual Dress', fr: 'Robe Décontractée Fille', ar: 'فستان كاجوال بناتي' },
    { en: 'Girls Denim Dress', fr: 'Robe en Jean Fille', ar: 'فستان جينز بناتي' },
  ].forEach((n, i) => {
    products.push({
      name: n.en, nameFr: n.fr, nameAr: n.ar, slug: `girls-dress-${i + 1}`,
      description: `Adorable ${n.en.toLowerCase()}.`, descriptionFr: `${n.fr} adorable.`, descriptionAr: `${n.ar} رائع.`,
      basePrice: 280000 + (i * 25000), category: 'girls-dresses',
      sizes: ['XS', 'S', 'M', 'L'], colors: ['Pink', 'White', 'Blue', 'Red', 'Purple'], isFeatured: i === 0, weightKg: 0.25,
    });
  });

  // Accessories - Bags (4)
  [
    { en: 'Leather Tote Bag', fr: 'Sac Cabas en Cuir', ar: 'حقيبة جلد كبيرة' },
    { en: 'Crossbody Bag', fr: 'Sac Bandoulière', ar: 'حقيبة كروس' },
    { en: 'Backpack', fr: 'Sac à Dos', ar: 'حقيبة ظهر' },
    { en: 'Clutch Bag', fr: 'Pochette', ar: 'حقيبة يد صغيرة' },
  ].forEach((n, i) => {
    products.push({
      name: n.en, nameFr: n.fr, nameAr: n.ar, slug: `bag-${i + 1}`,
      description: `Stylish ${n.en.toLowerCase()}.`, descriptionFr: `${n.fr} élégant.`, descriptionAr: `${n.ar} أنيق.`,
      basePrice: 380000 + (i * 50000), category: 'bags',
      sizes: ['One Size'], colors: ['Black', 'Brown', 'Beige', 'Navy'], isFeatured: i === 0, weightKg: 0.45,
    });
  });

  // Accessories - Belts (4)
  [
    { en: 'Leather Belt', fr: 'Ceinture en Cuir', ar: 'حزام جلد' },
    { en: 'Braided Belt', fr: 'Ceinture Tressée', ar: 'حزام مجدول' },
    { en: 'Canvas Belt', fr: 'Ceinture en Toile', ar: 'حزام قماش' },
    { en: 'Reversible Belt', fr: 'Ceinture Réversible', ar: 'حزام قابل للعكس' },
  ].forEach((n, i) => {
    products.push({
      name: n.en, nameFr: n.fr, nameAr: n.ar, slug: `belt-${i + 1}`,
      description: `Quality ${n.en.toLowerCase()}.`, descriptionFr: `${n.fr} de qualité.`, descriptionAr: `${n.ar} عالي الجودة.`,
      basePrice: 150000 + (i * 20000), category: 'belts',
      sizes: ['S', 'M', 'L', 'XL'], colors: ['Black', 'Brown', 'Navy'], weightKg: 0.15,
    });
  });

  // Accessories - Scarves (4)
  [
    { en: 'Wool Scarf', fr: 'Écharpe en Laine', ar: 'وشاح صوف' },
    { en: 'Silk Scarf', fr: 'Écharpe en Soie', ar: 'وشاح حرير' },
    { en: 'Cashmere Scarf', fr: 'Écharpe en Cachemire', ar: 'وشاح كشمير' },
    { en: 'Cotton Scarf', fr: 'Écharpe en Coton', ar: 'وشاح قطن' },
  ].forEach((n, i) => {
    products.push({
      name: n.en, nameFr: n.fr, nameAr: n.ar, slug: `scarf-${i + 1}`,
      description: `Elegant ${n.en.toLowerCase()}.`, descriptionFr: `${n.fr} élégante.`, descriptionAr: `${n.ar} أنيق.`,
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
  const productOptionGroupService = app.get(ProductOptionGroupService);
  const productOptionService = app.get(ProductOptionService);
  const collectionService = app.get(CollectionService);
  const taxCategoryService = app.get(TaxCategoryService);

  let channel = await channelService.getDefaultChannel();
  let ctx = new RequestContext({
    channel,
    apiType: 'admin',
    isAuthorized: true,
    authorizedAsOwnerOnly: false,
  });

  // OSCAR Fashion is an Algerian marketplace: ensure the default channel is priced in DZD.
  // Must run before any ProductVariant is created so prices are stored in DZD, not the
  // Vendure default (USD). Also register fr/ar as available channel languages — the search
  // index only indexes the channel's availableLanguageCodes, so without this French/Arabic
  // search terms (e.g. "robe") return nothing. Re-fetch the channel + ctx afterwards so
  // variant creation sees the new currency.
  const needsCurrency = channel.defaultCurrencyCode !== CurrencyCode.DZD;
  const needsLanguages = !(['fr', 'ar'] as const).every((l) =>
    (channel.availableLanguageCodes ?? []).includes(l as any),
  );
  if (needsCurrency || needsLanguages) {
    await channelService.update(ctx, {
      id: channel.id,
      defaultCurrencyCode: CurrencyCode.DZD,
      availableCurrencyCodes: [CurrencyCode.DZD],
      availableLanguageCodes: [LanguageCode.en, LanguageCode.fr, LanguageCode.ar],
    });
    channel = await channelService.getDefaultChannel();
    ctx = new RequestContext({ channel, apiType: 'admin', isAuthorized: true, authorizedAsOwnerOnly: false });
    console.log('  💱 Channel set to DZD + languages [en, fr, ar]\n');
  }

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

    // Create per-product Size and Color option groups so variants are selectable on the PDP.
    // (The Size/Color *facets* above drive faceted search; these *option groups* drive variant
    // selection — a product needs option groups to hold more than one variant.)
    const sizeGroup = await productOptionGroupService.create(ctx, {
      code: `${productDef.slug}-size`,
      translations: [
        { languageCode: LanguageCode.en, name: 'Size' },
        { languageCode: LanguageCode.fr, name: 'Taille' },
        { languageCode: LanguageCode.ar, name: 'المقاس' },
      ],
    });
    const colorGroup = await productOptionGroupService.create(ctx, {
      code: `${productDef.slug}-color`,
      translations: [
        { languageCode: LanguageCode.en, name: 'Color' },
        { languageCode: LanguageCode.fr, name: 'Couleur' },
        { languageCode: LanguageCode.ar, name: 'اللون' },
      ],
    });

    const sizeOptions = new Map<string, any>();
    for (const size of productDef.sizes) {
      sizeOptions.set(size, await productOptionService.create(ctx, sizeGroup.id, {
        code: `${productDef.slug}-size-${size}`.toLowerCase().replace(/[^a-z0-9-]/g, ''),
        translations: [{ languageCode: LanguageCode.en, name: size }],
      }));
    }
    const colorOptions = new Map<string, any>();
    for (const color of productDef.colors) {
      colorOptions.set(color, await productOptionService.create(ctx, colorGroup.id, {
        code: `${productDef.slug}-color-${color}`.toLowerCase().replace(/[^a-z0-9-]/g, ''),
        translations: [{ languageCode: LanguageCode.en, name: color }],
      }));
    }

    await productService.addOptionGroupToProduct(ctx, product.id, sizeGroup.id);
    await productService.addOptionGroupToProduct(ctx, product.id, colorGroup.id);

    for (const size of productDef.sizes) {
      for (const color of productDef.colors) {
        const sizeIndex = sizes.indexOf(size);
        const sizeMultiplier = 1 + (sizeIndex >= 0 ? (sizeIndex - 3) * 0.03 : 0);
        const colorMultiplier = color === 'Black' || color === 'White' ? 1 : 1.05;
        const finalPrice = Math.round(productDef.basePrice * sizeMultiplier * colorMultiplier);

        const sku = `${productDef.slug}-${size}-${color}`.toUpperCase().replace(/[^A-Z0-9-]/g, '');

        const sizeFv = sizeFacetValues.get(size);
        const colorFv = colorFacetValues.get(color);
        const sizeOpt = sizeOptions.get(size);
        const colorOpt = colorOptions.get(color);

        try {
          await productVariantService.create(ctx, [{
            productId: product.id,
            sku,
            price: finalPrice,
            taxCategoryId: defaultTaxCategory.id,
            optionIds: [sizeOpt?.id, colorOpt?.id].filter(Boolean),
            facetValueIds: [sizeFv?.id, colorFv?.id].filter(Boolean),
            translations: [{ languageCode: LanguageCode.en, name: `${productDef.name} - ${size} / ${color}` }],
            stockOnHand: 10 + Math.floor(Math.random() * 90),
            trackInventory: 'TRUE' as any,
            customFields: { minStockAlert: 5 },
          }]);
          variantCount++;
        } catch (e: any) {
          console.log(`     ⚠️  Variant ${sku} skipped: ${e.message}`);
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
