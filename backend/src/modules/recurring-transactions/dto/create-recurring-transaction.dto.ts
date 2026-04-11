export class CreateRecurringTransactionDto {
  amount: number;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  interval: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  note?: string;
  userId: string;
  walletId: string;
  categoryId?: string;
}
