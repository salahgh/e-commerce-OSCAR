import { Injectable } from '@nestjs/common';
import {
  ChannelService,
  ID,
  RequestContext,
  TransactionalConnection,
  UserInputError,
} from '@vendure/core';
import { WilayaShipping } from '../entities/wilaya-shipping.entity';
import { WilayaCommune } from '../entities/wilaya-commune.entity';
import {
  AddressLike,
  DeliveryMode,
  findWilayaRow,
  nextCommuneCode,
  quoteDelivery,
} from '../shipping/wilaya-pricing';

export interface UpdateWilayaShippingPriceInput {
  code: string;
  /** Minor units (centimes); null = home delivery not offered. */
  homePrice: number | null;
  /** Minor units (centimes); null = office pickup not offered. */
  officePrice: number | null;
}

export interface CreateDeliveryWilayaInput {
  code: string;
  name: string;
  nameAr: string;
  shippingZone: number;
  homePrice?: number | null;
  officePrice?: number | null;
}

/** `undefined` = unchanged; an explicit `null` price = mode not offered. */
export interface UpdateDeliveryWilayaInput {
  id: ID;
  name?: string;
  nameAr?: string;
  active?: boolean;
  shippingZone?: number;
  homePrice?: number | null;
  officePrice?: number | null;
}

export interface CreateDeliveryCommuneInput {
  wilayaId: ID;
  name: string;
  nameAr: string;
  postalCode?: string | null;
}

export interface UpdateDeliveryCommuneInput {
  id: ID;
  name?: string;
  nameAr?: string;
  postalCode?: string | null;
  active?: boolean;
}

/**
 * The delivery destinations (wilayas and their communes) and the per-wilaya
 * prices, all managed from the back-office. The storefronts read the active
 * destinations through the shop API; the shipping calculator asks
 * {@link quoteForAddress} for a price.
 */
@Injectable()
export class WilayaShippingService {
  constructor(
    private connection: TransactionalConnection,
    private channelService: ChannelService,
  ) {}

  /** Every wilaya, active or not, with its communes, ordered by code. */
  async findAll(ctx: RequestContext): Promise<WilayaShipping[]> {
    return this.connection.getRepository(ctx, WilayaShipping).find({
      relations: { communes: true },
      order: { code: 'ASC', communes: { name: 'ASC' } },
    });
  }

  /** Active wilayas with their active communes only: what customers may pick. */
  async findActive(ctx: RequestContext): Promise<WilayaShipping[]> {
    const rows = await this.connection.getRepository(ctx, WilayaShipping).find({
      where: { active: true },
      relations: { communes: true },
      order: { code: 'ASC', communes: { name: 'ASC' } },
    });
    for (const row of rows) row.communes = row.communes.filter((c) => c.active);
    return rows;
  }

  async findOne(ctx: RequestContext, id: ID): Promise<WilayaShipping> {
    const row = await this.connection
      .getRepository(ctx, WilayaShipping)
      .findOne({ where: { id: id as number }, relations: { communes: true }, order: { communes: { name: 'ASC' } } });
    if (!row) throw new UserInputError(`Wilaya ${id} introuvable`);
    return row;
  }

  // ==================== WILAYAS ====================

  async createWilaya(ctx: RequestContext, input: CreateDeliveryWilayaInput): Promise<WilayaShipping> {
    const repo = this.connection.getRepository(ctx, WilayaShipping);
    const code = input.code.trim();
    if (!/^\d{2}$/.test(code)) throw new UserInputError('Le code wilaya doit comporter deux chiffres');
    if (await repo.findOne({ where: { code } })) throw new UserInputError(`Le code ${code} existe déjà`);
    const wilaya = new WilayaShipping({
      code,
      name: this.requireName(input.name, 'français'),
      nameAr: this.requireName(input.nameAr, 'arabe'),
      shippingZone: this.checkZone(input.shippingZone),
      homePrice: this.checkPrice(input.homePrice ?? null, 'home', code),
      officePrice: this.checkPrice(input.officePrice ?? null, 'office', code),
      active: true,
    });
    const saved = await repo.save(wilaya);
    return this.findOne(ctx, saved.id);
  }

