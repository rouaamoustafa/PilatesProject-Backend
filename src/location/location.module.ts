// src/location/location.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Location } from './entities/location.entity';
import { LocationService } from './location.service';
import { LocationController } from './location.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Location])],
  controllers: [ LocationController ],  
  providers:   [ LocationService ],  
  exports: [TypeOrmModule,LocationService],
})
export class LocationModule {}

