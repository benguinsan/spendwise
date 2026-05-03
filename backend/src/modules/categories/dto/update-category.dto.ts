import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsIn } from 'class-validator';

function normalizeCategoryType({ value }: { value: unknown }): unknown {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') return value;
  const t = value.trim();
  if (t === '') return undefined;
  return t.toUpperCase();
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @Transform(normalizeCategoryType)
  @IsIn(['INCOME', 'EXPENSE'])
  type?: string;
}
