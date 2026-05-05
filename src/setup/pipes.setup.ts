import {
  INestApplication,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { ObjectIdValidationTransformationPipe } from '../core/pipes/Object-Id-Validation-Transformation-Pipe.service';
import {
  DomainException,
  Extension,
} from '../core/exceptions/domain-exception';
import { DomainExceptionCode } from '../core/exceptions/domain-exception-codes';

export const errorFormatter = (
  errors: ValidationError[],
  errorMessage?: Extension[],
): Extension[] => {
  const errorsForResponse: Extension[] = errorMessage || [];

  for (const error of errors) {
    if (!error.constraints && error.children?.length) {
      errorFormatter(error.children, errorsForResponse);
    } else if (error.constraints) {
      const constrainKeys = Object.keys(error.constraints);

      for (const key of constrainKeys) {
        errorsForResponse.push(
          new Extension(
            error.constraints[key]
              ? `${error.constraints[key]}; Received value: ${String(error?.value)}`
              : '',
            error.property,
          ),
        );
      }
    }
  }

  return errorsForResponse;
};

export function pipesSetup(app: INestApplication) {
  //Глобальный пайп для валидации и трансформации входящих данных.
  app.useGlobalPipes(
    new ObjectIdValidationTransformationPipe(),
    new ValidationPipe({
      //class-transformer создает экземпляр dto
      //соответственно применятся значения по-умолчанию
      //и методы классов dto
      transform: true,

      whitelist: true,
      //Выдавать первую ошибку для каждого поля
      stopAtFirstError: true,
      //Для преобразования ошибок класс валидатора в необходимый вид
      exceptionFactory: (errors) => {
        const formattedErrors = errorFormatter(errors);

        throw new DomainException({
          code: DomainExceptionCode.ValidationError,
          message: 'Validation failed',
          extensions: formattedErrors,
        });
      },
    }),
  );
}
