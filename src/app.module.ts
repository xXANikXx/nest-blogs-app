import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './modules/user_accounts/user-accounts.module';
import { BloggerPlatformModule } from './modules/bloggers_platform/bloggers-platform.module';
import { CoreModule } from './core/core.module';
import { TestingModule } from './modules/testing/testing.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER } from '@nestjs/core';
import { AllHttpExceptionsFilter } from './core/exceptions/filters/all-exception.filter';
import { HttpExceptionFilter } from './core/exceptions/filters/httpexception.filter';
import { DomainHttpExceptionsFilter } from './core/exceptions/filters/domain-exception.filter';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 10000, // 10 секунд
        limit: 5, // максимум 5 запросов
      },
    ]),
    MongooseModule.forRoot(
      'mongodb+srv://admin:nik7@cluster0.rh4d0no.mongodb.net/blogspostsapp?retryWrites=true&w=majority',
    ), //TODO: move to env. will be in the following lessons
    CoreModule,
    UserAccountsModule,
    BloggerPlatformModule,
    TestingModule,
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
export class AppModule {}
