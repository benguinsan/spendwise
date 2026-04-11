import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/service/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(private prisma: PrismaService) {}

  async create(createTagDto: CreateTagDto) {
    // Verify user exists
    const userExists = await this.prisma.user.findUnique({
      where: { id: createTagDto.userId },
    });

    if (!userExists) {
      throw new BadRequestException('User not found');
    }

    // Check for duplicate tag name per user
    const existingTag = await this.prisma.tag.findFirst({
      where: {
        userId: createTagDto.userId,
        name: {
          equals: createTagDto.name,
          mode: 'insensitive',
        },
      },
    });

    if (existingTag) {
      throw new BadRequestException(
        'Tag with this name already exists for this user',
      );
    }

    return this.prisma.tag.create({
      data: {
        name: createTagDto.name,
        userId: createTagDto.userId,
      },
    });
  }

  async findAll(userId: string, skip = 0, take = 50) {
    const [tags, total] = await Promise.all([
      this.prisma.tag.findMany({
        where: { userId },
        skip,
        take,
        include: {
          _count: {
            select: { transactions: true },
          },
        },
        orderBy: { name: 'asc' },
      }),
      this.prisma.tag.count({ where: { userId } }),
    ]);

    return {
      tags: tags.map((tag) => ({
        ...tag,
        transactionCount: tag._count.transactions,
        _count: undefined,
      })),
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
    };
  }

  async findOne(id: string, userId: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      include: {
        transactions: {
          select: {
            transaction: {
              select: {
                id: true,
                amount: true,
                type: true,
                date: true,
                category: {
                  select: { name: true, icon: true },
                },
              },
            },
          },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    if (tag.userId !== userId) {
      throw new BadRequestException('Tag does not belong to this user');
    }

    return {
      ...tag,
      transactions: tag.transactions.map((t) => t.transaction),
      transactionCount: tag.transactions.length,
    };
  }

  async update(id: string, userId: string, updateTagDto: UpdateTagDto) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    if (tag.userId !== userId) {
      throw new BadRequestException('Tag does not belong to this user');
    }

    // Check for duplicate if name is being changed
    if (updateTagDto.name && updateTagDto.name !== tag.name) {
      const existingTag = await this.prisma.tag.findFirst({
        where: {
          userId,
          name: {
            equals: updateTagDto.name,
            mode: 'insensitive',
          },
        },
      });

      if (existingTag) {
        throw new BadRequestException(
          'A tag with this name already exists for this user',
        );
      }
    }

    return this.prisma.tag.update({
      where: { id },
      data: {
        name: updateTagDto.name,
      },
    });
  }

  async delete(id: string, userId: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
      include: {
        transactions: true,
      },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    if (tag.userId !== userId) {
      throw new BadRequestException('Tag does not belong to this user');
    }

    // Delete all relationships first
    await this.prisma.transactionTag.deleteMany({
      where: { tagId: id },
    });

    // Then delete the tag
    return this.prisma.tag.delete({
      where: { id },
    });
  }

  /**
   * Add a tag to a transaction
   */
  async addTagToTransaction(
    transactionId: string,
    tagId: string,
    userId: string,
  ) {
    // Verify transaction exists and belongs to user
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.userId !== userId) {
      throw new BadRequestException('Transaction does not belong to this user');
    }

    // Verify tag exists and belongs to user
    const tag = await this.prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    if (tag.userId !== userId) {
      throw new BadRequestException('Tag does not belong to this user');
    }

    // Check if relationship already exists
    const existingRelationship = await this.prisma.transactionTag.findUnique({
      where: {
        transactionId_tagId: {
          transactionId,
          tagId,
        },
      },
    });

    if (existingRelationship) {
      throw new BadRequestException(
        'Tag is already assigned to this transaction',
      );
    }

    return this.prisma.transactionTag.create({
      data: {
        transactionId,
        tagId,
      },
    });
  }

  /**
   * Remove a tag from a transaction
   */
  async removeTagFromTransaction(
    transactionId: string,
    tagId: string,
    userId: string,
  ) {
    // Verify transaction exists and belongs to user
    const transaction = await this.prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.userId !== userId) {
      throw new BadRequestException('Transaction does not belong to this user');
    }

    // Verify tag exists and belongs to user
    const tag = await this.prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    if (tag.userId !== userId) {
      throw new BadRequestException('Tag does not belong to this user');
    }

    return this.prisma.transactionTag.delete({
      where: {
        transactionId_tagId: {
          transactionId,
          tagId,
        },
      },
    });
  }

  /**
   * Get all transactions for a specific tag
   */
  async getTagTransactions(tagId: string, userId: string, skip = 0, take = 20) {
    const tag = await this.prisma.tag.findUnique({
      where: { id: tagId },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    if (tag.userId !== userId) {
      throw new BadRequestException('Tag does not belong to this user');
    }

    const [transactions, total] = await Promise.all([
      this.prisma.transactionTag.findMany({
        where: { tagId },
        skip,
        take,
        include: {
          transaction: {
            select: {
              id: true,
              amount: true,
              type: true,
              date: true,
              note: true,
              createdAt: true,
              category: {
                select: { id: true, name: true, icon: true },
              },
              fromWallet: {
                select: { id: true, name: true, currency: true },
              },
            },
          },
        },
        orderBy: { transaction: { date: 'desc' } },
      }),
      this.prisma.transactionTag.count({
        where: { tagId },
      }),
    ]);

    return {
      tag,
      transactions: transactions.map((t) => t.transaction),
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
    };
  }

  /**
   * Get analytics for a tag
   */
  async getTagAnalytics(tagId: string, userId: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id: tagId },
      include: {
        transactions: {
          include: {
            transaction: {
              select: {
                amount: true,
                type: true,
                date: true,
              },
            },
          },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException('Tag not found');
    }

    if (tag.userId !== userId) {
      throw new BadRequestException('Tag does not belong to this user');
    }

    const transactions = tag.transactions.map((t) => t.transaction);

    const stats = {
      totalTransactions: transactions.length,
      totalSpent: transactions
        .filter((t) => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0),
      totalIncome: transactions
        .filter((t) => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0),
      averageTransaction:
        transactions.length > 0
          ? transactions.reduce((sum, t) => sum + t.amount, 0) /
            transactions.length
          : 0,
      byType: {
        EXPENSE: transactions.filter((t) => t.type === 'EXPENSE').length,
        INCOME: transactions.filter((t) => t.type === 'INCOME').length,
        TRANSFER: transactions.filter((t) => t.type === 'TRANSFER').length,
      },
    };

    return stats;
  }
}
