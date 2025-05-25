import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusPayment1748013360644 implements MigrationInterface {
    name = 'AddStatusPayment1748013360644'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_59c32a5b6a9cc00c760d8867cff"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_9f8f3c659b84b4a6064355cd333"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "UQ_64c28be3f3bbba0c6386c65dbbc"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "discount"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "promoCodeId"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "promoCode" character varying`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "paymentId" character varying`);
        await queryRunner.query(`ALTER TABLE "order_items" ALTER COLUMN "price" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "total" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_59c32a5b6a9cc00c760d8867cff" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_59c32a5b6a9cc00c760d8867cff"`);
        await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "total" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "order_items" ALTER COLUMN "price" TYPE numeric(10,2)`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "paymentId"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "promoCode"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "promoCodeId" uuid`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "status" character varying NOT NULL DEFAULT 'paid'`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "discount" numeric(10,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "UQ_64c28be3f3bbba0c6386c65dbbc" UNIQUE ("orderId", "courseId")`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_9f8f3c659b84b4a6064355cd333" FOREIGN KEY ("promoCodeId") REFERENCES "promo_codes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_59c32a5b6a9cc00c760d8867cff" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
