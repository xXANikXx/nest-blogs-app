import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../core/object-result/result.entity';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { domainExceptionCodeToResultStatus } from '../../../../../core/object-result/domain-exception-code.mapper';

export class ConfirmEmailCommand {
  constructor(public readonly code: string) {}
}

@CommandHandler(ConfirmEmailCommand)
export class ConfirmEmailUseCase implements ICommandHandler<
  ConfirmEmailCommand,
  Result
> {
  constructor(private usersRepository: UsersRepository) {}

  async execute(command: ConfirmEmailCommand): Promise<Result> {
    const user = await this.usersRepository.findByConfirmationCode(
      command.code,
    );
    if (!user) return Result.badRequest('Invalid confirmation code', 'code');

    try {
      user.confirmEmail(command.code);
    } catch (e) {
      if (e instanceof DomainException) {
        return Result.fail(
          domainExceptionCodeToResultStatus(e.code),
          e.message,
          'code',
        );
      }
      throw e;
    }

    await this.usersRepository.save(user);
    return Result.success();
  }
}
