import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateRma1700000000002 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "rma" (
        "id"                      UUID          NOT NULL DEFAULT gen_random_uuid(),
        "rma_number"              VARCHAR(32)   NOT NULL,
        "customer_name"           VARCHAR(255)  NOT NULL,
        "customer_email"          VARCHAR(255),
        "device_model"            VARCHAR(128)  NOT NULL,
        "return_reason"           VARCHAR(32)   NOT NULL,
        "status"                  VARCHAR(32)   NOT NULL DEFAULT 'OPEN',
        "disposition"             VARCHAR(32),
        "expected_serial_number"  VARCHAR(128),
        "eligibility_window_days" INT           NOT NULL DEFAULT 30,
        "notes"                   TEXT,
        "created_at"              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "updated_at"              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "closed_at"               TIMESTAMPTZ,
        "deleted_at"              TIMESTAMPTZ,
        CONSTRAINT "PK_rma" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_rma_number" UNIQUE ("rma_number")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_rma_status" ON "rma" ("status")`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "rma"`);
  }
}
