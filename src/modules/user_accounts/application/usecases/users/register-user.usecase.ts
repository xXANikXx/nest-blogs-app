import { CreateUserInputDto } from '../../../api/input-dto/users.input-dto';
import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../core/object-result/result.entity';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { UserRegisteredEvent } from '../../../domain/events/user-registered.event';
import { UserFactory } from '../../factories/user.factory';

export class RegisterUserCommand {
  constructor(public readonly dto: CreateUserInputDto) {}
}

@CommandHandler(RegisterUserCommand)
export class RegisterUserUseCase implements ICommandHandler<
  RegisterUserCommand,
  Result
> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly userFactory: UserFactory,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: RegisterUserCommand): Promise<Result> {
    const { login, email } = command.dto;

    // 1. Точечная проверка email
    const existingByEmail = await this.usersRepository.findByEmail(email);
    if (existingByEmail) {
      return Result.badRequest('Email already exists', 'email');
    }

    // 2. Точечная проверка login
    const existingByLogin = await this.usersRepository.findByLogin(login);
    if (existingByLogin) {
      return Result.badRequest('Login already exists', 'login');
    }
    const newUser = await this.userFactory.createByRegistration(command.dto);
    await this.usersRepository.save(newUser);

    // Публикуем событие
    this.eventBus.publish(
      new UserRegisteredEvent(
        newUser.email,
        newUser.emailConfirmation.confirmationCode,
      ),
    );

    return Result.success();
  }
}
