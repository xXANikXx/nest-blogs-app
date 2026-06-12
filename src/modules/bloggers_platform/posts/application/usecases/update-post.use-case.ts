import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../core/object-result/result.entity';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsExternalQueryRepository } from '../../../blogs/infrastructure/external-query/external-dto/blogs.external-query.repository';

export interface UpdatePostData {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}

export class UpdatePostCommand {
  constructor(
    public readonly id: string,
    public readonly data: UpdatePostData,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(
    private postsRepository: PostsRepository,
    private blogsExternalQueryRepository: BlogsExternalQueryRepository,
  ) {}

  async execute(command: UpdatePostCommand): Promise<Result> {
    const { id, data } = command;
    const post = await this.postsRepository.findById(id);

    if (!post) {
      return Result.notFound('Post not found');
    }

    const blog = await this.blogsExternalQueryRepository.findById(data.blogId);
    if (!blog) {
      return Result.notFound('Blog not found');
    }

    post.updatePost(
      data.title,
      data.shortDescription,
      data.content,
      data.blogId,
      blog.name,
    );
    await this.postsRepository.save(post);

    return Result.success();
  }
}
