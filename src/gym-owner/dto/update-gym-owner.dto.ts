import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator'
import { Role } from '../../auth/roles.enum'

export class UpdateGymOwnerDto {
  @IsOptional() @IsString()              full_name?: string
  @IsOptional() @IsEmail()               email?:     string
  @IsOptional() @IsString() @MinLength(6) password?:  string
  @IsOptional() @IsEnum(Role)            role?:      Role

  @IsOptional() @IsString() bio?:     string
  @IsOptional() @IsString() phone?:   string
  @IsOptional() @IsString() address?: string
  @IsOptional() @IsString() mapLink?: string

  // Supabase will return a full URL
  @IsOptional() @IsString() image?:   string
}
