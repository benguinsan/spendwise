import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/service/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { JWT_EXPIRY, REFRESH_TOKEN_EXPIRY } from './constants/jwt.constants';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService');

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;

    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      this.logger.warn(`Registration failed: Email ${email} already exists`);
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    this.logger.log(`User registered: ${email}`);

    // Generate tokens
    // const tokens = this.generateTokens(user.id, user.email);

    return {
      user,
      // ...tokens,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
      },
    });

    if (!user) {
      this.logger.warn(`Login failed: User ${email} not found`);
      throw new UnauthorizedException('Invalid email or password');
    }

    // Verify password

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      this.logger.warn(`Login failed: Invalid password for ${email}`);
      throw new UnauthorizedException('Invalid email or password');
    }

    this.logger.log(`User logged in: ${email}`);

    // Generate tokens
    const tokens = this.generateTokens(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      ...tokens,
    };
  }

  async refreshToken(userId: string, refreshToken: string) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      this.logger.warn(`Token refresh failed: User ${userId} not found`);
      throw new UnauthorizedException('User not found');
    }

    // Verify refresh token
    try {
      const decoded = await this.jwtService.verifyAsync(refreshToken, {
        secret:
          process.env.JWT_SECRET ||
          'your-super-secret-key-change-in-production',
      });

      if (decoded.sub !== userId || decoded.type !== 'refresh') {
        throw new Error('Invalid token');
      }
    } catch {
      this.logger.warn(
        `Token refresh failed: Invalid refresh token for ${userId}`,
      );
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Generate new tokens
    const tokens = this.generateTokens(user.id, user.email);

    this.logger.log(`Token refreshed for user: ${user.email}`);

    return {
      user,
      ...tokens,
    };
  }

  logout(userId: string) {
    // In a real application, you might want to:
    // 1. Invalidate the refresh token in the database
    // 2. Add the access token to a blacklist
    // For now, we'll just log the action

    this.logger.log(`User logged out: ${userId}`);

    return {
      message: 'Logged out successfully',
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
  }

  private generateTokens(userId: string, email: string) {
    // Generate access token (short-lived)
    const accessToken = this.jwtService.sign(
      { sub: userId, email, type: 'access' },
      { expiresIn: JWT_EXPIRY as any },
    );

    // Generate refresh token (long-lived)
    const refreshToken = this.jwtService.sign(
      { sub: userId, email, type: 'refresh' },
      { expiresIn: REFRESH_TOKEN_EXPIRY as any },
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: JWT_EXPIRY,
    };
  }
}
