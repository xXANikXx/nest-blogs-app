import { HttpStatus, INestApplication } from '@nestjs/common';
import { CreateUserInputDto } from '../../src/modules/user_accounts/api/input-dto/users.input-dto';
import { UserViewDto } from '../../src/modules/user_accounts/api/view-dto/user.view-dto';
import request from 'supertest';
import { Server } from 'node:http';
import { GLOBAL_PREFIX } from '../../src/setup/global-prefix.setup';
import { PaginatedViewDto } from '../../src/core/dto/base.paginated.view-dto';
import { delay } from './delay';

export class UsersTestManager {
  constructor(private app: INestApplication) {}

  private get httpServer(): Server {
    return this.app.getHttpServer() as Server;
  }

  async createUser(
    createModel: CreateUserInputDto,
    statusCode: number = HttpStatus.CREATED,
  ): Promise<UserViewDto> {
    const response = await request(this.httpServer)
      .post(`/${GLOBAL_PREFIX}/users`)
      .send(createModel)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response.body as UserViewDto;
  }

  async createSeveralUsers(count: number): Promise<UserViewDto[]> {
    const users: UserViewDto[] = [];

    for (let i = 0; i < count; ++i) {
      await delay(50);
      const response = await this.createUser({
        login: `test` + i,
        email: `test${i}@gmail.com`,
        password: '123456789',
      });
      users.push(response);
    }

    return users;
  }

  async getById(
    userId: string,
    statusCode: number = HttpStatus.OK,
  ): Promise<UserViewDto> {
    const response = await request(this.httpServer)
      .get(`/${GLOBAL_PREFIX}/users/${userId}`)
      .auth('admin', 'qwerty')
      .expect(statusCode);

    return response.body as UserViewDto;
  }

  async getAll(
    query: Record<string, unknown> = {},
    statusCode: number = HttpStatus.OK,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const response = await request(this.httpServer)
      .get(`/${GLOBAL_PREFIX}/users`)
      .auth('admin', 'qwerty')
      .query(query)
      .expect(statusCode);

    return response.body as PaginatedViewDto<UserViewDto[]>;
  }

  async deleteUser(
    usersId: string,
    statusCode: number = HttpStatus.NO_CONTENT,
  ): Promise<void> {
    await request(this.httpServer)
      .delete(`/${GLOBAL_PREFIX}/users/${usersId}`)
      .auth('admin', 'qwerty')
      .expect(statusCode);
  }
}
