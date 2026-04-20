import { INestApplication } from '@nestjs/common';
import { swaggerSetup } from './swagger.setup';
import { pipesSetup } from './pipes.setup';
import { GlobalExceptionFilter } from '../core/exception-filters/global-exception.filter';

export function appSetup(app: INestApplication) {
  pipesSetup(app);
  // globalPrefixSetup(app);
  swaggerSetup(app);
  app.useGlobalFilters(new GlobalExceptionFilter());
}
