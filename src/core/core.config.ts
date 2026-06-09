import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { configValidationUtility } from '../setup/config-validation.utility';

export enum Environments {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TESTING = 'testing',
}

@Injectable()
export class CoreConfig {
  @IsNumber({}, { message: 'Set Env variable PORT, example: 3000' })
  readonly port: number;

  @IsNotEmpty({ message: 'Set Env variable MONGO_URI' })
  readonly mongoURI: string;

  @IsEnum(Environments, {
    message:
      'Set correct NODE_ENV value, available values: ' +
      configValidationUtility.getEnumValues(Environments).join(', '),
  })
  readonly env: string;

  @IsBoolean({ message: 'Set Env variable IS_SWAGGER_ENABLED (true/false)' })
  readonly isSwaggerEnabled: boolean;

  @IsBoolean({
    message: 'Set Env variable INCLUDE_TESTING_MODULE (true/false)',
  })
  readonly includeTestingModule: boolean;

  @IsBoolean({
    message: 'Set Env variable SEND_INTERNAL_SERVER_ERROR_DETAILS (true/false)',
  })
  readonly sendInternalServerErrorDetails: boolean;

  constructor(private configService: ConfigService<any, true>) {
    this.port = Number(this.configService.get('PORT'));
    this.mongoURI =
      this.configService.get('MONGO_URI') ||
      this.configService.get('MONGO_URI'); //
    this.env =
      this.configService.get('NODE_ENV') ??
      process.env.NODE_ENV ??
      'development';
    this.isSwaggerEnabled =
      configValidationUtility.convertToBoolean(
        this.configService.get('IS_SWAGGER_ENABLED'),
      ) ?? false;

    this.includeTestingModule =
      configValidationUtility.convertToBoolean(
        this.configService.get('INCLUDE_TESTING_MODULE'),
      ) ?? false;

    this.sendInternalServerErrorDetails =
      configValidationUtility.convertToBoolean(
        this.configService.get('SEND_INTERNAL_SERVER_ERROR_DETAILS'),
      ) ?? false;

    configValidationUtility.validateConfig(this);
  }
}
