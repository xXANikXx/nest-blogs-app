import { UsersRepository } from './infrastructure/users.repository';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/user.entity';
import { UsersController } from './api/users.controller';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { UsersExternalQueryRepository } from './infrastructure/external-query/users.external-query.repository';
import { UsersExternalService } from './application/users.external-service';
import { UsersExternalRepository } from './infrastructure/external-query/users.external-repository';
import { AuthQueryRepository } from './infrastructure/query/auth.query-repository';
import { AuthService } from './application/services/auth.service';
import { AuthController } from './api/auth.controller';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { LocalStrategy } from './guards/local/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { NotificationsModule } from '../notifications/notifications.module';
import { GetUsersQueryHandler } from './application/queries/get.users.query-handler';
import { LoginUserUseCase } from './application/usecases/users/login-user.usecase';
import { RegisterUserUseCase } from './application/usecases/users/register-user.usecase';
import { ConfirmEmailUseCase } from './application/usecases/users/confirm-email.usecase';
import { ResendConfirmationUseCase } from './application/usecases/users/resend-confirmation.usecase';
import { PasswordRecoveryUseCase } from './application/usecases/users/password-recovery.usecase';
import { UpdatePasswordUseCase } from './application/usecases/users/update-password.usecase';
import { CreateUserUseCase } from './application/usecases/admin/create-user.usecase';
import { DeleteUserUseCase } from './application/usecases/admin/delete-user.usecase';
import {
  ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
  REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
} from './constants/auth-tokens.inject-constants';
import { UserFactory } from './application/factories/user.factory';
import { RefreshTokenUseCase } from './application/usecases/users/refresh-token.usecase';
import { LogoutUseCase } from './application/usecases/users/logout.usecase';
import { DeleteAllSessionsUseCase } from './application/usecases/sessions/delete-all-sessions.usecase';
import { DeleteSessionUseCase } from './application/usecases/sessions/delete-session.usecase';
import { GetDevicesQueryHandler } from './application/queries/get.devices.query-handler';
import { SessionsRepository } from './infrastructure/sessions.repository';
import { RefreshTokenStrategy } from './guards/bearer/refresh-token.strategy';
import { RefreshTokenAuthGuard } from './guards/bearer/refresh-token-auth.guard';
import { Session, SessionSchema } from './domain/session.entity';
import { UserAccountsConfig } from './config/user-accounts.config';
import { StringValue } from 'ms';
import { SecurityDevicesController } from './api/security-devices.controller';

const commandHandlers = [
  LoginUserUseCase,
  RegisterUserUseCase,
  ConfirmEmailUseCase,
  ResendConfirmationUseCase,
  PasswordRecoveryUseCase,
  UpdatePasswordUseCase,
  CreateUserUseCase,
  DeleteUserUseCase,
];

const queryHandlers = [GetUsersQueryHandler];

@Module({
  imports: [
    PassportModule,
    JwtModule,
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      { name: Session.name, schema: SessionSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [UsersController, AuthController, SecurityDevicesController],
  providers: [
    {
      provide: ACCESS_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (userAccountsConfig: UserAccountsConfig) =>
        new JwtService({
          secret: userAccountsConfig.accessTokenSecret,
          signOptions: {
            expiresIn: userAccountsConfig.accessTokenExpireIn as StringValue,
          },
        }),
      inject: [UserAccountsConfig],
    },
    {
      provide: REFRESH_TOKEN_STRATEGY_INJECT_TOKEN,
      useFactory: (userAccountsConfig: UserAccountsConfig) =>
        new JwtService({
          secret: userAccountsConfig.refreshTokenSecret,
          signOptions: {
            expiresIn: userAccountsConfig.refreshTokenExpireIn as StringValue,
          },
        }),
      inject: [UserAccountsConfig],
    },
    RefreshTokenUseCase,
    LogoutUseCase,
    DeleteAllSessionsUseCase,
    DeleteSessionUseCase,
    GetDevicesQueryHandler,
    SessionsRepository,
    RefreshTokenStrategy,
    RefreshTokenAuthGuard,
    ...commandHandlers,
    ...queryHandlers,
    UserFactory,
    UsersRepository,
    UsersQueryRepository,
    UsersExternalQueryRepository,
    UsersExternalRepository,
    UsersExternalService,
    UserAccountsConfig,
    AuthQueryRepository,
    AuthService,
    JwtStrategy,
    LocalStrategy,
  ],
  exports: [
    JwtStrategy,
    UsersExternalQueryRepository,
    UsersExternalService,
    UsersExternalRepository,
    UserAccountsConfig,
  ],
})
export class UserAccountsModule {}
