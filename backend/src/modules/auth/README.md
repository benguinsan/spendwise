# Auth Module Documentation

## Overview
Complete JWT-based authentication module for SpendWise with registration, login, token refresh, and logout functionality.

## Features
- ✅ User registration with email validation
- ✅ User login with bcrypt password verification
- ✅ JWT access tokens (short-lived)
- ✅ JWT refresh tokens (long-lived)
- ✅ Protected routes with JwtAuthGuard
- ✅ Comprehensive error handling
- ✅ Logging for security events
- ✅ Optimized Prisma queries

## Endpoints

### POST `/auth/register`
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "statusCode": 201,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe",
      "createdAt": "2026-03-31T00:00:00Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "15m"
  },
  "timestamp": "2026-03-31T00:00:00Z"
}
```

---

### POST `/auth/login`
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "15m"
  },
  "timestamp": "2026-03-31T00:00:00Z"
}
```

---

### POST `/auth/refresh`
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "name": "John Doe"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "15m"
  },
  "timestamp": "2026-03-31T00:00:00Z"
}
```

---

### POST `/auth/logout`
Logout and invalidate tokens (requires authentication).

**Header:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {
    "message": "Logged out successfully"
  },
  "timestamp": "2026-03-31T00:00:00Z"
}
```

---

### GET `/auth/me`
Get current user profile (requires authentication).

**Header:**
```
Authorization: Bearer <accessToken>
```

**Response (200 OK):**
```json
{
  "statusCode": 200,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2026-03-31T00:00:00Z"
  },
  "timestamp": "2026-03-31T00:00:00Z"
}
```

---

## Usage in Controllers

### Using JwtAuthGuard
```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Controller('protected')
export class ProtectedController {
  @Get()
  @UseGuards(JwtAuthGuard)
  getProtected(@Request() req) {
    return { userId: req.user.userId };
  }
}
```

### Using CurrentUser Decorator
```typescript
import { CurrentUser } from './auth/decorators/current-user.decorator';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Controller('profile')
export class ProfileController {
  @Get()
  @UseGuards(JwtAuthGuard)
  getProfile(@CurrentUser() user: any) {
    return { userId: user.userId, email: user.email };
  }
}
```

---

## Environment Variables

Set the following in your `.env` file:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
```

---

## Security Best Practices

1. **Password Hashing**: Passwords are hashed using bcrypt with 10 salt rounds
2. **Token Expiration**: Access tokens expire in 15 minutes, refresh tokens in 7 days
3. **Error Messages**: Generic error messages are returned to prevent user enumeration
4. **HTTPS Only**: Always use HTTPS in production
5. **Secure Headers**: Consider adding CORS and other security headers
6. **Secret Management**: Use a .env file or secure vault for JWT_SECRET

---

## File Structure

```
src/modules/auth/
├── auth.controller.ts
├── auth.service.ts
├── auth.module.ts
├── constants/
│   └── jwt.constants.ts
├── decorators/
│   └── current-user.decorator.ts
├── dto/
│   ├── register.dto.ts
│   ├── login.dto.ts
│   └── refresh-token.dto.ts
├── guards/
│   ├── jwt-auth.guard.ts
│   └── optional-jwt-auth.guard.ts
└── strategies/
    └── jwt.strategy.ts
```

---

## Testing

### Register User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "name": "Test User"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }'
```

### Access Protected Route
```bash
curl -X GET http://localhost:3000/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Refresh Token
```bash
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```
