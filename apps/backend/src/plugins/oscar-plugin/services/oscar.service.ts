import { Injectable } from '@nestjs/common';
import {
  RequestContext,
  TransactionalConnection,
  ProductService,
  CollectionService,
  OrderService,
  CustomerService,
  ID,
  PaginatedList,
  Product,
  Collection,
} from '@vendure/core';

@Injectable()
export class OscarService {
  constructor(
    private connection: TransactionalConnection,
    private productService: ProductService,
    private collectionService: CollectionService,
    private orderService: OrderService,
    private customerService: CustomerService,
  ) {}

  /**
   * Get featured products
   */
  async getFeaturedProducts(ctx: RequestContext, take: number = 10): Promise<Product[]> {
    const qb = this.connection
      .getRepository(ctx, Product)
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.featuredAsset', 'featuredAsset')
      .where('product.customFieldsIsfeatured = :isFeatured', { isFeatured: true })
      .andWhere('product.enabled = :enabled', { enabled: true })
      .take(take);

    return qb.getMany();
  }

  /**
   * Get new arrivals (products created in last 30 days)
   */
  async getNewArrivals(ctx: RequestContext, take: number = 10): Promise<Product[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const qb = this.connection
      .getRepository(ctx, Product)
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.featuredAsset', 'featuredAsset')
      .where('product.createdAt >= :date', { date: thirtyDaysAgo })
      .andWhere('product.enabled = :enabled', { enabled: true })
      .orderBy('product.createdAt', 'DESC')
      .take(take);

    return qb.getMany();
  }

  /**
   * Get popular products (by view count)
   */
  async getPopularProducts(ctx: RequestContext, take: number = 10): Promise<Product[]> {
    const qb = this.connection
      .getRepository(ctx, Product)
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.featuredAsset', 'featuredAsset')
      .where('product.enabled = :enabled', { enabled: true })
      // Use the custom-field property path (customFields.viewCount), not the raw
      // DB column alias. TypeORM resolves column metadata from the property path when
      // combining orderBy with take()+join; the raw alias has no metadata and throws.
      .orderBy('product.customFields.viewCount', 'DESC')
      .take(take);

    return qb.getMany();
  }

  /**
   * Increment product view count
   */
  async incrementViewCount(ctx: RequestContext, productId: ID): Promise<boolean> {
    await this.connection
      .getRepository(ctx, Product)
      .createQueryBuilder()
      .update(Product)
      // Target the embedded customFields.viewCount property so TypeORM maps it to the
      // customFieldsViewcount column; a flat `customFields` raw setter is not a known property.
      .set({ customFields: { viewCount: () => '"customFieldsViewcount" + 1' } } as any)
      .where('id = :id', { id: productId })
      .execute();

    return true;
  }

  /**
   * Search products with multilingual support (FR/AR/EN)
   */
  async searchProductsMultilingual(
    ctx: RequestContext,
    keyword: string,
    take: number = 20,
    skip: number = 0,
  ): Promise<{ items: Product[]; totalItems: number }> {
    const searchTerm = `%${keyword}%`;

    // Product name/description are native Vendure translations (the *fr/*ar custom fields were
    // removed). Match the term against any translation (fr/ar/en) via the product_translation table.
    const qb = this.connection
      .getRepository(ctx, Product)
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.featuredAsset', 'featuredAsset')
      .where('product.enabled = :enabled', { enabled: true })
      .andWhere((sub) => {
        const subQuery = sub
          .subQuery()
          .select('translation.baseId')
          .from('product_translation', 'translation')
          .where('LOWER(translation.name) LIKE LOWER(:term)')
          .orWhere('LOWER(translation.description) LIKE LOWER(:term)')
          .getQuery();
        return `product.id IN ${subQuery}`;
      })
      .setParameter('term', searchTerm);

    const [items, totalItems] = await qb
      .skip(skip)
      .take(take)
      .getManyAndCount();

    return { items, totalItems };
  }

  /**
   * Get low stock products (for admin dashboard)
   */
  async getLowStockProducts(ctx: RequestContext, threshold: number = 10): Promise<Product[]> {
    // This would need to query ProductVariants for stock levels
    // Simplified implementation
    const products = await this.productService.findAll(ctx, {
      take: 100,
      filter: {
        enabled: { eq: true },
      },
    });

    return products.items;
  }
}
