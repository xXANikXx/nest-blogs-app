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

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersQueryService,
    UsersRepository,
    UsersQueryRepository,
    UsersExternalQueryRepository,
    UsersExternalRepository,
    UsersExternalService,
  ],
  exports: [
    UsersExternalQueryRepository,
    UsersExternalService,
    UsersExternalRepository,
  ],
})
export class UserAccountsModule {}
