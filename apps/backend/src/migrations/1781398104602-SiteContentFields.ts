import {MigrationInterface, QueryRunner} from "typeorm";

export class SiteContentFields1781398104602 implements MigrationInterface {

   public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "channel_custom_fields_banner_images_asset" ("channelId" integer NOT NULL, "assetId" integer NOT NULL, CONSTRAINT "PK_74968f004f1e764f084ef19d632" PRIMARY KEY ("channelId", "assetId"))`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_148442f631d6d204279627b7ba" ON "channel_custom_fields_banner_images_asset" ("channelId") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_ef00c38c17e8832d118a3447b4" ON "channel_custom_fields_banner_images_asset" ("assetId") `, undefined);
        await queryRunner.query(`CREATE TABLE "channel_custom_fields_review_images_asset" ("channelId" integer NOT NULL, "assetId" integer NOT NULL, CONSTRAINT "PK_4de04b4df3c0310092d67f9898f" PRIMARY KEY ("channelId", "assetId"))`, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_97aa7f55ea635b4b729bcc362d" ON "channel_custom_fields_review_images_asset" ("channelId") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_eb9ac5bdf6abac96d7cbde267c" ON "channel_custom_fields_review_images_asset" ("assetId") `, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsHeroimageid" integer`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsPromotextar" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsPromotextfr" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsPromotexten" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsFreeshippingthreshold" integer DEFAULT '12000'`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsContactemail" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsContactphone" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsFooteraddressar" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsFooteraddressfr" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsFooteraddressen" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsSocialfacebook" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsSocialinstagram" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsSocialtwitter" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsSociallinkedin" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsSocialyoutube" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsAppappstore" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsAppgoogleplay" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsReviewstitlear" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsReviewstitlefr" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsReviewstitleen" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsReviewssubtitlear" text`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsReviewssubtitlefr" text`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsReviewssubtitleen" text`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsCopyrighttextar" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsCopyrighttextfr" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsCopyrighttexten" character varying(255)`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" ADD CONSTRAINT "FK_5acf26fe4f7dddb4447d4fcab0d" FOREIGN KEY ("customFieldsHeroimageid") REFERENCES "asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
        await queryRunner.query(`ALTER TABLE "channel_custom_fields_banner_images_asset" ADD CONSTRAINT "FK_148442f631d6d204279627b7bad" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE CASCADE ON UPDATE CASCADE`, undefined);
        await queryRunner.query(`ALTER TABLE "channel_custom_fields_banner_images_asset" ADD CONSTRAINT "FK_ef00c38c17e8832d118a3447b4a" FOREIGN KEY ("assetId") REFERENCES "asset"("id") ON DELETE CASCADE ON UPDATE CASCADE`, undefined);
        await queryRunner.query(`ALTER TABLE "channel_custom_fields_review_images_asset" ADD CONSTRAINT "FK_97aa7f55ea635b4b729bcc362d9" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE CASCADE ON UPDATE CASCADE`, undefined);
        await queryRunner.query(`ALTER TABLE "channel_custom_fields_review_images_asset" ADD CONSTRAINT "FK_eb9ac5bdf6abac96d7cbde267cf" FOREIGN KEY ("assetId") REFERENCES "asset"("id") ON DELETE CASCADE ON UPDATE CASCADE`, undefined);
   }

   public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "channel_custom_fields_review_images_asset" DROP CONSTRAINT "FK_eb9ac5bdf6abac96d7cbde267cf"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel_custom_fields_review_images_asset" DROP CONSTRAINT "FK_97aa7f55ea635b4b729bcc362d9"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel_custom_fields_banner_images_asset" DROP CONSTRAINT "FK_ef00c38c17e8832d118a3447b4a"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel_custom_fields_banner_images_asset" DROP CONSTRAINT "FK_148442f631d6d204279627b7bad"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP CONSTRAINT "FK_5acf26fe4f7dddb4447d4fcab0d"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsCopyrighttexten"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsCopyrighttextfr"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsCopyrighttextar"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsReviewssubtitleen"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsReviewssubtitlefr"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsReviewssubtitlear"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsReviewstitleen"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsReviewstitlefr"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsReviewstitlear"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsAppgoogleplay"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsAppappstore"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsSocialyoutube"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsSociallinkedin"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsSocialtwitter"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsSocialinstagram"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsSocialfacebook"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsFooteraddressen"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsFooteraddressfr"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsFooteraddressar"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsContactphone"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsContactemail"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsFreeshippingthreshold"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsPromotexten"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsPromotextfr"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsPromotextar"`, undefined);
        await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsHeroimageid"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_eb9ac5bdf6abac96d7cbde267c"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_97aa7f55ea635b4b729bcc362d"`, undefined);
        await queryRunner.query(`DROP TABLE "channel_custom_fields_review_images_asset"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_ef00c38c17e8832d118a3447b4"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_148442f631d6d204279627b7ba"`, undefined);
        await queryRunner.query(`DROP TABLE "channel_custom_fields_banner_images_asset"`, undefined);
   }

}
