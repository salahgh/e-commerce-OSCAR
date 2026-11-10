import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Allow, Ctx, ID, Order, Permission, RequestContext } from '@vendure/core';
import { RelatedOrdersService } from '../services/related-orders.service';
import { PhoneSearchService } from '../services/phone-search.service';

/** Admin API: possible duplicate orders (same phone, within 24h) and merging them. */
@Resolver()
export class RelatedOrdersAdminResolver {
  constructor(private relatedOrdersService: RelatedOrdersService) {}

  @Query()
  @Allow(Permission.ReadOrder)
  relatedOrders(@Ctx() ctx: RequestContext, @Args() args: { orderId: ID }) {
    return this.relatedOrdersService.findRelated(ctx, args.orderId);
  }

  @Mutation()
  @Allow(Permission.UpdateOrder)
  mergeOrders(@Ctx() ctx: RequestContext, @Args() args: { targetOrderId: ID; sourceOrderId: ID }) {
    return this.relatedOrdersService.merge(ctx, args.targetOrderId, args.sourceOrderId);
  }
}

/** Admin API: search orders and customers by phone number. */
@Resolver()
export class PhoneSearchAdminResolver {
  constructor(private phoneSearchService: PhoneSearchService) {}

  @Query()
  @Allow(Permission.ReadOrder, Permission.ReadCustomer)
  phoneSearch(@Ctx() ctx: RequestContext, @Args() args: { phone: string }) {
    return this.phoneSearchService.search(ctx, args.phone);
  }
}

@Resolver('Order')
export class RelatedOrdersOrderFieldResolver {
  constructor(private relatedOrdersService: RelatedOrdersService) {}

  @ResolveField()
  @Allow(Permission.ReadOrder)
  async relatedOrderCount(@Ctx() ctx: RequestContext, @Parent() order: Order) {
    return (await this.relatedOrdersService.findRelated(ctx, order.id)).length;
  }
}

/** Shop API: add an item to the order the customer just placed. */
@Resolver()
export class RelatedOrdersShopResolver {
  constructor(private relatedOrdersService: RelatedOrdersService) {}

  // No @Transaction: OrderModificationService manages its own transactions (as for modifyOrderGuided).
  @Mutation()
  addToPlacedOrder(
    @Ctx() ctx: RequestContext,
    @Args() args: { orderCode: string; productVariantId: ID; quantity: number },
  ) {
    return this.relatedOrdersService.addToPlacedOrder(ctx, args.orderCode, args.productVariantId, args.quantity);
  }
}
