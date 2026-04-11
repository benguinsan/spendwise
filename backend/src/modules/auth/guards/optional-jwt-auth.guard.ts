import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest(
    err: unknown,
    user: unknown,
    _info: unknown,
    _context: ExecutionContext,
  ): any {
    // Allow request to proceed even if JWT validation fails
    return user || null;
  }
}
