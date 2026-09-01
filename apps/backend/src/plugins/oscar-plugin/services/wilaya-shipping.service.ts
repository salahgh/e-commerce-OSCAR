import { Injectable } from '@nestjs/common';
import { ChannelService, RequestContext, TransactionalConnection } from '@vendure/core';
import { WilayaShipping } from '../entities/wilaya-shipping.entity';

export interface UpdateWilayaShippingPriceInput {
  code: string;
  /** Minor units (centimes). */
  price: number;
}

/** Charged when the address can't be matched to any wilaya row (500 DZD). */
export const FALLBACK_SHIPPING_PRICE = 50000;

@Injectable()
export class WilayaShippingService {
  constructor(
    private connection: TransactionalConnection,
    private channelService: ChannelService,
  ) {}

  async findAll(ctx: RequestContext): Promise<WilayaShipping[]> {
    return this.connection.getRepository(ctx, WilayaShipping).find({ order: { code: 'ASC' } });
  }

  async updatePrices(
    ctx: RequestContext,
    input: UpdateWilayaShippingPriceInput[],
  ): Promise<WilayaShipping[]> {
    const repo = this.connection.getRepository(ctx, WilayaShipping);
    for (const { code, price } of input) {
      if (!Number.isInteger(price) || price < 0) {
        throw new Error(`Invalid price for wilaya ${code}: ${price}`);
      }
      await repo.update({ code }, { price });
    }
    return this.findAll(ctx);
  }

  /**
   * Resolve the delivery price for an order shipping address. The storefront
   * writes the wilaya into `province` in the shopper's locale (French or
   * Arabic name, or the raw code as fallback), so match against all three.
   * Orders above the channel's free-shipping threshold ship free, matching
   * the storefront banner.
   */
  async priceForAddress(
    ctx: RequestContext,
    address: { province?: string | null } | undefined,
    orderSubTotalWithTax: number,
  ): Promise<number> {
    const threshold = await this.freeShippingThreshold(ctx);
    if (threshold != null && orderSubTotalWithTax >= threshold) {
      return 0;
    }
    const province = address?.province?.trim();
    if (!province) return FALLBACK_SHIPPING_PRICE;
    const row = await this.connection
      .getRepository(ctx, WilayaShipping)
      .createQueryBuilder('w')
      .where('w.code = :p OR w.name = :p OR w.nameAr = :p', { p: province })
      .getOne();
    return row?.price ?? FALLBACK_SHIPPING_PRICE;
  }

  /** Channel free-shipping threshold in minor units, or null when unset. */
  private async freeShippingThreshold(ctx: RequestContext): Promise<number | null> {
    const channel = await this.channelService.getChannelFromToken(ctx.channel.token);
    const dzd = (channel.customFields as { freeShippingThreshold?: number } | undefined)
      ?.freeShippingThreshold;
    return dzd != null && dzd > 0 ? dzd * 100 : null;
  }
}
