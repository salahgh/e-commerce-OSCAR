import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Home / office delivery: the single per-wilaya `price` becomes the nullable
 * home-delivery price and a nullable `officePrice` is added. Office prices
 * are seeded as placeholders (home price minus 100 DZD, never below 0) until
 * the courier grid is entered in the back-office. The two shipping methods
 * themselves are created on boot by ShippingSetupService.
 */
export class HomeOfficeDelivery1789000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "wilaya_shipping" ALTER COLUMN "price" DROP NOT NULL`, undefined);
    await queryRunner.query(`ALTER TABLE "wilaya_shipping" ADD COLUMN IF NOT EXISTS "officePrice" integer`, undefined);
    await queryRunner.query(
      `UPDATE "wilaya_shipping" SET "officePrice" = GREATEST("price" - 10000, 0)
       WHERE "officePrice" IS NULL AND "price" IS NOT NULL`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "wilaya_shipping" DROP COLUMN IF EXISTS "officePrice"`, undefined);
    await queryRunner.query(`UPDATE "wilaya_shipping" SET "price" = 50000 WHERE "price" IS NULL`, undefined);
    await queryRunner.query(`ALTER TABLE "wilaya_shipping" ALTER COLUMN "price" SET NOT NULL`, undefined);
  }
}
