import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { UserModelType } from '../../domain/user.entity';
import { User } from '../../domain/user.entity';

@Injectable()
export class UsersExternalQueryRepository {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  // методы добавим когда понадобятся blogs, posts и т.д.
}
