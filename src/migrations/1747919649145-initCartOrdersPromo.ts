import { MigrationInterface, QueryRunner } from "typeorm";

export class InitCartOrdersPromo1747919649145 implements MigrationInterface {
    name = 'InitCartOrdersPromo1747919649145'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "cart_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "qty" integer NOT NULL DEFAULT '1', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, "courseId" uuid, CONSTRAINT "UQ_a90e6cf858c2e65186f9d0285ef" UNIQUE ("userId", "courseId"), CONSTRAINT "PK_6fccf5ec03c172d27a28a82928b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "qty" integer NOT NULL DEFAULT '1', "price" numeric(10,2) NOT NULL, "orderId" uuid, "courseId" uuid, CONSTRAINT "UQ_64c28be3f3bbba0c6386c65dbbc" UNIQUE ("orderId", "courseId"), CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."promo_codes_kind_enum" AS ENUM('percent', 'flat')`);
        await queryRunner.query(`CREATE TABLE "promo_codes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(32) NOT NULL, "kind" "public"."promo_codes_kind_enum" NOT NULL, "value" numeric(10,2) NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE, "maxUses" integer, "uses" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "instructorId" uuid, CONSTRAINT "UQ_2f096c406a9d9d5b8ce204190c3" UNIQUE ("code"), CONSTRAINT "CHK_82375eb3854c50268161f2fa05" CHECK (kind IN ('percent','flat')), CONSTRAINT "PK_c7b4f01710fda5afa056a2b4a35" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "total" numeric(10,2) NOT NULL, "discount" numeric(10,2) NOT NULL DEFAULT '0', "status" character varying NOT NULL DEFAULT 'paid', "promoCodeId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_84e765378a5f03ad9900df3a9ba" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cart_items" ADD CONSTRAINT "FK_d211a81109a5c8836f686faf0d6" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_59c32a5b6a9cc00c760d8867cff" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "promo_codes" ADD CONSTRAINT "FK_be0cc147817192a339fb442e2ff" FOREIGN KEY ("instructorId") REFERENCES "instructor"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_9f8f3c659b84b4a6064355cd333" FOREIGN KEY ("promoCodeId") REFERENCES "promo_codes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_9f8f3c659b84b4a6064355cd333"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1"`);
        await queryRunner.query(`ALTER TABLE "promo_codes" DROP CONSTRAINT "FK_be0cc147817192a339fb442e2ff"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_59c32a5b6a9cc00c760d8867cff"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_d211a81109a5c8836f686faf0d6"`);
        await queryRunner.query(`ALTER TABLE "cart_items" DROP CONSTRAINT "FK_84e765378a5f03ad9900df3a9ba"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TABLE "promo_codes"`);
        await queryRunner.query(`DROP TYPE "public"."promo_codes_kind_enum"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`DROP TABLE "cart_items"`);
    }

}
