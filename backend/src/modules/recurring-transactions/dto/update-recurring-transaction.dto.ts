export class UpdateRecurringTransactionDto {
  amount?: number;
  type?: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  interval?: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  categoryId?: string;
  note?: string;
}
