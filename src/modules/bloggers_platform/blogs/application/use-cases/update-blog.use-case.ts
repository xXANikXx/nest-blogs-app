import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../core/object-result/result.entity';
import { BlogsRepository } from '../../infrastructure/blogs.repository';

export interface UpdateBlogData {
  name: string;
  description: string;
  websiteUrl: string;
}

export class UpdateBlogCommand {
  constructor(
    public readonly id: string,
    public readonly data: UpdateBlogData,
  ) {}
}

@CommandHandler(UpdateBlogCommand)
export class UpdateBlogUseCase implements ICommandHandler<UpdateBlogCommand> {
  constructor(private blogsRepository: BlogsRepository) {}

  async execute(command: UpdateBlogCommand): Promise<Result> {
    const { id, data } = command;
    const blog = await this.blogsRepository.findById(id);

    if (!blog) {
      return Result.notFound('Blog not found');
    }

    blog.updateBlog(data.name, data.description, data.websiteUrl);
    await this.blogsRepository.save(blog);

    return Result.success();
  }
}
