import { Role } from '../../auth/roles.enum';
import { IsEnum } from 'class-validator';

export class RegisterUserDto {
    full_name: string;
    email: string;
    password: string;

    @IsEnum(Role)
    role: Role;
}