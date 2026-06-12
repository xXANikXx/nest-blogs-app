import { HttpStatus, INestApplication } from '@nestjs/common';
import { AuthTestManager } from './helpers/auth-test-manager';
import { UsersTestManager } from './helpers/users-test-manager';
import { initSettings } from './helpers/init-settings';
import { deleteAllData } from './helpers/delete-all-data';
import request from 'supertest';
import { GLOBAL_PREFIX } from '../src/setup/global-prefix.setup';
import { Server } from 'node:http';
import { UserAccountsConfig } from '../src/modules/user_accounts/config/user-accounts.config';
import { ACCESS_TOKEN_STRATEGY_INJECT_TOKEN } from '../src/modules/user_accounts/constants/auth-tokens.inject-constants';
import { JwtService } from '@nestjs/jwt';

describe('auth', () => {
  let app: INestApplication;
  let authTestManager: AuthTestManager;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const result = await initSettings((moduleBuilder) =>
      moduleBuilder
        .overrideProvider(ACCESS_TOKEN_STRATEGY_INJECT_TOKEN)
        .useFactory({
          factory: (userAccountsConfig: UserAccountsConfig) => {
            return new JwtService({
              secret: userAccountsConfig.accessTokenSecret,
              signOptions: { expiresIn: '2s' },
            });
          },
          inject: [UserAccountsConfig],
        }),
    );

    app = result.app;
    authTestManager = result.authTestManager;
    usersTestManager = result.usersTestManager;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  describe('POST /auth/login', () => {
    it('should return accessToken', async () => {
      await usersTestManager.createUser({
        login: 'testuser',
        email: 'test@test.com',
        password: '123456789',
      });

      const { accessToken } = await authTestManager.login(
        'testuser',
        '123456789',
      );

      expect(accessToken).toBeDefined();
      expect(typeof accessToken).toBe('string');
    });

    it('should return 401 for expired token', async () => {
      const { accessToken } = await authTestManager.createAndLogin({
        login: 'testuser',
        email: 'test@test.com',
        password: '123456789',
      });

      // ждём пока токен истечёт (2 секунды + запас)
      await new Promise((resolve) => setTimeout(resolve, 3000));

      await authTestManager.me(accessToken, HttpStatus.UNAUTHORIZED);
    });

    it('should login by email', async () => {
      await usersTestManager.createUser({
        login: 'testuser',
        email: 'test@test.com',
        password: '123456789',
      });

      const { accessToken } = await authTestManager.login(
        'test@test.com',
        '123456789',
      );

      expect(accessToken).toBeDefined();
    });

    it('should return 401 for wrong password', async () => {
      await usersTestManager.createUser({
        login: 'testuser',
        email: 'test@test.com',
        password: '123456789',
      });

      await authTestManager.login(
        'testuser',
        'wrongpassword',
        HttpStatus.UNAUTHORIZED,
      );
    });

    it('should return 401 for non-existing user', async () => {
      await authTestManager.login(
        'nobody',
        '123456789',
        HttpStatus.UNAUTHORIZED,
      );
    });
  });

  describe('GET /auth/me', () => {
    it('should return current user info', async () => {
      const { user, accessToken } = await authTestManager.createAndLogin({
        login: 'testuser',
        email: 'test@test.com',
        password: '123456789',
      });

      const me = await authTestManager.me(accessToken);

      expect(me).toEqual({
        userId: user.id,
        login: user.login,
        email: user.email,
      });
    });

    it('should return 401 without token', async () => {
      await request(app.getHttpServer() as Server)
        .get(`/${GLOBAL_PREFIX}/auth/me`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return 401 for invalid token', async () => {
      await authTestManager.me('invalid-token', HttpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /auth/registration', () => {
    it('should register user and return 204', async () => {
      await request(app.getHttpServer() as Server)
        .post(`/${GLOBAL_PREFIX}/auth/registration`)
        .send({
          login: 'newuser',
          email: 'newuser@test.com',
          password: '123456789',
        })
        .expect(HttpStatus.NO_CONTENT);
    });

    it('should return 400 if email already exists', async () => {
      await usersTestManager.createUser({
        login: 'testuser',
        email: 'test@test.com',
        password: '123456789',
      });

      await request(app.getHttpServer() as Server)
        .post(`/${GLOBAL_PREFIX}/auth/registration`)
        .send({
          login: 'newuser',
          email: 'test@test.com',
          password: '123456789',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });

    it('should return 400 if login already exists', async () => {
      await usersTestManager.createUser({
        login: 'testuser',
        email: 'test@test.com',
        password: '123456789',
      });

      await request(app.getHttpServer() as Server)
        .post(`/${GLOBAL_PREFIX}/auth/registration`)
        .send({
          login: 'testuser',
          email: 'new@test.com',
          password: '123456789',
        })
        .expect(HttpStatus.BAD_REQUEST);
    });
  });
});
