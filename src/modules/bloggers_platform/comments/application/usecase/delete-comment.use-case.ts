import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../core/object-result/result.entity';
import { CommentsRepository } from '../../infrastructure/comments.repository';

export class DeleteCommentCommand {
  constructor(
    public readonly commentId: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(DeleteCommentCommand)
export class DeleteCommentUseCase implements ICommandHandler<
  DeleteCommentCommand,
  Result
> {
  constructor(private readonly commentsRepository: CommentsRepository) {}

  async execute(command: DeleteCommentCommand): Promise<Result> {
    const comment = await this.commentsRepository.findById(command.commentId);

    if (!comment) {
      return Result.notFound('Comment not found');
    }

    comment.makeDeleted(command.userId);
    await this.commentsRepository.save(comment);
    return Result.success();
  }
}
