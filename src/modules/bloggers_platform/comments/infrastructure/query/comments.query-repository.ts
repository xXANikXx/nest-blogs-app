import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  type CommentModelType,
  CommentsFilter,
} from '../../domain/comment.entity';
import { LikesRepository } from '../../../likes/infrastructure/likes.repository';
import { CommentViewDto } from '../../api/view-dto/comment.view-dto';
import { GetCommentsQueryParams } from '../../api/input-dto/get-comments-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(Comment.name) private CommentModel: CommentModelType,
    private likesRepository: LikesRepository,
  ) {}

  // ← возвращает уже ViewDto, не Document
  async findById(
    id: string,
    userId: string | null = null,
  ): Promise<CommentViewDto | null> {
    const comment = await this.CommentModel.findOne({
      _id: id,
      deletedAt: null,
    });
    if (!comment) return null;

    const likesInfo = await this.likesRepository.getLikesInfo(
      comment._id.toString(),
      userId,
    );

    return CommentViewDto.mapToView(comment, likesInfo);
  }

  async getByPostId(
    query: GetCommentsQueryParams,
    postId: string,
    userId: string | null = null,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> {
    const filter: CommentsFilter = { postId, deletedAt: null };

    const comments = await this.CommentModel.find(filter)
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize);

    const totalCount = await this.CommentModel.countDocuments(filter);

    const items = await Promise.all(
      comments.map(async (comment) => {
        const likesInfo = await this.likesRepository.getLikesInfo(
          comment._id.toString(),
          userId,
        );
        return CommentViewDto.mapToView(comment, likesInfo);
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
