import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Align hand-named indexes / foreign keys with the names TypeORM derives, so the
 * production boot log stops printing "Your database schema does not match your
 * current configuration" for them. Pure renames: no data touched, no semantics
 * changed. Guarded so it is a no-op on databases that already carry the TypeORM
 * names (dev databases built with `synchronize`).
 *
 * Deliberately NOT reconciled:
 *  - `refund.items/shipping/adjustment` DEFAULT 0 — set on purpose by
 *    RefundDeprecatedColumnDefaults1749200000000; dropping the defaults would
 *    make every amount-based refund insert fail again.
 *  - `customer.customFieldsAvatarid` FK keeps ON DELETE SET NULL (Vendure's
 *    relation custom field would use NO ACTION, which blocks deleting an asset
 *    that is someone's avatar). Only its name is aligned, so one drift line
 *    about this FK's ON DELETE rule remains and is expected.
 */
export class AlignConstraintNames1790000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER INDEX IF EXISTS "IDX_channel_hero_images_channel" RENAME TO "IDX_9606409bbd1b672c4f7a12057f"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER INDEX IF EXISTS "IDX_channel_hero_images_asset" RENAME TO "IDX_c7153d86eafeb1482abdede7f3"`,
      undefined,
    );
    await this.renameConstraint(
      queryRunner,
      'channel_custom_fields_hero_images_asset',
      'FK_channel_hero_images_channel',
      'FK_9606409bbd1b672c4f7a12057fe',
    );
    await this.renameConstraint(
      queryRunner,
      'channel_custom_fields_hero_images_asset',
      'FK_channel_hero_images_asset',
      'FK_c7153d86eafeb1482abdede7f3e',
    );
    await this.renameConstraint(
      queryRunner,
      'customer',
      'FK_customer_custom_fields_avatar_asset',
      'FK_f448a72a2326b03b66d9df059fe',
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await this.renameConstraint(
      queryRunner,
      'customer',
      'FK_f448a72a2326b03b66d9df059fe',
      'FK_customer_custom_fields_avatar_asset',
    );
    await this.renameConstraint(
      queryRunner,
      'channel_custom_fields_hero_images_asset',
      'FK_c7153d86eafeb1482abdede7f3e',
      'FK_channel_hero_images_asset',
    );
    await this.renameConstraint(
      queryRunner,
      'channel_custom_fields_hero_images_asset',
      'FK_9606409bbd1b672c4f7a12057fe',
      'FK_channel_hero_images_channel',
    );
    await queryRunner.query(
      `ALTER INDEX IF EXISTS "IDX_c7153d86eafeb1482abdede7f3" RENAME TO "IDX_channel_hero_images_asset"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER INDEX IF EXISTS "IDX_9606409bbd1b672c4f7a12057f" RENAME TO "IDX_channel_hero_images_channel"`,
      undefined,
    );
  }

  /** `ALTER TABLE … RENAME CONSTRAINT` has no IF EXISTS, so guard it in a DO block. */
  private async renameConstraint(
    queryRunner: QueryRunner,
    table: string,
    from: string,
    to: string,
  ): Promise<void> {
    await queryRunner.query(
      `DO $$ BEGIN
         IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '${from}')
            AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = '${to}') THEN
           ALTER TABLE "${table}" RENAME CONSTRAINT "${from}" TO "${to}";
         END IF;
       END $$;`,
      undefined,
    );
  }
}
