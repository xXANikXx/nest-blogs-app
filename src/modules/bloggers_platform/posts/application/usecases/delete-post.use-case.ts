import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../core/object-result/result.entity';
import { PostsRepository } from '../../infrastructure/posts.repository';

export class DeletePostCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeletePostCommand)
export class DeletePostUseCase implements ICommandHandler<DeletePostCommand> {
  constructor(private postsRepository: PostsRepository) {}

  async execute(command: DeletePostCommand): Promise<Result> {
    const { id } = command;
    const post = await this.postsRepository.findById(id);

    if (!post) {
      return Result.notFound('Post not found');
    }

    await this.postsRepository.delete(post);
    return Result.success();
  }
}
