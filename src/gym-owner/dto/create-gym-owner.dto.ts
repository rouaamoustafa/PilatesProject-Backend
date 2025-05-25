import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Role } from '../../auth/roles.enum';

export class CreateGymOwnerDto {
  // User fields
  @IsString()              full_name: string;
  @IsEmail()               email:     string;
  @IsString()
  @MinLength(6)            password:  string;
  @IsEnum(Role)            role:      Role;

  // Gym owner profile fields
  @IsOptional() @IsString() bio?:      string;
  @IsOptional() @IsString() phone?:    string;
  @IsOptional() @IsString() address?:  string;
  @IsOptional() @IsString() mapLink?:  string;

  // Image filename stored on server
  @IsOptional() @IsString() image?:     string;
}