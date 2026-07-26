import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWarehouseUser001 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "warehouse_user" (
        "id"            UUID          NOT NULL DEFAULT gen_random_uuid(),
        "username"      VARCHAR(64)   NOT NULL,
        "display_name"  VARCHAR(128)  NOT NULL,
        "email"         VARCHAR(255)  NOT NULL,
        "password_hash" VARCHAR       NOT NULL,
        "role"          VARCHAR(32)   NOT NULL DEFAULT 'receiver',
        "is_active"     BOOLEAN       NOT NULL DEFAULT TRUE,
        "created_at"    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
        "deleted_at"    TIMESTAMPTZ,
        CONSTRAINT "PK_warehouse_user" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_warehouse_user_username" UNIQUE ("username"),
        CONSTRAINT "UQ_warehouse_user_email" UNIQUE ("email")
      )
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "warehouse_user"`);
  }
}
