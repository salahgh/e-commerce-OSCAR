import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the `avatar` relation custom field (Customer → Asset) used by the mobile &
 * web profile screens. A single nullable relation to Asset maps to a
 * `customFieldsAvatarid` integer column on the `customer` table with a FK to
 * `asset(id)`. ON DELETE SET NULL so removing an asset clears the avatar instead
 * of blocking the deletion.
 */
export class CustomerAvatar1787000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "customer" ADD "customFieldsAvatarid" integer`, undefined);
    await queryRunner.query(
      `ALTER TABLE "customer" ADD CONSTRAINT "FK_customer_custom_fields_avatar_asset" FOREIGN KEY ("customFieldsAvatarid") REFERENCES "asset"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "customer" DROP CONSTRAINT "FK_customer_custom_fields_avatar_asset"`,
      undefined,
    );
    await queryRunner.query(`ALTER TABLE "customer" DROP COLUMN "customFieldsAvatarid"`, undefined);
  }
}
