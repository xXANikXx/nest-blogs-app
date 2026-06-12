import { INestApplication } from '@nestjs/common';
import { swaggerSetup } from './swagger.setup';
import { pipesSetup } from './pipes.setup';
import cookieParser from 'cookie-parser';

export function appSetup(app: INestApplication, isSwaggerEnabled: boolean) {
  app.use(cookieParser());

  pipesSetup(app);
  // globalPrefixSetup(app);
  if (isSwaggerEnabled) {
    swaggerSetup(app);
  }
  // app.useGlobalFilters(
  //   new AllHttpExceptionsFilter(),
  //   new HttpExceptionFilter(),
  //   new DomainHttpExceptionsFilter(),
  // );
}
