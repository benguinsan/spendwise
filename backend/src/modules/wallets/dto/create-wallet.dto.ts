import { IsString, IsNumber, IsOptional, Min } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateWalletDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(String(value)) : 0))
  balance?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  userId: string;
}
