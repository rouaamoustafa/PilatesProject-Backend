import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GymOwnerService } from './gym-owner.service';
import { GymOwnerController } from './gym-owner.controller';
import { GymOwner } from './entities/gym-owner.entity';
import { User } from '../user/entities/user.entity';
import { Location } from '../location/entities/location.entity'; 
import { ImgbbService } from '../imgbb/imgbb.service';
import { ImgbbModule } from 'src/imgbb/imgbb.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GymOwner, User, Location]) ,
    ImgbbModule
  ],
  controllers: [GymOwnerController],
  providers: [GymOwnerService, ImgbbService],
  exports: [GymOwnerService],
})
export class GymOwnerModule {}
