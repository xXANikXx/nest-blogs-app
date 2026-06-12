import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetBlogsQueryParams } from '../../api/input-dto/get-blogs-query-params.input-dto';
import { Result } from '../../../../../core/object-result/result.entity';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { BlogViewDto } from '../../api/view-dto/blog.view-dto';
import { BlogsQueryRepository } from '../../infrastructure/query/blogs.query-repository';

export class GetBlogsQuery {
  constructor(public readonly query: GetBlogsQueryParams) {}
}

@QueryHandler(GetBlogsQuery)
export class GetBlogsHandler implements IQueryHandler<GetBlogsQuery> {
  constructor(private blogsQueryRepository: BlogsQueryRepository) {}

  async execute(
    query: GetBlogsQuery,
  ): Promise<Result<PaginatedViewDto<BlogViewDto[]>>> {
    const data = await this.blogsQueryRepository.getAll(query.query);
    return Result.success(data);
  }
}
