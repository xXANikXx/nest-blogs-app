// import { Injectable } from '@nestjs/common';
// import { CommentsQueryRepository } from '../../query/comments.query-repository';
// import { GetCommentsQueryParams } from '../../../api/input-dto/get-comments-query-params.input-dto';
// import { PaginatedViewDto } from '../../../../../../core/dto/base.paginated.view-dto';
// import { CommentViewDto } from '../../../api/view-dto/comment.view-dto';
//
// @Injectable()
// export class CommentsExternalQueryRepository {
//   constructor(private commentsQueryRepository: CommentsQueryRepository) {}
//
//   async getByPostId(
//     query: GetCommentsQueryParams,
//     postId: string,
//   ): Promise<PaginatedViewDto<CommentViewDto[]>> {
//     // Здесь мы просто делегируем вызов, но в будущем
//     // сможем добавить специфическую фильтрацию или маппинг
//     return this.commentsQueryRepository.getByPostId(query, postId);
//   }
// }
