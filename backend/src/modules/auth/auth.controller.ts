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

  @Get('cognito/me')
  @UseGuards(CognitoJwtAuthGuard)
  getCognitoProfile(@Request() req: ExpressRequest & { user: unknown }) {
    return req.user;
  }
}
