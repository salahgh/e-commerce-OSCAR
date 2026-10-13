import { DeepPartial, VendureEntity } from '@vendure/core';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { WilayaShipping } from './wilaya-shipping.entity';

/**
 * A commune of a wilaya, offered in the storefront address forms. Managed in
 * the back-office (Settings → Livraison) alongside its wilaya; an inactive
 * commune is hidden from customers. Seeded from the official nomenclature by
 * the DeliveryDestinations migration.
 */
@Entity()
export class WilayaCommune extends VendureEntity {
  constructor(input?: DeepPartial<WilayaCommune>) {
    super(input);
  }

  /** Wilaya code + two-digit sequence, e.g. '1601'. */
  @Column({ unique: true })
  code: string;

  /** French name (addresses store this form in `city`). */
  @Column()
  name: string;

  @Column()
  nameAr: string;

  @Column({ type: 'varchar', nullable: true })
  postalCode: string | null;

  @Column({ default: true })
  active: boolean;

  @Index()
  @ManyToOne(() => WilayaShipping, (wilaya) => wilaya.communes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wilayaId' })
  wilaya: WilayaShipping;

  @Column()
  wilayaId: number;
}
