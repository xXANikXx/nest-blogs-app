import { Injectable } from '@nestjs/common';
import { BcryptService } from '../../../../core/adapters/bcrypt.service';
import { InjectModel } from '@nestjs/mongoose';
import {
  User,
  UserDocument,
  type UserModelType,
} from '../../domain/user.entity';
import { CreateUserInputDto } from '../../api/input-dto/users.input-dto';

@Injectable()
export class UserFactory {
  constructor(
    private readonly bcryptService: BcryptService,
    @InjectModel(User.name) private readonly UserModel: UserModelType,
  ) {}

  async createByAdmin(dto: CreateUserInputDto): Promise<UserDocument> {
    const passwordHash = await this.createPasswordHash(dto.password);
    return this.UserModel.createdByAdmin({
      login: dto.login,
      email: dto.email,
      passwordHash,
    });
  }

  async createByRegistration(dto: CreateUserInputDto): Promise<UserDocument> {
    const passwordHash = await this.createPasswordHash(dto.password);
    return this.UserModel.createUserByRegistration({
      login: dto.login,
      email: dto.email,
      passwordHash,
    });
  }

  private async createPasswordHash(password: string): Promise<string> {
    return this.bcryptService.generateHash(password);
  }
}
