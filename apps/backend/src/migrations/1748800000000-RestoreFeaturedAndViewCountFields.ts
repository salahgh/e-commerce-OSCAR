import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Restores the Product `isFeatured` and `viewCount` custom-field columns that
 * RemoveProductCustomFields1737290000000 dropped. We keep curated featured
 * products (admin-toggleable) and real view-count popularity. The multilingual
 * name/description and other previously-removed fields are intentionally NOT
 * restored — native Vendure translations cover search.
 *
 * Guarded with hasColumn so it is safe to run where `synchronize` already
 * created the columns.
 */
export class RestoreFeaturedAndViewCountFields1748800000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn('product', 'customFieldsIsfeatured'))) {
      await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsIsfeatured" boolean DEFAULT false`);
      console.log('Added product column: customFieldsIsfeatured');
    }
    if (!(await queryRunner.hasColumn('product', 'customFieldsViewcount'))) {
      await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsViewcount" integer DEFAULT 0`);
      console.log('Added product column: customFieldsViewcount');
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    if (await queryRunner.hasColumn('product', 'customFieldsViewcount')) {
      await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "customFieldsViewcount"`);
    }
    if (await queryRunner.hasColumn('product', 'customFieldsIsfeatured')) {
      await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "customFieldsIsfeatured"`);
    }
  }
}
