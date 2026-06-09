import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../core/object-result/result.entity';
import { SessionsRepository } from '../../../infrastructure/sessions.repository';
import { ResultStatus } from '../../../../../core/object-result/resultCode';

export class DeleteSessionCommand {
  constructor(
    public readonly userId: string,
    public readonly deviceId: string,
  ) {}
}

@CommandHandler(DeleteSessionCommand)
export class DeleteSessionUseCase implements ICommandHandler<
  DeleteSessionCommand,
  Result
> {
  constructor(private sessionsRepository: SessionsRepository) {}

  async execute(command: DeleteSessionCommand): Promise<Result> {
    const session = await this.sessionsRepository.findByDeviceId(
      command.deviceId,
    );
    if (!session) return Result.notFound('Session not found');

    if (session.userId !== command.userId) {
      return Result.fail(ResultStatus.Forbidden, 'Forbidden');
    }

    await this.sessionsRepository.deleteByDeviceId(command.deviceId);
    return Result.success();
  }
}
