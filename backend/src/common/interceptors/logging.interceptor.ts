import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface HttpRequest {
  method: string;
  url: string;
}

interface HttpResponse {
  statusCode: number;
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: unknown): Observable<unknown> {
    const request = context.switchToHttp().getRequest<HttpRequest>();
    const { method, url } = request;
    const startTime = Date.now();

    return (next as { handle(): Observable<unknown> }).handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        const response = context.switchToHttp().getResponse<HttpResponse>();
        this.logger.log(
          `${method} ${url} - ${response.statusCode} - ${duration}ms`,
        );
      }),
    );
  }
}
