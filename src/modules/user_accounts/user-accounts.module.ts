import { UsersQueryService } from './application/users.query.service';
import { UsersRepository } from './infrastructure/users.repository';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './domain/user.entity';
import { UsersController } from './api/users.controller';
import { UsersQueryRepository } from './infrastructure/query/users.query-repository';
import { UsersExternalQueryRepository } from './infrastructure/external-query/users.external-query.repository';
import { UsersService } from './application/users.service';
import { UsersExternalService } from './application/users.external-service';
import { UsersExternalRepository } from './infrastructure/external-query/users.external-repository';
import { AuthQueryRepository } from './infrastructure/query/auth.query-repository';
import { AuthService } from './application/auth.service';
import { AuthController } from './api/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './guards/bearer/jwt.strategy';
import { LocalStrategy } from './guards/local/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: 'access-token-secret', //TODO: move to env. will be in the following lessons
      signOptions: { expiresIn: '60m' },
    }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    NotificationsModule,
  ],
  controllers: [UsersController, AuthController],
  providers: [
    UsersService,
    UsersQueryService,
    UsersRepository,
    UsersQueryRepository,
    UsersExternalQueryRepository,
    UsersExternalRepository,
    UsersExternalService,
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
  ],
})
export class UserAccountsModule {}
