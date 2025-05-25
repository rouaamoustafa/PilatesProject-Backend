import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCoursesTable1747792587368 implements MigrationInterface {
    name = 'CreateCoursesTable1747792587368'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gym_owner" DROP CONSTRAINT "FK_47848a376dbf813d8fabeaa5515"`);
        await queryRunner.query(`ALTER TABLE "gym_owner" ADD CONSTRAINT "FK_47848a376dbf813d8fabeaa5515" FOREIGN KEY ("addressId") REFERENCES "location"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gym_owner" DROP CONSTRAINT "FK_47848a376dbf813d8fabeaa5515"`);
        await queryRunner.query(`ALTER TABLE "gym_owner" ADD CONSTRAINT "FK_47848a376dbf813d8fabeaa5515" FOREIGN KEY ("addressId") REFERENCES "location"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
