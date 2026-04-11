import { IsString, IsOptional, IsEnum } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsEnum(['INCOME', 'EXPENSE'])
  type?: string;
}
