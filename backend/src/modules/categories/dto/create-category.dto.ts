import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsIn, IsNotEmpty } from 'class-validator';

function normalizeCategoryType({ value }: { value: unknown }): unknown {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string') return value;
  const t = value.trim();
  if (t === '') return undefined;
  return t.toUpperCase();
}

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @Transform(normalizeCategoryType)
  @IsIn(['INCOME', 'EXPENSE'])
  type?: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}
