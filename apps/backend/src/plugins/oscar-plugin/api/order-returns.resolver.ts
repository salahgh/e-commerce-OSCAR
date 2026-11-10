import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Allow, Ctx, ID, Permission, RequestContext } from '@vendure/core';
import { OrderReturnsService, RegisterReturnInput } from '../services/order-returns.service';

/** Admin API: product returns on shipped / delivered orders. */
@Resolver()
export class OrderReturnsAdminResolver {
  constructor(private orderReturnsService: OrderReturnsService) {}

  @Query()
  @Allow(Permission.ReadOrder)
  returnReasons() {
    return this.orderReturnsService.reasons();
  }

  @Query()
  @Allow(Permission.ReadOrder)
  returnableLines(@Ctx() ctx: RequestContext, @Args() args: { orderId: ID }) {
    return this.orderReturnsService.returnableLines(ctx, args.orderId);
  }

  @Query()
  @Allow(Permission.ReadOrder)
  returnStats(@Ctx() ctx: RequestContext, @Args() args: { from: Date; to: Date }) {
    return this.orderReturnsService.stats(ctx, new Date(args.from), new Date(args.to));
  }

  @Mutation()
  @Allow(Permission.UpdateOrder)
  registerReturn(@Ctx() ctx: RequestContext, @Args() args: { input: RegisterReturnInput }) {
    return this.orderReturnsService.registerReturn(ctx, args.input);
  }
}
