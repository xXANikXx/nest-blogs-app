import { HttpStatus, INestApplication } from '@nestjs/common';
import { UsersTestManager } from './users-test-manager';
import { Server } from 'node:http';
import request from 'supertest';
import { GLOBAL_PREFIX } from '../../src/setup/global-prefix.setup';
import {
  MeViewDto,
  UserViewDto,
} from '../../src/modules/user_accounts/api/view-dto/user.view-dto';
import { CreateUserInputDto } from '../../src/modules/user_accounts/api/input-dto/users.input-dto';

export class AuthTestManager {
  constructor(
    private app: INestApplication,
    private usersTestManager: UsersTestManager,
  ) {}

  private get httpServer(): Server {
    return this.app.getHttpServer() as Server;
  }

  async login(
    loginOrEmail: string,
    password: string,
    statusCode: number = HttpStatus.OK,
  ): Promise<{ accessToken: string }> {
    const response = await request(this.httpServer)
      .post(`/${GLOBAL_PREFIX}/auth/login`)
      .send({ loginOrEmail, password })
      .expect(statusCode);

    const body = response.body as { accessToken: string }; // ← каст
    return {
      accessToken: body.accessToken,
    };
  }

  async me(
    accessToken: string,
    statusCode: number = HttpStatus.OK,
  ): Promise<MeViewDto> {
    const response = await request(this.httpServer)
      .get(`/${GLOBAL_PREFIX}/auth/me`)
      .auth(accessToken, { type: 'bearer' })
      .expect(statusCode);

    return response.body as MeViewDto;
  }

  async createAndLogin(
    dto?: Partial<CreateUserInputDto>,
  ): Promise<{ user: UserViewDto; accessToken: string }> {
    const defaultDto: CreateUserInputDto = {
      login: 'test-user',
      email: 'test@test.com',
      password: '123456789',
      ...dto,
    };

    const user = await this.usersTestManager.createUser(defaultDto);
    const { accessToken } = await this.login(
      defaultDto.login,
      defaultDto.password,
    );

    return { user, accessToken };
  }

  async createAndLoginSeveralUsers(
    count: number,
  ): Promise<{ accessToken: string }[]> {
    const users = await this.usersTestManager.createSeveralUsers(count);

    const loginPromises = users.map((user: UserViewDto) =>
      this.login(user.login, '123456789'),
    );

    return await Promise.all(loginPromises);
  }
}
