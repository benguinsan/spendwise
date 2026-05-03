import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JWT_SECRET, JWT_EXPIRY } from './constants/jwt.constants';
import { PrismaService } from '../prisma/service/prisma.service';
import { CognitoJwtAuthGuard } from './guards/cognito-jwt-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { MeAuthGuard } from './guards/me-auth.guard';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: JWT_SECRET,
      signOptions: { expiresIn: JWT_EXPIRY },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy, // JWT nội bộ — vẫn dùng khi không cấu hình Cognito (MeAuthGuard → JwtAuthGuard).
    CognitoJwtAuthGuard,
    JwtAuthGuard,
    MeAuthGuard,
    PrismaService,
  ],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}
