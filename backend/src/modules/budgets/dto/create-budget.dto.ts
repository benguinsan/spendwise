import {
  IsString,
  IsNumber,
  IsInt,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBudgetDto {
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(String(value)))
  amount: number;

  @IsInt()
  @Min(1)
  @Max(12)
  month: number;

  @IsInt()
  @Min(2000)
  year: number;

  @IsString()
  userId: string;

  @IsString()
  @IsOptional()
  categoryId?: string;
}
