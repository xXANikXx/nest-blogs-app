import { HttpStatus, INestApplication } from '@nestjs/common';
import { UsersTestManager } from './helpers/users-test-manager';
import { initSettings } from './helpers/init-settings';
import { deleteAllData } from './helpers/delete-all-data';
import request from 'supertest';
import { GLOBAL_PREFIX } from '../src/setup/global-prefix.setup';
import { Server } from 'node:http';

describe('users', () => {
  let app: INestApplication;
  let usersTestManager: UsersTestManager;

  beforeAll(async () => {
    const result = await initSettings();
    app = result.app;
    usersTestManager = result.usersTestManager;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  describe('POST /users', () => {
    it('should create user and return correct structure', async () => {
      const dto = {
        login: 'testuser',
        email: 'test@test.com',
        password: '123456789',
      };

      const user = await usersTestManager.createUser(dto);

      expect(user).toEqual({
        id: expect.any(String) as string,
        login: dto.login,
        email: dto.email,
        createdAt: expect.any(String) as string,
      });
    });

    it('should return 401 for unauthorized request', async () => {
      await request(app.getHttpServer() as Server)
        .post(`/${GLOBAL_PREFIX}/users`)
        .send({
          login: 'testuser',
          email: 'test@test.com',
          password: '123456789',
        })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('should return 400 for invalid login', async () => {
      await usersTestManager.createUser(
        { login: 'sh', email: 'test@test.com', password: '123456789' },
        HttpStatus.BAD_REQUEST,
      );
    });

    it('should return 400 for invalid email', async () => {
      await usersTestManager.createUser(
        { login: 'testuser', email: 'not-an-email', password: '123456789' },
        HttpStatus.BAD_REQUEST,
      );
    });
  });

  describe('GET /users', () => {
    it('should return empty list', async () => {
      const response = await usersTestManager.getAll();

      expect(response.totalCount).toBe(0);
      expect(response.items).toHaveLength(0);
      expect(response.page).toBe(1);
      expect(response.pageSize).toBe(10);
    });

    it('should return users with pagination', async () => {
      await usersTestManager.createSeveralUsers(12);

      const response = await usersTestManager.getAll({
        pageSize: 10,
        pageNumber: 1,
      });

      expect(response.totalCount).toBe(12);
      expect(response.items).toHaveLength(10);
      expect(response.pagesCount).toBe(2);
    });

    it('should filter by searchLoginTerm', async () => {
      await usersTestManager.createUser({
        login: 'adminuser',
        email: 'admin@test.com',
        password: '123456789',
      });
      await usersTestManager.createUser({
        login: 'test-user',
        email: 'regular@test.com',
        password: '123456789',
      });

      const response = await usersTestManager.getAll({
        searchLoginTerm: 'admin',
      });

      expect(response.totalCount).toBe(1);
      expect(response.items[0].login).toBe('adminuser');
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user', async () => {
      const user = await usersTestManager.createUser({
        login: 'testuser',
        email: 'test@test.com',
        password: '123456789',
      });

      await usersTestManager.deleteUser(user.id);
      await usersTestManager.getById(user.id, HttpStatus.NOT_FOUND);
    });

    it('should return 404 for non-existing user', async () => {
      await usersTestManager.deleteUser(
        '000000000000000000000000',
        HttpStatus.NOT_FOUND,
      );
    });

    it('should return 401 for unauthorized request', async () => {
      const user = await usersTestManager.createUser({
        login: 'testuser',
        email: 'test@test.com',
        password: '123456789',
      });

      await request(app.getHttpServer() as Server)
        .delete(`/${GLOBAL_PREFIX}/users/${user.id}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });
});
