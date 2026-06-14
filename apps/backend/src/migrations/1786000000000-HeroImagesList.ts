import { MigrationInterface, QueryRunner } from 'typeorm';

export class HeroImagesList1786000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "channel" DROP CONSTRAINT "FK_5acf26fe4f7dddb4447d4fcab0d"`,
      undefined,
    );
    await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsHeroimageid"`, undefined);
    await queryRunner.query(
      `CREATE TABLE "channel_custom_fields_hero_images_asset" ("channelId" integer NOT NULL, "assetId" integer NOT NULL, CONSTRAINT "PK_channel_hero_images_asset" PRIMARY KEY ("channelId", "assetId"))`,
      undefined,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_channel_hero_images_channel" ON "channel_custom_fields_hero_images_asset" ("channelId")`,
      undefined,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_channel_hero_images_asset" ON "channel_custom_fields_hero_images_asset" ("assetId")`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "channel_custom_fields_hero_images_asset" ADD CONSTRAINT "FK_channel_hero_images_channel" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "channel_custom_fields_hero_images_asset" ADD CONSTRAINT "FK_channel_hero_images_asset" FOREIGN KEY ("assetId") REFERENCES "asset"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `ALTER TABLE "channel_custom_fields_hero_images_asset" DROP CONSTRAINT "FK_channel_hero_images_asset"`,
      undefined,
    );
    await queryRunner.query(
      `ALTER TABLE "channel_custom_fields_hero_images_asset" DROP CONSTRAINT "FK_channel_hero_images_channel"`,
      undefined,
    );
    await queryRunner.query(`DROP INDEX "public"."IDX_channel_hero_images_asset"`, undefined);
    await queryRunner.query(`DROP INDEX "public"."IDX_channel_hero_images_channel"`, undefined);
    await queryRunner.query(`DROP TABLE "channel_custom_fields_hero_images_asset"`, undefined);
    await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsHeroimageid" integer`, undefined);
    await queryRunner.query(
      `ALTER TABLE "channel" ADD CONSTRAINT "FK_5acf26fe4f7dddb4447d4fcab0d" FOREIGN KEY ("customFieldsHeroimageid") REFERENCES "asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
      undefined,
    );
  }
}
