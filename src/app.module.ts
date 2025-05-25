// src/app.module.ts
import { forwardRef, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";

import { AppController } from "./app.controller";
import { AppService }     from "./app.service";

import { UserModule }      from "./user/user.module";
import { AuthModule }      from "./auth/auth.module";
import { InstructorModule }from "./instructor/instructor.module";
import { GymOwnerModule }  from "./gym-owner/gym-owner.module";
import { LocationModule }  from "./location/location.module";
import { CoursesModule }    from "./course/course.module";
import { ProgramModule }   from "./program/program.module";

import { TimeoutInterceptor } from "./common/interceptors/timeout.interceptor";
import { JwtAuthGuard }       from "./auth/jwt-auth.guard";
import { RolesGuard }         from "./auth/roles.guard";

// Manual imports of all your entity classes:
import { User }       from "./user/entities/user.entity";
import { Instructor } from "./instructor/entities/instructor.entity";
import { CartItemModule } from './cart-item/cart-item.module';
import { OrdersModule } from './order/order.module';
import { OrderItemModule } from './order-item/order-item.module';
import { PromoCodeModule } from './promo-code/promo-code.module';
import { GymOwner }   from "./gym-owner/entities/gym-owner.entity";
import { Location }   from "./location/entities/location.entity";
import { Course }     from "./course/entities/course.entity";
import { Program }    from "./program/entities/program.entity";
import { CartItem } from "./cart-item/entities/cart-item.entity";
import { OrderItem } from "./order-item/entities/order-item.entity";
import { PromoCode } from "./promo-code/entities/promo-code.entity";
import { Order } from "./order/entities/order.entity";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ".env", cache: true }),
    forwardRef(() => OrdersModule),
    forwardRef(() => CartItemModule),
    TypeOrmModule.forRoot({
      type: "postgres",
      url: process.env.DATABASE_URL,
      // either list them all…
      entities: [User, Instructor, GymOwner, Location, Course, Program,
        CartItem, Order,OrderItem,PromoCode,
      ],
      // …or use a glob:
      // entities: [__dirname + '/**/*.entity{.ts,.js}'],

      synchronize: false,
      migrations: ["dist/migrations/*.js"],
      migrationsRun: true,

      // connection pool & logging settings as before
      poolSize: 10,
      connectTimeoutMS: 10000,
      maxQueryExecutionTime: 5000,
      ssl: process.env.NODE_ENV === "production"
        ? { rejectUnauthorized: false }
        : false,
      retryAttempts: 3,
      retryDelay: 1000,
      extra: { max: 20, idleTimeoutMillis: 30000, connectionTimeoutMillis: 10000 },
      logging: process.env.NODE_ENV !== "production" ? ["error", "warn"] : false,
    }),

    UserModule,
    AuthModule,
    InstructorModule,
    GymOwnerModule,
    LocationModule,
    CoursesModule,
    ProgramModule,
    CartItemModule,
    OrdersModule,
    OrderItemModule,
    PromoCodeModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_INTERCEPTOR, useClass: TimeoutInterceptor },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
