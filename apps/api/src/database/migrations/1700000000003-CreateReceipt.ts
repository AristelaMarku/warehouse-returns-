import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReceipt1700000000003 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "receipt" (
        "id"                      UUID          NOT NULL DEFAULT gen_random_uuid(),
        "rma_id"                  UUID          NOT NULL,
        "received_serial_number"  VARCHAR(128)  NOT NULL,
        "received_by_user_id"     UUID          NOT NULL,
        "status"                  VARCHAR(32)   NOT NULL,
        "disposition"             VARCHAR(32),
        "rejection_reason"        VARCHAR(512),
        "received_at"             TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        CONSTRAINT "PK_receipt" PRIMARY KEY ("id"),
        CONSTRAINT "FK_receipt_rma" FOREIGN KEY ("rma_id") REFERENCES "rma" ("id"),
        CONSTRAINT "FK_receipt_user" FOREIGN KEY ("received_by_user_id") REFERENCES "warehouse_user" ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_receipt_rma_id" ON "receipt" ("rma_id")`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "receipt"`);
  }
}
