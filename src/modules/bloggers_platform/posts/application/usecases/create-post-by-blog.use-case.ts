import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostViewDto } from '../../api/view-dto/post.view-dto';
import { Result } from '../../../../../core/object-result/result.entity';
import { Post, type PostModelType } from '../../domain/post.entity';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsExternalQueryRepository } from '../../../blogs/infrastructure/external-query/external-dto/blogs.external-query.repository';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePostDomainDto } from '../../domain/dto/create-post.domain.dto';

export interface CreatePostByBlogData {
  title: string;
  shortDescription: string;
  content: string;
}

export class CreatePostByBlogCommand {
  constructor(
    public readonly blogId: string,
    public readonly data: CreatePostByBlogData,
  ) {}
}

@CommandHandler(CreatePostByBlogCommand)
export class CreatePostByBlogUseCase implements ICommandHandler<CreatePostByBlogCommand> {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    private postsRepository: PostsRepository,
    private blogsExternalQueryRepository: BlogsExternalQueryRepository,
  ) {}

  async execute(
    command: CreatePostByBlogCommand,
  ): Promise<Result<PostViewDto>> {
    const { blogId, data } = command;
    const blog = await this.blogsExternalQueryRepository.findById(blogId);

    if (!blog) {
      return Result.notFound('Blog not found');
    }

    const domainDto: CreatePostDomainDto = {
      title: data.title,
      shortDescription: data.shortDescription,
      content: data.content,
      blogId: blogId,
      blogName: blog.name,
    };

    const newPost = this.PostModel.createPost(domainDto);
    await this.postsRepository.save(newPost);
    return Result.success(PostViewDto.mapToView(newPost));
  }
}
