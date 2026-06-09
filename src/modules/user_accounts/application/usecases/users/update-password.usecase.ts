import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NewPasswordInputDto } from '../../../api/input-dto/new-password.input-dto';
import { Result } from '../../../../../core/object-result/result.entity';
import { UsersRepository } from '../../../infrastructure/users.repository';
import { BcryptService } from '../../../../../core/adapters/bcrypt.service';
import { DomainException } from '../../../../../core/exceptions/domain-exception';
import { domainExceptionCodeToResultStatus } from '../../../../../core/object-result/domain-exception-code.mapper';

export class UpdatePasswordCommand {
  constructor(public readonly dto: NewPasswordInputDto) {}
}

@CommandHandler(UpdatePasswordCommand)
export class UpdatePasswordUseCase implements ICommandHandler<
  UpdatePasswordCommand,
  Result
> {
  constructor(
    private usersRepository: UsersRepository,
    private bcryptService: BcryptService,
  ) {}

  async execute(command: UpdatePasswordCommand): Promise<Result> {
    const user = await this.usersRepository.findByRecoveryCode(
      command.dto.recoveryCode,
    );
    if (!user) return Result.badRequest('Code is invalid', 'recoveryCode');

    const newPasswordHash = await this.bcryptService.generateHash(
      command.dto.newPassword,
    );

    try {
      user.updatePassword(newPasswordHash, command.dto.recoveryCode);
      await this.usersRepository.save(user);
      return Result.success();
    } catch (e) {
      if (e instanceof DomainException) {
        return Result.fail(
          domainExceptionCodeToResultStatus(e.code),
          e.message,
        );
      }
      throw e;
    }
  }
}
