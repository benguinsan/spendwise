import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { CognitoJwtAuthGuard } from './cognito-jwt-auth.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

function isCognitoAuthConfigured(): boolean {
  const pool = process.env.COGNITO_USER_POOL_ID;
  const clientId = process.env.COGNITO_CLIENT_ID;
  const region = process.env.COGNITO_REGION || process.env.AWS_REGION;
  return !!(pool && clientId && region);
}

/**
 * GET /auth/me:
 * - Khi có COGNITO_USER_POOL_ID + COGNITO_CLIENT_ID (+ region): Cognito (access hoặc id token).
 * - Ngược lại: vẫn dùng JWT nội bộ (Passport JwtAuthGuard + JwtStrategy + JWT_SECRET) — không gỡ luồng đó,
 *   chỉ không gắn trực tiếp lên controller nữa.
 */
@Injectable()
export class MeAuthGuard implements CanActivate {
  constructor(
    private readonly cognitoGuard: CognitoJwtAuthGuard,
    private readonly jwtGuard: JwtAuthGuard,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    if (isCognitoAuthConfigured()) {
      return this.cognitoGuard.canActivate(context) as Promise<boolean>;
    }
    return this.jwtGuard.canActivate(context) as Promise<boolean>;
  }
}
