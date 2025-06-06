// src/instructor/instructor.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstructorService } from './instructor.service';
import { InstructorController } from './instructor.controller';
import { Instructor } from './entities/instructor.entity';
import { User } from '../user/entities/user.entity';
import { ImgbbModule } from '../imgbb/imgbb.module';
import { GymOwner } from '../gym-owner/entities/gym-owner.entity';
import { GymOwnerModule } from '../gym-owner/gym-owner.module';

@Module({
  imports: [TypeOrmModule.forFeature([Instructor, User,GymOwner]),
  ImgbbModule ,GymOwnerModule], 
  controllers: [InstructorController],
  providers: [InstructorService],
  exports: [InstructorService],
})
export class InstructorModule {}
