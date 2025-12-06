"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OscarService = exports.ALGERIA_WILAYAS = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@vendure/core");
/**
 * Algeria Wilaya codes for shipping
 */
exports.ALGERIA_WILAYAS = [
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
let OscarService = class OscarService {
    constructor(connection, productService, collectionService, orderService, customerService) {
        this.connection = connection;
        this.productService = productService;
        this.collectionService = collectionService;
        this.orderService = orderService;
        this.customerService = customerService;
    }
    /**
     * Get featured products
     */
    async getFeaturedProducts(ctx, take = 10) {
        const qb = this.connection
            .getRepository(ctx, core_1.Product)
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
    async getNewArrivals(ctx, take = 10) {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const qb = this.connection
            .getRepository(ctx, core_1.Product)
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
    async getPopularProducts(ctx, take = 10) {
        const qb = this.connection
            .getRepository(ctx, core_1.Product)
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
    async incrementViewCount(ctx, productId) {
        await this.connection
            .getRepository(ctx, core_1.Product)
            .createQueryBuilder()
            .update(core_1.Product)
            .set({ customFields: () => '"customFieldsViewcount" + 1' })
            .where('id = :id', { id: productId })
            .execute();
        return true;
    }
    /**
     * Search products with multilingual support (FR/AR/EN)
     */
    async searchProductsMultilingual(ctx, keyword, take = 20, skip = 0) {
        const searchTerm = `%${keyword}%`;
        const qb = this.connection
            .getRepository(ctx, core_1.Product)
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.featuredAsset', 'featuredAsset')
            .where('product.enabled = :enabled', { enabled: true })
            .andWhere('(LOWER(product.name) LIKE LOWER(:term) OR ' +
            'LOWER(product.customFieldsNamefr) LIKE LOWER(:term) OR ' +
            'LOWER(product.customFieldsNamear) LIKE LOWER(:term) OR ' +
            'LOWER(product.description) LIKE LOWER(:term) OR ' +
            'LOWER(product.customFieldsDescriptionfr) LIKE LOWER(:term) OR ' +
            'LOWER(product.customFieldsDescriptionar) LIKE LOWER(:term))', { term: searchTerm });
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
        return exports.ALGERIA_WILAYAS;
    }
    /**
     * Calculate shipping cost based on wilaya
     */
    calculateShippingCost(wilayaCode) {
        // Shipping rates in DZD (Algerian Dinar)
        const remoteWilayas = ['01', '08', '11', '30', '33', '37', '47'];
        const southernWilayas = ['17', '28', '32', '39', '45'];
        if (remoteWilayas.includes(wilayaCode)) {
            return 1200; // Remote areas
        }
        else if (southernWilayas.includes(wilayaCode)) {
            return 900; // Southern regions
        }
        else if (wilayaCode === '16') {
            return 400; // Algiers
        }
        else {
            return 600; // Standard shipping
        }
    }
    /**
     * Get low stock products (for admin dashboard)
     */
    async getLowStockProducts(ctx, threshold = 10) {
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
};
exports.OscarService = OscarService;
exports.OscarService = OscarService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.TransactionalConnection,
        core_1.ProductService,
        core_1.CollectionService,
        core_1.OrderService,
        core_1.CustomerService])
], OscarService);
//# sourceMappingURL=oscar.service.js.map