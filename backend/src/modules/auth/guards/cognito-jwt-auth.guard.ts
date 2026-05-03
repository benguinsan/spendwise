import {
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import type { Request } from 'express';

type CognitoClaims = {
  sub: string;
  email?: string;
  token_use: 'access' | 'id';
  username?: string;
  scope?: string;
  [key: string]: unknown;
};

@Injectable()
export class CognitoJwtAuthGuard implements CanActivate {
  private accessVerifier: ReturnType<typeof CognitoJwtVerifier.create> | null =
    null;
  private idVerifier: ReturnType<typeof CognitoJwtVerifier.create> | null =
    null;

  private getVerifiers() {
    const userPoolId = process.env.COGNITO_USER_POOL_ID;
    const clientId = process.env.COGNITO_CLIENT_ID;
    const region = process.env.COGNITO_REGION || process.env.AWS_REGION;

    if (!userPoolId || !clientId || !region) {
      throw new InternalServerErrorException(
        'Missing Cognito envs: COGNITO_USER_POOL_ID, COGNITO_CLIENT_ID, COGNITO_REGION/AWS_REGION',
      );
    }

    if (!this.accessVerifier) {
      this.accessVerifier = CognitoJwtVerifier.create({
        userPoolId,
        tokenUse: 'access',
        clientId,
      });
    }
    if (!this.idVerifier) {
      this.idVerifier = CognitoJwtVerifier.create({
        userPoolId,
        tokenUse: 'id',
        clientId,
      });
    }

    return { accessVerifier: this.accessVerifier, idVerifier: this.idVerifier };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context
      .switchToHttp()
      .getRequest<Request & { user?: unknown }>();
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing Bearer token');
    }

    const token = authHeader.slice('Bearer '.length).trim();
    if (!token) {
      throw new UnauthorizedException('Empty Bearer token');
    }

    const { accessVerifier, idVerifier } = this.getVerifiers();

    let payload: CognitoClaims;
    try {
      payload = (await accessVerifier.verify(token)) as CognitoClaims;
    } catch {
      try {
        payload = (await idVerifier.verify(token)) as CognitoClaims;
      } catch {
        throw new UnauthorizedException(
          'Invalid Cognito token (expected access or id token)',
        );
      }
    }

    req.user = {
      provider: 'cognito',
      sub: payload.sub,
      email: payload.email ?? null,
      username: payload.username ?? null,
      scope: payload.scope ?? null,
      tokenUse: payload.token_use,
      claims: payload,
    };
    return true;
  }
}
