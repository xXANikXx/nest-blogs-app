import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { EmailService } from './email.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'annikita.and@gmail.com', //TODO: move to env
          pass: 'tjkp nswx vhzj vwya', //TODO: move to env
        },
      },
      defaults: {
        from: '"Blog App" <annikita.and@gmail.com>',
      },
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class NotificationsModule {}
