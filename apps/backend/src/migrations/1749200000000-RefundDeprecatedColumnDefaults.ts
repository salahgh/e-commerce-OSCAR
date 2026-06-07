import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Fix: `refundOrder` fails with
 *   "null value in column \"shipping\" of relation \"refund\" violates not-null constraint".
 *
 * Since Vendure v2.2 the Refund `items`, `shipping` and `adjustment` columns are
 * deprecated — the amount-based refund only populates `total` and omits the other
 * three. Those columns, however, are still NOT NULL with no DEFAULT, so every
 * amount-based refund insert violates the constraint and refunds are impossible.
 *
 * Give the three deprecated columns a DEFAULT of 0 so the omitted values fall
 * back to 0 on insert. (In production `synchronize` is off and this migration is
 * authoritative; in dev `synchronize` may need to be re-applied after a restart.)
 */
export class RefundDeprecatedColumnDefaults1749200000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const col of ['items', 'shipping', 'adjustment']) {
      if (await queryRunner.hasColumn('refund', col)) {
        await queryRunner.query(`ALTER TABLE "refund" ALTER COLUMN "${col}" SET DEFAULT 0`);
        // Backfill any existing NULLs (defensive; none expected).
        await queryRunner.query(`UPDATE "refund" SET "${col}" = 0 WHERE "${col}" IS NULL`);
        console.log(`refund.${col}: SET DEFAULT 0`);
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const col of ['items', 'shipping', 'adjustment']) {
      if (await queryRunner.hasColumn('refund', col)) {
        await queryRunner.query(`ALTER TABLE "refund" ALTER COLUMN "${col}" DROP DEFAULT`);
      }
    }
  }
}
