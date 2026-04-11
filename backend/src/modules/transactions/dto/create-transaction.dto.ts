import {
  IsString,
  IsNumber,
  IsDateString,
  IsOptional,
  IsEnum,
  Min,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateTransactionDto {
  @IsNumber()
  @Min(0.01)
  @Transform(({ value }) => parseFloat(String(value)))
  amount: number;

  @IsEnum(['INCOME', 'EXPENSE', 'TRANSFER'])
  @Transform(({ value }) => value?.toUpperCase())
  type: string;

  @IsString()
  @IsOptional()
  note?: string;

  @IsDateString()
  date: string;

  @IsString()
  userId: string;

  // For INCOME/EXPENSE: specify which wallet
  @IsString()
  @ValidateIf((obj) => obj.type !== 'TRANSFER')
  @IsOptional()
  walletId?: string;

  // For TRANSFER: specify source wallet
  @IsString()
  @ValidateIf((obj) => obj.type === 'TRANSFER')
  @IsOptional()
  fromWalletId?: string;

  // For TRANSFER: specify destination wallet
  @IsString()
  @ValidateIf((obj) => obj.type === 'TRANSFER')
  @IsOptional()
  toWalletId?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  // Convenience method to normalize the DTO
  normalize(): CreateTransactionDto {
    if (this.type === 'TRANSFER') {
      // For transfers, clear walletId
      this.walletId = undefined;
    } else {
      // For income/expense, set wallet field to ensure backward compatibility
      if (this.walletId && !this.fromWalletId) {
        // Legacy support
        this.fromWalletId = this.walletId;
      }
    }
    return this;
  }
}
