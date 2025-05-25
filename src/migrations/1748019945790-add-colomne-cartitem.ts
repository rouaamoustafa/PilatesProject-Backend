import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColomneCartitem1748019945790 implements MigrationInterface {
    name = 'AddColomneCartitem1748019945790'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."cart_items_status_enum" AS ENUM('IN_CART', 'PAID')`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD "status" "public"."cart_items_status_enum" NOT NULL DEFAULT 'IN_CART'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cart_items" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."cart_items_status_enum"`);
    }

}
