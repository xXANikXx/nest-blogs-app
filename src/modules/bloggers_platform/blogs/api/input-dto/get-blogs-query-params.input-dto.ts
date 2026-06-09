import { BlogsSortBy } from './blogs-sort-by';
import { BaseQueryParams } from '../../../../../core/dto/base.paginated-params.input-dto';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class GetBlogsQueryParams extends BaseQueryParams {
  @IsEnum(BlogsSortBy)
  @IsOptional()
  sortBy: BlogsSortBy = BlogsSortBy.CreatedAt;

  @IsString()
  @IsOptional()
  searchNameTerm: string | null = null;
}
