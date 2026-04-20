import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, type UserModelType } from '../domain/user.entity';

@Injectable()
export class UsersExternalService {
  constructor(@InjectModel(User.name) private UserModel: UserModelType) {}

  // методы добавим когда понадобятся blogs, posts и т.д.
}
