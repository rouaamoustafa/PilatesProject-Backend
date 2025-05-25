import { MigrationInterface, QueryRunner } from "typeorm";

export class Deletefix1748201282817 implements MigrationInterface {
    name = 'Deletefix1748201282817'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_e6714597bea722629fa7d32124a"`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_e6714597bea722629fa7d32124a" FOREIGN KEY ("instructorId") REFERENCES "instructor"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_e6714597bea722629fa7d32124a"`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_e6714597bea722629fa7d32124a" FOREIGN KEY ("instructorId") REFERENCES "instructor"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

}
