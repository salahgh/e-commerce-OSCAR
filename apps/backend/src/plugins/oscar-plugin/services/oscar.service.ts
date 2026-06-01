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

/**
 * Algeria Wilaya codes for shipping
 */
export const ALGERIA_WILAYAS = [
  { code: '01', name: 'Adrar' },
  { code: '02', name: 'Chlef' },
  { code: '03', name: 'Laghouat' },
  { code: '04', name: 'Oum El Bouaghi' },
  { code: '05', name: 'Batna' },
  { code: '06', name: 'Béjaïa' },
  { code: '07', name: 'Biskra' },
  { code: '08', name: 'Béchar' },
  { code: '09', name: 'Blida' },
  { code: '10', name: 'Bouira' },
  { code: '11', name: 'Tamanrasset' },
  { code: '12', name: 'Tébessa' },
  { code: '13', name: 'Tlemcen' },
  { code: '14', name: 'Tiaret' },
  { code: '15', name: 'Tizi Ouzou' },
  { code: '16', name: 'Alger' },
  { code: '17', name: 'Djelfa' },
  { code: '18', name: 'Jijel' },
  { code: '19', name: 'Sétif' },
  { code: '20', name: 'Saïda' },
  { code: '21', name: 'Skikda' },
  { code: '22', name: 'Sidi Bel Abbès' },
  { code: '23', name: 'Annaba' },
  { code: '24', name: 'Guelma' },
  { code: '25', name: 'Constantine' },
  { code: '26', name: 'Médéa' },
  { code: '27', name: 'Mostaganem' },
  { code: '28', name: "M'Sila" },
  { code: '29', name: 'Mascara' },
  { code: '30', name: 'Ouargla' },
  { code: '31', name: 'Oran' },
  { code: '32', name: 'El Bayadh' },
  { code: '33', name: 'Illizi' },
  { code: '34', name: 'Bordj Bou Arréridj' },
  { code: '35', name: 'Boumerdès' },
  { code: '36', name: 'El Tarf' },
  { code: '37', name: 'Tindouf' },
  { code: '38', name: 'Tissemsilt' },
  { code: '39', name: 'El Oued' },
  { code: '40', name: 'Khenchela' },
  { code: '41', name: 'Souk Ahras' },
  { code: '42', name: 'Tipaza' },
  { code: '43', name: 'Mila' },
  { code: '44', name: 'Aïn Defla' },
  { code: '45', name: 'Naâma' },
  { code: '46', name: 'Aïn Témouchent' },
  { code: '47', name: 'Ghardaïa' },
  { code: '48', name: 'Relizane' },
  { code: '49', name: "El M'Ghair" },
  { code: '50', name: 'El Meniaa' },
  { code: '51', name: 'Ouled Djellal' },
  { code: '52', name: 'Bordj Badji Mokhtar' },
  { code: '53', name: 'Béni Abbès' },
  { code: '54', name: 'Timimoun' },
  { code: '55', name: 'Touggourt' },
  { code: '56', name: 'Djanet' },
  { code: '57', name: 'In Salah' },
  { code: '58', name: 'In Guezzam' },
];

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
      .orderBy('product.customFieldsViewcount', 'DESC')
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
      .set({ customFields: () => '"customFieldsViewcount" + 1' } as any)
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
   * Get all Algeria wilayas
   */
  getWilayas() {
    return ALGERIA_WILAYAS;
  }

  /**
   * Calculate shipping cost based on wilaya
   */
  calculateShippingCost(wilayaCode: string): number {
    // Shipping rates in DZD (Algerian Dinar)
    const remoteWilayas = ['01', '08', '11', '30', '33', '37', '47'];
    const southernWilayas = ['17', '28', '32', '39', '45'];

    if (remoteWilayas.includes(wilayaCode)) {
      return 1200; // Remote areas
    } else if (southernWilayas.includes(wilayaCode)) {
      return 900; // Southern regions
    } else if (wilayaCode === '16') {
      return 400; // Algiers
    } else {
      return 600; // Standard shipping
    }
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
