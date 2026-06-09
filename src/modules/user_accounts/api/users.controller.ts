import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BasicAuthGuard } from '../guards/basic/basic-auth.guard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetUsersQueryParams } from './input-dto/get-users-query-params.input-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { UserViewDto } from './view-dto/user.view-dto';
import { GetUsersQuery } from '../application/queries/get.users.query-handler';
import { Result } from '../../../core/object-result/result.entity';
import { handleResult } from '../../../core/object-result/handleresult';
import { CreateUserInputDto } from './input-dto/users.input-dto';
import { CreateUserCommand } from '../application/usecases/admin/create-user.usecase';
import { DeleteUserCommand } from '../application/usecases/admin/delete-user.usecase';

@Controller('users')
@UseGuards(BasicAuthGuard)
export class UsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async getAll(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    // Исправлен синтаксис generic-параметров вызова <...>
    const result = await this.queryBus.execute<
      GetUsersQuery,
      Result<PaginatedViewDto<UserViewDto[]>>
    >(new GetUsersQuery(query));
    return handleResult(result);
  }

  @Post()
  async createUser(@Body() body: CreateUserInputDto): Promise<UserViewDto> {
    // Исправлен синтаксис generic-параметров вызова <...>
    const result = await this.commandBus.execute<
      CreateUserCommand,
      Result<UserViewDto>
    >(new CreateUserCommand(body));
    return handleResult(result);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string): Promise<void> {
    const result = await this.commandBus.execute<DeleteUserCommand, Result>(
      new DeleteUserCommand(id),
    );
    handleResult(result);
  }
}
