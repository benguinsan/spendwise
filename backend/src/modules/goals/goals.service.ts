import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/service/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  async create(createGoalDto: CreateGoalDto) {
    // Verify user exists
    const userExists = await this.prisma.user.findUnique({
      where: { id: createGoalDto.userId },
    });

    if (!userExists) {
      throw new BadRequestException('User not found');
    }

    if (createGoalDto.target <= 0) {
      throw new BadRequestException('Target amount must be greater than 0');
    }

    if (new Date(createGoalDto.deadline) <= new Date()) {
      throw new BadRequestException('Deadline must be in the future');
    }

    return this.prisma.goal.create({
      data: {
        name: createGoalDto.name,
        target: createGoalDto.target,
        current: createGoalDto.current || 0,
        deadline: new Date(createGoalDto.deadline),
        userId: createGoalDto.userId,
      },
      select: {
        id: true,
        name: true,
        target: true,
        current: true,
        deadline: true,
        userId: true,
        createdAt: true,
      },
    });
  }

  async findAll(userId: string, skip = 0, take = 10) {
    const [goals, total] = await Promise.all([
      this.prisma.goal.findMany({
        where: { userId },
        skip,
        take,
        orderBy: { deadline: 'asc' },
      }),
      this.prisma.goal.count({ where: { userId } }),
    ]);

    return {
      goals: goals.map((goal) => this.calculateGoalProgress(goal)),
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
    };
  }

  async findOne(id: string, userId: string) {
    const goal = await this.prisma.goal.findUnique({
      where: { id },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    if (goal.userId !== userId) {
      throw new BadRequestException('Goal does not belong to this user');
    }

    return this.calculateGoalProgress(goal);
  }

  async update(id: string, userId: string, updateGoalDto: UpdateGoalDto) {
    const goal = await this.prisma.goal.findUnique({
      where: { id },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    if (goal.userId !== userId) {
      throw new BadRequestException('Goal does not belong to this user');
    }

    if (updateGoalDto.deadline) {
      if (new Date(updateGoalDto.deadline) <= new Date()) {
        throw new BadRequestException('Deadline must be in the future');
      }
    }

    const updatedGoal = await this.prisma.goal.update({
      where: { id },
      data: {
        name: updateGoalDto.name,
        target: updateGoalDto.target,
        current: updateGoalDto.current,
        deadline: updateGoalDto.deadline
          ? new Date(updateGoalDto.deadline)
          : undefined,
      },
    });

    return this.calculateGoalProgress(updatedGoal);
  }

  async delete(id: string, userId: string) {
    const goal = await this.prisma.goal.findUnique({
      where: { id },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    if (goal.userId !== userId) {
      throw new BadRequestException('Goal does not belong to this user');
    }

    return this.prisma.goal.delete({
      where: { id },
    });
  }

  /**
   * Add progress to goal - called when transactions are created/updated
   * This could be automated with a webhook or cron job
   */
  async addProgress(id: string, userId: string, amount: number) {
    const goal = await this.prisma.goal.findUnique({
      where: { id },
    });

    if (!goal) {
      throw new NotFoundException('Goal not found');
    }

    if (goal.userId !== userId) {
      throw new BadRequestException('Goal does not belong to this user');
    }

    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    const newCurrent = Math.min(goal.current + amount, goal.target);
    const isReached = newCurrent >= goal.target;

    const updatedGoal = await this.prisma.goal.update({
      where: { id },
      data: { current: newCurrent },
    });

    // Create notification if goal reached
    if (isReached && !goal.notificationSent) {
      await this.prisma.notification.create({
        data: {
          userId,
          type: 'GOAL_REACHED',
          message: `Congratulations! You've reached your goal: ${goal.name}`,
          isRead: false,
        },
      });

      // Mark as notified by updating goal status
      await this.prisma.goal.update({
        where: { id },
        data: { notificationSent: true },
      });
    }

    return this.calculateGoalProgress(updatedGoal);
  }

  /**
   * Calculate goal progress and status
   */
  private calculateGoalProgress(goal: {
    id: string;
    name: string;
    target: number;
    current: number;
    deadline: Date;
    userId: string;
    createdAt?: Date;
    updatedAt?: Date;
    description?: string | null;
    notificationSent?: boolean;
  }) {
    const progress = Math.min((goal.current / goal.target) * 100, 100);
    const daysRemaining = Math.ceil(
      (new Date(goal.deadline).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const isOverdue = daysRemaining < 0;

    return {
      ...goal,
      progress: Math.round(progress * 100) / 100,
      daysRemaining: Math.max(daysRemaining, 0),
      isOverdue,
      isReached: goal.current >= goal.target,
    };
  }

  /**
   * Get goals by category name - useful for grouping
   */
  async getGoalsSummary(userId: string) {
    const goals = await this.prisma.goal.findMany({
      where: { userId },
    });

    const summary = {
      total: goals.length,
      active: goals.filter((g) => g.current < g.target).length,
      reached: goals.filter((g) => g.current >= g.target).length,
      overdue: goals.filter(
        (g) => new Date(g.deadline) < new Date() && g.current < g.target,
      ).length,
      totalProgress: goals.reduce((sum, g) => sum + g.current, 0),
      totalTarget: goals.reduce((sum, g) => sum + g.target, 0),
      goals: goals.map((g) => this.calculateGoalProgress(g)),
    };

    return summary;
  }
}
