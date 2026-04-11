import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/service/prisma.service';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  async create(createBudgetDto: CreateBudgetDto) {
    // Verify user exists
    const userExists = await this.prisma.user.findUnique({
      where: { id: createBudgetDto.userId },
    });

    if (!userExists) {
      throw new BadRequestException('User not found');
    }

    // Verify category exists if provided
    if (createBudgetDto.categoryId) {
      const categoryExists = await this.prisma.category.findUnique({
        where: { id: createBudgetDto.categoryId },
      });

      if (!categoryExists) {
        throw new BadRequestException('Category not found');
      }
    }

    return this.prisma.budget.create({
      data: {
        amount: createBudgetDto.amount,
        month: createBudgetDto.month,
        year: createBudgetDto.year,
        userId: createBudgetDto.userId,
        categoryId: createBudgetDto.categoryId,
      },
      select: {
        id: true,
        amount: true,
        month: true,
        year: true,
        userId: true,
        categoryId: true,
        createdAt: true,
      },
    });
  }

  async findAll(userId?: string, skip = 0, take = 10) {
    const where = userId ? { userId } : {};

    const [budgets, total] = await Promise.all([
      this.prisma.budget.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          amount: true,
          month: true,
          year: true,
          userId: true,
          createdAt: true,
          category: {
            select: {
              id: true,
              name: true,
              icon: true,
            },
          },
        },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
      }),
      this.prisma.budget.count({ where }),
    ]);

    return {
      budgets,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
    };
  }

  async findOne(id: string) {
    const budget = await this.prisma.budget.findUnique({
      where: { id },
      select: {
        id: true,
        amount: true,
        month: true,
        year: true,
        userId: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
    });

    if (!budget) {
      throw new NotFoundException(`Budget with ID ${id} not found`);
    }

    return budget;
  }

  async update(id: string, updateBudgetDto: UpdateBudgetDto) {
    await this.findOne(id); // Verify budget exists

    return this.prisma.budget.update({
      where: { id },
      data: updateBudgetDto,
      select: {
        id: true,
        amount: true,
        month: true,
        year: true,
        userId: true,
        categoryId: true,
        createdAt: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Verify budget exists

    return this.prisma.budget.delete({
      where: { id },
      select: {
        id: true,
        amount: true,
        month: true,
        year: true,
      },
    });
  }

  getBudgetsByUser(userId: string, month?: number, year?: number) {
    const where: any = { userId };

    if (month) where.month = month;
    if (year) where.year = year;

    return this.prisma.budget.findMany({
      where,
      select: {
        id: true,
        amount: true,
        month: true,
        year: true,
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
          },
        },
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  }
}
