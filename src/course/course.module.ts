import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { CartItemModule } from '../cart-item/cart-item.module';
import { Instructor } from '../instructor/entities/instructor.entity';
import { GymOwner } from '../gym-owner/entities/gym-owner.entity';

/* src/courses/courses.module.ts (example) */
@Module({
  imports: [
    forwardRef(() => CartItemModule),  // the matching half of the circle
    TypeOrmModule.forFeature([Course,Instructor,GymOwner]),
  ],
  providers:   [CourseService],
  controllers: [CourseController],
  exports:     [CourseService],
})
export class CoursesModule {}

