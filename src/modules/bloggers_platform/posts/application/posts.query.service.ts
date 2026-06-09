import { Injectable } from '@nestjs/common';
import { GetPostsQueryParams } from '../api/input-dto/get-posts-query-params.input.dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { PostViewDto } from '../api/view-dto/post.view-dto';
import { Result } from '../../../../core/object-result/result.entity';
import { PostsQueryRepository } from '../infrastructure/query/posts.query-repository';

@Injectable()
export class PostsQueryService {
  constructor(private postsQueryRepository: PostsQueryRepository) {}

  async getAll(
    query: GetPostsQueryParams,
    userId: string | null = null,
  ): Promise<Result<PaginatedViewDto<PostViewDto[]>>> {
    const data = await this.postsQueryRepository.getAll(query, userId);
    return Result.success(data);
  }

  async findById(
    id: string,
    userId: string | null = null,
  ): Promise<Result<PostViewDto>> {
    const post = await this.postsQueryRepository.findById(id, userId); // ← передай userId

    if (!post) {
      return Result.notFound('Post not found');
    }

    return Result.success(post);
  }

  async getByBlogId(
    blogId: string,
    query: GetPostsQueryParams,
    userId: string | null = null,
  ): Promise<Result<PaginatedViewDto<PostViewDto[]>>> {
    const data = await this.postsQueryRepository.getByBlogId(
      blogId,
      query,
      userId,
    );
    return Result.success(data);
  }
}
