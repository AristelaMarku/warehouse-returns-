import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAuditLog004 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "audit_log" (
        "id"             UUID          NOT NULL DEFAULT gen_random_uuid(),
        "entity_type"    VARCHAR(64)   NOT NULL,
        "entity_id"      UUID          NOT NULL,
        "action"         VARCHAR(64)   NOT NULL,
        "actor_user_id"  UUID,
        "before_state"   JSONB,
        "after_state"    JSONB,
        "occurred_at"    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        CONSTRAINT "PK_audit_log" PRIMARY KEY ("id"),
        CONSTRAINT "FK_audit_log_user" FOREIGN KEY ("actor_user_id") REFERENCES "warehouse_user" ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_audit_log_entity_id" ON "audit_log" ("entity_id")`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "audit_log"`);
  }
}
