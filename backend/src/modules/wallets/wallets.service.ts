import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/service/prisma.service';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';

@Injectable()
export class WalletsService {
  constructor(private prisma: PrismaService) {}

  async create(createWalletDto: CreateWalletDto) {
    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: createWalletDto.userId },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Validate balance is non-negative
    const balance = createWalletDto.balance || 0;
    if (balance < 0) {
      throw new BadRequestException('Wallet balance cannot be negative');
    }

    return this.prisma.wallet.create({
      data: {
        name: createWalletDto.name,
        balance,
        currency: createWalletDto.currency || 'VND',
        userId: createWalletDto.userId,
      },
    });
  }

  async findAll(userId?: string, skip = 0, take = 10) {
    const where = userId ? { userId } : {};

    const [wallets, total] = await Promise.all([
      this.prisma.wallet.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          name: true,
          balance: true,
          currency: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { transactionsFrom: true, transactionsTo: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.wallet.count({ where }),
    ]);

    return {
      wallets: wallets.map((w) => ({
        ...w,
        transactionCount: w._count.transactionsFrom + w._count.transactionsTo,
        _count: undefined,
      })),
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
    };
  }

  async findOne(id: string) {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id },
      include: {
        transactionsFrom: {
          select: {
            id: true,
            amount: true,
            type: true,
            date: true,
            note: true,
            category: {
              select: {
                id: true,
                name: true,
                icon: true,
              },
            },
          },
          take: 10,
          orderBy: { date: 'desc' },
        },
        transactionsTo: {
          select: {
            id: true,
            amount: true,
            type: true,
            date: true,
            note: true,
          },
          take: 10,
          orderBy: { date: 'desc' },
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

    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${id} not found`);
    }

    return wallet;
  }

  async update(id: string, updateWalletDto: UpdateWalletDto) {
    // Verify wallet exists
    await this.findOne(id);

    // Validate balance if being updated
    if (updateWalletDto.balance !== undefined && updateWalletDto.balance < 0) {
      throw new BadRequestException('Wallet balance cannot be negative');
    }

    return this.prisma.wallet.update({
      where: { id },
      data: {
        name: updateWalletDto.name,
        balance: updateWalletDto.balance,
        currency: updateWalletDto.currency,
      },
    });
  }

  async remove(id: string) {
    // Verify wallet exists
    await this.findOne(id);

    // Check if wallet has transactions
    const transactionCount = await this.prisma.transaction.count({
      where: {
        OR: [{ fromWalletId: id }, { toWalletId: id }],
      },
    });

    if (transactionCount > 0) {
      throw new BadRequestException(
        'Cannot delete wallet with existing transactions. Please delete transactions first.',
      );
    }

    return this.prisma.wallet.delete({
      where: { id },
    });
  }

  getWalletsByUser(userId: string) {
    return this.prisma.wallet.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        balance: true,
        currency: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get wallet balance (useful for balance verification)
   */
  async getBalance(walletId: string): Promise<number> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
      select: { balance: true },
    });

    if (!wallet) {
      throw new NotFoundException(`Wallet with ID ${walletId} not found`);
    }

    return wallet.balance;
  }

  /**
   * Verify wallet ownership (useful for authorization checks)
   */
  async verifyOwnership(walletId: string, userId: string): Promise<boolean> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
      select: { userId: true },
    });

    return wallet?.userId === userId;
  }
}
