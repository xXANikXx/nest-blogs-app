import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ResultStatus } from './resultCode';
import { ExtensionType } from './result.entity';

export const resultCodeToHttpException = (
  status: ResultStatus,
  errorMessage?: string,
  extensions: ExtensionType[] = [],
): HttpException => {
  switch (status) {
    case ResultStatus.BadRequest:
      // Передаем и сообщение, и наши расширения (extensions) для Swagger
      return new BadRequestException({
        message: errorMessage,
        errorsMessages: extensions,
      });
    case ResultStatus.NotFound:
      return new NotFoundException(errorMessage);
    case ResultStatus.Unauthorized:
      return new UnauthorizedException();
    case ResultStatus.Forbidden:
      return new ForbiddenException();
    default:
      return new InternalServerErrorException();
  }
};
