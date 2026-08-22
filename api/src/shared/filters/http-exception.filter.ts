import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  Inject,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { appConfig, type AppConfig } from '../../config/app.config';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: AppConfig,
  ) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;
    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const isDev = this.appConfiguration.nodeEnv !== 'production';

    const errorResponse: Record<string, unknown> = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: message,
    };

    if (isDev) {
      if (exception instanceof Error) {
        errorResponse.stack = exception.stack;
        if (!(exception instanceof HttpException)) {
          errorResponse.details = exception.message;
        }
      } else if (exception) {
        errorResponse.details = exception;
      }
    }

    response.status(status).json(errorResponse);
  }
}
