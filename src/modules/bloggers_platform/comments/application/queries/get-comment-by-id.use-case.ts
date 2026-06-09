import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { CommentsQueryRepository } from '../../infrastructure/query/comments.query-repository';
import { Result } from '../../../../../core/object-result/result.entity';
import { CommentViewDto } from '../../api/view-dto/comment.view-dto';

export class GetCommentByIdQuery {
  constructor(
    public readonly commentId: string,
    public readonly userId: string | null,
  ) {}
}

@QueryHandler(GetCommentByIdQuery)
export class GetCommentByIdHandler implements IQueryHandler<GetCommentByIdQuery> {
  constructor(private commentsQueryRepository: CommentsQueryRepository) {}

  async execute(query: GetCommentByIdQuery): Promise<Result<CommentViewDto>> {
    const comment = await this.commentsQueryRepository.findById(
      query.commentId,
      query.userId,
    );

    if (!comment) return Result.notFound('Comment not found');

    return Result.success(comment); // ← уже готовый ViewDto
  }
}
