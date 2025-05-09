import { PartialType } from '@nestjs/mapped-types';
import { CreateGymOwnerDto } from './create-gym-owner.dto';

export class UpdateGymOwnerDto extends PartialType(CreateGymOwnerDto) {}
