import { Role } from '../../auth/roles.enum';
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterUserDto {
    @IsString()
    full_name: string;

    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;

    @IsEnum(Role)
    @IsOptional()
    role: Role;
}