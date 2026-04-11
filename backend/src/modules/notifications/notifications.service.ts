import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/service/prisma.service';
@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(
    userId: string,
    type: 'BUDGET_ALERT' | 'GOAL_REACHED' | 'REMINDER',
    message: string,
  ) {
    // Verify user exists
    const userExists = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      throw new BadRequestException('User not found');
    }

    return this.prisma.notification.create({
      data: {
        userId,
        type,
        message,
        isRead: false,
      },
    });
  }

  async findAll(userId: string, skip = 0, take = 10, isRead?: boolean) {
    const where: any = { userId };
    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where }),
    ]);

    return {
      notifications,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
      unreadCount: await this.prisma.notification.count({
        where: { userId, isRead: false },
      }),
    };
  }

  async findOne(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new BadRequestException(
        'Notification does not belong to this user',
      );
    }

    return notification;
  }

  async markAsRead(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new BadRequestException(
        'Notification does not belong to this user',
      );
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async delete(id: string, userId: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new BadRequestException(
        'Notification does not belong to this user',
      );
    }

    return this.prisma.notification.delete({
      where: { id },
    });
  }

  async deleteAll(userId: string) {
    return this.prisma.notification.deleteMany({
      where: { userId },
    });
  }

  /**
   * Get notification summary for user
   */
  async getSummary(userId: string) {
    const [unread, budgetAlerts, goalAlerts, reminders] = await Promise.all([
      this.prisma.notification.count({
        where: { userId, isRead: false },
      }),
      this.prisma.notification.count({
        where: { userId, type: 'BUDGET_ALERT' },
      }),
      this.prisma.notification.count({
        where: { userId, type: 'GOAL_REACHED' },
      }),
      this.prisma.notification.count({
        where: { userId, type: 'REMINDER' },
      }),
    ]);

    return {
      unreadCount: unread,
      budgetAlertsCount: budgetAlerts,
      goalAlertsCount: goalAlerts,
      remindersCount: reminders,
      totalCount: unread + budgetAlerts + goalAlerts + reminders,
    };
  }

  /**
   * Internal method to create budget alert - called from budgets service
   */
  async createBudgetAlert(
    userId: string,
    budgetName: string,
    percentage: number,
  ) {
    const message = `Budget alert: ${budgetName} has reached ${Math.round(percentage)}% of allocated amount`;

    return this.create(userId, 'BUDGET_ALERT', message);
  }

  /**
   * Internal method to create goal reached notification - called from goals service
   */
  async createGoalReachedNotification(userId: string, goalName: string) {
    const message = `Congratulations! You've reached your goal: ${goalName}`;

    return this.create(userId, 'GOAL_REACHED', message);
  }

  /**
   * Internal method to create reminder - called from recurring transactions
   */
  async createReminder(userId: string, message: string) {
    return this.create(userId, 'REMINDER', message);
  }
}
