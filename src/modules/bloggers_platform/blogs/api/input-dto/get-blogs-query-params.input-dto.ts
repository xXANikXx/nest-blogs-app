import { BlogsSortBy } from './blogs-sort-by';
import { BaseQueryParams } from '../../../../../core/dto/base.paginated-params.input-dto';

export class GetBlogsQueryParams extends BaseQueryParams {
  sortBy = BlogsSortBy.CreatedAt;
  searchNameTerm: string | null = null;
}
