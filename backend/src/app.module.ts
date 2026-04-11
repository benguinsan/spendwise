import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { WalletsModule } from './modules/wallets/wallets.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { BudgetsModule } from './modules/budgets/budgets.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TagsModule } from './modules/tags/tags.module';
import { GoalsModule } from './modules/goals/goals.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { RecurringTransactionsModule } from './modules/recurring-transactions/recurring-transactions.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    WalletsModule,
    TransactionsModule,
    BudgetsModule,
    CategoriesModule,
    TagsModule,
    GoalsModule,
    NotificationsModule,
    RecurringTransactionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
