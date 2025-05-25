import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUUID, Length, Min } from "class-validator";
import { PromoKind } from "../entities/promo-code.entity";

export class CreatePromoCodeDto {
    @IsString() @Length(3,32) code: string;
    @IsEnum(PromoKind) kind: PromoKind;
    @IsNumber() @Min(0.01) value: number;
    @IsUUID() instructorId: string;
    @IsOptional() @IsDateString() expiresAt?: string;
    @IsOptional() @IsInt() @Min(1) maxUses?: number;
  }
  