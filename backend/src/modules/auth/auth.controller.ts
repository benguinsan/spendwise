import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfirmSignupDto } from './dto/confirm-signup.dto';
import { CognitoJwtAuthGuard } from './guards/cognito-jwt-auth.guard';
import { MeAuthGuard } from './guards/me-auth.guard';
// JWT nội bộ (Passport) vẫn dùng trong MeAuthGuard khi không set Cognito — không xóa JwtAuthGuard / JwtStrategy.
// Trước đây route này chỉ JWT trực tiếp, ví dụ:
//   @UseGuards(JwtAuthGuard)
//   getProfile(@Request() req) { return req.user; }
import type { Request as ExpressRequest } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('confirm-signup')
  @HttpCode(HttpStatus.OK)
  async confirmSignup(@Body() confirmSignupDto: ConfirmSignupDto) {
    return this.authService.confirmSignup(confirmSignupDto);
  }

  /** Cognito (prod) hoặc JWT nội bộ (dev không Cognito) — xem MeAuthGuard + AuthService.getMe. */
  @Get('me')
  @UseGuards(MeAuthGuard)
  getProfile(@Request() req: ExpressRequest) {
    return this.authService.getMe(req);
  }

  @Get('cognito/me')
  @UseGuards(CognitoJwtAuthGuard)
  getCognitoProfile(@Request() req: ExpressRequest) {
    return this.authService.getMe(req);
  }
}