  async updateWilaya(ctx: RequestContext, input: UpdateDeliveryWilayaInput): Promise<WilayaShipping> {
    const repo = this.connection.getRepository(ctx, WilayaShipping);
    const wilaya = await this.findOne(ctx, input.id);
    if (input.name !== undefined) wilaya.name = this.requireName(input.name, 'français');
    if (input.nameAr !== undefined) wilaya.nameAr = this.requireName(input.nameAr, 'arabe');
    if (input.active !== undefined) wilaya.active = input.active;
    if (input.shippingZone !== undefined) wilaya.shippingZone = this.checkZone(input.shippingZone);
    if (input.homePrice !== undefined) wilaya.homePrice = this.checkPrice(input.homePrice, 'home', wilaya.code);
    if (input.officePrice !== undefined) wilaya.officePrice = this.checkPrice(input.officePrice, 'office', wilaya.code);
    await repo.save(wilaya);
    return this.findOne(ctx, wilaya.id);
  }

  /** Deletes the wilaya and, by cascade, its communes. Orders keep their address text. */
  async deleteWilaya(ctx: RequestContext, id: ID): Promise<boolean> {
    const wilaya = await this.findOne(ctx, id);
    await this.connection.getRepository(ctx, WilayaShipping).remove(wilaya);
    return true;
  }

  async updatePrices(
    ctx: RequestContext,
    input: UpdateWilayaShippingPriceInput[],
  ): Promise<WilayaShipping[]> {
    const repo = this.connection.getRepository(ctx, WilayaShipping);
    for (const { code, homePrice, officePrice } of input) {
      await repo.update(
        { code },
        {
          homePrice: this.checkPrice(homePrice, 'home', code),
          officePrice: this.checkPrice(officePrice, 'office', code),
        },
      );
    }
    return this.findAll(ctx);
  }

  // ==================== COMMUNES ====================

  async createCommune(ctx: RequestContext, input: CreateDeliveryCommuneInput): Promise<WilayaCommune> {
    const wilaya = await this.findOne(ctx, input.wilayaId);
    const repo = this.connection.getRepository(ctx, WilayaCommune);
    const allCodes = (await repo.find({ select: { code: true } })).map((c) => c.code);
    const commune = new WilayaCommune({
      code: nextCommuneCode(wilaya.code, allCodes),
      name: this.requireName(input.name, 'français'),
      nameAr: this.requireName(input.nameAr, 'arabe'),
      postalCode: this.cleanPostalCode(input.postalCode),
      active: true,
      wilayaId: wilaya.id as number,
    });
    return repo.save(commune);
  }

  async updateCommune(ctx: RequestContext, input: UpdateDeliveryCommuneInput): Promise<WilayaCommune> {
    const repo = this.connection.getRepository(ctx, WilayaCommune);
    const commune = await repo.findOne({ where: { id: input.id as number } });
    if (!commune) throw new UserInputError(`Commune ${input.id} introuvable`);
    if (input.name !== undefined) commune.name = this.requireName(input.name, 'français');
    if (input.nameAr !== undefined) commune.nameAr = this.requireName(input.nameAr, 'arabe');
    if (input.postalCode !== undefined) commune.postalCode = this.cleanPostalCode(input.postalCode);
    if (input.active !== undefined) commune.active = input.active;
    return repo.save(commune);
  }

  async deleteCommune(ctx: RequestContext, id: ID): Promise<boolean> {
    const repo = this.connection.getRepository(ctx, WilayaCommune);
    const commune = await repo.findOne({ where: { id: id as number } });
    if (!commune) throw new UserInputError(`Commune ${id} introuvable`);
    await repo.remove(commune);
    return true;
  }

  // ==================== QUOTING ====================

  /**
   * Quote one delivery mode for an order shipping address, in minor units, or
   * `undefined` when that mode is not offered in the wilaya. Orders above the
   * channel's free-shipping threshold ship free, matching the storefront banner.
   */
  async quoteForAddress(
    ctx: RequestContext,
    address: AddressLike | undefined,
    orderSubTotalWithTax: number,
    mode: DeliveryMode,
  ): Promise<number | undefined> {
    const rows = await this.connection.getRepository(ctx, WilayaShipping).find();
    const row = findWilayaRow(rows, address);
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

  // ==================== VALIDATION ====================

  private requireName(value: string, language: string): string {
    const trimmed = value.trim();
    if (!trimmed) throw new UserInputError(`Le nom en ${language} est obligatoire`);
    return trimmed;
  }

  private checkZone(zone: number): number {
    if (!Number.isInteger(zone) || zone < 1 || zone > 4) {
      throw new UserInputError('La zone de délai doit être comprise entre 1 et 4');
    }
    return zone;
  }

  private checkPrice(price: number | null, label: DeliveryMode, code: string): number | null {
    if (price != null && (!Number.isInteger(price) || price < 0)) {
      throw new UserInputError(`Prix ${label} invalide pour la wilaya ${code} : ${price}`);
    }
    return price;
  }

  private cleanPostalCode(value: string | null | undefined): string | null {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  }
}
