import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ExtensionType } from '../../object-result/result.entity';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const exceptionResponse = exception.getResponse();

    // если ответ содержит errorsMessages — возвращаем только его
    if (
      typeof exceptionResponse === 'object' &&
      'errorsMessages' in exceptionResponse
    ) {
      const { errorsMessages } = exceptionResponse as {
        errorsMessages: ExtensionType[];
      };
      response.status(exception.getStatus()).json({ errorsMessages });
      return;
    }

    response.status(exception.getStatus()).json(exceptionResponse);
  }
}
