import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/service/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(createTransactionDto: CreateTransactionDto) {
    // Normalize the DTO to handle legacy walletId usage
    createTransactionDto.normalize();

    // Verify user exists
    const userExists = await this.prisma.user.findUnique({
      where: { id: createTransactionDto.userId },
    });

    if (!userExists) {
      throw new BadRequestException('User not found');
    }

    // Validate based on transaction type
    if (createTransactionDto.type === 'TRANSFER') {
      return this.createTransfer(createTransactionDto);
    } else {
      return this.createIncomeOrExpense(createTransactionDto);
    }
  }

  private async createIncomeOrExpense(dto: CreateTransactionDto) {
    const walletId = dto.fromWalletId || dto.walletId;

    if (!walletId) {
      throw new BadRequestException(
        'Wallet ID is required for INCOME/EXPENSE transactions',
      );
    }

    // Verify wallet exists and belongs to user
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    if (wallet.userId !== dto.userId) {
      throw new BadRequestException('Wallet does not belong to the user');
    }

    // Verify category exists if provided
    if (dto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: dto.categoryId },
      });

      if (!category) {
        throw new BadRequestException('Category not found');
      }
    }

    // Use atomic transaction to ensure consistency
    return this.prisma.$transaction(async (tx) => {
      // Calculate new balance
      let newBalance = wallet.balance;
      if (dto.type === 'INCOME') {
        newBalance += dto.amount;
      } else if (dto.type === 'EXPENSE') {
        newBalance -= dto.amount;
        if (newBalance < 0) {
          throw new BadRequestException(
            'Insufficient wallet balance for this expense',
          );
        }
      }

      // Update wallet balance
      await tx.wallet.update({
        where: { id: walletId },
        data: { balance: newBalance },
      });

      // Create transaction record
      return tx.transaction.create({
        data: {
          amount: dto.amount,
          type: (dto.type || 'EXPENSE') as any,
          note: dto.note,
          date: new Date(dto.date),
          userId: dto.userId,
          fromWalletId: walletId,
          categoryId: dto.categoryId,
        },
        include: {
          category: true,
          fromWallet: true,
          user: true,
        },
      });
    });
  }

  private async createTransfer(dto: CreateTransactionDto) {
    if (!dto.fromWalletId || !dto.toWalletId) {
      throw new BadRequestException(
        'Both fromWalletId and toWalletId are required for TRANSFER',
      );
    }

    if (dto.fromWalletId === dto.toWalletId) {
      throw new BadRequestException('Cannot transfer to the same wallet');
    }

    // Verify both wallets exist and belong to user
    const [fromWallet, toWallet] = await Promise.all([
      this.prisma.wallet.findUnique({ where: { id: dto.fromWalletId } }),
      this.prisma.wallet.findUnique({ where: { id: dto.toWalletId } }),
    ]);

    if (!fromWallet) {
      throw new BadRequestException('Source wallet not found');
    }

    if (!toWallet) {
      throw new BadRequestException('Destination wallet not found');
    }

    if (fromWallet.userId !== dto.userId || toWallet.userId !== dto.userId) {
      throw new BadRequestException('Both wallets must belong to the user');
    }

    if (fromWallet.balance < dto.amount) {
      throw new BadRequestException('Insufficient balance in source wallet');
    }

    // Use atomic transaction for transfer
    return this.prisma.$transaction(async (tx) => {
      // Debit from source wallet
      await tx.wallet.update({
        where: { id: dto.fromWalletId },
        data: { balance: { decrement: dto.amount } },
      });

      // Credit to destination wallet
      await tx.wallet.update({
        where: { id: dto.toWalletId },
        data: { balance: { increment: dto.amount } },
      });

      // Create transaction record
      return tx.transaction.create({
        data: {
          amount: dto.amount,
          type: 'TRANSFER',
          note: dto.note,
          date: new Date(dto.date),
          userId: dto.userId,
          fromWalletId: dto.fromWalletId,
          toWalletId: dto.toWalletId,
          // Note: categoryId is not applicable for transfers
        },
        include: {
          fromWallet: true,
          toWallet: true,
          user: true,
        },
      });
    });
  }

  async findAll(
    userId?: string,
    walletId?: string,
    skip: number = 0,
    take: number = 10,
  ) {
    const where: any = {};
    if (userId) where.userId = userId;
    // Support filtering by wallet (either from or to)
    if (walletId) {
      where.OR = [{ fromWalletId: walletId }, { toWalletId: walletId }];
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        skip,
        take,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
            },
          },
          fromWallet: {
            select: {
              id: true,
              name: true,
              currency: true,
            },
          },
          toWallet: {
            select: {
              id: true,
              name: true,
              currency: true,
            },
          },
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
        orderBy: { date: 'desc' },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      transactions,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
    };
  }

  async findOne(id: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            type: true,
          },
        },
        fromWallet: {
          select: {
            id: true,
            name: true,
            balance: true,
            currency: true,
          },
        },
        toWallet: {
          select: {
            id: true,
            name: true,
            balance: true,
            currency: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException(`Transaction with ID ${id} not found`);
    }

    return transaction;
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto) {
    const existingTransaction = await this.findOne(id);

    // Do not allow changing transaction type or wallets
    // This ensures balance consistency
    if (
      updateTransactionDto.type &&
      updateTransactionDto.type !== existingTransaction.type
    ) {
      throw new BadRequestException('Cannot change transaction type');
    }

    const updateData: any = {};

    if (updateTransactionDto.amount !== undefined) {
      updateData.amount = updateTransactionDto.amount;
    }

    if (updateTransactionDto.note !== undefined) {
      updateData.note = updateTransactionDto.note;
    }

    if (updateTransactionDto.date) {
      updateData.date = new Date(updateTransactionDto.date);
    }

    if (updateTransactionDto.categoryId !== undefined) {
      updateData.categoryId = updateTransactionDto.categoryId;
    }

    return this.prisma.transaction.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        fromWallet: true,
        toWallet: true,
        user: true,
      },
    });
  }

  async remove(id: string) {
    const transaction = await this.findOne(id);

    // Use atomic transaction to revert balance changes
    return this.prisma.$transaction(async (tx) => {
      if (
        transaction.type === 'TRANSFER' &&
        transaction.fromWalletId &&
        transaction.toWalletId
      ) {
        // Revert transfer: credit source wallet, debit destination wallet
        await tx.wallet.update({
          where: { id: transaction.fromWalletId },
          data: { balance: { increment: transaction.amount } },
        });

        await tx.wallet.update({
          where: { id: transaction.toWalletId },
          data: { balance: { decrement: transaction.amount } },
        });
      } else if (
        transaction.fromWalletId &&
        (transaction.type === 'INCOME' || transaction.type === 'EXPENSE')
      ) {
        // Revert income/expense
        let balanceAdjustment = 0;
        if (transaction.type === 'INCOME') {
          balanceAdjustment = -transaction.amount; // Decrease balance
        } else if (transaction.type === 'EXPENSE') {
          balanceAdjustment = transaction.amount; // Increase balance
        }

        if (balanceAdjustment !== 0) {
          await tx.wallet.update({
            where: { id: transaction.fromWalletId },
            data: { balance: { increment: balanceAdjustment } },
          });
        }
      }

      // Delete transaction
      return tx.transaction.delete({
        where: { id },
      });
    });
  }

  getTransactionsByUser(userId: string, limit = 20) {
    return this.prisma.transaction.findMany({
      where: { userId },
      take: limit,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
        fromWallet: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
        toWallet: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  getTransactionsByWallet(walletId: string, limit = 20) {
    return this.prisma.transaction.findMany({
      where: {
        OR: [{ fromWalletId: walletId }, { toWalletId: walletId }],
      },
      take: limit,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
        fromWallet: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
        toWallet: {
          select: {
            id: true,
            name: true,
            currency: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }
}
