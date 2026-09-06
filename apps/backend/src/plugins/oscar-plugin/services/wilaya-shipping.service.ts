import { Injectable } from '@nestjs/common';
import { ChannelService, RequestContext, TransactionalConnection } from '@vendure/core';
import { WilayaShipping } from '../entities/wilaya-shipping.entity';
import { DeliveryMode, findWilayaRow, quoteDelivery } from '../shipping/wilaya-pricing';

export interface UpdateWilayaShippingPriceInput {
  code: string;
  /** Minor units (centimes); null = home delivery not offered. */
  homePrice: number | null;
  /** Minor units (centimes); null = office pickup not offered. */
  officePrice: number | null;
}

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
    for (const { code, homePrice, officePrice } of input) {
      for (const [label, price] of [['home', homePrice], ['office', officePrice]] as const) {
        if (price != null && (!Number.isInteger(price) || price < 0)) {
          throw new Error(`Invalid ${label} price for wilaya ${code}: ${price}`);
        }
      }
      await repo.update({ code }, { homePrice, officePrice });
    }
    return this.findAll(ctx);
  }

  /**
   * Quote one delivery mode for an order shipping address, in minor units, or
   * `undefined` when that mode is not offered in the wilaya. Orders above the
   * channel's free-shipping threshold ship free, matching the storefront banner.
   */
  async quoteForAddress(
    ctx: RequestContext,
    address: { province?: string | null } | undefined,
    orderSubTotalWithTax: number,
    mode: DeliveryMode,
  ): Promise<number | undefined> {
    const rows = await this.findAll(ctx);
    const row = findWilayaRow(rows, address?.province);
    const threshold = await this.freeShippingThreshold(ctx);
    return quoteDelivery(row, mode, orderSubTotalWithTax, threshold);
  }

  /** Channel free-shipping threshold in minor units, or null when unset. */
  private async freeShippingThreshold(ctx: RequestContext): Promise<number | null> {
    const channel = await this.channelService.getChannelFromToken(ctx.channel.token);
    const dzd = (channel.customFields as { freeShippingThreshold?: number } | undefined)
      ?.freeShippingThreshold;
    return dzd != null && dzd > 0 ? dzd * 100 : null;
  }
}
