import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInstructorFields1745090768316 implements MigrationInterface {
    name = 'AddInstructorFields1745090768316'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "instructor" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "bio" character varying, "image" character varying, "userId" uuid, CONSTRAINT "REL_a914853943da2844065d6e5c38" UNIQUE ("userId"), CONSTRAINT "PK_ccc0348eefb581ca002c05ef2f3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "instructor" ADD CONSTRAINT "FK_a914853943da2844065d6e5c383" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "instructor" DROP CONSTRAINT "FK_a914853943da2844065d6e5c383"`);
        await queryRunner.query(`DROP TABLE "instructor"`);
    }

}
