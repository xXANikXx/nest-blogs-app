import { Injectable } from '@nestjs/common';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NotificationsConfig {
  @IsEmail({}, { message: 'Set correct MAIL_USER email' })
  readonly mailUser: string;

  @IsNotEmpty({ message: 'Set Env variable MAIL_PASS' })
  readonly mailPass: string;

  @IsNotEmpty({ message: 'Set Env variable MAIL_FROM' })
  readonly mailFrom: string;

  constructor(private configService: ConfigService<any, true>) {
    this.mailUser = this.configService.get('MAIL_USER');
    this.mailPass = this.configService.get('MAIL_PASS');
    this.mailFrom = this.configService.get('MAIL_FROM');
  }
}
