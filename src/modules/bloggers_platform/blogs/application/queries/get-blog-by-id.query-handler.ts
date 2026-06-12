import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Result } from '../../../../../core/object-result/result.entity';
import { BlogViewDto } from '../../api/view-dto/blog.view-dto';
import { BlogsQueryRepository } from '../../infrastructure/query/blogs.query-repository';

export class GetBlogByIdQuery {
  constructor(public readonly id: string) {}
}

@QueryHandler(GetBlogByIdQuery)
export class GetBlogByIdHandler implements IQueryHandler<GetBlogByIdQuery> {
  constructor(private blogsQueryRepository: BlogsQueryRepository) {}

  async execute(query: GetBlogByIdQuery): Promise<Result<BlogViewDto>> {
    const blog = await this.blogsQueryRepository.findById(query.id);

    if (!blog) {
      return Result.notFound('Blog not found');
    }

    return Result.success(BlogViewDto.mapToView(blog));
  }
}
