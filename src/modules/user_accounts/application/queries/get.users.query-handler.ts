import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { Result } from '../../../../core/object-result/result.entity';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { UserViewDto } from '../../api/view-dto/user.view-dto';
import { UsersQueryRepository } from '../../infrastructure/query/users.query-repository';

export class GetUsersQuery {
  constructor(public readonly queryParams: GetUsersQueryParams) {}
}

@QueryHandler(GetUsersQuery)
export class GetUsersQueryHandler implements IQueryHandler<
  GetUsersQuery,
  Result<PaginatedViewDto<UserViewDto[]>>
> {
  constructor(private readonly usersQueryRepository: UsersQueryRepository) {}

  async execute(
    query: GetUsersQuery,
  ): Promise<Result<PaginatedViewDto<UserViewDto[]>>> {
    const data = await this.usersQueryRepository.getAll(query.queryParams);
    return Result.success(data);
  }
}
