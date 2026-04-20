import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/users.repository';
import { Result } from '../../../core/object-result/result.entity';
import { UserViewDto } from '../api/view-dto/user.view-dto';
import { CreateUserDomainDto } from '../domain/dto/create-user.domain.dto';
import { User, type UserModelType } from '../domain/user.entity';
import { CreateUserInputDto } from '../api/input-dto/users.input-dto';
import { BcryptService } from '../../../core/adapters/bcrypt.service';
import { InjectModel } from '@nestjs/mongoose';
import { DomainException } from '../../../core/exceptions/domain-exception';

@Injectable()
export class UsersService {
  constructor(
    private usersRepository: UsersRepository,
    private bcryptService: BcryptService,
    @InjectModel(User.name) private UserModel: UserModelType,
  ) {}

  async findById(id: string): Promise<Result<UserViewDto>> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      return Result.notFound('User not found');
    }

    return Result.success(UserViewDto.mapToView(user));
  }

  async createdByAdmin(dto: CreateUserInputDto): Promise<Result<UserViewDto>> {
    const existingByEmail = await this.usersRepository.findByEmail(dto.email);
    if (existingByEmail) {
      return Result.badRequest('Email already exists', 'email');
    }

    const existingByLogin = await this.usersRepository.findByLogin(dto.login);
    if (existingByLogin) {
      return Result.badRequest('Login already exists', 'login');
    }

    const passwordHash = await this.bcryptService.generateHash(dto.password);

    const domainDto: CreateUserDomainDto = {
      login: dto.login,
      email: dto.email,
      passwordHash,
    };

    const newUser = this.UserModel.createdByAdmin(domainDto);

    await this.usersRepository.save(newUser);

    return Result.success(UserViewDto.mapToView(newUser));
  }

  async deleteUser(id: string): Promise<Result> {
    const user = await this.usersRepository.findById(id); // ← ищем по id здесь

    if (!user) {
      return Result.notFound('User not found');
    }

    try {
      await this.usersRepository.delete(user);
    } catch (e) {
      if (e instanceof DomainException) {
        return Result.fail(e.status, e.message);
      }
      throw e;
    }
    return Result.success();
  }
}
