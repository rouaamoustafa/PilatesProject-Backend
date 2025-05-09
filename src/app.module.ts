// src/app.module.ts
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { UserModule } from './user/user.module'
import { AuthModule } from './auth/auth.module'
import { InstructorModule } from './instructor/instructor.module'
import { GymOwnerModule } from './gym-owner/gym-owner.module'
import { LocationModule } from './location/location.module'
import { GlobalJwtModule } from './jwt.module'
import { User } from './user/entities/user.entity'
import { Instructor } from './instructor/entities/instructor.entity'
import { GymOwner } from './gym-owner/entities/gym-owner.entity'
import { Location } from './location/entities/location.entity'
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor'
import * as dotenv from 'dotenv'

dotenv.config()

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [User, Instructor, GymOwner, Location],
      synchronize: false,
      migrations: ['dist/migrations/*.js'],
      migrationsRun: true,
      poolSize: 10,
      connectTimeoutMS: 10000,
      maxQueryExecutionTime: 5000,
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
      retryAttempts: 3,
      retryDelay: 1000,
      extra: {
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      },
      logging:
        process.env.NODE_ENV !== 'production' ? ['error', 'warn'] : false,
    }),
    GlobalJwtModule,
    UserModule,
    AuthModule,
    InstructorModule,
    GymOwnerModule,
    LocationModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TimeoutInterceptor,
    },
  ],
})
export class AppModule {}
