import { PostsSortBy } from './posts-sort-by';
import { BaseQueryParams } from '../../../../../core/dto/base.paginated-params.input-dto';

export class GetPostsQueryParams extends BaseQueryParams {
  sortBy = PostsSortBy.CreatedAt;
}
