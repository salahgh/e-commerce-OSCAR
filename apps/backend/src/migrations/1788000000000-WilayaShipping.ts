import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Per-wilaya delivery pricing:
 *  1. Creates the `wilaya_shipping` table (entity WilayaShipping in oscar-plugin).
 *  2. Seeds all 69 wilayas with default prices derived from the @oscar/shared
 *     shipping zones (300/400/500/800 DZD, stored in centimes). Prices are then
 *     managed from the back-office "Livraison par wilaya" table.
 *  3. Switches the existing `standard-shipping` method from the flat
 *     default-shipping-calculator to the wilaya-shipping-calculator.
 */
export class WilayaShipping1788000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `CREATE TABLE "wilaya_shipping" (
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "id" SERIAL NOT NULL,
        "code" character varying NOT NULL,
        "name" character varying NOT NULL,
        "nameAr" character varying NOT NULL,
        "price" integer NOT NULL,
        CONSTRAINT "UQ_wilaya_shipping_code" UNIQUE ("code"),
        CONSTRAINT "PK_wilaya_shipping_id" PRIMARY KEY ("id")
      )`,
      undefined,
    );
    await queryRunner.query(
      `INSERT INTO "wilaya_shipping" ("code", "name", "nameAr", "price") VALUES
('01', 'Adrar', 'أدرار', 80000),
('02', 'Chlef', 'الشلف', 40000),
('03', 'Laghouat', 'الأغواط', 50000),
('04', 'Oum El Bouaghi', 'أم البواقي', 50000),
('05', 'Batna', 'باتنة', 50000),
('06', 'Béjaïa', 'بجاية', 40000),
('07', 'Biskra', 'بسكرة', 50000),
('08', 'Béchar', 'بشار', 80000),
('09', 'Blida', 'البليدة', 30000),
('10', 'Bouira', 'البويرة', 50000),
('11', 'Tamanrasset', 'تمنراست', 80000),
('12', 'Tébessa', 'تبسة', 50000),
('13', 'Tlemcen', 'تلمسان', 40000),
('14', 'Tiaret', 'تيارت', 50000),
('15', 'Tizi Ouzou', 'تيزي وزو', 40000),
('16', 'Alger', 'الجزائر', 30000),
('17', 'Djelfa', 'الجلفة', 50000),
('18', 'Jijel', 'جيجل', 40000),
('19', 'Sétif', 'سطيف', 50000),
('20', 'Saïda', 'سعيدة', 50000),
('21', 'Skikda', 'سكيكدة', 40000),
('22', 'Sidi Bel Abbès', 'سيدي بلعباس', 40000),
('23', 'Annaba', 'عنابة', 40000),
('24', 'Guelma', 'قالمة', 40000),
('25', 'Constantine', 'قسنطينة', 40000),
('26', 'Médéa', 'المدية', 50000),
('27', 'Mostaganem', 'مستغانم', 40000),
('28', 'M''Sila', 'المسيلة', 50000),
('29', 'Mascara', 'معسكر', 40000),
('30', 'Ouargla', 'ورقلة', 80000),
('31', 'Oran', 'وهران', 40000),
('32', 'El Bayadh', 'البيض', 80000),
('33', 'Illizi', 'إليزي', 80000),
('34', 'Bordj Bou Arreridj', 'برج بوعريريج', 50000),
('35', 'Boumerdès', 'بومرداس', 30000),
('36', 'El Tarf', 'الطارف', 40000),
('37', 'Tindouf', 'تندوف', 80000),
('38', 'Tissemsilt', 'تيسمسيلت', 50000),
('39', 'El Oued', 'الوادي', 80000),
('40', 'Khenchela', 'خنشلة', 50000),
('41', 'Souk Ahras', 'سوق أهراس', 50000),
('42', 'Tipaza', 'تيبازة', 30000),
('43', 'Mila', 'ميلة', 50000),
('44', 'Aïn Defla', 'عين الدفلة', 50000),
('45', 'Naâma', 'النعامة', 80000),
('46', 'Aïn Témouchent', 'عين تيموشنت', 40000),
('47', 'Ghardaïa', 'غرداية', 80000),
('48', 'Relizane', 'غليزان', 40000),
('49', 'Timimoun', 'تيميمون', 80000),
('50', 'Bordj Badji Mokhtar', 'برج باجي مختار', 80000),
('51', 'Ouled Djellal', 'أولاد جلال', 50000),
('52', 'Béni Abbès', 'بني عباس', 80000),
('53', 'In Salah', 'عين صالح', 80000),
('54', 'In Guezzam', 'عين قزام', 80000),
('55', 'Touggourt', 'تقرت', 80000),
('56', 'Djanet', 'جانت', 80000),
('57', 'El Meghaier', 'المغير', 80000),
('58', 'El Menia', 'المنيعة', 80000),
('59', 'Aflou', 'أفلو', 50000),
('60', 'Barika', 'بريكة', 50000),
('61', 'Ksar Chellala', 'قصر الشلالة', 50000),
('62', 'Messaad', 'مسعد', 50000),
('63', 'Aïn Oussera', 'عين وسارة', 50000),
('64', 'Boussaâda', 'بوسعادة', 50000),
('65', 'El Abiodh Sidi Cheikh', 'الأبيض سيدي الشيخ', 80000),
('66', 'El Kantara', 'القنطرة', 50000),
('67', 'Bir El Ater', 'بئر العاتر', 50000),
('68', 'Ksar El Boukhari', 'قصر البخاري', 50000),
('69', 'El Aricha', 'العريشة', 50000)      ON CONFLICT ("code") DO NOTHING`,
      undefined,
    );
    await queryRunner.query(
      `UPDATE "shipping_method"
       SET "calculator" = '{"code":"wilaya-shipping-calculator","args":[]}'
       WHERE "code" = 'standard-shipping'
         AND "calculator" LIKE '%default-shipping-calculator%'`,
      undefined,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(
      `UPDATE "shipping_method"
       SET "calculator" = '{"code":"default-shipping-calculator","args":[{"name":"rate","value":"50000"},{"name":"includesTax","value":"auto"},{"name":"taxRate","value":"0"}]}'
       WHERE "code" = 'standard-shipping'
         AND "calculator" LIKE '%wilaya-shipping-calculator%'`,
      undefined,
    );
    await queryRunner.query(`DROP TABLE "wilaya_shipping"`, undefined);
  }
}
