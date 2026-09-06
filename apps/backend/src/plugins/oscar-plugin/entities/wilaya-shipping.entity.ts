import { DeepPartial, VendureEntity } from '@vendure/core';
import { Column, Entity } from 'typeorm';

/**
 * Per-wilaya home-delivery price. Seeded with all 69 wilayas by migration
 * (defaults derived from the @oscar/shared zone prices); the back-office
 * "Livraison par wilaya" table edits `price` only.
 */
@Entity()
export class WilayaShipping extends VendureEntity {
  constructor(input?: DeepPartial<WilayaShipping>) {
    super(input);
  }

  /** Official wilaya code, '01'..'69'. */
  @Column({ unique: true })
  code: string;

  /** French name (matches @oscar/shared wilaya names, used to resolve addresses). */
  @Column()
  name: string;

  /** Arabic name (addresses saved from the AR storefront carry this form). */
  @Column()
  nameAr: string;

  /** Delivery price in minor units (centimes): 30000 = 300 DZD. */
  @Column({ type: 'int' })
  price: number;
}
