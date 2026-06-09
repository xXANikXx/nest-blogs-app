import { Injectable } from '@nestjs/common';
import { IsNotEmpty } from 'class-validator';
import { ConfigService } from '@nestjs/config';
import { configValidationUtility } from '../../../setup/config-validation.utility';

@Injectable()
export class UserAccountsConfig {
  @IsNotEmpty({ message: 'Set Env variable ACCESS_TOKEN_EXPIRE_IN' })
  readonly accessTokenExpireIn: string;

  @IsNotEmpty({ message: 'Set Env variable REFRESH_TOKEN_EXPIRE_IN' })
  readonly refreshTokenExpireIn: string;

  @IsNotEmpty({ message: 'Set Env variable REFRESH_TOKEN_SECRET' })
  readonly refreshTokenSecret: string;

  @IsNotEmpty({ message: 'Set Env variable ACCESS_TOKEN_SECRET' })
  readonly accessTokenSecret: string;

  constructor(private configService: ConfigService<any, true>) {
    this.accessTokenExpireIn = this.configService.get('ACCESS_TOKEN_EXPIRE_IN');
    this.refreshTokenExpireIn = this.configService.get(
      'REFRESH_TOKEN_EXPIRE_IN',
    );
    this.refreshTokenSecret = this.configService.get('REFRESH_TOKEN_SECRET');
    this.accessTokenSecret = this.configService.get('ACCESS_TOKEN_SECRET');

    configValidationUtility.validateConfig(this);
  }
}
