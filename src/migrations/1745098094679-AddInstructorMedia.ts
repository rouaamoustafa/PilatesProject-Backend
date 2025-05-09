import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInstructorMedia1745098094679 implements MigrationInterface {
    name = 'AddInstructorMedia1745098094679'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "instructor" ADD "cv" character varying`);
        await queryRunner.query(`ALTER TABLE "instructor" ADD "link" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "instructor" DROP COLUMN "link"`);
        await queryRunner.query(`ALTER TABLE "instructor" DROP COLUMN "cv"`);
    }

}
