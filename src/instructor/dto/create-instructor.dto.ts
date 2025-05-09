import { IsEmail, IsEnum, IsOptional, IsString, MinLength, IsUrl } from 'class-validator'
import { Role } from '../../auth/roles.enum'

export class CreateInstructorDto {
  // User fields
  @IsString()              full_name: string

  @IsEmail()               email:     string

  @IsString()
  @MinLength(6)            password:  string

  @IsEnum(Role)            role:      Role

  // Instructor profile fields
  @IsOptional() @IsString() bio?:      string
  @IsOptional() @IsUrl()    link?:     string
  @IsOptional() @IsString() image?:    string
  @IsOptional() @IsString() cv?:       string
}