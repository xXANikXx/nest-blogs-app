import { Injectable } from '@nestjs/common';
import { CommentsQueryRepository } from '../infrastructure/query/comments.query-repository';
import { Result } from '../../../../core/object-result/result.entity';
import { CommentViewDto } from '../api/view-dto/comment.view-dto';
import { GetCommentsQueryParams } from '../api/input-dto/get-comments-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';

@Injectable()
export class CommentsQueryService {
  constructor(private commentQueryRepository: CommentsQueryRepository) {}

  async findById(id: string): Promise<Result<CommentViewDto>> {
    const comment = await this.commentQueryRepository.findById(id);

    if (!comment) {
      return Result.notFound('Comment not found');
    }

    return Result.success(CommentViewDto.mapToView(comment));
  }

  async getByPostId(
    postId: string,
    query: GetCommentsQueryParams,
  ): Promise<Result<PaginatedViewDto<CommentViewDto[]>>> {
    const data = await this.commentQueryRepository.getByPostId(query, postId);
    return Result.success(data);
  }
}
