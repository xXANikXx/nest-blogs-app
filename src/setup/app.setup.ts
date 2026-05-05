import { INestApplication } from '@nestjs/common';
import { swaggerSetup } from './swagger.setup';
import { pipesSetup } from './pipes.setup';

export function appSetup(app: INestApplication) {
  pipesSetup(app);
  // globalPrefixSetup(app);
  swaggerSetup(app);
  // app.useGlobalFilters(
  //   new AllHttpExceptionsFilter(),
  //   new HttpExceptionFilter(),
  //   new DomainHttpExceptionsFilter(),
  // );
}
