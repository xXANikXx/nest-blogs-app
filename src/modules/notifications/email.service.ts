import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private mailerService: MailerService) {}

  async sendConfirmationEmail(email: string, code: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Registration confirmation',
      html: `<p>Confirm registration via link: <a href="https://some.com?code=${code}">confirm</a></p>`,
    });
  }

  async sendPasswordRecoveryEmail(email: string, code: string): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Password recovery',
      html: `<p>Recovery password via link: <a href="https://some.com?recoveryCode=${code}">recover</a></p>`,
    });
  }
}
