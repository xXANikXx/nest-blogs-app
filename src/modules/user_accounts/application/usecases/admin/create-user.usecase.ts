import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserInputDto } from '../../../api/input-dto/users.input-dto';
import { Result } from '../../../../../core/object-result/result.entity';
import { UserViewDto } from '../../../api/view-dto/user.view-dto';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { UserFactory } from '../../factories/user.factory';

export class CreateUserCommand {
  constructor(public readonly dto: CreateUserInputDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<
  CreateUserCommand,
  Result<UserViewDto>
> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly userFactory: UserFactory,
  ) {}

  async execute(command: CreateUserCommand): Promise<Result<UserViewDto>> {
    const existingByEmail = await this.usersRepository.findByEmail(
      command.dto.email,
    );
    if (existingByEmail) {
      return Result.badRequest('Email already exists', 'email');
    }

    const existingByLogin = await this.usersRepository.findByLogin(
      command.dto.login,
    );
    if (existingByLogin) {
      return Result.badRequest('Login already exists', 'login');
    }

    const user = await this.userFactory.createByAdmin(command.dto);
    await this.usersRepository.save(user);

    return Result.success(UserViewDto.mapToView(user));
  }
}
