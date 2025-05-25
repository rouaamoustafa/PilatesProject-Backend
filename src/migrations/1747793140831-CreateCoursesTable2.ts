import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCoursesTable21747793140831 implements MigrationInterface {
    name = 'CreateCoursesTable21747793140831'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."courses_level_enum" AS ENUM('beginner', 'intermediate', 'advanced')`);
        await queryRunner.query(`CREATE TYPE "public"."courses_mode_enum" AS ENUM('online', 'onsite')`);
        await queryRunner.query(`CREATE TABLE "courses" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "level" "public"."courses_level_enum" NOT NULL, "mode" "public"."courses_mode_enum" NOT NULL, "price" numeric(10,2) NOT NULL, "date" date NOT NULL, "startTime" TIME NOT NULL, "durationMinutes" integer NOT NULL, "instructorId" uuid NOT NULL, "locationId" uuid, CONSTRAINT "PK_3f70a487cc718ad8eda4e6d58c9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_e6714597bea722629fa7d32124a" FOREIGN KEY ("instructorId") REFERENCES "instructor"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_e6d4e5b876b877ceaab83812f39" FOREIGN KEY ("locationId") REFERENCES "location"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_e6d4e5b876b877ceaab83812f39"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_e6714597bea722629fa7d32124a"`);
        await queryRunner.query(`DROP TABLE "courses"`);
        await queryRunner.query(`DROP TYPE "public"."courses_mode_enum"`);
        await queryRunner.query(`DROP TYPE "public"."courses_level_enum"`);
    }

}
