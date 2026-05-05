import { INestApplication } from '@nestjs/common';
import { swaggerSetup } from './swagger.setup';
import { pipesSetup } from './pipes.setup';
import { DomainHttpExceptionsFilter } from '../core/exceptions/filters/domain-exception.filter';
import { AllHttpExceptionsFilter } from '../core/exceptions/filters/all-exception.filter';
import { HttpExceptionFilter } from '../core/exceptions/filters/httpexception.filter';

export function appSetup(app: INestApplication) {
  pipesSetup(app);
  // globalPrefixSetup(app);
  swaggerSetup(app);
  app.useGlobalFilters(
    new AllHttpExceptionsFilter(),
    new HttpExceptionFilter(),
    new DomainHttpExceptionsFilter(),
  );
}
