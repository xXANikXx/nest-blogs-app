import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../core/object-result/result.entity';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export class DeleteBlogCommand {
  constructor(public readonly id: string) {}
}

@CommandHandler(DeleteBlogCommand)
export class DeleteBlogUseCase implements ICommandHandler<DeleteBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute(command: DeleteBlogCommand): Promise<Result> {
    const { id } = command;
    const blog = await this.blogsRepository.findById(id);

    if (!blog) {
      return Result.notFound('Blog not found');
    }

    await this.blogsRepository.delete(blog);

    return Result.success();
  }
}
