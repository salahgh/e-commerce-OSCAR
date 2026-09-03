import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  Ctx,
  RequestContext,
  Product,
  Customer,
  Allow,
  Permission,
  ID,
  AssetService,
  CustomerService,
  ForbiddenError,
  InternalServerError,
} from '@vendure/core';
import { OscarService } from '../services/oscar.service';

@Resolver()
export class OscarShopResolver {
  constructor(
    private oscarService: OscarService,
    private assetService: AssetService,
    private customerService: CustomerService,
  ) {}

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

  @Mutation()
  async trackProductView(
    @Ctx() ctx: RequestContext,
    @Args() args: { productId: ID },
  ): Promise<boolean> {
    return this.oscarService.incrementViewCount(ctx, args.productId);
  }

  /**
   * Upload (or replace) the active customer's avatar.
   * The `file` argument is a graphql-upload Upload promise; AssetService.create
   * awaits/streams it internally (same as Vendure core's createAssets resolver,
   * which passes `input.file` straight through).
   */
  @Mutation()
  @Allow(Permission.Authenticated, Permission.Owner)
  async updateCustomerAvatar(
    @Ctx() ctx: RequestContext,
    @Args() args: { file: any },
  ): Promise<Customer> {
    const userId = ctx.activeUserId;
    if (!userId) {
      throw new ForbiddenError();
    }

    const customer = await this.customerService.findOneByUserId(ctx, userId);
    if (!customer) {
      throw new ForbiddenError();
    }

    // Create the asset from the uploaded file. `args.file` is the graphql-upload Upload
    // promise; AssetService.create awaits/streams it internally, exactly as Vendure core's
    // AssetResolver.createAssets forwards `input.file` straight through to assetService.create.
    const asset = await this.assetService.create(ctx, {
      file: args.file,
      tags: ['avatar'],
    });

    // assetService.create returns CreateAssetResult = Asset | MimeTypeError.
    // MimeTypeError is a GraphQL ErrorResult (not a JS Error), so discriminate on the
    // `id` field which only the successful Asset variant carries.
    if (!('id' in asset)) {
      throw new InternalServerError((asset as { message?: string }).message ?? 'invalid-avatar-file');
    }

    await this.customerService.update(ctx, {
      id: customer.id,
      customFields: { avatarId: asset.id },
    } as any);

    // Reload the customer so the new avatar relation is resolved on the return value.
    const updated = await this.customerService.findOneByUserId(ctx, userId);
    return updated!;
  }
}
