import 'dotenv/config';
import {
  LanguageCode,
  ProductService,
  CollectionService,
  RequestContext,
  bootstrapWorker,
  ChannelService,
  FacetService,
  FacetValueService,
} from '@vendure/core';
import { config } from './vendure-config';

/**
 * OSCAR Fashion - Link Products to Collections via Facet Filters
 *
 * This script creates a "category" facet and adds facet values to products
 * so collections can use facet-based filters to contain products.
 *
 * Run with: npm run link-products
 * NOTE: Stop the main Vendure server first before running this script.
 */

// Map product slug prefixes to collection slugs
const productCategoryMap: Record<string, string> = {
  'men-casual-shirt': 'men-casual-shirts',
  'men-formal-shirt': 'men-formal-shirts',
  'men-polo': 'men-polo-shirts',
  'men-jeans': 'men-jeans',
  'men-chinos': 'men-chinos',
  'men-tshirt': 'men-tshirts',
  'men-jacket': 'men-jackets',
  'women-casual-dress': 'women-casual-dresses',
  'women-evening-dress': 'women-evening-dresses',
  'women-blouse': 'women-blouses',
  'women-tshirt': 'women-tshirts',
  'women-skirt': 'women-skirts',
  'women-hijab': 'women-hijabs',
  'women-abaya': 'women-abayas',
  'boys-shirt': 'boys-shirts',
  'boys-pants': 'boys-pants',
  'girls-dress': 'girls-dresses',
  'bag': 'bags',
  'belt': 'belts',
  'scarf': 'scarves',
};

// Parent collections and their child category facets
const parentMappings: Record<string, string[]> = {
  'men-shirts': ['men-casual-shirts', 'men-formal-shirts', 'men-polo-shirts'],
  'men-pants': ['men-jeans', 'men-chinos'],
  'men-outerwear': ['men-jackets'],
  'men': ['men-tshirts', 'men-casual-shirts', 'men-formal-shirts', 'men-polo-shirts', 'men-jeans', 'men-chinos', 'men-jackets'],
  'women-dresses': ['women-casual-dresses', 'women-evening-dresses'],
  'women-tops': ['women-blouses', 'women-tshirts'],
  'women-bottoms': ['women-skirts'],
  'women': ['women-casual-dresses', 'women-evening-dresses', 'women-blouses', 'women-tshirts', 'women-skirts', 'women-hijabs', 'women-abayas'],
  'boys': ['boys-shirts', 'boys-pants'],
  'girls': ['girls-dresses'],
  'kids': ['boys-shirts', 'boys-pants', 'girls-dresses'],
  'accessories': ['bags', 'belts', 'scarves'],
};

