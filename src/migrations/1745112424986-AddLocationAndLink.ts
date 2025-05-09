import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLocationAndLink1745112424986 implements MigrationInterface {
    name = 'AddLocationAndLink1745112424986'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gym_owner" RENAME COLUMN "address" TO "addressId"`);
        await queryRunner.query(`CREATE TABLE "location" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "address" character varying NOT NULL, "mapLink" character varying, CONSTRAINT "PK_876d7bdba03c72251ec4c2dc827" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "gym_owner" DROP COLUMN "addressId"`);
        await queryRunner.query(`ALTER TABLE "gym_owner" ADD "addressId" uuid`);
        await queryRunner.query(`ALTER TABLE "gym_owner" ADD CONSTRAINT "UQ_47848a376dbf813d8fabeaa5515" UNIQUE ("addressId")`);
        await queryRunner.query(`ALTER TABLE "gym_owner" ADD CONSTRAINT "FK_47848a376dbf813d8fabeaa5515" FOREIGN KEY ("addressId") REFERENCES "location"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gym_owner" DROP CONSTRAINT "FK_47848a376dbf813d8fabeaa5515"`);
        await queryRunner.query(`ALTER TABLE "gym_owner" DROP CONSTRAINT "UQ_47848a376dbf813d8fabeaa5515"`);
        await queryRunner.query(`ALTER TABLE "gym_owner" DROP COLUMN "addressId"`);
        await queryRunner.query(`ALTER TABLE "gym_owner" ADD "addressId" character varying`);
        await queryRunner.query(`DROP TABLE "location"`);
        await queryRunner.query(`ALTER TABLE "gym_owner" RENAME COLUMN "addressId" TO "address"`);
    }

}
