import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../core/object-result/result.entity';
import { UsersRepository } from '../../../infrastructure/users.repository';

export class DeleteUserCommand {
  constructor(public readonly userId: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<
  DeleteUserCommand,
  Result
> {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(command: DeleteUserCommand): Promise<Result> {
    const user = await this.usersRepository.findById(command.userId);
    if (!user) return Result.notFound('User not found');

    user.makeDeleted();
    await this.usersRepository.save(user);

    return Result.success();
  }
}
