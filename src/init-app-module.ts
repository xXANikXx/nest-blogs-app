import { DynamicModule } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CoreConfig } from './core/core.config';
import { InitConfigModule } from './init-config.module';

export async function initAppModule(): Promise<DynamicModule> {
  // контекст поднимает ИСКЛЮЧИТЕЛЬНО чтение и валидацию .env файлов.
  // Никакого двойного коннекта к базе данных и сканирования контроллеров!
  const appContext =
    await NestFactory.createApplicationContext(InitConfigModule);

  // Достаем уже провалидированный объект конфигурации
  const coreConfig = appContext.get<CoreConfig>(CoreConfig);
  // Закрываем этот мини-контекст. Он отработал за долю секунды
  await appContext.close();
  // Передаем чистый конфиг в главный модуль
  return AppModule.forRoot(coreConfig);
}
