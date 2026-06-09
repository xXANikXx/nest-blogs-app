import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import { GLOBAL_PREFIX } from '../../src/setup/global-prefix.setup';
import { Server } from 'node:http';
import { CommentViewDto } from '../../src/modules/bloggers_platform/comments/api/view-dto/comment.view-dto';

export class CommentsTestManager {
  constructor(private readonly app: INestApplication) {}

  private get httpServer(): Server {
    return this.app.getHttpServer() as Server;
  }

  async getById(
    commentId: string,
    statusCode: number = HttpStatus.OK,
  ): Promise<CommentViewDto> {
    const response = await request(this.httpServer)
      .get(`/${GLOBAL_PREFIX}/comments/${commentId}`)
      .expect(statusCode);

    return response.body as CommentViewDto;
  }
}
