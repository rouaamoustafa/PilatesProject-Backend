import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GymOwnerService } from './gym-owner.service';
import { GymOwnerController } from './gym-owner.controller';
import { GymOwner } from './entities/gym-owner.entity';
import { User } from '../user/entities/user.entity';
import { Location } from '../location/entities/location.entity'; // ✅ import this

@Module({
  imports: [
    TypeOrmModule.forFeature([GymOwner, User, Location]) // ✅ add Location here
  ],
  controllers: [GymOwnerController],
  providers: [GymOwnerService],
  exports: [GymOwnerService],
})
export class GymOwnerModule {}
