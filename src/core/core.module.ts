import { Global, Module } from '@nestjs/common';
import { BcryptService } from './adapters/bcrypt.service';

//глобальный модуль для провайдеров и модулей необходимых во всех частях приложения (например LoggerService, CqrsModule, etc...)
@Global()
@Module({
  // exports: [GlobalLogerService],
  providers: [BcryptService],
  exports: [BcryptService],
})
export class CoreModule {}
