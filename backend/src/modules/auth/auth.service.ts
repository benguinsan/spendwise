import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
  InternalServerErrorException,
  BadGatewayException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfirmSignupDto } from './dto/confirm-signup.dto';
import { PrismaService } from '../prisma/service/prisma.service';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class AuthService {
  private logger = new Logger('AuthService');

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // Check if Cognito is configured
    if (this.isCognitoConfigured()) {
      return this.registerWithCognito(registerDto);
    }
    // Fallback to local JWT authentication
    // return this.registerWithJWT(registerDto);
  }

  async login(loginDto: LoginDto) {
    // Check if Cognito is configured
    if (this.isCognitoConfigured()) {
      return this.loginWithCognito(loginDto);
    }
    // Fallback to local JWT authentication
    // return this.loginWithJWT(loginDto);
  }

  async confirmSignup(confirmSignupDto: ConfirmSignupDto) {
    const { email, confirmationCode } = confirmSignupDto;
    const { clientId } = this.getCognitoConfig();

    await this.cognitoRequest<Record<string, never>>('ConfirmSignUp', {
      ClientId: clientId,
      Username: email,
      ConfirmationCode: confirmationCode,
    });

    // Source of truth sync rule:
    // Only create/update local `users` row after the user confirms signup.
    // At this moment we only reliably know `email` (password is managed by Cognito).
    // `cognitoSub` may be filled later on first successful login.
    await this.upsertLocalUser({
      email,
      // We don't have name from ConfirmSignUp response.
      name: undefined,
      cognitoSub: undefined,
    });

    return {
      provider: 'cognito',
      message: 'Account confirmed successfully',
    };
  }

  private getCognitoConfig() {
    const region = process.env.COGNITO_REGION || process.env.AWS_REGION;
    const clientId = process.env.COGNITO_CLIENT_ID;

    if (!region || !clientId) {
      throw new InternalServerErrorException(
        'Missing Cognito envs: COGNITO_REGION/AWS_REGION and COGNITO_CLIENT_ID',
      );
    }

    return {
      endpoint: `https://cognito-idp.${region}.amazonaws.com/`,
      clientId,
    };
  }

  private async cognitoRequest<T>(
    action: string,
    payload: Record<string, unknown>,
  ): Promise<T> {
    const { endpoint } = this.getCognitoConfig();
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': `AWSCognitoIdentityProviderService.${action}`,
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json()) as Record<string, unknown>;
    if (!response.ok) {
      const errorName =
        typeof data.__type === 'string'
          ? data.__type
          : typeof data.code === 'string'
            ? data.code
            : '';
      const message =
        typeof data.message === 'string'
          ? data.message
          : 'Cognito request failed';

      if (errorName.includes('UsernameExistsException')) {
        throw new ConflictException(message);
      }
      if (errorName.includes('NotAuthorizedException')) {
        throw new UnauthorizedException(message);
      }
      throw new BadGatewayException(message);
    }

    return data as T;
  }

  private async registerWithCognito(registerDto: RegisterDto) {
    const { email, password, name } = registerDto;
    const { clientId } = this.getCognitoConfig();

    const userAttributes: Array<{ Name: string; Value: string }> = [
      { Name: 'email', Value: email },
    ];
    if (name) {
      userAttributes.push({ Name: 'name', Value: name });
    }

    const signUpResult = await this.cognitoRequest<{
      UserSub: string;
      UserConfirmed: boolean;
    }>('SignUp', {
      ClientId: clientId,
      Username: email,
      Password: password,
      UserAttributes: userAttributes,
    });

    return {
      provider: 'cognito',
      user: {
        id: signUpResult.UserSub,
        email,
        name: name ?? null,
      },
      userConfirmed: signUpResult.UserConfirmed,
      message: signUpResult.UserConfirmed
        ? 'Signup successful'
        : 'Signup successful, please confirm your email code',
    };
  }

  private async loginWithCognito(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const { clientId } = this.getCognitoConfig();

    const authResult = await this.cognitoRequest<{
      AuthenticationResult?: {
        AccessToken?: string;
        IdToken?: string;
        RefreshToken?: string;
        ExpiresIn?: number;
        TokenType?: string;
      };
      ChallengeName?: string;
      Session?: string;
    }>('InitiateAuth', {
      ClientId: clientId,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    // Prefer Cognito `GetUser` (uses AccessToken, no IAM signing)
    // to reliably get user attributes (sub/email/name) for DB sync.
    const accessToken = authResult.AuthenticationResult?.AccessToken ?? null;
    if (accessToken) {
      const profile = await this.cognitoRequest<{
        Username?: string;
        UserAttributes?: Array<{ Name: string; Value: string }>;
      }>('GetUser', { AccessToken: accessToken });

      const attrs = profile.UserAttributes ?? [];
      const getAttr = (key: string) => attrs.find((a) => a.Name === key)?.Value;

      const sub = getAttr('sub') ?? null;
      const profileEmail = getAttr('email') ?? null;
      const profileName = getAttr('name') ?? null;

      if (profileEmail) {
        await this.upsertLocalUser({
          email: profileEmail,
          name: profileName,
          cognitoSub: sub ?? undefined,
        });
      }
    } else {
      // Fallback: try parse IdToken claims if AccessToken isn't present.
      const idToken = authResult.AuthenticationResult?.IdToken ?? null;
      if (idToken) {
        const claims = this.decodeJwtClaims(idToken);
        if (claims?.email) {
          await this.upsertLocalUser({
            email: claims.email,
            name: claims.name ?? null,
            cognitoSub: claims.sub,
          });
        }
      }
    }

    return {
      provider: 'cognito',
      challengeName: authResult.ChallengeName ?? null,
      session: authResult.Session ?? null,
      accessToken,
      idToken: authResult.AuthenticationResult?.IdToken ?? null,
      refreshToken: authResult.AuthenticationResult?.RefreshToken ?? null,
      expiresIn: authResult.AuthenticationResult?.ExpiresIn ?? null,
      tokenType: authResult.AuthenticationResult?.TokenType ?? null,
    };
  }

  private decodeJwtClaims(
    token: string,
  ): { sub?: string; email?: string; name?: string } | null {
    try {
      const [, payloadBase64Url] = token.split('.');
      if (!payloadBase64Url) {
        return null;
      }
      const payloadBase64 = payloadBase64Url
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      const padded = payloadBase64.padEnd(
        payloadBase64.length + ((4 - (payloadBase64.length % 4)) % 4),
        '=',
      );
      const json = Buffer.from(padded, 'base64').toString('utf-8');
      return JSON.parse(json) as {
        sub?: string;
        email?: string;
        name?: string;
      };
    } catch {
      return null;
    }
  }

  private async upsertLocalUser(params: {
    email: string;
    name?: string | null;
    cognitoSub?: string;
  }) {
    // We upsert by `email` first, because ConfirmSignUp doesn't return `sub`.
    // Then, if we have `cognitoSub` (from JWT on login), we attach it to the existing row.
    const existing = await this.prisma.user.findUnique({
      where: { email: params.email },
    });

    const data: Record<string, unknown> = {
      email: params.email,
    };

    if (params.name !== undefined) {
      data.name = params.name;
    }
    if (params.cognitoSub) {
      data.cognitoSub = params.cognitoSub;
    }

    if (existing) {
      await this.prisma.user.update({
        where: { id: existing.id },
        data: data as any,
      });
      return;
    }

    await this.prisma.user.create({
      data: data as any,
    });
  }

  private isCognitoConfigured(): boolean {
    const region = process.env.COGNITO_REGION || process.env.AWS_REGION;
    const clientId = process.env.COGNITO_CLIENT_ID;
    return !!(region && clientId);
  }

  // Local JWT authentication fallback when Cognito is not configured
  // private async registerWithJWT(registerDto: RegisterDto) {
  //   const { email, password, name } = registerDto;

  //   // Check if user already exists
  //   const existingUser = await this.prisma.user.findUnique({
  //     where: { email },
  //   });

  //   if (existingUser) {
  //     throw new ConflictException('User with this email already exists');
  //   }

  //   // Hash password
  //   const hashedPassword = await bcryptjs.hash(password, 10);

  //   // Create user
  //   const user = await this.prisma.user.create({
  //     data: {
  //       email,
  //       name: name || null,
  //       password: hashedPassword,
  //     },
  //   });

  //   // Generate JWT token
  //   const idToken = this.jwtService.sign(
  //     {
  //       sub: user.id,
  //       email: user.email,
  //       name: user.name,
  //     },
  //     {
  //       expiresIn: '24h',
  //     },
  //   );

  //   return {
  //     provider: 'local',
  //     idToken,
  //     user: {
  //       id: user.id,
  //       email: user.email,
  //       name: user.name,
  //     },
  //     userConfirmed: true,
  //     expiresIn: 86400,
  //     message: 'Signup successful',
  //   };
  // }

  // private async loginWithJWT(loginDto: LoginDto) {
  //   const { email, password } = loginDto;

  //   // Find user
  //   const user = await this.prisma.user.findUnique({
  //     where: { email },
  //   });

  //   if (!user || !user.password) {
  //     throw new UnauthorizedException('Invalid email or password');
  //   }

  //   // Verify password
  //   const isPasswordValid = await bcryptjs.compare(password, user.password);
  //   if (!isPasswordValid) {
  //     throw new UnauthorizedException('Invalid email or password');
  //   }

  //   // Generate JWT token
  //   const idToken = this.jwtService.sign(
  //     {
  //       sub: user.id,
  //       email: user.email,
  //       name: user.name,
  //     },
  //     {
  //       expiresIn: '24h',
  //     },
  //   );

  //   return {
  //     provider: 'local',
  //     idToken,
  //     user: {
  //       id: user.id,
  //       email: user.email,
  //       name: user.name,
  //     },
  //     userConfirmed: true,
  //     expiresIn: 86400,
  //   };
  // }
}
