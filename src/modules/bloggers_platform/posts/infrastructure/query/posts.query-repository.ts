import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Post, type PostModelType } from '../../domain/post.entity';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { PostViewDto } from '../../api/view-dto/post.view-dto';
import { GetPostsQueryParams } from '../../api/input-dto/get-posts-query-params.input.dto';
import { LikesRepository } from '../../../likes/infrastructure/likes.repository';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(Post.name) private PostModel: PostModelType,
    private likesRepository: LikesRepository, // ← добавь
  ) {}

  async findById(
    id: string,
    userId: string | null = null,
  ): Promise<PostViewDto | null> {
    const post = await this.PostModel.findOne({ _id: id, deletedAt: null });
    if (!post) return null;

    const [likesInfo, newestLikes] = await Promise.all([
      this.likesRepository.getLikesInfo(id, userId),
      this.likesRepository.findNewestLikes(id),
    ]);

    return PostViewDto.mapToView(post, { ...likesInfo, newestLikes });
  }

  async getAll(
    query: GetPostsQueryParams,
    userId: string | null = null,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.getPaginated(query, {}, userId);
  }

  async getByBlogId(
    blogId: string,
    query: GetPostsQueryParams,
    userId: string | null = null,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.getPaginated(query, { blogId }, userId);
  }

  private async getPaginated(
    query: GetPostsQueryParams,
    additionalFilter: Record<string, unknown>,
    userId: string | null = null,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    const filter = { ...additionalFilter, deletedAt: null };

    const posts = await this.PostModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.PostModel.countDocuments(filter);

    const items = await Promise.all(
      posts.map(async (post) => {
        const postId = post._id.toString();
        const [likesInfo, newestLikes] = await Promise.all([
          this.likesRepository.getLikesInfo(postId, userId),
          this.likesRepository.findNewestLikes(postId),
        ]);
        return PostViewDto.mapToView(post, { ...likesInfo, newestLikes });
      }),
    );

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
