import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/service/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    // Verify user exists if userId is provided
    if (createCategoryDto.userId) {
      const userExists = await this.prisma.user.findUnique({
        where: { id: createCategoryDto.userId },
      });

      if (!userExists) {
        throw new BadRequestException('User not found');
      }

      // Check for duplicate user category names
      const existing = await this.prisma.category.findFirst({
        where: {
          userId: createCategoryDto.userId,
          name: createCategoryDto.name,
        },
      });

      if (existing) {
        throw new BadRequestException(
          'Category with this name already exists for this user',
        );
      }
    }

    return this.prisma.category.create({
      data: {
        name: createCategoryDto.name,
        icon: createCategoryDto.icon,
        type: (createCategoryDto.type || 'EXPENSE') as any,
        userId: createCategoryDto.userId,
      },
    });
  }

  async findAll(type?: string, skip = 0, take = 20) {
    const where: any = {};
    if (type) where.type = type;

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take,
        include: {
          _count: {
            select: { transactions: true },
          },
        },
        orderBy: [{ name: 'asc' }],
      }),
      this.prisma.category.count({ where }),
    ]);

    return {
      categories,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
    };
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        transactions: {
          select: {
            id: true,
            amount: true,
            date: true,
            type: true,
          },
          take: 10,
          orderBy: { date: 'desc' },
        },
        budgets: {
          select: {
            id: true,
            amount: true,
            month: true,
            year: true,
          },
        },
        _count: {
          select: { transactions: true, budgets: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    // Verify category exists
    const category = await this.findOne(id);

    // If updating name and has userId, check for duplicates
    if (updateCategoryDto.name && category.userId) {
      const existing = await this.prisma.category.findFirst({
        where: {
          userId: category.userId,
          name: updateCategoryDto.name,
          id: { not: id }, // Exclude current category
        },
      });

      if (existing) {
        throw new BadRequestException(
          'Category with this name already exists for this user',
        );
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        name: updateCategoryDto.name,
        icon: updateCategoryDto.icon,
        type: updateCategoryDto.type
          ? (updateCategoryDto.type as any)
          : undefined,
      },
    });
  }

  async remove(id: string) {
    // Verify category exists
    await this.findOne(id);

    // Check if category is being used
    const [transactionCount, budgetCount] = await Promise.all([
      this.prisma.transaction.count({
        where: { categoryId: id },
      }),
      this.prisma.budget.count({
        where: { categoryId: id },
      }),
    ]);

    if (transactionCount > 0 || budgetCount > 0) {
      throw new BadRequestException(
        `Cannot delete category that is in use (${transactionCount} transactions, ${budgetCount} budgets). Remove associated data first.`,
      );
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }

  /**
   * Get categories by type
   */
  getByType(type: string, userId?: string) {
    return this.prisma.category.findMany({
      where: {
        type: type as any,
        ...(userId && { userId }),
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get all categories unassigned to a specific user (system defaults if userId is null)
   */
  getDefaults() {
    return this.prisma.category.findMany({
      where: { userId: null }, // Only system-wide categories
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get categories for a specific user (including system defaults)
   */
  async getUserCategories(userId: string) {
    return this.prisma.category.findMany({
      where: {
        OR: [{ userId }, { userId: null }], // User's categories + system defaults
      },
      orderBy: [{ userId: 'desc' }, { name: 'asc' }],
    });
  }
}
