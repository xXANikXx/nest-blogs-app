import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../core/object-result/result.entity';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { domainExceptionCodeToResultStatus } from '../../../../../core/object-result/domain-exception-code.mapper';
import { UserRegisteredEvent } from '../../../domain/events/user-registered.event';

export class ResendConfirmationCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(ResendConfirmationCommand)
export class ResendConfirmationUseCase implements ICommandHandler<
  ResendConfirmationCommand,
  Result
> {
  constructor(
    private usersRepository: UsersRepository,
    private eventBus: EventBus,
  ) {}

  async execute(command: ResendConfirmationCommand): Promise<Result> {
    const user = await this.usersRepository.findByEmail(command.email);
    if (!user) return Result.badRequest('User not found', 'email');

    try {
      user.updateConfirmationCode();
    } catch (e) {
      if (e instanceof DomainException) {
        return Result.fail(
          domainExceptionCodeToResultStatus(e.code),
          e.message,
          'email',
        );
      }
      throw e;
    }

    await this.usersRepository.save(user);

    this.eventBus.publish(
      new UserRegisteredEvent(
        user.email,
        user.emailConfirmation.confirmationCode,
      ),
    );

    return Result.success();
  }
}
