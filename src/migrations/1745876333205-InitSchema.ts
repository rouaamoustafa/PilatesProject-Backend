import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1745876333205 implements MigrationInterface {
    name = 'InitSchema1745876333205'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "gym_owner" DROP CONSTRAINT "FK_47848a376dbf813d8fabeaa5515"`);
        await queryRunner.query(`ALTER TABLE "gym_owner" DROP CONSTRAINT "FK_90bd760bd7fb19dedc3837358f2"`);
        await queryRunner.query(`ALTER TABLE "instructor" DROP CONSTRAINT "FK_a914853943da2844065d6e5c383"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isDeleted"`);
        await queryRunner.query(`ALTER TABLE "instructor" ADD "gymOwnerId" uuid`);
        await queryRunner.query(`ALTER TABLE "users" ADD "deletedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD "instructorProfileId" uuid`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_69e5be66f2679907a23e9cc19ba" UNIQUE ("instructorProfileId")`);
        await queryRunner.query(`ALTER TABLE "users" ADD "gymOwnerProfileId" uuid`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "UQ_62b9b2ce7afbaf7d5aa3c68adff" UNIQUE ("gymOwnerProfileId")`);
        await queryRunner.query(`ALTER TABLE "gym_owner" ADD CONSTRAINT "FK_47848a376dbf813d8fabeaa5515" FOREIGN KEY ("addressId") REFERENCES "location"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gym_owner" ADD CONSTRAINT "FK_90bd760bd7fb19dedc3837358f2" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "instructor" ADD CONSTRAINT "FK_a914853943da2844065d6e5c383" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "instructor" ADD CONSTRAINT "FK_b31a2c361ce19b232155dec5eec" FOREIGN KEY ("gymOwnerId") REFERENCES "gym_owner"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_69e5be66f2679907a23e9cc19ba" FOREIGN KEY ("instructorProfileId") REFERENCES "instructor"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_62b9b2ce7afbaf7d5aa3c68adff" FOREIGN KEY ("gymOwnerProfileId") REFERENCES "gym_owner"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_62b9b2ce7afbaf7d5aa3c68adff"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_69e5be66f2679907a23e9cc19ba"`);
        await queryRunner.query(`ALTER TABLE "instructor" DROP CONSTRAINT "FK_b31a2c361ce19b232155dec5eec"`);
        await queryRunner.query(`ALTER TABLE "instructor" DROP CONSTRAINT "FK_a914853943da2844065d6e5c383"`);
        await queryRunner.query(`ALTER TABLE "gym_owner" DROP CONSTRAINT "FK_90bd760bd7fb19dedc3837358f2"`);
        await queryRunner.query(`ALTER TABLE "gym_owner" DROP CONSTRAINT "FK_47848a376dbf813d8fabeaa5515"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_62b9b2ce7afbaf7d5aa3c68adff"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "gymOwnerProfileId"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "UQ_69e5be66f2679907a23e9cc19ba"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "instructorProfileId"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "deletedAt"`);
        await queryRunner.query(`ALTER TABLE "instructor" DROP COLUMN "gymOwnerId"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "isDeleted" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "instructor" ADD CONSTRAINT "FK_a914853943da2844065d6e5c383" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gym_owner" ADD CONSTRAINT "FK_90bd760bd7fb19dedc3837358f2" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "gym_owner" ADD CONSTRAINT "FK_47848a376dbf813d8fabeaa5515" FOREIGN KEY ("addressId") REFERENCES "location"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
