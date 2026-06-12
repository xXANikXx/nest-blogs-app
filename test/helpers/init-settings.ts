import { CoreConfig } from '../../src/core/core.config';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { EmailService } from '../../src/modules/notifications/email.service';
import { EmailServiceMock } from '../mock/email-service.mock';
import { appSetup } from '../../src/setup/app.setup';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import { deleteAllData } from './delete-all-data';
import { BlogsTestManager } from './blogs-test-manager';
import { PostsTestManager } from './posts-test-manager';
import { AuthTestManager } from './auth-test-manager';
import { CommentsTestManager } from './comments-auth-manager';
import { UsersTestManager } from './users-test-manager';
import { InitConfigModule } from '../../src/init-config.module';
import { NestFactory } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

export const initSettings = async (
  //передаем callback, который получает ModuleBuilder, если хотим изменить настройку тестового модуля
  addSettingsToModuleBuilder?: (moduleBuilder: TestingModuleBuilder) => void,
) => {
  process.env.NODE_ENV = 'testing';

  // 1. Сначала получаем конфиг как в реальном приложении
  const appContext =
    await NestFactory.createApplicationContext(InitConfigModule);
  const coreConfig = appContext.get<CoreConfig>(CoreConfig);
  await appContext.close();

  // 2. Создаем тестовый модуль на основе AppModule.forRoot(coreConfig)
  const testingModuleBuilder: TestingModuleBuilder = Test.createTestingModule({
    imports: [AppModule.forRoot(coreConfig)],
  })
    .overrideProvider(EmailService)
    .useClass(EmailServiceMock)
    .overrideGuard(ThrottlerGuard)
    .useValue({ canActivate: () => true });

  if (addSettingsToModuleBuilder) {
    addSettingsToModuleBuilder(testingModuleBuilder);
  }

  const testingAppModule = await testingModuleBuilder.compile();

  const app = testingAppModule.createNestApplication();
  appSetup(app, coreConfig.isSwaggerEnabled);
  await app.init();

  const databaseConnection = app.get<Connection>(getConnectionToken());
  const postsTestManager = new PostsTestManager(app);
  const commentsTestManager = new CommentsTestManager(app);
  const usersTestManager = new UsersTestManager(app);
  const authTestManager = new AuthTestManager(app, usersTestManager);
  const blogsTestManager = new BlogsTestManager(app, postsTestManager);

  await deleteAllData(app);

  return {
    app,
    databaseConnection,
    usersTestManager,
    blogsTestManager,
    postsTestManager,
    authTestManager,
    commentsTestManager,
  };
};
