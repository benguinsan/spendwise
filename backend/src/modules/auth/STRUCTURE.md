# Auth Module - Complete Structure Summary

## 📁 File Structure

```
src/modules/auth/
├── auth.controller.ts           # REST API endpoints
├── auth.service.ts              # Business logic
├── auth.module.ts               # Module definition
├── index.ts                      # Public exports
├── INTEGRATION.md                # Integration guide for other modules
├── README.md                     # API documentation
├── EXAMPLES.ts                   # Usage examples
├── constants/
│   └── jwt.constants.ts         # JWT configuration
├── decorators/
│   └── current-user.decorator.ts # @CurrentUser() decorator
├── dto/
│   ├── register.dto.ts          # Registration payload
│   ├── login.dto.ts             # Login payload
│   └── refresh-token.dto.ts     # Token refresh payload
├── guards/
│   ├── jwt-auth.guard.ts        # Requires JWT token
│   └── optional-jwt-auth.guard.ts # Optional JWT token
└── strategies/
    └── jwt.strategy.ts          # Passport JWT strategy
```

## 🔐 Security Features

✅ Bcrypt password hashing (10 salt rounds)
✅ JWT access tokens (15 min expiry)
✅ JWT refresh tokens (7 day expiry)
✅ Token signature validation
✅ Payload verification
✅ Generic error messages (prevent user enumeration)
✅ Comprehensive logging
✅ Optimized Prisma queries (no password leakage)

## 📚 API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Register new user |
| POST | `/auth/login` | ❌ | Login with credentials |
| POST | `/auth/refresh` | ❌ | Get new access token |
| POST | `/auth/logout` | ✅ | Logout user |
| GET | `/auth/me` | ✅ | Get current user profile |

## 🎯 Core Components

### AuthService
- `register(RegisterDto)` - Create new user account
- `login(LoginDto)` - Authenticate user
- `refreshToken(userId, refreshToken)` - Generate new access token
- `logout(userId)` - Logout user
- `validateUser(userId)` - Get user details
- `generateTokens(userId, email)` - Create JWT tokens

### AuthController
- Exposes all AuthService methods as REST endpoints
- Handles request/response transformation
- Applies validation pipes

### JwtStrategy
- Extracts JWT from Authorization header
- Validates token signature and expiry
- Returns user info to guard

### JwtAuthGuard
- Protects routes requiring authentication
- Validates JWT and populates `request.user`

### CurrentUser Decorator
- Extracts user from `request.user`
- Provides type-safe access to authenticated user

## 🚀 Quick Integration

```typescript
// 1. Import in app.module.ts
import { AuthModule } from './modules/auth';

@Module({
  imports: [AuthModule, /* ... */],
})
export class AppModule {}

// 2. Protect routes
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard, CurrentUser } from './modules/auth';

@Controller('users')
export class UsersController {
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@CurrentUser() user: any) {
    return this.usersService.findOne(user.userId);
  }
}
```

## 🔧 Environment Variables

```env
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
DATABASE_URL=postgresql://...
```

## 📝 Response Format

All responses follow the global response format:

```json
{
  "statusCode": 200,
  "data": { /* response data */ },
  "timestamp": "2026-03-31T00:00:00Z"
}
```

## ✨ Key Features

- **Registration**: Email validation, password hashing, conflict detection
- **Login**: Email/password verification, token generation
- **Refresh**: Validate refresh token, issue new access token
- **Logout**: Invalidate session (extensible for blacklist)
- **Profile**: Return authenticated user details
- **Guards**: Protect routes with JWT validation
- **Decorators**: Extract user info with @CurrentUser()
- **Logging**: Log auth events for security audit trail

## 🧪 Testing

Use any HTTP client (Thunder Client, Postman, curl):

```bash
# Register
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"Pass123"}'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@test.com","password":"Pass123"}'

# Use token
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

## 📖 Documentation Files

- **README.md** - API endpoint documentation
- **INTEGRATION.md** - How to use in other modules
- **EXAMPLES.ts** - Code examples and patterns

---

Ready to use! All imports and dependencies are properly configured.
