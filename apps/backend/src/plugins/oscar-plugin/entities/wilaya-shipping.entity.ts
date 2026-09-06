import { DeepPartial, VendureEntity } from '@vendure/core';
import { Column, Entity } from 'typeorm';

/**
 * Per-wilaya delivery prices. Seeded with all 69 wilayas by migration; the
 * back-office "Livraison par wilaya" table edits the two prices. A null price
 * means that delivery mode is not offered in the wilaya.
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

  /**
   * Home-delivery price in minor units (centimes): 30000 = 300 DZD, or null
   * when not offered. The column keeps its original name `price`.
   */
  @Column({ name: 'price', type: 'int', nullable: true })
  homePrice: number | null;

  /** Courier-office pickup price in minor units, or null when not offered. */
  @Column({ type: 'int', nullable: true })
  officePrice: number | null;
}
