/* eslint-disable @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-member-access */
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

function formatCause(cause: unknown): string {
  if (cause == null) {
    return '';
  }
  if (cause instanceof Error) {
    return `${cause.name}: ${cause.message}`;
  }
  try {
    return JSON.stringify(cause);
  } catch {
    return String(cause);
  }
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private logger = new Logger('HttpException');

  private logServerError(exception: unknown, request: { method: string; url: string }) {
    const route = `${request.method} ${request.url}`;

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      this.logger.error(
        `[Prisma KnownRequest] ${route} code=${exception.code} message=${exception.message} meta=${JSON.stringify(exception.meta)} cause=${formatCause(exception.cause)}`,
        exception.stack,
      );
      return;
    }

    if (exception instanceof Prisma.PrismaClientUnknownRequestError) {
      this.logger.error(
        `[Prisma UnknownRequest] ${route} message=${exception.message} cause=${formatCause(exception.cause)}`,
        exception.stack,
      );
      return;
    }

    if (exception instanceof Prisma.PrismaClientInitializationError) {
      this.logger.error(
        `[Prisma Init] ${route} errorCode=${exception.errorCode} message=${exception.message} cause=${formatCause(exception.cause)}`,
        exception.stack,
      );
      return;
    }

    if (exception instanceof Prisma.PrismaClientValidationError) {
      this.logger.error(
        `[Prisma Validation] ${route} message=${exception.message}`,
        exception.stack,
      );
      return;
    }

    if (exception instanceof Error) {
      this.logger.error(
        `Unhandled error: ${route} message=${exception.message} cause=${formatCause(exception.cause)}`,
        exception.stack,
      );
      return;
    }

    this.logger.error(`Unhandled non-Error: ${route}`, String(exception));
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = 500;
    let message = 'Internal server error';
    let errors = undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || exception.message;
        errors = (exceptionResponse as any).error;
      } else {
        message = exceptionResponse;
      }
      if (status >= 500) {
        this.logServerError(exception, request);
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logServerError(exception, request);
    }

    // Log validation errors safely
    if (exception instanceof BadRequestException) {
      this.logger.warn(
        `Validation failed for ${request.method} ${request.url}`,
      );
    }

    const responseBody: any = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (errors) {
      responseBody.errors = errors;
    }

    response.status(status).json(responseBody);
  }
}
