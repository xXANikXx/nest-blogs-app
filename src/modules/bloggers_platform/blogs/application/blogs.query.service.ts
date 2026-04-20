import { Injectable } from '@nestjs/common';
import { BlogsQueryRepository } from '../infrastructure/query/blogs.query-repository';
import { Result } from '../../../../core/object-result/result.entity';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { GetBlogsQueryParams } from '../api/input-dto/get-blogs-query-params.input-dto';
import { BlogViewDto } from '../api/view-dto/blog.view-dto';

@Injectable()
export class BlogsQueryService {
  constructor(private blogsQueryRepository: BlogsQueryRepository) {}

  async getAll(
    query: GetBlogsQueryParams,
  ): Promise<Result<PaginatedViewDto<BlogViewDto[]>>> {
    const data = await this.blogsQueryRepository.getAll(query);
    return Result.success(data);
  }

  async findById(id: string): Promise<Result<BlogViewDto>> {
    const blog = await this.blogsQueryRepository.findById(id);

    if (!blog) {
      return Result.notFound('Blog not found');
    }

    return Result.success(BlogViewDto.mapToView(blog));
  }
}
