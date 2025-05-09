import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGymOwner1745107456569 implements MigrationInterface {
    name = 'AddGymOwner1745107456569'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "gym_owner" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "bio" character varying, "image" character varying, "phone" character varying, "address" character varying, "userId" uuid, CONSTRAINT "REL_90bd760bd7fb19dedc3837358f" UNIQUE ("userId"), CONSTRAINT "PK_711f7104af0047a4772cfadd340" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "gym_owner" ADD CONSTRAINT "FK_90bd760bd7fb19dedc3837358f2" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gym_owner" DROP CONSTRAINT "FK_90bd760bd7fb19dedc3837358f2"`);
        await queryRunner.query(`DROP TABLE "gym_owner"`);
    }

}
