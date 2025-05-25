import { IsInt, IsOptional, IsUUID, Min } from "class-validator";

export class AddCartItemDto {
    @IsUUID() courseId: string;
    @IsOptional() @IsInt() @Min(1) qty = 1;
  }
  