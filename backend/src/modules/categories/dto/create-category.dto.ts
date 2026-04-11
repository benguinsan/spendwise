import { IsString, IsOptional, IsEnum } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsEnum(['INCOME', 'EXPENSE'])
  @IsOptional()
  type?: string;

  @IsString()
  userId: string;
}
