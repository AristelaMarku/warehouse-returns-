import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNotesToReceipt1700000000005 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "receipt" ADD COLUMN IF NOT EXISTS "notes" VARCHAR(512) NULL`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "receipt" DROP COLUMN IF EXISTS "notes"`);
  }
}
