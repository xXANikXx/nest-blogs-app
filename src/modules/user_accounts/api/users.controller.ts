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
} from '@nestjs/common';
import { UsersService } from '../application/users.service';
import { UsersQueryService } from '../application/users.query.service';
import {
  ApiExtraModels,
  ApiOkResponse,
  ApiParam,
  getSchemaPath,
} from '@nestjs/swagger';
import { UserViewDto } from './view-dto/user.view-dto';
import { GetUsersQueryParams } from './input-dto/get-users-query-params.input-dto';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { CreateUserInputDto } from './input-dto/users.input-dto';

@Controller('users')
@ApiExtraModels(PaginatedViewDto, UserViewDto)
export class UsersController {
  constructor(
    private usersService: UsersService,
    private usersQueryService: UsersQueryService,
  ) {}

  @ApiParam({ name: `id` })
  @Get(`:id`)
  async getById(@Param('id') id: string): Promise<UserViewDto> {
    const result = await this.usersQueryService.findById(id);
    result.throwIfError();
    return result.getDataOrThrow();
  }

  @Get()
  @ApiOkResponse({
    description: 'Return list with pagination',
    schema: {
      allOf: [
        { $ref: getSchemaPath(PaginatedViewDto) }, // Берем структуру пагинации
        {
          properties: {
            items: {
              type: 'array',
              items: { $ref: getSchemaPath(UserViewDto) }, // Уточняем, что в items массив UserViewDto
            },
          },
        },
      ],
    },
  })
  async getAll(
    @Query() query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const result = await this.usersQueryService.getAll(query);
    result.throwIfError();
    return result.getDataOrThrow();
  }

  @Post()
  async createUser(@Body() body: CreateUserInputDto): Promise<UserViewDto> {
    const result = await this.usersService.createdByAdmin(body);
    result.throwIfError();
    return result.getDataOrThrow();
  }

  @ApiParam({ name: 'id' }) //для сваггера
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string): Promise<void> {
    const result = await this.usersService.deleteUser(id);
    result.throwIfError();
  }
}
