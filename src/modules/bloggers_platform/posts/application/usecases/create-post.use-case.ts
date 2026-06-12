import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostViewDto } from '../../api/view-dto/post.view-dto';
import { Result } from '../../../../../core/object-result/result.entity';
import { Post, type PostModelType } from '../../domain/post.entity';
import { PostsRepository } from '../../infrastructure/posts.repository';
import { BlogsExternalQueryRepository } from '../../../blogs/infrastructure/external-query/external-dto/blogs.external-query.repository';
import { InjectModel } from '@nestjs/mongoose';
import { CreatePostDomainDto } from '../../domain/dto/create-post.domain.dto';

export interface CreatePostData {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
}

export class CreatePostCommand {
  constructor(public readonly data: CreatePostData) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    private postsRepository: PostsRepository,
    private blogsExternalQueryRepository: BlogsExternalQueryRepository,
  ) {}

  async execute(command: CreatePostCommand): Promise<Result<PostViewDto>> {
    const { data } = command;
    const blog = await this.blogsExternalQueryRepository.findById(data.blogId);

    if (!blog) {
      return Result.notFound('Blog not found');
    }

    const domainDto: CreatePostDomainDto = {
      title: data.title,
      shortDescription: data.shortDescription,
      content: data.content,
      blogId: data.blogId,
      blogName: blog.name,
    };

    const newPost = this.PostModel.createPost(domainDto);
    await this.postsRepository.save(newPost);
    return Result.success(PostViewDto.mapToView(newPost));
  }
}
