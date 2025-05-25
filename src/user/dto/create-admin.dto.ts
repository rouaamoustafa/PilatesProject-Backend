import { IsString, IsEmail, MinLength } from 'class-validator';

export class CreateAdminDto {
  @IsString()
  full_name: string;

  @IsEmail()
  email: string;

  @MinLength(6)
  password: string;
}
