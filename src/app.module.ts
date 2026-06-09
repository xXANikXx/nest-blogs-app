import { configModule } from './config-dynamic-module';

import { DynamicModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './modules/user_accounts/user-accounts.module';
import { BloggerPlatformModule } from './modules/bloggers_platform/bloggers-platform.module';
import { TestingModule } from './modules/testing/testing.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER } from '@nestjs/core';
import { AllHttpExceptionsFilter } from './core/exceptions/filters/all-exception.filter';
import { HttpExceptionFilter } from './core/exceptions/filters/httpexception.filter';
import { DomainHttpExceptionsFilter } from './core/exceptions/filters/domain-exception.filter';
import { CoreConfig } from './core/core.config';
import { CoreModule } from './core/core.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 5,
      },
    ]),
    MongooseModule.forRootAsync({
      useFactory: (coreConfig: CoreConfig) => {
        const uri = coreConfig.mongoURI;
        console.log('MONGO_URL', uri);

        return {
          uri: uri,
        };
      },
      inject: [CoreConfig],
    }),
    UserAccountsModule,
    BloggerPlatformModule,
    configModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // NestJS применяет в обратном порядке регистрации:
    // 1. DomainHttpExceptionsFilter  — ловит DomainException
    // 2. HttpExceptionFilter         — ловит HttpException
    // 3. AllHttpExceptionsFilter     — ловит всё остальное → 500
    {
      provide: APP_FILTER,
      useClass: AllHttpExceptionsFilter, // регистрируем первым → сработает последним
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter, // регистрируем вторым → сработает вторым
    },
    {
      provide: APP_FILTER,
      useClass: DomainHttpExceptionsFilter, // регистрируем последним → сработает первым
    },
  ],
})
export class AppModule {
  // Мы используем статический метод forRoot(coreConfig) по двум важным причинам:
  //
  // 1. Обход ограничений TypeScript: Переменная "coreConfig" (содержащая настройки .env) физически
  //    не существует вверху файла в момент выполнения декоратора @Module. Она доступна только здесь,
  //    как аргумент метода. Поэтому мы передаем её в CoreModule.forRoot(coreConfig) именно тут.
  //
  // 2. Динамическое управление архитектурой: Только здесь, зная значение coreConfig.includeTestingModule,
  //    мы можем безопасно решить — подмешивать ли TestingModule в рантайм приложения (для тестов)
  //    или полностью скрыть его (для продакшена), чтобы исключить утечку опасных эндпоинтов.
  static forRoot(coreConfig: CoreConfig): DynamicModule {
    // такой мудрёный способ мы используем, чтобы добавить к основным модулям необязательный модуль.
    // чтобы не обращаться в декораторе к переменной окружения через process.env в декораторе, потому что
    // запуск декораторов происходит на этапе склейки всех модулей до старта жизненного цикла самого NestJS

    return {
      module: AppModule,
      imports: [
        CoreModule.forRoot(coreConfig), // Передаем управление конфигом внутрь родного CoreModule
        ...(coreConfig.includeTestingModule ? [TestingModule] : []),
      ], // Add dynamic modules here
      providers: [{ provide: CoreConfig, useValue: coreConfig }],
      // Обязательно экспортируем их, чтобы MongooseModule и другие модули могли их импортировать через inject
      exports: [CoreConfig],
    };
  }
}
