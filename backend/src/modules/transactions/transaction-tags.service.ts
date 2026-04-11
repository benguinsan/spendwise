import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/service/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionTagsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get a transaction with all its tags
   */
  async getTransactionWithTags(transactionId: string, userId: string) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        tags: {
          include: {
            tag: {
              select: { id: true, name: true },
            },
          },
        },
        category: {
          select: { id: true, name: true, icon: true },
        },
        fromWallet: {
          select: { id: true, name: true, currency: true },
        },
        toWallet: {
          select: { id: true, name: true, currency: true },
        },
      },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.userId !== userId) {
      throw new BadRequestException('Transaction does not belong to this user');
    }

    return {
      ...transaction,
      tags: transaction.tags.map((t) => t.tag),
    };
  }

  /**
   * Create a transaction with multiple tags
   */
  async createTransactionWithTags(
    createTransactionDto: CreateTransactionDto,
    tagIds?: string[],
  ) {
    // Verify user and wallet
    const userExists = await this.prisma.user.findUnique({
      where: { id: createTransactionDto.userId },
    });

    if (!userExists) {
      throw new BadRequestException('User not found');
    }

    const walletExists = await this.prisma.wallet.findUnique({
      where: { id: createTransactionDto.walletId },
    });

    if (!walletExists) {
      throw new BadRequestException('Wallet not found');
    }

    if (walletExists.userId !== createTransactionDto.userId) {
      throw new BadRequestException('Wallet does not belong to the user');
    }

    // If tags are provided, verify they exist and belong to user
    if (tagIds && tagIds.length > 0) {
      const tags = await this.prisma.tag.findMany({
        where: {
          id: { in: tagIds },
          userId: createTransactionDto.userId,
        },
      });

      if (tags.length !== tagIds.length) {
        throw new BadRequestException('One or more tags do not exist');
      }
    }

    // Create transaction with tags
    const transaction = await this.prisma.transaction.create({
      data: {
        amount: createTransactionDto.amount,
        type: createTransactionDto.type as any,
        note: createTransactionDto.note,
        date: new Date(createTransactionDto.date),
        userId: createTransactionDto.userId,
        fromWalletId: createTransactionDto.fromWalletId,
        toWalletId: createTransactionDto.toWalletId,
        categoryId: createTransactionDto.categoryId,
        tags: {
          create: tagIds
            ? tagIds.map((tagId) => ({
                tag: { connect: { id: tagId } },
              }))
            : [],
        },
      },
      include: {
        tags: {
          include: {
            tag: {
              select: { id: true, name: true },
            },
          },
        },
        category: {
          select: { id: true, name: true, icon: true },
        },
      },
    });

    return {
      ...transaction,
      tags: transaction.tags.map((t) => t.tag),
    };
  }

  /**
   * Update transaction and its tags
   */
  async updateTransactionWithTags(
    transactionId: string,
    userId: string,
    updateData: any,
    newTagIds?: string[],
  ) {
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.userId !== userId) {
      throw new BadRequestException('Transaction does not belong to this user');
    }

    // If new tags are provided, replace all tag relations
    if (newTagIds !== undefined) {
      // Verify tags exist
      const tags = await this.prisma.tag.findMany({
        where: {
          id: { in: newTagIds },
          userId,
        },
      });

      if (tags.length !== newTagIds.length) {
        throw new BadRequestException('One or more tags do not exist');
      }

      // Delete old tags
      await this.prisma.transactionTag.deleteMany({
        where: { transactionId },
      });

      // Create new tags
      if (newTagIds.length > 0) {
        await this.prisma.transactionTag.createMany({
          data: newTagIds.map((tagId) => ({
            transactionId,
            tagId,
          })),
        });
      }
    }

    // Update transaction data
    const updatedTransaction = await this.prisma.transaction.update({
      where: { id: transactionId },
      data: updateData,
      include: {
        tags: {
          include: {
            tag: {
              select: { id: true, name: true },
            },
          },
        },
        category: {
          select: { id: true, name: true, icon: true },
        },
      },
    });

    return {
      ...updatedTransaction,
      tags: updatedTransaction.tags.map((t) => t.tag),
    };
  }

  /**
   * Get transactions by multiple tags (AND operation - transaction must have all tags)
   */
  async findTransactionsByTags(
    userId: string,
    tagIds: string[],
    skip = 0,
    take = 10,
  ) {
    if (!tagIds || tagIds.length === 0) {
      throw new BadRequestException('At least one tag ID is required');
    }

    // Get transactions that have all the specified tags
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        tags: {
          every: {
            tagId: { in: tagIds },
          },
        },
      },
      skip,
      take,
      include: {
        tags: {
          include: {
            tag: {
              select: { id: true, name: true },
            },
          },
        },
        category: {
          select: { id: true, name: true, icon: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    const total = await this.prisma.transaction.count({
      where: {
        userId,
        tags: {
          every: {
            tagId: { in: tagIds },
          },
        },
      },
    });

    return {
      transactions: transactions.map((t) => ({
        ...t,
        tags: t.tags.map((tag) => tag.tag),
      })),
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
    };
  }

  /**
   * Get transactions by any of the tags (OR operation)
   */
  async findTransactionsByAnyTag(
    userId: string,
    tagIds: string[],
    skip = 0,
    take = 10,
  ) {
    if (!tagIds || tagIds.length === 0) {
      throw new BadRequestException('At least one tag ID is required');
    }

    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        tags: {
          some: {
            tagId: { in: tagIds },
          },
        },
      },
      skip,
      take,
      include: {
        tags: {
          include: {
            tag: {
              select: { id: true, name: true },
            },
          },
        },
        category: {
          select: { id: true, name: true, icon: true },
        },
      },
      orderBy: { date: 'desc' },
    });

    const total = await this.prisma.transaction.count({
      where: {
        userId,
        tags: {
          some: {
            tagId: { in: tagIds },
          },
        },
      },
    });

    return {
      transactions: transactions.map((t) => ({
        ...t,
        tags: t.tags.map((tag) => tag.tag),
      })),
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
    };
  }
}
