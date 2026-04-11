import {
  IsString,
  IsNumber,
  IsInt,
  IsOptional,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateBudgetDto {
  @IsNumber()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(String(value)) : undefined))
  amount?: number;

  @IsInt()
  @Min(1)
  @Max(12)
  @IsOptional()
  month?: number;

  @IsInt()
  @Min(2000)
  @IsOptional()
  year?: number;

  @IsString()
  @IsOptional()
  categoryId?: string;
}
