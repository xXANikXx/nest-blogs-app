import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../core/object-result/result.entity';
import { SessionsRepository } from '../../../infrastructure/sessions.repository';

export class DeleteAllSessionsCommand {
  constructor(
    public readonly userId: string,
    public readonly deviceId: string,
  ) {}
}

@CommandHandler(DeleteAllSessionsCommand)
export class DeleteAllSessionsUseCase implements ICommandHandler<
  DeleteAllSessionsCommand,
  Result
> {
  constructor(private sessionsRepository: SessionsRepository) {}

  async execute(command: DeleteAllSessionsCommand): Promise<Result> {
    await this.sessionsRepository.deleteAllExceptCurrent(
      command.userId,
      command.deviceId,
    );
    return Result.success();
  }
}
