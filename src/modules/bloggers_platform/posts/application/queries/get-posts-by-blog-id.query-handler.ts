import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input.dto';
import { Result } from '../../../../../core/object-result/result.entity';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { PostViewDto } from '../../api/view-dto/post.view-dto';
import { PostsQueryRepository } from '../../infrastructure/query/posts.query-repository';

export class GetPostsByBlogIdQuery {
  constructor(
    public readonly blogId: string,
    public readonly query: GetPostsQueryParams,
    public readonly userId: string | null = null,
  ) {}
}

@QueryHandler(GetPostsByBlogIdQuery)
export class GetPostsByBlogIdHandler implements IQueryHandler<GetPostsByBlogIdQuery> {
  constructor(private postsQueryRepository: PostsQueryRepository) {}

  async execute(
    query: GetPostsByBlogIdQuery,
  ): Promise<Result<PaginatedViewDto<PostViewDto[]>>> {
    const data = await this.postsQueryRepository.getByBlogId(
      query.blogId,
      query.query,
      query.userId,
    );
    return Result.success(data);
  }
}
