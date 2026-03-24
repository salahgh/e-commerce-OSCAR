import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Ctx, RequestContext, Product, Allow, Permission, ID } from '@vendure/core';
import { OscarService } from '../services/oscar.service';

@Resolver()
export class OscarShopResolver {
  constructor(private oscarService: OscarService) {}

  @Query()
  async featuredProducts(
    @Ctx() ctx: RequestContext,
    @Args() args: { take?: number },
  ): Promise<Product[]> {
    return this.oscarService.getFeaturedProducts(ctx, args.take ?? 10);
  }

  @Query()
  async newArrivals(
    @Ctx() ctx: RequestContext,
    @Args() args: { take?: number },
  ): Promise<Product[]> {
    return this.oscarService.getNewArrivals(ctx, args.take ?? 10);
  }

  @Query()
  async popularProducts(
    @Ctx() ctx: RequestContext,
    @Args() args: { take?: number },
  ): Promise<Product[]> {
    return this.oscarService.getPopularProducts(ctx, args.take ?? 10);
  }

  @Query()
  async searchProductsMultilingual(
    @Ctx() ctx: RequestContext,
    @Args() args: { keyword: string; take?: number; skip?: number },
  ): Promise<{ items: Product[]; totalItems: number }> {
    return this.oscarService.searchProductsMultilingual(
      ctx,
      args.keyword,
      args.take ?? 20,
      args.skip ?? 0,
    );
  }

  @Query()
  wilayas() {
    return this.oscarService.getWilayas();
  }

  @Query()
  shippingCost(@Args() args: { wilayaCode: string }) {
    const amount = this.oscarService.calculateShippingCost(args.wilayaCode);
    return { amount, currency: 'DZD' };
  }

  @Mutation()
  async trackProductView(
    @Ctx() ctx: RequestContext,
    @Args() args: { productId: ID },
  ): Promise<boolean> {
    return this.oscarService.incrementViewCount(ctx, args.productId);
  }
}
