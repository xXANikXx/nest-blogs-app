import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../core/object-result/result.entity';
import { CommentsRepository } from '../../infrastructure/comments.repository';

export class UpdateCommentCommand {
  constructor(
    public readonly commentId: string,
    public readonly content: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(UpdateCommentCommand)
export class UpdateCommentUseCase implements ICommandHandler<
  UpdateCommentCommand,
  Result
> {
  constructor(
    private readonly commentsRepository: CommentsRepository, // Наш глупый репозиторий
  ) {}

  async execute(command: UpdateCommentCommand): Promise<Result> {
    const comment = await this.commentsRepository.findById(command.commentId);

    if (!comment) {
      return Result.notFound('Comment not found');
    }

    comment.updateContent(command.content, command.userId);

    await this.commentsRepository.save(comment);

    return Result.success();
  }
}
