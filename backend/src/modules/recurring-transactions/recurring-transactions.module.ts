import { Module } from '@nestjs/common';
import { RecurringTransactionsService } from './recurring-transactions.service';
import { RecurringTransactionsController } from './recurring-transactions.controller';
import { PrismaService } from '../prisma/service/prisma.service';

@Module({
  controllers: [RecurringTransactionsController],
  providers: [RecurringTransactionsService, PrismaService],
  exports: [RecurringTransactionsService],
})
export class RecurringTransactionsModule {}
