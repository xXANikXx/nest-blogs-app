import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../core/object-result/result.entity';
import { PostViewDto } from '../../api/view-dto/post.view-dto';
import { PostsQueryRepository } from '../../infrastructure/query/posts.query-repository';

export class GetPostByIdQuery {
  constructor(
    public readonly id: string,
    public readonly userId: string | null = null,
  ) {}
}

@QueryHandler(GetPostByIdQuery)
export class GetPostByIdHandler implements IQueryHandler<GetPostByIdQuery> {
  constructor(private postsQueryRepository: PostsQueryRepository) {}

  async execute(query: GetPostByIdQuery): Promise<Result<PostViewDto>> {
    const post = await this.postsQueryRepository.findById(
      query.id,
      query.userId,
    );

    if (!post) {
      return Result.notFound('Post not found');
    }

    return Result.success(post);
  }
}
