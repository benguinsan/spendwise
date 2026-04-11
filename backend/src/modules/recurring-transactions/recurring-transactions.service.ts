import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
// import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/service/prisma.service';
import { CreateRecurringTransactionDto } from './dto/create-recurring-transaction.dto';
import { UpdateRecurringTransactionDto } from './dto/update-recurring-transaction.dto';

@Injectable()
export class RecurringTransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(createRecurringTransactionDto: CreateRecurringTransactionDto) {
    // Verify user exists
    const userExists = await this.prisma.user.findUnique({
      where: { id: createRecurringTransactionDto.userId },
    });

    if (!userExists) {
      throw new BadRequestException('User not found');
    }

    // Verify wallet exists and belongs to user
    const walletExists = await this.prisma.wallet.findUnique({
      where: { id: createRecurringTransactionDto.walletId },
    });

    if (!walletExists) {
      throw new BadRequestException('Wallet not found');
    }

    if (walletExists.userId !== createRecurringTransactionDto.userId) {
      throw new BadRequestException('Wallet does not belong to the user');
    }

    // Verify category exists if provided
    if (createRecurringTransactionDto.categoryId) {
      const categoryExists = await this.prisma.category.findUnique({
        where: { id: createRecurringTransactionDto.categoryId },
      });

      if (!categoryExists) {
        throw new BadRequestException('Category not found');
      }
    }

    if (createRecurringTransactionDto.amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    // Calculate next execution date
    const nextDate = this.calculateNextDate(
      new Date(),
      createRecurringTransactionDto.interval,
    );

    return this.prisma.recurringTransaction.create({
      data: {
        amount: createRecurringTransactionDto.amount,
        type: createRecurringTransactionDto.type,
        interval: createRecurringTransactionDto.interval,
        nextDate,
        userId: createRecurringTransactionDto.userId,
        walletId: createRecurringTransactionDto.walletId,
        categoryId: createRecurringTransactionDto.categoryId,
        note: createRecurringTransactionDto.note,
        isActive: true,
      },
    });
  }

  async findAll(userId: string, skip = 0, take = 10) {
    const [recurringTransactions, total] = await Promise.all([
      this.prisma.recurringTransaction.findMany({
        where: { userId },
        skip,
        take,
        include: {
          wallet: {
            select: { id: true, name: true, currency: true },
          },
          category: {
            select: { id: true, name: true, icon: true },
          },
        },
        orderBy: { nextDate: 'asc' },
      }),
      this.prisma.recurringTransaction.count({ where: { userId } }),
    ]);

    return {
      recurringTransactions,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
    };
  }

  async findOne(id: string, userId: string) {
    const recurringTransaction = await (
      this.prisma as any
    ).recurringTransaction.findUnique({
      where: { id },
      include: {
        wallet: {
          select: { id: true, name: true, currency: true },
        },
        category: {
          select: { id: true, name: true, icon: true },
        },
      },
    });

    if (!recurringTransaction) {
      throw new NotFoundException('Recurring transaction not found');
    }

    if (recurringTransaction.userId !== userId) {
      throw new BadRequestException(
        'Recurring transaction does not belong to this user',
      );
    }

    return recurringTransaction;
  }

  async update(
    id: string,
    userId: string,
    updateRecurringTransactionDto: UpdateRecurringTransactionDto,
  ) {
    const recurringTransaction = await (
      this.prisma as any
    ).recurringTransaction.findUnique({
      where: { id },
    });

    if (!recurringTransaction) {
      throw new NotFoundException('Recurring transaction not found');
    }

    if (recurringTransaction.userId !== userId) {
      throw new BadRequestException(
        'Recurring transaction does not belong to this user',
      );
    }

    if (
      updateRecurringTransactionDto.amount &&
      updateRecurringTransactionDto.amount <= 0
    ) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    return this.prisma.recurringTransaction.update({
      where: { id },
      data: {
        amount: updateRecurringTransactionDto.amount,
        type: updateRecurringTransactionDto.type,
        interval: updateRecurringTransactionDto.interval,
        categoryId: updateRecurringTransactionDto.categoryId,
        note: updateRecurringTransactionDto.note,
      },
      include: {
        wallet: {
          select: { id: true, name: true, currency: true },
        },
        category: {
          select: { id: true, name: true, icon: true },
        },
      },
    });
  }

  async toggleActive(id: string, userId: string, isActive: boolean) {
    const recurringTransaction = await (
      this.prisma as any
    ).recurringTransaction.findUnique({
      where: { id },
    });

    if (!recurringTransaction) {
      throw new NotFoundException('Recurring transaction not found');
    }

    if (recurringTransaction.userId !== userId) {
      throw new BadRequestException(
        'Recurring transaction does not belong to this user',
      );
    }

    return this.prisma.recurringTransaction.update({
      where: { id },
      data: { isActive },
      include: {
        wallet: {
          select: { id: true, name: true, currency: true },
        },
        category: {
          select: { id: true, name: true, icon: true },
        },
      },
    });
  }

