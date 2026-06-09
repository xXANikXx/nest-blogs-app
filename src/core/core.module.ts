import { DynamicModule, Global, Module } from '@nestjs/common';
import { BcryptService } from './adapters/bcrypt.service';
import { CqrsModule } from '@nestjs/cqrs';
import { CoreConfig } from './core.config';

//глобальный модуль для провайдеров и модулей необходимых во всех частях приложения (например LoggerService, CqrsModule, etc...)
@Global()
@Module({
  imports: [CqrsModule],
  providers: [BcryptService],
  exports: [BcryptService, CqrsModule], // ← экспортируем чтобы другие модули видели
})
export class CoreModule {
  // Мы используем динамический паттерн forRoot(coreConfig), чтобы передать в систему
  //    ИМЕННО ТОТ экземпляр конфигурации, который уже был создан и провалидирован
  //    на этапе "разведки" в initAppModule.
  //    Если бы мы просто указали [CoreConfig] в обычном массиве providers, NestJS проигнорировал бы
  //    наш готовый объект и создал бы через "new" второй (дублирующий) экземпляр конфига.
  static forRoot(coreConfig: CoreConfig): DynamicModule {
    return {
      module: CoreModule,
      providers: [
        {
          provide: CoreConfig,
          useValue: coreConfig, // Регистрируем готовый инстанс в DI
        },
      ],
      exports: [CoreConfig], // Магически раздаем его всему приложению
    };
  }
}
