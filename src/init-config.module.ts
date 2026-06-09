import { Module } from '@nestjs/common';
import { configModule } from './config-dynamic-module';
import { CoreConfig } from './core/core.config';
import { UserAccountsConfig } from './modules/user_accounts/config/user-accounts.config';
import { NotificationsConfig } from './modules/notifications/notifications.config';

@Module({
  imports: [configModule],
  providers: [CoreConfig, UserAccountsConfig, NotificationsConfig],
  exports: [CoreConfig, UserAccountsConfig, NotificationsConfig],
})
export class InitConfigModule {}
