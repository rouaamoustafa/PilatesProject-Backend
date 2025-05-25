import { IsInt, Min } from 'class-validator';
export class UpdateQtyDto { @IsInt() @Min(1) qty: number }