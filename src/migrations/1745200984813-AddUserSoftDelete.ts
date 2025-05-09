import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserSoftDelete1745200984813 implements MigrationInterface {
    name = 'AddUserSoftDelete1745200984813'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "isDeleted" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isDeleted"`);
    }

}
