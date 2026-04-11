import {
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  IsEnum,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateTransactionDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(String(value)))
  amount?: number;

  @IsOptional()
  @IsEnum(['INCOME', 'EXPENSE', 'TRANSFER'])
  type?: string;

  @IsOptional()
  @IsString()
  note?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  // For INCOME/EXPENSE
  @IsOptional()
  @IsString()
  walletId?: string;

  // For TRANSFER
  @IsOptional()
  @IsString()
  fromWalletId?: string;

  @IsOptional()
  @IsString()
  toWalletId?: string;
}
