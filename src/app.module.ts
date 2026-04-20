import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './modules/user_accounts/user-accounts.module';
import { BloggerPlatformModule } from './modules/bloggers_platform/bloggers-platform.module';
import { CoreModule } from './core/core.module';
import { TestingModule } from './modules/testing/testing.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      'mongodb+srv://admin:nik7@cluster0.rh4d0no.mongodb.net/blogspostsapp?retryWrites=true&w=majority',
    ), //TODO: move to env. will be in the following lessons
    CoreModule,
    UserAccountsModule,
    BloggerPlatformModule,
    TestingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
