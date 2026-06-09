import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../core/object-result/result.entity';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { PasswordRecoveryEvent } from '../../../domain/events/password-recovery.event';

export class PasswordRecoveryCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(PasswordRecoveryCommand)
export class PasswordRecoveryUseCase implements ICommandHandler<
  PasswordRecoveryCommand,
  Result
> {
  constructor(
    private usersRepository: UsersRepository,
    private eventBus: EventBus,
  ) {}

  async execute(command: PasswordRecoveryCommand): Promise<Result> {
    const user = await this.usersRepository.findByEmail(command.email);

    if (user) {
      const code = user.generateRecoveryCode();
      await this.usersRepository.save(user);
      this.eventBus.publish(new PasswordRecoveryEvent(user.email, code));
    }

    return Result.success();
  }
}
