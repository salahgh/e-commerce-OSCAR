import { Injectable } from '@nestjs/common';
import { Customer, ID, Order, RequestContext, TransactionalConnection } from '@vendure/core';
import { phoneSearchCore } from '../order/phone-search';

/** More matches than this means the number typed is too short to be useful. */
const MAX_RESULTS = 500;

/** SQL: digits of a text expression (PostgreSQL). */
const digitsOf = (expr: string) => `regexp_replace(coalesce(${expr}, ''), '[^0-9]', '', 'g')`;

export interface PhoneSearchResult {
  orderIds: ID[];
  customerIds: ID[];
}

/**
 * Back-office search by phone number. Vendure's list filters can't search the
 * customer's phone from the orders list, nor ignore formatting ("+213 661 …"
 * vs "0661…"), so this returns the matching ids and the back-office adds them
 * to its existing search as `id IN (...)`.
 */
@Injectable()
export class PhoneSearchService {
  constructor(private connection: TransactionalConnection) {}

  async search(ctx: RequestContext, phone: string): Promise<PhoneSearchResult> {
    const core = phoneSearchCore(phone);
    if (!core) return { orderIds: [], customerIds: [] };
    const like = `%${core}%`;

    // Orders: the customer's phone or the phone on the delivery address
    // (they differ on some orders). shippingAddress is a JSON text column.
    const orders = await this.connection
      .getRepository(ctx, Order)
      .createQueryBuilder('o') // not "order": a reserved SQL word, and raw SQL below uses the alias unquoted
      .innerJoin('o.channels', 'channel', 'channel.id = :channelId', { channelId: ctx.channelId })
      .leftJoin('o.customer', 'cust')
      .select('o.id', 'id')
      .where(
        `(${digitsOf('cust."phoneNumber"')} LIKE :like OR ${digitsOf(`(o."shippingAddress"::jsonb ->> 'phoneNumber')`)} LIKE :like)`,
        { like },
      )
      .orderBy('o.id', 'DESC')
      .limit(MAX_RESULTS)
      .getRawMany<{ id: ID }>();

    // Customers: their own phone or the phone of any saved address.
    const customers = await this.connection
      .getRepository(ctx, Customer)
      .createQueryBuilder('cust')
      .innerJoin('cust.channels', 'channel', 'channel.id = :channelId', { channelId: ctx.channelId })
      .leftJoin('cust.addresses', 'addr')
      .select('cust.id', 'id')
      .distinct(true)
      .where('cust.deletedAt IS NULL')
      .andWhere(`(${digitsOf('cust."phoneNumber"')} LIKE :like OR ${digitsOf('addr."phoneNumber"')} LIKE :like)`, {
        like,
      })
      .limit(MAX_RESULTS)
      .getRawMany<{ id: ID }>();

    return { orderIds: orders.map(o => o.id), customerIds: customers.map(c => c.id) };
  }
}
