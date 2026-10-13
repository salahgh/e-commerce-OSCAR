import { DeepPartial, VendureEntity } from '@vendure/core';
import { Column, Entity, OneToMany } from 'typeorm';
import { WilayaCommune } from './wilaya-commune.entity';

/**
 * A delivery wilaya: the destination itself (code, names, delay zone, on/off)
 * and its two delivery prices. Managed in the back-office (Settings →
 * Livraison): wilayas can be added, renamed, switched off or deleted there.
 * A null price means that delivery mode is not offered in the wilaya; an
 * inactive wilaya is hidden from customers and offers no delivery at all.
 */
@Entity()
export class WilayaShipping extends VendureEntity {
  constructor(input?: DeepPartial<WilayaShipping>) {
    super(input);
  }

  /** Two-digit wilaya code, '01'..'69' for the official ones. */
  @Column({ unique: true })
  code: string;

  /** French name (addresses store this form in `province`). */
  @Column()
  name: string;

  /** Arabic name (addresses saved from the AR storefront may carry this form). */
  @Column()
  nameAr: string;

  /** Offered to customers at all. */
  @Column({ default: true })
  active: boolean;

  /** Delivery-delay zone 1..4, shown as an estimate at checkout. */
  @Column({ type: 'int', default: 3 })
  shippingZone: number;

  /**
   * Home-delivery price in minor units (centimes): 30000 = 300 DZD, or null
   * when not offered. The column keeps its original name `price`.
   */
  @Column({ name: 'price', type: 'int', nullable: true })
  homePrice: number | null;

  /** Courier-office pickup price in minor units, or null when not offered. */
  @Column({ type: 'int', nullable: true })
  officePrice: number | null;

  @OneToMany(() => WilayaCommune, (commune) => commune.wilaya)
  communes: WilayaCommune[];
}
