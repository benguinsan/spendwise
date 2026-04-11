import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateWalletDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(String(value)) : undefined))
  balance?: number;

  @IsString()
  @IsOptional()
  currency?: string;
}
