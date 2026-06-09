import { ConfigService } from '@nestjs/config';

import { NotificationsConfig } from './notifications.config';

import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { SendConfirmationEmailWhenUserRegisteredEventHandler } from './applications/user-registered.event';

@Module({
  imports: [
    MailerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          transport: {
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
              // Достаем переменные напрямую через ConfigService
              user: configService.get<string>('MAIL_USER'),
              pass: configService.get<string>('MAIL_PASS'),
            },
          },
          defaults: {
            from: configService.get<string>('MAIL_FROM'),
          },
        };
      },
    }),
  ],
  providers: [
    EmailService,
    SendConfirmationEmailWhenUserRegisteredEventHandler,
    NotificationsConfig,
  ],
  exports: [EmailService, NotificationsConfig],
})
export class NotificationsModule {}