  async delete(id: string, userId: string) {
    const recurringTransaction = await (
      this.prisma as any
    ).recurringTransaction.findUnique({
      where: { id },
    });

    if (!recurringTransaction) {
      throw new NotFoundException('Recurring transaction not found');
    }

    if (recurringTransaction.userId !== userId) {
      throw new BadRequestException(
        'Recurring transaction does not belong to this user',
      );
    }

    return this.prisma.recurringTransaction.delete({
      where: { id },
    });
  }

  /**
   * CRON JOB: Executes every day at 2:00 AM
   * Check for recurring transactions that need to be executed
   */
  // @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async executeRecurringTransactions() {
    console.log(
      `[CRON] Executing recurring transactions at ${new Date().toISOString()}...`,
    );

    const now = new Date();
    const recurringTransactions = await (
      this.prisma as any
    ).recurringTransaction.findMany({
      where: {
        isActive: true,
        nextDate: {
          lte: now,
        },
      },
      include: {
        wallet: true,
        user: true,
      },
    });

    for (const recurring of recurringTransactions) {
      try {
        // Create the actual transaction
        const newTransaction = await this.prisma.transaction.create({
          data: {
            amount: recurring.amount,
            type: recurring.type,
            date: now,
            userId: recurring.userId,
            fromWalletId:
              recurring.type !== 'INCOME' ? recurring.walletId : undefined,
            toWalletId:
              recurring.type === 'INCOME' ? recurring.walletId : undefined,
            categoryId: recurring.categoryId,
            note: `Auto-generated from recurring transaction: ${recurring.id}`,
          },
        });

        // Update wallet balance
        if (recurring.type === 'INCOME') {
          await this.prisma.wallet.update({
            where: { id: recurring.walletId },
            data: { balance: { increment: recurring.amount } },
          });
        } else {
          await this.prisma.wallet.update({
            where: { id: recurring.walletId },
            data: { balance: { decrement: recurring.amount } },
          });
        }

        // Calculate next execution date
        const nextDate = this.calculateNextDate(
          now,
          recurring.interval as string,
        );

        // Update recurring transaction with new next date
        await this.prisma.recurringTransaction.update({
          where: { id: recurring.id },
          data: { nextDate },
        });

        // Create reminder notification
        await this.prisma.notification.create({
          data: {
            userId: recurring.userId,
            type: 'REMINDER',
            message: `Recurring transaction processed: ${newTransaction.type} of ${recurring.amount}`,
            isRead: false,
          },
        });

        console.log(
          `[CRON] Executed recurring transaction: ${recurring.id}, next: ${nextDate.toISOString()}`,
        );
      } catch (error) {
        console.error(
          `[CRON] Error executing recurring transaction ${recurring.id}:`,
          error,
        );
      }
    }

    console.log(
      `[CRON] Completed at ${new Date().toISOString()}. Processed ${recurringTransactions.length} transactions.`,
    );
  }

  /**
   * Calculate next execution date based on interval
   */
  private calculateNextDate(currentDate: Date, interval: string): Date {
    const next = new Date(currentDate);

    switch (interval) {
      case 'DAILY':
        next.setDate(next.getDate() + 1);
        break;
      case 'WEEKLY':
        next.setDate(next.getDate() + 7);
        break;
      case 'MONTHLY':
        next.setMonth(next.getMonth() + 1);
        break;
      case 'YEARLY':
        next.setFullYear(next.getFullYear() + 1);
        break;
      default:
        throw new BadRequestException(`Invalid interval: ${interval}`);
    }

    return next;
  }

  /**
   * Get next execution count for a recurring transaction
   */
  async getNextExecutions(id: string, userId: string, count = 5) {
    const recurring = await (
      this.prisma as any
    ).recurringTransaction.findUnique({
      where: { id },
    });

    if (!recurring) {
      throw new NotFoundException('Recurring transaction not found');
    }

    if (recurring.userId !== userId) {
      throw new BadRequestException(
        'Recurring transaction does not belong to this user',
      );
    }

    const executions = [];
    let currentDate = new Date(recurring.nextDate as Date | string);

    for (let i = 0; i < count; i++) {
      executions.push({
        date: new Date(currentDate),
        amount: recurring.amount,
        type: recurring.type,
      });
      currentDate = this.calculateNextDate(
        currentDate,
        recurring.interval as string,
      );
    }

    return executions;
  }
}
