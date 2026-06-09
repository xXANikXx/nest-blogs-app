import { CommentsSortBy } from './comments-sort-by';
import { BaseQueryParams } from '../../../../../core/dto/base.paginated-params.input-dto';
import { IsEnum, IsOptional } from 'class-validator';

export class GetCommentsQueryParams extends BaseQueryParams {
  @IsEnum(CommentsSortBy)
  @IsOptional()
  sortBy: CommentsSortBy = CommentsSortBy.CreatedAt;
}
