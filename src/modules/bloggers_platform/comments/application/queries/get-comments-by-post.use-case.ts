import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { CommentViewDto } from '../../api/view-dto/comment.view-dto';
import { CommentsQueryRepository } from '../../infrastructure/query/comments.query-repository';
import { Result } from '../../../../../core/object-result/result.entity';
import { PostsRepository } from '../../../posts/infrastructure/posts.repository';
import { GetCommentsQueryParams } from '../../api/input-dto/get-comments-query-params.input-dto';

export class GetCommentByPostIdQuery {
  constructor(
    public readonly postId: string,
    public readonly queryParams: GetCommentsQueryParams, // Передаем параметры сортировки/пагинации
    public readonly userId: string | null,
  ) {}
}

@QueryHandler(GetCommentByPostIdQuery)
export class GetCommentsByPostIdQueryHandler implements IQueryHandler<GetCommentByPostIdQuery> {
  constructor(
    private readonly commentsQueryRepository: CommentsQueryRepository,
    private readonly postsRepository: PostsRepository, // ← Добавили для проверки существования поста
  ) {}

  async execute(
    query: GetCommentByPostIdQuery,
  ): Promise<Result<PaginatedViewDto<CommentViewDto[]>>> {
    // ← Исправили возвращаемый тип

    // 1. Проверяем, существует ли сам пост
    const postExists = await this.postsRepository.findById(query.postId);
    if (!postExists) {
      return Result.notFound('Post not found');
    }

    // 2. Если пост есть, запрашиваем его комментарии с пагинацией
    const paginatedComments = await this.commentsQueryRepository.getByPostId(
      query.queryParams,
      query.postId,
      query.userId,
    );

    return Result.success(paginatedComments);
  }
}
