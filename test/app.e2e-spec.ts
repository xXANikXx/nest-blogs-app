import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { initSettings } from './helpers/init-settings';
import { Server } from 'node:http';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const settings = await initSettings();
    app = settings.app;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer() as Server)
      .get('/api')
      .expect(200)
      .expect('Hello World!');
  });
});
