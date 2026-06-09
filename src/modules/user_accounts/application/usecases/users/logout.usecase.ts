import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../core/object-result/result.entity';
import { SessionsRepository } from '../../../infrastructure/sessions.repository';

export class LogoutCommand {
  constructor(public readonly deviceId: string) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand, Result> {
  constructor(private sessionsRepository: SessionsRepository) {}

  async execute(command: LogoutCommand): Promise<Result> {
    const session = await this.sessionsRepository.findByDeviceId(
      command.deviceId,
    );
    if (!session) return Result.notFound('Session not found');

    await this.sessionsRepository.deleteByDeviceId(command.deviceId);
    return Result.success();
  }
}
