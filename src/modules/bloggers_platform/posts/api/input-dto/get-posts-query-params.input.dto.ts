import { IsEnum, IsOptional } from 'class-validator';
import { BaseQueryParams } from '../../../../../core/dto/base.paginated-params.input-dto';
import { PostsSortBy } from './posts-sort-by';

export class GetPostsQueryParams extends BaseQueryParams {
  @IsEnum(PostsSortBy)
  @IsOptional()
  sortBy: PostsSortBy = PostsSortBy.CreatedAt;
}
