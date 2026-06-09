import { HttpStatus, INestApplication } from '@nestjs/common';
import { CommentsTestManager } from './helpers/comments-auth-manager';
import { initSettings } from './helpers/init-settings';
import { deleteAllData } from './helpers/delete-all-data';

describe('comments', () => {
  let app: INestApplication;
  let commentsTestManager: CommentsTestManager;

  beforeAll(async () => {
    const result = await initSettings();
    app = result.app;
    commentsTestManager = result.commentsTestManager;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await deleteAllData(app);
  });

  describe('GET /comments/:id', () => {
    it('should return 404 for non-existing comment', async () => {
      await commentsTestManager.getById(
        '000000000000000000000000',
        HttpStatus.NOT_FOUND,
      );
    });
  });
});
