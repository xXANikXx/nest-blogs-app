import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input.dto';
import { Result } from '../../../../../core/object-result/result.entity';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { PostViewDto } from '../../api/view-dto/post.view-dto';
import { PostsQueryRepository } from '../../infrastructure/query/posts.query-repository';

export class GetPostsQuery {
  constructor(
    public readonly query: GetPostsQueryParams,
    public readonly userId: string | null = null,
  ) {}
}

@QueryHandler(GetPostsQuery)
export class GetPostsHandler implements IQueryHandler<GetPostsQuery> {
  constructor(private postsQueryRepository: PostsQueryRepository) {}

  async execute(
    query: GetPostsQuery,
  ): Promise<Result<PaginatedViewDto<PostViewDto[]>>> {
    const data = await this.postsQueryRepository.getAll(
      query.query,
      query.userId,
    );
    return Result.success(data);
  }
}
