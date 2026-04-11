# Auth Module Integration Guide

## Quick Start

### 1. Import AuthModule in AppModule
```typescript
import { AuthModule } from './modules/auth';

@Module({
  imports: [
    // ... other modules
    AuthModule,
  ],
})
export class AppModule {}
```

### 2. Protect Routes with JwtAuthGuard
```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard, CurrentUser } from '../auth';

@Controller('users')
export class UsersController {
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getUserProfile(@CurrentUser() user: any) {
    // user.userId and user.email are available
    return this.usersService.findOne(user.userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  createWallet(@Body() dto: CreateWalletDto, @CurrentUser() user: any) {
    return this.walletsService.create({
      ...dto,
      userId: user.userId, // Inject user ID from token
    });
  }
}
```

### 3. Use in Other Services
```typescript
// wallet.service.ts
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Injectable()
export class WalletsService {
  constructor(private prisma: PrismaService, private authService: AuthService) {}

  async getMyWallets(userId: string) {
    // User ID is already verified by guard
    return this.prisma.wallet.findMany({
      where: { userId },
    });
  }
}
```

## Token Flow

```
User Registration/Login
        ↓
   AuthService.register() or AuthService.login()
        ↓
   Generate Access Token (15m) + Refresh Token (7d)
        ↓
 [Client stores tokens securely]
        ↓
Request with Bearer Token in Authorization Header
        ↓
JwtAuthGuard verifies token
        ↓
JwtStrategy validates and extracts user info
        ↓
Controller receives user data in request.user
        ↓
Route handler executes with authenticated user
```

## Error Handling

The Auth module returns standard HTTP errors:

| Error | Status | Cause |
|-------|--------|-------|
| `ConflictException` | 409 | Email already registered |
| `UnauthorizedException` | 401 | Invalid email/password or token |
| `BadRequestException` | 400 | Invalid DTO data |

## Common Patterns

### 1. Extract User Across Multiple Services
```typescript
@Controller('wallets')
export class WalletsController {
  constructor(
    private walletsService: WalletsService,
    private transactionsService: TransactionsService,
  ) {}

  @Get('summary')
  @UseGuards(JwtAuthGuard)
  async getSummary(@CurrentUser() user: any) {
    const wallets = await this.walletsService.getByUser(user.userId);
    const transactions = await this.transactionsService.getByUser(user.userId);
    return { wallets, transactions };
  }
}
```

### 2. Conditional Authentication
If you need optional authentication (some routes work with/without user):

```typescript
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@Controller('public')
export class PublicController {
  @Get('items')
  @UseGuards(OptionalJwtAuthGuard)
  getItems(@CurrentUser() user?: any) {
    // If authenticated, user.userId is available
    // If not authenticated, user will be undefined
    if (user) {
      return this.getPrivateItems(user.userId);
    }
    return this.getPublicItems();
  }
}
```

### 3. Service-Level Auth Check
```typescript
async deleteWallet(walletId: string, userId: string) {
  const wallet = await this.prisma.wallet.findUnique({
    where: { id: walletId },
  });

  // Verify ownership
  if (wallet.userId !== userId) {
    throw new UnauthorizedException('Cannot delete wallet you do not own');
  }

  return this.prisma.wallet.delete({ where: { id: walletId } });
}
```

## Advanced Features

### Custom Decorators
```typescript
// Create a decorator that combines auth + role check
import { createParamDecorator, ExecutionContext, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

export const IsOwnerOf = createParamDecorator(
  (resourceParam: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const resourceId = request.params[resourceParam];
    const userId = request.user.userId;
    return { resourceId, userId };
  },
);

// Usage in controller:
@Delete(':id')
@UseGuards(JwtAuthGuard)
async deleteWallet(@IsOwnerOf('id') { resourceId, userId }: any) {
  return this.walletsService.deleteWallet(resourceId, userId);
}
```

## Security Checklist

- [ ] JWT_SECRET is 32+ characters in production
- [ ] JWT tokens are sent only over HTTPS
- [ ] Access tokens are short-lived (15 minutes)
- [ ] Refresh tokens are long-lived but validated
- [ ] Passwords are never logged or exposed
- [ ] Failed login attempts are logged
- [ ] Token refresh validates refresh token signature and expiry
- [ ] User data returned excludes password field

## Testing Auth Endpoints

### Using Thunder Client / Postman

**1. Register User:**
```
POST /auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "SecurePass123",
  "name": "Test User"
}
```

**2. Login:**
```
POST /auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "SecurePass123"
}
```

**3. Save the accessToken from response, then use:**
```
GET /auth/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**4. Refresh Token (when access token expires):**
```
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

## Troubleshooting

### "Property 'userId' does not exist on type 'any'"
Add type annotation:
```typescript
@CurrentUser() user: { userId: string; email: string }
```

### "JWT malformed"
- Ensure token is sent in correct format: `Authorization: Bearer <token>`
- Check JWT_SECRET matches on encode/decode

### "Token expired"
- Get new token via refresh endpoint
- Update client to auto-refresh before expiry

