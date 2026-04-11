/**
 * EXAMPLE: How to use Auth module with other controllers
 * This file shows patterns for protecting routes and using authenticated user data
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return */

// Example 1: Basic Protected Route
import { Controller, Get, Post, Body, UseGuards, Param } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('wallets')
export class WalletsExampleController {
  constructor(private walletsService: any) {}

  // Only authenticated users can access
  @Get()
  @UseGuards(JwtAuthGuard)
  getUserWallets(@CurrentUser() user: { userId: string; email: string }) {
    // userId is automatically extracted from JWT token
    return this.walletsService.findByUser(user.userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createWallet(
    @Body() createWalletDto: any,
    @CurrentUser() user: { userId: string; email: string },
  ) {
    // Automatically associate wallet with authenticated user
    return this.walletsService.create({
      ...createWalletDto,
      userId: user.userId,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getWallet(
    @Param('id') walletId: string,
    @CurrentUser() user: { userId: string; email: string },
  ) {
    // Verify user owns this wallet before returning
    const wallet = await this.walletsService.findOne(walletId);
    if (wallet.userId !== user.userId) {
      throw new Error('Not authorized');
    }
    return wallet;
  }
}

// Example 2: Transactions mapped to user
@Controller('transactions')
export class TransactionsExampleController {
  constructor(
    private transactionsService: any,
    private walletsService: any,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getUserTransactions(@CurrentUser() user: { userId: string; email: string }) {
    // Automatically filter by user
    return this.transactionsService.findByUser(user.userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createTransaction(
    @Body() createTransactionDto: any,
    @CurrentUser() user: { userId: string; email: string },
  ) {
    // Validate user owns the wallet before creating transaction
    const wallet = await this.walletsService.findOne(
      createTransactionDto.walletId,
    );
    if (wallet.userId !== user.userId) {
      throw new Error('Wallet not owned by user');
    }

    return this.transactionsService.create({
      ...createTransactionDto,
      userId: user.userId,
    });
  }
}

// Example 3: Mixed auth (some public, some protected)
import { OptionalJwtAuthGuard } from './guards/optional-jwt-auth.guard';

@Controller('categories')
export class CategoriesExampleController {
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  getCategories(@CurrentUser() user?: { userId: string; email: string }) {
    // Public endpoint - returns more data for authenticated users
    if (user) {
      return this.getCategoriesWithUserDefaults(user.userId);
    }
    return this.getDefaultCategories();
  }

  private getCategoriesWithUserDefaults(_userId: string) {
    // Logic for authenticated users
  }

  private getDefaultCategories() {
    // Logic for public users
  }
}

// Example 4: Admin auth check (extend this pattern)
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private prisma: any) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return false;
    }

    // Check if user is admin in database
    const adminUser = await this.prisma.user.findUnique({
      where: { id: user.userId },
      select: { role: true },
    });

    return adminUser?.role === 'ADMIN';
  }
}

// Usage:
@Controller('admin')
export class AdminController {
  constructor(private usersService: any) {}

  @Get('users')
  @UseGuards(JwtAuthGuard, AdminGuard)
  getAllUsers() {
    // Only admins can access
    return this.usersService.findAll();
  }
}
