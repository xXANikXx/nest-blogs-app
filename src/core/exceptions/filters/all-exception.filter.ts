import { DomainExceptionCode } from '../domain-exception-codes';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseBody } from '../error-response-body.type';

@Catch()
export class AllHttpExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): void {
    //ctx нужен, чтобы получить request и response (express). Это из документации, делаем по аналогии
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    console.error('AllHttpExceptionsFilter caught:', exception);
    //Если сработал этот фильтр, то пользователю улетит 500я ошибка
    const message =
      exception instanceof Error
        ? exception.message
        : 'Unknown exception occurred.';

    const responseBody = this.buildResponseBody(request.url, message);

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(responseBody);
  }

  private buildResponseBody(
    requestUrl: string,
    message: string,
  ): ErrorResponseBody {
    //TODO: Replace with getter from configService. will be in the following lessons
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      return {
        timestamp: new Date().toISOString(),
        path: null,
        message: 'Some error occurred',
        errorsMessages: [],
        code: DomainExceptionCode.InternalServerError,
      };
    }

    return {
      timestamp: new Date().toISOString(),
      path: requestUrl,
      message,
      errorsMessages: [],
      code: DomainExceptionCode.InternalServerError,
    };
  }
}