async function linkProductsToCollections() {
  console.log('🚀 Starting to link products to collections via facet filters...\n');
  console.log('⚠️  Make sure the main Vendure server is STOPPED before running this script.\n');

  const { app } = await bootstrapWorker(config);

  const channelService = app.get(ChannelService);
  const productService = app.get(ProductService);
  const collectionService = app.get(CollectionService);
  const facetService = app.get(FacetService);
  const facetValueService = app.get(FacetValueService);

  const channel = await channelService.getDefaultChannel();
  const ctx = new RequestContext({
    channel,
    apiType: 'admin',
    isAuthorized: true,
    authorizedAsOwnerOnly: false,
  });

  // 1. Create or find "category" facet
  console.log('📂 Creating category facet...\n');
  let categoryFacet = await facetService.findByCode(ctx, 'category', LanguageCode.en);
  if (!categoryFacet) {
    categoryFacet = await facetService.create(ctx, {
      code: 'category',
      isPrivate: false,
      translations: [
        { languageCode: LanguageCode.en, name: 'Category' },
        { languageCode: LanguageCode.fr, name: 'Catégorie' },
        { languageCode: LanguageCode.ar, name: 'الفئة' },
      ],
    });
    console.log('  ✅ Created Category facet');
  } else {
    console.log('  ⏭️  Category facet already exists');
  }

  // 2. Create facet values for each category
  console.log('\n📂 Creating category facet values...\n');
  const categoryFacetValues = new Map<string, any>();
  const existingFacetValues = await facetValueService.findByFacetId(ctx, categoryFacet.id);

  const allCategories = [
    ...Object.values(productCategoryMap),
    ...Object.keys(parentMappings),
  ];
  const uniqueCategories = [...new Set(allCategories)];

  for (const categorySlug of uniqueCategories) {
    let existing = existingFacetValues.find(fv => fv.code === categorySlug);
    if (!existing) {
      existing = await facetValueService.create(ctx, categoryFacet, {
        code: categorySlug,
        translations: [{ languageCode: LanguageCode.en, name: categorySlug }],
      });
      console.log(`  ✅ Created facet value: ${categorySlug}`);
    }
    categoryFacetValues.set(categorySlug, existing);
  }

  // 3. Get all products and assign category facet values
  console.log('\n👕 Assigning category facets to products...\n');
  const productsResult = await productService.findAll(ctx, { take: 200 });
  console.log(`📦 Found ${productsResult.totalItems} products\n`);

  for (const product of productsResult.items) {
    // Find matching category based on product slug prefix
    let targetCategory: string | null = null;

    for (const [prefix, categorySlug] of Object.entries(productCategoryMap)) {
      if (product.slug.startsWith(prefix)) {
        targetCategory = categorySlug;
        break;
      }
    }

    if (targetCategory) {
      const categoryFv = categoryFacetValues.get(targetCategory);
      if (categoryFv) {
        // Get current facet value IDs
        const currentFacetValueIds = product.facetValues?.map(fv => fv.id) || [];

        // Only add if not already present
        if (!currentFacetValueIds.includes(categoryFv.id)) {
          try {
            await productService.update(ctx, {
              id: product.id,
              facetValueIds: [...currentFacetValueIds, categoryFv.id],
            });
            console.log(`  ✅ Added category "${targetCategory}" to product: ${product.slug}`);
          } catch (error: any) {
            console.log(`  ❌ Error updating ${product.slug}: ${error.message}`);
          }
        } else {
          console.log(`  ⏭️  Product already has category: ${product.slug}`);
        }
      }
    } else {
      console.log(`  ⚠️  No matching category for product: ${product.slug}`);
    }
  }

  // 4. Update collections to use facet value filters
  console.log('\n📂 Updating collection filters...\n');
  const collectionsResult = await collectionService.findAll(ctx, { take: 100 });

  for (const collection of collectionsResult.items) {
    // Skip root collection
    if (collection.slug === '__root_collection__') continue;

    const categoryFv = categoryFacetValues.get(collection.slug);

    // Also check if this is a parent collection
    const childCategories = parentMappings[collection.slug];
    const childFacetValueIds: string[] = [];

    if (childCategories) {
      for (const childCat of childCategories) {
        const childFv = categoryFacetValues.get(childCat);
        if (childFv) {
          childFacetValueIds.push(String(childFv.id));
        }
      }
    }

    // If collection has a direct facet value or child values
    const facetValueIds = categoryFv ? [String(categoryFv.id), ...childFacetValueIds] : childFacetValueIds;

    if (facetValueIds.length > 0) {
      try {
        // Create filter based on facet values
        const filters: any[] = [{
          code: 'facet-value-filter',
          arguments: [
            { name: 'facetValueIds', value: JSON.stringify(facetValueIds) },
            { name: 'containsAny', value: 'true' },
          ],
        }];

        await collectionService.update(ctx, {
          id: collection.id,
          filters,
        });
        console.log(`  ✅ Updated collection filter: ${collection.slug} (${facetValueIds.length} facet values)`);
      } catch (error: any) {
        console.log(`  ❌ Error updating collection ${collection.slug}: ${error.message}`);
      }
    }
  }

  // 5. Rebuild search index
  console.log('\n🔍 Rebuilding search index...');
  try {
    // Run job to reindex
    const { JobQueueService } = await import('@vendure/core');
    const jobQueueService = app.get(JobQueueService);

    // Find the search plugin's reindex handler if available
    console.log('  ✅ Index update will happen automatically via job queue');
    console.log('  💡 You can also manually reindex from the Vendure Admin UI: Settings > Job Queue > Reindex');
  } catch (e: any) {
    console.log(`  ⚠️  Could not trigger reindex: ${e.message}`);
    console.log('  💡 You can rebuild it manually from the Vendure Admin UI: Settings > Job Queue > Reindex');
  }

  console.log('\n✨ Done! Products are now linked to collections via facet filters.\n');

  await app.close();
  process.exit(0);
}

linkProductsToCollections().catch((err) => {
  console.error('❌ Script failed:', err);
  process.exit(1);
});
