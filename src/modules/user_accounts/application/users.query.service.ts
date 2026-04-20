import { Injectable } from '@nestjs/common';
import { UsersQueryRepository } from '../infrastructure/query/users.query-repository';
import { GetUsersQueryParams } from '../api/input-dto/get-users-query-params.input-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { UserViewDto } from '../api/view-dto/user.view-dto';
import { Result } from '../../../core/object-result/result.entity';

@Injectable()
export class UsersQueryService {
  constructor(private usersQueryRepository: UsersQueryRepository) {}

  async getAll(
    query: GetUsersQueryParams,
  ): Promise<Result<PaginatedViewDto<UserViewDto[]>>> {
    const data = await this.usersQueryRepository.getAll(query);
    return Result.success(data);
  }

  async findById(id: string): Promise<Result<UserViewDto>> {
    const user = await this.usersQueryRepository.findById(id);

    if (!user) {
      return Result.notFound('User not found');
    }

    return Result.success(UserViewDto.mapToView(user));
  }
}
