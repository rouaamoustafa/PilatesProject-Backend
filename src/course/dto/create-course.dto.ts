import { IsUUID, IsString, IsEnum, IsOptional, IsNumber, IsDateString, IsMilitaryTime, Min } from 'class-validator';
import { Level, Mode } from '../../EventBase/event-base.entity';

export class CreateCourseDto {
  @IsString() title: string;
  @IsUUID() instructorId: string;
  @IsEnum(Level) level: Level;
  @IsEnum(Mode) mode: Mode;
  @IsOptional() @IsUUID() locationId?: string;
  @IsNumber() @Min(0) price: number;
  @IsDateString() date: string;
  @IsMilitaryTime() startTime: string;
  @IsNumber() @Min(1) durationMinutes: number;
}

