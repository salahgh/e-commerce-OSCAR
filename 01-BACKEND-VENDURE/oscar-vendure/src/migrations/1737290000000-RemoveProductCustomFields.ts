import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration to remove obsolete Product and Collection custom fields.
 * These fields have been replaced by native Vendure translations.
 */
export class RemoveProductCustomFields1737290000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if columns exist before dropping (PostgreSQL)

    // Product custom fields to remove
    const productColumns = [
      'customFieldsSaleprice',
      'customFieldsIsfeatured',
      'customFieldsViewcount',
      'customFieldsWeightkg',
      'customFieldsNamefr',
      'customFieldsNamear',
      'customFieldsDescriptionfr',
      'customFieldsDescriptionar',
      'customFieldsAvailablesizes',
      'customFieldsAvailablecolors',
    ];

    for (const column of productColumns) {
      const hasColumn = await queryRunner.hasColumn('product', column);
      if (hasColumn) {
        await queryRunner.query(`ALTER TABLE "product" DROP COLUMN "${column}"`);
        console.log(`Dropped product column: ${column}`);
      }
    }

    // Collection custom fields to remove (translation fields - now using native translations)
    const collectionColumns = [
      'customFieldsNamefr',
      'customFieldsNamear',
      'customFieldsDescriptionfr',
      'customFieldsDescriptionar',
    ];

    for (const column of collectionColumns) {
      const hasColumn = await queryRunner.hasColumn('collection', column);
      if (hasColumn) {
        await queryRunner.query(`ALTER TABLE "collection" DROP COLUMN "${column}"`);
        console.log(`Dropped collection column: ${column}`);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate the columns if needed to rollback
    // Note: Data will be lost on rollback

    // Product columns
    await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsSaleprice" integer`);
    await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsIsfeatured" boolean DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsViewcount" integer DEFAULT 0`);
    await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsWeightkg" double precision`);
    await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsNamefr" character varying(255)`);
    await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsNamear" character varying(255)`);
    await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsDescriptionfr" text`);
    await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsDescriptionar" text`);
    await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsAvailablesizes" text`);
    await queryRunner.query(`ALTER TABLE "product" ADD "customFieldsAvailablecolors" text`);

    // Collection columns
    await queryRunner.query(`ALTER TABLE "collection" ADD "customFieldsNamefr" character varying(255)`);
    await queryRunner.query(`ALTER TABLE "collection" ADD "customFieldsNamear" character varying(255)`);
    await queryRunner.query(`ALTER TABLE "collection" ADD "customFieldsDescriptionfr" text`);
    await queryRunner.query(`ALTER TABLE "collection" ADD "customFieldsDescriptionar" text`);
  }
}
